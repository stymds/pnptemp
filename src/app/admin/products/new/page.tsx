import Link from 'next/link';
import { prisma } from '@/lib/db';
import { ProductForm } from '../ProductForm';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          <Link href="/admin/products">Products</Link> / <span style={{ color: 'var(--ink)' }}>New</span>
        </div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em' }}>New product</h1>
      </div>
      <ProductForm mode="create" categories={categories} />
    </>
  );
}
