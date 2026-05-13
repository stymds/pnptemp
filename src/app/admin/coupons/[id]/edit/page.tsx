import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { CouponForm } from '../../CouponForm';

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) notFound();

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          <Link href="/admin/coupons">Coupons</Link> / <span style={{ color: 'var(--ink)' }}>{coupon.code}</span>
        </div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em' }}>{coupon.code}</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
          Used {coupon.usageCount} time{coupon.usageCount === 1 ? '' : 's'}
          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
        </p>
      </div>
      <CouponForm
        mode="edit"
        initial={{
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          minOrderPaise: coupon.minOrderPaise,
          maxDiscountPaise: coupon.maxDiscountPaise,
          usageLimit: coupon.usageLimit,
          startsAt: coupon.startsAt,
          expiresAt: coupon.expiresAt,
          isActive: coupon.isActive,
        }}
      />
    </>
  );
}
