'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

const upsertSchema = z.object({
  code: z.string().regex(/^[A-Z0-9_-]+$/, 'Use UPPERCASE letters, digits, dashes, underscores').max(40),
  type: z.enum(['PERCENT', 'FIXED_AMOUNT']),
  value: z.number().int().positive(),
  minOrderRupees: z.number().int().nonnegative().optional(),
  maxDiscountRupees: z.number().int().nonnegative().optional(),
  usageLimit: z.number().int().nonnegative().optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CouponFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

function readForm(formData: FormData) {
  const num = (k: string) => {
    const v = formData.get(k);
    if (v === null || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const str = (k: string) => {
    const v = formData.get(k);
    if (v === null) return undefined;
    const s = String(v).trim();
    return s ? s : undefined;
  };
  return {
    code: String(formData.get('code') ?? '').trim().toUpperCase(),
    type: String(formData.get('type') ?? 'PERCENT') as 'PERCENT' | 'FIXED_AMOUNT',
    value: num('value') ?? 0,
    minOrderRupees: num('minOrderRupees'),
    maxDiscountRupees: num('maxDiscountRupees'),
    usageLimit: num('usageLimit'),
    startsAt: str('startsAt'),
    expiresAt: str('expiresAt'),
    isActive: formData.get('isActive') === 'on',
  };
}

function toCouponData(parsed: z.infer<typeof upsertSchema>) {
  return {
    code: parsed.code,
    type: parsed.type,
    // For PERCENT: value is the percent integer. For FIXED_AMOUNT: store paise.
    value: parsed.type === 'PERCENT' ? parsed.value : parsed.value * 100,
    minOrderPaise: parsed.minOrderRupees != null ? parsed.minOrderRupees * 100 : null,
    maxDiscountPaise: parsed.maxDiscountRupees != null ? parsed.maxDiscountRupees * 100 : null,
    usageLimit: parsed.usageLimit ?? null,
    startsAt: parsed.startsAt ? new Date(parsed.startsAt) : null,
    expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
    isActive: parsed.isActive,
  };
}

export async function createCouponAction(
  _prev: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  try {
    await requireAdmin();
    const parsed = upsertSchema.parse(readForm(formData));
    const exists = await prisma.coupon.findUnique({ where: { code: parsed.code } });
    if (exists) return { ok: false, error: `Code "${parsed.code}" already exists` };
    if (parsed.type === 'PERCENT' && parsed.value > 100) {
      return { ok: false, error: 'Percent coupons must be ≤ 100' };
    }
    await prisma.coupon.create({ data: toCouponData(parsed) });
    revalidatePath('/admin/coupons');
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0]?.message ?? 'Validation failed' };
    return { ok: false, error: e instanceof Error ? e.message : 'Could not create' };
  }
  redirect('/admin/coupons');
}

export async function updateCouponAction(
  couponId: string,
  _prev: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  try {
    await requireAdmin();
    const parsed = upsertSchema.parse(readForm(formData));
    if (parsed.type === 'PERCENT' && parsed.value > 100) {
      return { ok: false, error: 'Percent coupons must be ≤ 100' };
    }
    const clash = await prisma.coupon.findFirst({ where: { code: parsed.code, id: { not: couponId } } });
    if (clash) return { ok: false, error: `Code "${parsed.code}" already taken` };
    await prisma.coupon.update({ where: { id: couponId }, data: toCouponData(parsed) });
    revalidatePath('/admin/coupons');
    return { ok: true };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0]?.message ?? 'Validation failed' };
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save' };
  }
}

export async function deleteCouponAction(couponId: string) {
  await requireAdmin();
  await prisma.coupon.delete({ where: { id: couponId } });
  revalidatePath('/admin/coupons');
}

export async function toggleCouponActiveAction(couponId: string) {
  await requireAdmin();
  const c = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!c) return;
  await prisma.coupon.update({ where: { id: couponId }, data: { isActive: !c.isActive } });
  revalidatePath('/admin/coupons');
}
