'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

/**
 * Toggle a product in the user's wishlist by slug. Returns the new state.
 * If the user is not signed in, redirects to /login.
 */
export async function toggleWishlistAction(slug: string): Promise<{ wished: boolean }> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent('/cameras/' + slug)}`);

  const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (!product) throw new Error('Product not found');

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId: product.id } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath('/account/wishlist');
    revalidatePath('/cameras');
    revalidatePath(`/cameras/${slug}`);
    return { wished: false };
  }
  await prisma.wishlistItem.create({
    data: { userId: user.id, productId: product.id },
  });
  revalidatePath('/account/wishlist');
  revalidatePath('/cameras');
  revalidatePath(`/cameras/${slug}`);
  return { wished: true };
}

export async function removeWishlistItemAction(productId: string) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  await prisma.wishlistItem.deleteMany({ where: { userId: user.id, productId } });
  revalidatePath('/account/wishlist');
}
