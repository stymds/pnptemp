'use server';

import { revalidatePath } from 'next/cache';
import { getCart } from '@/lib/cart';
import {
  validateCoupon,
  setAppliedCouponCookie,
  clearAppliedCouponCookie,
  CouponError,
} from '@/lib/coupons';

export type CouponActionState =
  | { ok: true; description: string }
  | { ok: false; error: string }
  | null;

export async function applyCouponAction(
  _prev: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  const code = String(formData.get('code') ?? '').trim();
  if (!code) return { ok: false, error: 'Enter a coupon code' };

  const cart = await getCart();
  const subtotalPaise = cart?.items.reduce(
    (s, i) => s + i.priceAtAddPaise * i.qty,
    0,
  ) ?? 0;
  if (subtotalPaise === 0) {
    return { ok: false, error: 'Add items to your bag first' };
  }

  try {
    const result = await validateCoupon(code, subtotalPaise);
    await setAppliedCouponCookie(result.code);
    revalidatePath('/cart');
    revalidatePath('/checkout');
    return { ok: true, description: `${result.description} via ${result.code}` };
  } catch (e) {
    if (e instanceof CouponError) return { ok: false, error: e.message };
    return { ok: false, error: 'Could not apply coupon' };
  }
}

export async function removeCouponAction() {
  await clearAppliedCouponCookie();
  revalidatePath('/cart');
  revalidatePath('/checkout');
}
