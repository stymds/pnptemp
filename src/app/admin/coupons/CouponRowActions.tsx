'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { deleteCouponAction, toggleCouponActiveAction } from './actions';

export function CouponRowActions({
  couponId,
  isActive,
  code,
}: {
  couponId: string;
  isActive: boolean;
  code: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div style={{ display: 'flex', gap: 14, fontSize: 12, opacity: pending ? 0.5 : 1, alignItems: 'center' }}>
      <Link href={`/admin/coupons/${couponId}/edit`} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 1 }}>
        Edit
      </Link>
      <button
        type="button"
        onClick={() => startTransition(() => toggleCouponActiveAction(couponId))}
        style={{ borderBottom: '1px solid var(--line)', paddingBottom: 1 }}
      >
        {isActive ? 'Disable' : 'Enable'}
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm(`Delete coupon "${code}"?`)) {
            startTransition(() => deleteCouponAction(couponId));
          }
        }}
        style={{ borderBottom: '1px solid var(--line)', paddingBottom: 1, color: '#a82323' }}
      >
        Delete
      </button>
    </div>
  );
}
