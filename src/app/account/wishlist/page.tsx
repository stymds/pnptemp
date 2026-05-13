import Link from 'next/link';
import { Footer } from '@/components/footer';
import { NavWithCount } from '@/components/nav-with-count';
import { ProductImage } from '@/components/product-image';
import { formatINR } from '@/lib/data';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { productImageSrc } from '@/lib/storage';
import { WishlistRemoveButton } from './WishlistRemoveButton';

export default async function WishlistPage() {
  const user = await requireUser();
  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        include: {
          category: true,
          images: { orderBy: { position: 'asc' }, take: 1 },
        },
      },
    },
  });

  return (
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <NavWithCount />

      <section className="pnp-px" style={{ paddingTop: 40, paddingBottom: 24 }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          <Link href="/account">My account</Link> / <span style={{ color: 'var(--ink)' }}>Wishlist</span>
        </div>
        <h1 className="fluid-h1" style={{ letterSpacing: '-0.03em' }}>Wishlist</h1>
        <p className="muted" style={{ fontSize: 15, marginTop: 10 }}>
          {items.length === 0 ? 'Save products to come back to later.' : `${items.length} item${items.length === 1 ? '' : 's'}.`}
        </p>
      </section>

      <section className="pnp-px" style={{ paddingBottom: 96 }}>
        {items.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', background: 'var(--paper-2)', borderRadius: 'var(--r-lg)' }}>
            <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>Tap the heart on any product to save it here.</p>
            <Link href="/cameras" className="btn btn-primary btn-lg">Browse cameras →</Link>
          </div>
        ) : (
          <div className="grid-3">
            {items.map((it) => {
              const img = it.product.images[0];
              const price = Math.round(it.product.pricePaise / 100);
              const mrp = Math.round(it.product.mrpPaise / 100);
              return (
                <div key={it.id} style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                  <Link href={`/cameras/${it.product.slug}`} style={{ aspectRatio: '1/1', background: 'var(--paper-2)', position: 'relative' }}>
                    {img && <ProductImage src={productImageSrc(img.storagePath)} alt={img.alt} sizes="(max-width: 768px) 100vw, 33vw" />}
                  </Link>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="mono muted" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {it.product.category.name}
                    </div>
                    <Link href={`/cameras/${it.product.slug}`} style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink)' }}>
                      {it.product.name}
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 500 }}>{formatINR(price)}</span>
                      {mrp > price && <span className="strike" style={{ fontSize: 12 }}>{formatINR(mrp)}</span>}
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                      <Link href={`/cameras/${it.product.slug}`} className="btn btn-primary btn-sm">View →</Link>
                      <WishlistRemoveButton productId={it.product.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
