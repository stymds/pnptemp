import { prisma } from '@/lib/db';
import { CategoryAddForm } from './CategoryAddForm';
import { CategoryRow } from './CategoryRow';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 6 }}>Categories</h1>
        <p className="muted" style={{ fontSize: 13 }}>{categories.length} total</p>
      </div>

      <CategoryAddForm />

      {categories.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--paper-2)', borderRadius: 'var(--r-md)' }}>
          <p className="muted" style={{ fontSize: 13 }}>No categories yet — add one above.</p>
        </div>
      ) : (
        <div style={{ borderTop: '1px solid var(--ink)' }}>
          {categories.map((c) => (
            <CategoryRow
              key={c.id}
              id={c.id}
              slug={c.slug}
              name={c.name}
              productCount={c._count.products}
            />
          ))}
        </div>
      )}
    </>
  );
}
