import 'server-only';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

const COOKIE_NAME = 'applied_coupon';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface CouponApplication {
  code: string;
  discountPaise: number;
  description: string;
}

export class CouponError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CouponError';
  }
}

const fmtRupees = (paise: number) => 'Rs. ' + Math.round(paise / 100).toLocaleString('en-IN');

/**
 * Validate a coupon against a cart subtotal. Throws CouponError with a
 * human-readable message if not applicable. Idempotent — does NOT increment
 * usageCount (that happens in createOrderFromCart on actual order placement).
 */
export async function validateCoupon(
  rawCode: string,
  subtotalPaise: number,
): Promise<CouponApplication> {
  const code = rawCode.trim().toUpperCase();
  if (!code) throw new CouponError('Enter a coupon code');

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) throw new CouponError('Coupon not found');
  if (!coupon.isActive) throw new CouponError('This coupon is inactive');

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) throw new CouponError('Coupon not yet active');
  if (coupon.expiresAt && coupon.expiresAt < now) throw new CouponError('Coupon has expired');
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw new CouponError('Coupon usage limit reached');
  }
  if (coupon.minOrderPaise !== null && subtotalPaise < coupon.minOrderPaise) {
    throw new CouponError(`Minimum order ${fmtRupees(coupon.minOrderPaise)}`);
  }

  let discountPaise: number;
  let description: string;
  if (coupon.type === 'PERCENT') {
    discountPaise = Math.floor((subtotalPaise * coupon.value) / 100);
    if (coupon.maxDiscountPaise !== null) {
      discountPaise = Math.min(discountPaise, coupon.maxDiscountPaise);
    }
    description = `${coupon.value}% off`;
  } else {
    discountPaise = Math.min(coupon.value, subtotalPaise);
    description = `${fmtRupees(coupon.value)} off`;
  }

  return { code: coupon.code, discountPaise, description };
}

/**
 * Read the currently applied coupon code from the cookie. Returns null if
 * none is set; does NOT validate against the cart.
 */
export async function getAppliedCouponCode(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE_NAME)?.value ?? null;
}

/**
 * Read + validate the cookie's coupon against the given subtotal. Returns
 * null if no coupon is set, or if the coupon is no longer valid for the
 * current subtotal (caller can clear the cookie if desired).
 */
export async function getAppliedCoupon(
  subtotalPaise: number,
): Promise<CouponApplication | null> {
  const code = await getAppliedCouponCode();
  if (!code) return null;
  try {
    return await validateCoupon(code, subtotalPaise);
  } catch {
    return null;
  }
}

/**
 * Cookie helpers — only callable from Server Actions / Route Handlers.
 */
export async function setAppliedCouponCookie(code: string) {
  const c = await cookies();
  c.set(COOKIE_NAME, code, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function clearAppliedCouponCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

/**
 * Increment the usage count for a coupon. Called from order creation.
 */
export async function incrementCouponUsage(code: string) {
  await prisma.coupon.updateMany({
    where: { code },
    data: { usageCount: { increment: 1 } },
  });
}
