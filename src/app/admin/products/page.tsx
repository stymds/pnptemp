import Link from 'next/link';
import { prisma } from '@/lib/db';
import { ProductImage } from '@/components/product-image';
import { formatINR } from '@/lib/data';
import { productImageSrc } from '@/lib/storage';
import { ProductRowActions } from './ProductRowActions';
import { Pagination } from '../Pagination';

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; page?: string }>;
}) {
  const { q = '', cat = '', page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { slug: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(cat ? { category: { slug: cat } } : {}),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: true,
        images: { orderBy: { position: 'asc' }, take: 1 },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 6 }}>Products</h1>
          <p className="muted" style={{ fontSize: 13 }}>{total} total</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">+ New product</Link>
      </div>

      <form action="/admin/products" method="get" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or slug…"
          className="input"
          style={{ flex: 1, minWidth: 200, maxWidth: 320 }}
        />
        <select name="cat" defaultValue={cat} className="input" style={{ maxWidth: 220 }}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-ghost">Apply</button>
        {(q || cat) && (
          <Link href="/admin/products" className="btn btn-ghost" style={{ color: 'var(--ink-3)' }}>Clear</Link>
        )}
      </form>

      <style>{`
        .admin-products-row {
          display: grid;
          grid-template-columns: 64px minmax(160px,1fr) auto;
          gap: 18px;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid var(--line);
        }
        .admin-products-meta {
          display: flex; align-items: center; gap: 18px;
          flex-wrap: wrap; justify-content: flex-end;
        }
        @media (max-width: 768px) {
          .admin-products-row {
            grid-template-columns: 56px 1fr;
            gap: 10px 14px;
            row-gap: 8px;
          }
          .admin-products-meta {
            grid-column: 1 / -1;
            justify-content: space-between;
            gap: 10px 14px;
          }
        }
      `}</style>
      {products.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--paper-2)', borderRadius: 'var(--r-md)' }}>
          <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
            {q || cat ? 'No products match those filters.' : 'No products yet.'}
          </p>
          <Link href="/admin/products/new" className="btn btn-primary btn-sm">Create your first →</Link>
        </div>
      ) : (
        <>
          <div style={{ borderTop: '1px solid var(--ink)' }}>
            {products.map((p) => {
              const img = p.images[0];
              return (
                <div key={p.id} className="admin-products-row">
                  <Link href={`/admin/products/${p.id}/edit`} style={{ width: 56, height: 56, background: 'var(--paper-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden', display: 'block' }}>
                    {img && <ProductImage src={productImageSrc(img.storagePath)} alt={img.alt} sizes="56px" />}
                  </Link>
                  <Link href={`/admin/products/${p.id}/edit`} style={{ color: 'inherit', minWidth: 0 }}>
                    <div className="mono muted" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {p.category.name} · {p.slug}
                    </div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>{p.name}</div>
                  </Link>
                  <div className="admin-products-meta">
                    <div style={{ fontSize: 12, color: p.stockUnits === 0 ? '#a82323' : p.stockUnits < 5 ? 'var(--accent)' : 'var(--ink-2)', fontFamily: 'var(--mono)' }}>
                      {p.stockUnits} units
                    </div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 14 }}>
                      {formatINR(Math.round(p.pricePaise / 100))}
                    </div>
                    <span style={{
                      fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: p.isPublished ? 'var(--ok)' : 'var(--ink-3)',
                    }}>
                      {p.isPublished ? 'Published' : 'Hidden'}
                    </span>
                    <ProductRowActions productId={p.id} isPublished={p.isPublished} productName={p.name} />
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            basePath="/admin/products"
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            extraQuery={{ q, cat }}
          />
        </>
      )}
    </>
  );
}
