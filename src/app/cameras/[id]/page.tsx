import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { NavWithCount } from '@/components/nav-with-count';
import { ProductCard } from '@/components/product-card';
import { Icons } from '@/components/icons';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import { getWishedSlugs } from '@/lib/wishlist';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PDPClient } from './PDPClient';
import { ReviewsSection } from './ReviewsSection';

export default async function PDPPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductBySlug(id);
  if (!product) notFound();

  const [related, wishedSlugs, user, productRow] = await Promise.all([
    getRelatedProducts(product.id, 4),
    getWishedSlugs(),
    getCurrentUser(),
    prisma.product.findUnique({ where: { slug: product.id }, select: { id: true, rating: true, reviewsCount: true } }),
  ]);
  const initialWished = wishedSlugs.has(product.id);

  const dbProductId = productRow?.id ?? '';
  const reviewsRaw = dbProductId
    ? await prisma.review.findMany({
        where: { productId: dbProductId },
        orderBy: [{ verifiedPurchase: 'desc' }, { createdAt: 'desc' }],
        take: 50,
        include: { user: { select: { id: true, fullName: true, email: true } } },
      })
    : [];

  const reviews = reviewsRaw.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    verifiedPurchase: r.verifiedPurchase,
    createdAt: r.createdAt.toISOString(),
    authorName: r.user.fullName ?? r.user.email.split('@')[0],
    isMine: !!user && r.user.id === user.id,
  }));

  const myReview = user ? reviewsRaw.find((r) => r.user.id === user.id) : null;
  const purchasedCount = user && dbProductId
    ? await prisma.orderItem.count({
        where: {
          productId: dbProductId,
          order: { userId: user.id, status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
        },
      })
    : 0;
  const canReview = !!user && purchasedCount > 0;

  return (
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <NavWithCount />

      <section className="pnp-px" style={{ paddingTop: 28 }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', flexWrap: 'wrap', display: 'flex', gap: 6 }}>
          <Link href="/">Home</Link> <span>/</span> <Link href="/cameras">Cameras</Link> <span>/</span> {product.category} <span>/</span>
          <span style={{ color: 'var(--ink)' }}>{product.name}</span>
        </div>
      </section>

      <PDPClient product={product} initialWished={initialWished} />

      <ReviewsSection
        productId={dbProductId}
        productSlug={product.id}
        reviews={reviews}
        averageRating={productRow?.rating ?? 0}
        reviewsCount={productRow?.reviewsCount ?? 0}
        canReview={canReview}
        isSignedIn={!!user}
        currentUserReview={myReview ? { rating: myReview.rating, title: myReview.title, body: myReview.body } : null}
      />

      <section className="pnp-px" style={{ paddingBottom: 96, borderTop: '1px solid var(--line)', paddingTop: 80 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Pairs well with</div>
        <h2 className="fluid-h3" style={{ marginBottom: 40, letterSpacing: '-0.02em' }}>Complete the kit.</h2>
        <div className="grid-4">
          {related.map(p => (
            <Link key={p.id} href={`/cameras/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <ProductCard product={p} initialWished={wishedSlugs.has(p.id)} />
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
