import 'server-only';
import { prisma } from '@/lib/db';
import type { Product as PrismaProduct, ProductImage, Category } from '@prisma/client';
import type { Product as LegacyProduct, ProductImageAsset } from '@/lib/data';
import { productImageSrc } from '@/lib/storage';

type DbProduct = PrismaProduct & { images: ProductImage[]; category: Category };

const productInclude = {
  images: { orderBy: { position: 'asc' as const } },
  category: true,
};

export function toLegacyProduct(p: DbProduct): LegacyProduct {
  const images = p.images;
  const main = images[0];
  const gallery: ProductImageAsset[] | undefined =
    images.length > 1
      ? images.map((im) => ({
          src: productImageSrc(im.storagePath),
          alt: im.alt,
          label: im.label ?? 'view',
        }))
      : undefined;

  const stockLabel =
    p.stockUnits <= 0
      ? 'Out of stock'
      : p.stockUnits < 5
      ? `In stock | ${p.stockUnits} units`
      : 'In stock';

  return {
    id: p.slug,
    name: p.name,
    category: p.category.name,
    tagline: p.tagline ?? '',
    price: Math.round(p.pricePaise / 100),
    mrp: Math.round(p.mrpPaise / 100),
    emi: p.emi ?? '',
    rating: p.rating,
    reviews: p.reviewsCount,
    badge: p.badge ?? undefined,
    stock: stockLabel,
    swatch: p.swatch ?? '#1a1a1a',
    image: main ? productImageSrc(main.storagePath) : '',
    imageAlt: main?.alt ?? p.name,
    sourceUrl: p.sourceUrl ?? '',
    sourceNote: p.sourceNote ?? undefined,
    gallery,
  };
}

export async function getFeaturedProducts(limit = 4): Promise<LegacyProduct[]> {
  const rows = await prisma.product.findMany({
    where: { isPublished: true },
    include: productInclude,
    orderBy: [{ reviewsCount: 'desc' }],
    take: limit,
  });
  return rows.map(toLegacyProduct);
}

export async function listProducts(opts?: {
  categorySlug?: string;
}): Promise<LegacyProduct[]> {
  const rows = await prisma.product.findMany({
    where: {
      isPublished: true,
      category: opts?.categorySlug ? { slug: opts.categorySlug } : undefined,
    },
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toLegacyProduct);
}

export async function getProductBySlug(slug: string): Promise<LegacyProduct | null> {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
  return row ? toLegacyProduct(row) : null;
}

export async function getRelatedProducts(
  excludeSlug: string,
  limit = 4
): Promise<LegacyProduct[]> {
  const rows = await prisma.product.findMany({
    where: { isPublished: true, slug: { not: excludeSlug } },
    include: productInclude,
    orderBy: { reviewsCount: 'desc' },
    take: limit,
  });
  return rows.map(toLegacyProduct);
}

export async function getCategoryTiles(slugs: string[]) {
  const rows = await prisma.category.findMany({
    where: { slug: { in: slugs } },
    include: {
      products: {
        where: { isPublished: true },
        take: 1,
        orderBy: { reviewsCount: 'desc' },
        include: productInclude,
      },
      _count: { select: { products: true } },
    },
  });
  // preserve requested order
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return slugs
    .map((s) => bySlug.get(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      count: c._count.products,
      product: c.products[0] ? toLegacyProduct(c.products[0]) : null,
    }));
}

export async function searchProducts(q: string): Promise<LegacyProduct[]> {
  const trimmed = q.trim();
  if (!trimmed) return [];
  const ranked = await prisma.$queryRaw<Array<{ id: string }>>`
    select id from "Product"
    where "isPublished" = true
      and search @@ websearch_to_tsquery('english', ${trimmed})
    order by ts_rank(search, websearch_to_tsquery('english', ${trimmed})) desc
    limit 50
  `;
  if (ranked.length === 0) return [];
  const ids = ranked.map((r) => r.id);
  const rows = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: productInclude,
  });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map(toLegacyProduct);
}
