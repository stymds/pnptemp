'use client';

import { useActionState } from 'react';
import {
  createCouponAction,
  updateCouponAction,
  type CouponFormState,
} from './actions';

interface Initial {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED_AMOUNT';
  value: number;
  minOrderPaise: number | null;
  maxDiscountPaise: number | null;
  usageLimit: number | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
}

function isoForInput(d: Date | null): string {
  if (!d) return '';
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function CouponForm({
  mode,
  initial,
}: {
  mode: 'create' | 'edit';
  initial?: Initial;
}) {
  const action =
    mode === 'create'
      ? createCouponAction
      : updateCouponAction.bind(null, initial!.id);

  const [state, formAction, pending] = useActionState<CouponFormState, FormData>(
    action,
    null,
  );

  // Display value: PERCENT stores integer percent, FIXED stores paise.
  const initialDisplayValue = initial
    ? initial.type === 'PERCENT'
      ? initial.value
      : Math.round(initial.value / 100)
    : '';

  return (
    <form action={formAction} style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
      <style>{`
        .admin-form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .admin-form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        @media (max-width: 768px) {
          .admin-form-row-2 { grid-template-columns: 1fr; }
          .admin-form-row-3 { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="admin-form-row-2">
        <div>
          <label className="label">Code *</label>
          <input
            className="input"
            name="code"
            required
            defaultValue={initial?.code ?? ''}
            placeholder="WELCOME10"
            pattern="[A-Z0-9_-]+"
            style={{ textTransform: 'uppercase' }}
          />
        </div>
        <div>
          <label className="label">Type *</label>
          <select className="input" name="type" defaultValue={initial?.type ?? 'PERCENT'}>
            <option value="PERCENT">Percent off (%)</option>
            <option value="FIXED_AMOUNT">Fixed amount off (₹)</option>
          </select>
        </div>
      </div>

      <div className="admin-form-row-3">
        <div>
          <label className="label">Value *</label>
          <input
            className="input"
            type="number"
            name="value"
            required
            min={1}
            step="1"
            defaultValue={initialDisplayValue}
            placeholder="10"
          />
          <small className="muted" style={{ fontSize: 11 }}>Percent (1–100) or rupees off</small>
        </div>
        <div>
          <label className="label">Min order (₹)</label>
          <input
            className="input"
            type="number"
            name="minOrderRupees"
            min={0}
            step="1"
            defaultValue={initial?.minOrderPaise ? Math.round(initial.minOrderPaise / 100) : ''}
            placeholder="optional"
          />
        </div>
        <div>
          <label className="label">Max discount (₹)</label>
          <input
            className="input"
            type="number"
            name="maxDiscountRupees"
            min={0}
            step="1"
            defaultValue={initial?.maxDiscountPaise ? Math.round(initial.maxDiscountPaise / 100) : ''}
            placeholder="for % type"
          />
        </div>
      </div>

      <div className="admin-form-row-3">
        <div>
          <label className="label">Usage limit</label>
          <input
            className="input"
            type="number"
            name="usageLimit"
            min={0}
            step="1"
            defaultValue={initial?.usageLimit ?? ''}
            placeholder="unlimited"
          />
        </div>
        <div>
          <label className="label">Starts at</label>
          <input
            className="input"
            type="datetime-local"
            name="startsAt"
            defaultValue={isoForInput(initial?.startsAt ?? null)}
          />
        </div>
        <div>
          <label className="label">Expires at</label>
          <input
            className="input"
            type="datetime-local"
            name="expiresAt"
            defaultValue={isoForInput(initial?.expiresAt ?? null)}
          />
        </div>
      </div>

      <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
        <input type="checkbox" name="isActive" defaultChecked={initial?.isActive ?? true} />
        Active
      </label>

      {state?.ok === false && (
        <div role="alert" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'rgba(220,60,60,0.08)', color: '#a82323', fontSize: 13 }}>
          {state.error}
        </div>
      )}
      {state?.ok === true && mode === 'edit' && (
        <div role="status" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'rgba(60,140,90,0.08)', color: 'var(--ok)', fontSize: 13 }}>
          Saved.
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" disabled={pending} className="btn btn-primary btn-lg">
          {pending ? 'Saving…' : mode === 'create' ? 'Create coupon' : 'Save changes'}
        </button>
        <a href="/admin/coupons" className="btn btn-ghost btn-lg">Cancel</a>
      </div>
    </form>
  );
}
