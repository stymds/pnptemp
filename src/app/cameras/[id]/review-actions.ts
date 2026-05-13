'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().or(z.literal('').transform(() => undefined)),
  body: z.string().trim().max(2000).optional().or(z.literal('').transform(() => undefined)),
});

export type ReviewFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

async function recomputeProductAggregate(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewsCount: agg._count,
    },
  });
}

export async function submitReviewAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const slug = String(formData.get('productSlug') ?? '');
      redirect(`/login?next=${encodeURIComponent('/cameras/' + slug)}`);
    }

    const parsed = reviewSchema.parse({
      productId: String(formData.get('productId') ?? ''),
      rating: Number(formData.get('rating') ?? '0'),
      title: String(formData.get('title') ?? ''),
      body: String(formData.get('body') ?? ''),
    });

    // Verify the user actually purchased + paid for this product.
    const purchased = await prisma.orderItem.count({
      where: {
        productId: parsed.productId,
        order: {
          userId: user.id,
          status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
        },
      },
    });
    if (purchased === 0) {
      return { ok: false, error: 'Only verified purchasers can review this product.' };
    }

    await prisma.review.upsert({
      where: { userId_productId: { userId: user.id, productId: parsed.productId } },
      update: {
        rating: parsed.rating,
        title: parsed.title ?? null,
        body: parsed.body ?? null,
      },
      create: {
        userId: user.id,
        productId: parsed.productId,
        rating: parsed.rating,
        title: parsed.title ?? null,
        body: parsed.body ?? null,
        verifiedPurchase: true,
      },
    });

    await recomputeProductAggregate(parsed.productId);

    const product = await prisma.product.findUnique({
      where: { id: parsed.productId },
      select: { slug: true },
    });
    if (product) revalidatePath(`/cameras/${product.slug}`);
    revalidatePath('/cameras');

    return { ok: true };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { ok: false, error: e.issues[0]?.message ?? 'Validation failed' };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save review' };
  }
}

export async function deleteOwnReviewAction(productId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.review.deleteMany({ where: { userId: user.id, productId } });
  await recomputeProductAggregate(productId);
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  if (product) revalidatePath(`/cameras/${product.slug}`);
  revalidatePath('/cameras');
}
