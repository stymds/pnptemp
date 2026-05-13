import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProductImage } from '@/components/product-image';
import { productImageSrc } from '@/lib/storage';
import { ProductForm } from '../../ProductForm';
import { ProductImageRemoveButton } from './ProductImageRemoveButton';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: 'asc' } } },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          <Link href="/admin/products">Products</Link> / <span style={{ color: 'var(--ink)' }}>{product.slug}</span>
        </div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em' }}>{product.name}</h1>
      </div>

      <div className="grid-2" style={{ gap: 48, alignItems: 'flex-start' }}>
        <ProductForm
          mode="edit"
          categories={categories}
          initial={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            tagline: product.tagline,
            description: product.description,
            categoryId: product.categoryId,
            pricePaise: product.pricePaise,
            mrpPaise: product.mrpPaise,
            emi: product.emi,
            stockUnits: product.stockUnits,
            badge: product.badge,
            swatch: product.swatch,
            isPublished: product.isPublished,
          }}
        />

        <div>
          <h2 style={{ fontSize: 18, marginBottom: 12, borderTop: '1px solid var(--ink)', paddingTop: 14 }}>
            Existing images ({product.images.length})
          </h2>
          {product.images.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>No images yet — add some via the form.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {product.images.map((img) => (
                <div key={img.id} style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', aspectRatio: '1/1' }}>
                    <ProductImage src={productImageSrc(img.storagePath)} alt={img.alt} sizes="200px" />
                  </div>
                  <div style={{ padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                    <span className="muted">{img.label ?? `Image ${img.position + 1}`}</span>
                    <ProductImageRemoveButton imageId={img.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
