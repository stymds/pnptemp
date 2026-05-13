import Link from 'next/link';
import { prisma } from '@/lib/db';
import { CouponRowActions } from './CouponRowActions';

const fmt = (paise: number) => 'Rs. ' + Math.round(paise / 100).toLocaleString('en-IN');

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 6 }}>Coupons</h1>
          <p className="muted" style={{ fontSize: 13 }}>{coupons.length} total</p>
        </div>
        <Link href="/admin/coupons/new" className="btn btn-primary">+ New coupon</Link>
      </div>

      <style>{`
        .admin-coupons-row {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 18px;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid var(--line);
        }
        .admin-coupons-meta {
          display: flex; align-items: center; gap: 16px;
          flex-wrap: wrap; justify-content: flex-end;
        }
        @media (max-width: 768px) {
          .admin-coupons-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .admin-coupons-meta {
            justify-content: space-between;
            gap: 10px 14px;
          }
        }
      `}</style>
      {coupons.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--paper-2)', borderRadius: 'var(--r-md)' }}>
          <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>No coupons yet.</p>
          <Link href="/admin/coupons/new" className="btn btn-primary btn-sm">Create your first →</Link>
        </div>
      ) : (
        <div style={{ borderTop: '1px solid var(--ink)' }}>
          {coupons.map((c) => {
            const usage = c.usageLimit
              ? `${c.usageCount}/${c.usageLimit}`
              : `${c.usageCount}`;
            const valueLabel =
              c.type === 'PERCENT'
                ? `${c.value}% off`
                : `${fmt(c.value)} off`;
            const window =
              c.expiresAt
                ? `expires ${c.expiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : c.startsAt
                ? `starts ${c.startsAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                : 'no end date';
            return (
              <div key={c.id} className="admin-coupons-row">
                <div style={{ minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 14, letterSpacing: '0.05em', fontWeight: 500 }}>{c.code}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{window}</div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13 }}>{valueLabel}</div>
                  <div className="muted" style={{ fontSize: 11 }}>
                    {c.minOrderPaise ? `min ${fmt(c.minOrderPaise)}` : 'no minimum'}
                    {c.type === 'PERCENT' && c.maxDiscountPaise ? ` · cap ${fmt(c.maxDiscountPaise)}` : ''}
                  </div>
                </div>
                <div className="admin-coupons-meta">
                  <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink-2)' }}>
                    {usage}
                  </div>
                  <span style={{
                    fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: c.isActive ? 'var(--ok)' : 'var(--ink-3)',
                  }}>
                    {c.isActive ? 'Active' : 'Disabled'}
                  </span>
                  <CouponRowActions couponId={c.id} isActive={c.isActive} code={c.code} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
