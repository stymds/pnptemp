import Link from 'next/link';
import { CouponForm } from '../CouponForm';

export default function NewCouponPage() {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          <Link href="/admin/coupons">Coupons</Link> / <span style={{ color: 'var(--ink)' }}>New</span>
        </div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em' }}>New coupon</h1>
      </div>
      <CouponForm mode="create" />
    </>
  );
}
