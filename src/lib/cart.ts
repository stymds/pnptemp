import 'server-only';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const COOKIE_NAME = 'cart_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

const cartInclude = {
  items: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      product: {
        include: {
          category: true,
          images: { orderBy: { position: 'asc' as const }, take: 1 },
        },
      },
    },
  },
};

export type CartWithItems = NonNullable<Awaited<ReturnType<typeof getCart>>>;
export type CartLineItem = CartWithItems['items'][number];

/**
 * Read-only cart fetch. Safe to call from Server Components.
 * Returns null if the visitor is a guest with no cart_token cookie.
 */
export async function getCart() {
  const user = await getCurrentUser();
  if (user) {
    return prisma.cart.findUnique({
      where: { userId: user.id },
      include: cartInclude,
    });
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return prisma.cart.findUnique({
    where: { cartToken: token },
    include: cartInclude,
  });
}

/**
 * Returns the visitor's cart, creating one (and setting the cart_token cookie
 * for guests) if needed. ONLY call from Server Actions or Route Handlers —
 * Server Components cannot set cookies.
 */
export async function ensureCart() {
  const user = await getCurrentUser();
  if (user) {
    return prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  }
  const cookieStore = await cookies();
  let token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    token = crypto.randomUUID();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return prisma.cart.upsert({
    where: { cartToken: token },
    update: {},
    create: { cartToken: token },
  });
}

/**
 * Total item count (sum of qty) across all lines. Used by nav badge.
 */
export async function getCartItemCount(): Promise<number> {
  const cart = await getCart();
  if (!cart) return 0;
  return cart.items.reduce((s, i) => s + i.qty, 0);
}

/**
 * On sign-in, fold the guest cart (identified by cart_token cookie) into the
 * user's cart, summing qty for matching products. Deletes guest cart and
 * clears the cookie. ONLY call from Server Action / Route Handler.
 */
export async function mergeGuestCartIntoUser(userId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return;

  const guestCart = await prisma.cart.findUnique({
    where: { cartToken: token },
    include: { items: true },
  });

  if (!guestCart) {
    cookieStore.delete(COOKIE_NAME);
    return;
  }

  if (guestCart.items.length === 0) {
    await prisma.cart.delete({ where: { id: guestCart.id } });
    cookieStore.delete(COOKIE_NAME);
    return;
  }

  const userCart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  for (const it of guestCart.items) {
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: userCart.id, productId: it.productId } },
      update: { qty: { increment: it.qty } },
      create: {
        cartId: userCart.id,
        productId: it.productId,
        qty: it.qty,
        priceAtAddPaise: it.priceAtAddPaise,
      },
    });
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });
  cookieStore.delete(COOKIE_NAME);
}
