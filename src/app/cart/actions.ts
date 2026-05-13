'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { ensureCart, mergeGuestCartIntoUser } from '@/lib/cart';
import { getCurrentUser } from '@/lib/auth';

function revalidateCartUI() {
  // /cart shows the line items; every page renders the nav badge.
  revalidatePath('/cart');
  revalidatePath('/', 'layout');
}

export async function addToCartAction(productId: string, qty: number = 1) {
  if (!productId) throw new Error('productId is required');
  if (!Number.isFinite(qty) || qty < 1) qty = 1;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, pricePaise: true, stockUnits: true, isPublished: true },
  });
  if (!product || !product.isPublished) {
    throw new Error('Product not available');
  }

  const cart = await ensureCart();

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId: product.id } },
    update: { qty: { increment: qty } },
    create: {
      cartId: cart.id,
      productId: product.id,
      qty,
      priceAtAddPaise: product.pricePaise,
    },
  });

  revalidateCartUI();
}

/**
 * Add by slug — convenience for product cards / PDP that hold the slug.
 */
export async function addToCartBySlugAction(slug: string, qty: number = 1) {
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!product) throw new Error('Product not found');
  await addToCartAction(product.id, qty);
}

export async function updateCartItemAction(itemId: string, qty: number) {
  if (!itemId) throw new Error('itemId is required');

  if (qty < 1) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({ where: { id: itemId }, data: { qty } });
  }

  revalidateCartUI();
}

export async function removeCartItemAction(itemId: string) {
  if (!itemId) throw new Error('itemId is required');
  await prisma.cartItem.delete({ where: { id: itemId } });
  revalidateCartUI();
}

/**
 * Called from the login page after a successful client-side sign-in
 * (signInWithPassword, verifyOtp, signUp with immediate session).
 * OAuth/magic-link flows route through /auth/callback which already does this.
 */
export async function claimGuestCartAction() {
  const user = await getCurrentUser();
  if (!user) return;
  await mergeGuestCartIntoUser(user.id);
  revalidateCartUI();
}
