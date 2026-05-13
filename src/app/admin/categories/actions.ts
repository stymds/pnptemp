'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

const categorySchema = z.object({
  slug: z.string().regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Lowercase, digits, dashes only').max(60),
  name: z.string().min(1).max(60),
});

export type CategoryFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

function revalidate() {
  revalidatePath('/admin/categories');
  revalidatePath('/admin/products');
  revalidatePath('/cameras');
  revalidatePath('/');
}

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  try {
    await requireAdmin();
    const parsed = categorySchema.parse({
      slug: String(formData.get('slug') ?? '').trim(),
      name: String(formData.get('name') ?? '').trim(),
    });
    const existing = await prisma.category.findUnique({ where: { slug: parsed.slug } });
    if (existing) return { ok: false, error: `Slug "${parsed.slug}" already exists` };

    await prisma.category.create({ data: parsed });
    revalidate();
    return { ok: true };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0]?.message ?? 'Validation failed' };
    return { ok: false, error: e instanceof Error ? e.message : 'Could not create' };
  }
}

export async function renameCategoryAction(
  categoryId: string,
  newName: string,
) {
  await requireAdmin();
  const trimmed = newName.trim();
  if (!trimmed || trimmed.length > 60) throw new Error('Name must be 1–60 characters');
  await prisma.category.update({ where: { id: categoryId }, data: { name: trimmed } });
  revalidate();
}

export async function deleteCategoryAction(categoryId: string) {
  await requireAdmin();
  const productCount = await prisma.product.count({ where: { categoryId } });
  if (productCount > 0) {
    throw new Error(`Cannot delete: ${productCount} product${productCount === 1 ? '' : 's'} still in this category.`);
  }
  await prisma.category.delete({ where: { id: categoryId } });
  revalidate();
}
