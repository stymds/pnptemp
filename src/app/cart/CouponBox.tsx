'use client';

import { useActionState, useTransition } from 'react';
import { Icons } from '@/components/icons';
import {
  applyCouponAction,
  removeCouponAction,
  type CouponActionState,
} from './coupon-actions';

export function CouponBox({
  appliedCode,
  appliedDescription,
  appliedDiscountRupees,
}: {
  appliedCode: string | null;
  appliedDescription: string | null;
  appliedDiscountRupees: number;
}) {
  const [state, formAction, pending] = useActionState<CouponActionState, FormData>(
    applyCouponAction,
    null,
  );
  const [removing, startRemove] = useTransition();

  if (appliedCode) {
    return (
      <div style={{
        padding: 14, borderRadius: 'var(--r-md)',
        background: 'rgba(60,140,90,0.08)', border: '1px solid rgba(60,140,90,0.25)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ color: 'var(--ok)' }}>{Icons.check}</span>
        <div style={{ flex: 1, fontSize: 13 }}>
          <div style={{ fontWeight: 500 }}>
            <span className="mono">{appliedCode}</span>
            {' '}<span className="muted">applied</span>
          </div>
          <div className="muted" style={{ fontSize: 12 }}>
            {appliedDescription} · You save Rs. {appliedDiscountRupees.toLocaleString('en-IN')}
          </div>
        </div>
        <button
          type="button"
          disabled={removing}
          onClick={() => startRemove(() => removeCouponAction())}
          style={{ fontSize: 12, color: 'var(--ink-3)', borderBottom: '1px solid var(--line)', paddingBottom: 1 }}
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          name="code"
          className="input"
          placeholder="Promo code"
          autoComplete="off"
          style={{ flex: 1, textTransform: 'uppercase' }}
          required
        />
        <button type="submit" disabled={pending} className="btn btn-ghost btn-sm">
          {pending ? '…' : 'Apply'}
        </button>
      </div>
      {state?.ok === false && (
        <div role="alert" style={{ fontSize: 12, color: '#a82323' }}>{state.error}</div>
      )}
    </form>
  );
}
