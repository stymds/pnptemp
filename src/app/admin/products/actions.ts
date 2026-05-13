'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { uploadProductImage, deleteProductImage } from '@/lib/storage-upload';

const productSchema = z.object({
  slug: z.string().regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Use lowercase letters, digits, and dashes only').max(80),
  name: z.string().min(1).max(120),
  tagline: z.string().max(160).optional().or(z.literal('').transform(() => undefined)),
  description: z.string().max(4000).optional().or(z.literal('').transform(() => undefined)),
  categoryId: z.string().min(1, 'Pick a category'),
  pricePaise: z.number().int().nonnegative(),
  mrpPaise: z.number().int().nonnegative(),
  emi: z.string().max(80).optional().or(z.literal('').transform(() => undefined)),
  stockUnits: z.number().int().nonnegative(),
  badge: z.string().max(40).optional().or(z.literal('').transform(() => undefined)),
  swatch: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional().or(z.literal('').transform(() => undefined)),
  isPublished: z.boolean().default(true),
});

export type ProductFormState =
  | { ok: true; productId?: string }
  | { ok: false; error: string }
  | null;

function readForm(formData: FormData) {
  return {
    slug: String(formData.get('slug') ?? '').trim(),
    name: String(formData.get('name') ?? '').trim(),
    tagline: String(formData.get('tagline') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    categoryId: String(formData.get('categoryId') ?? ''),
    pricePaise: Math.round(Number(formData.get('priceRupees') ?? '0') * 100),
    mrpPaise: Math.round(Number(formData.get('mrpRupees') ?? '0') * 100),
    emi: String(formData.get('emi') ?? '').trim(),
    stockUnits: Number(formData.get('stockUnits') ?? '0') | 0,
    badge: String(formData.get('badge') ?? '').trim(),
    swatch: String(formData.get('swatch') ?? '').trim(),
    isPublished: formData.get('isPublished') === 'on',
  };
}

function revalidateAll(slug?: string) {
  revalidatePath('/admin/products');
  revalidatePath('/admin');
  revalidatePath('/cameras');
  revalidatePath('/');
  if (slug) revalidatePath(`/cameras/${slug}`);
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  try {
    await requireAdmin();
    const parsed = productSchema.parse(readForm(formData));

    const existing = await prisma.product.findUnique({ where: { slug: parsed.slug } });
    if (existing) return { ok: false, error: `Slug "${parsed.slug}" already exists` };

    const product = await prisma.product.create({ data: parsed });

    const files = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0);
    for (let i = 0; i < files.length; i++) {
      try {
        const storagePath = await uploadProductImage(product.id, files[i]);
        await prisma.productImage.create({
          data: {
            productId: product.id,
            storagePath,
            alt: parsed.name,
            position: i,
          },
        });
      } catch (e) {
        console.error('Image upload failed', e);
      }
    }

    revalidateAll(parsed.slug);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { ok: false, error: e.issues[0]?.message ?? 'Validation failed' };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'Could not create product' };
  }

  redirect('/admin/products');
}

export async function updateProductAction(
  productId: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  try {
    await requireAdmin();
    const parsed = productSchema.parse(readForm(formData));

    const slugClash = await prisma.product.findFirst({
      where: { slug: parsed.slug, id: { not: productId } },
    });
    if (slugClash) return { ok: false, error: `Slug "${parsed.slug}" is taken` };

    await prisma.product.update({ where: { id: productId }, data: parsed });

    const files = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length) {
      const maxPos = await prisma.productImage.aggregate({
        where: { productId },
        _max: { position: true },
      });
      let position = (maxPos._max.position ?? -1) + 1;
      for (const file of files) {
        try {
          const storagePath = await uploadProductImage(productId, file);
          await prisma.productImage.create({
            data: { productId, storagePath, alt: parsed.name, position },
          });
          position++;
        } catch (e) {
          console.error('Image upload failed', e);
        }
      }
    }

    revalidateAll(parsed.slug);
    return { ok: true, productId };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { ok: false, error: e.issues[0]?.message ?? 'Validation failed' };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save product' };
  }
}

export async function deleteProductAction(productId: string) {
  await requireAdmin();
  const images = await prisma.productImage.findMany({ where: { productId } });
  // Delete DB rows first (cascades remove ProductImage too).
  const product = await prisma.product.findUnique({ where: { id: productId } });
  await prisma.product.delete({ where: { id: productId } });
  // Best-effort storage cleanup.
  for (const img of images) {
    await deleteProductImage(img.storagePath);
  }
  revalidateAll(product?.slug);
}

export async function togglePublishedAction(productId: string) {
  await requireAdmin();
  const p = await prisma.product.findUnique({ where: { id: productId } });
  if (!p) return;
  await prisma.product.update({
    where: { id: productId },
    data: { isPublished: !p.isPublished },
  });
  revalidateAll(p.slug);
}

export async function deleteProductImageAction(imageId: string) {
  await requireAdmin();
  const img = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: { product: true },
  });
  if (!img) return;
  await prisma.productImage.delete({ where: { id: imageId } });
  await deleteProductImage(img.storagePath);
  revalidateAll(img.product.slug);
}
