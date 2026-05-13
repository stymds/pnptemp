'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createAddressAction, type AddressFormState } from './actions';

export function AddressForm() {
  const [state, formAction, pending] = useActionState<AddressFormState, FormData>(
    createAddressAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} style={{ display: 'grid', gap: 12 }}>
      <style>{`
        .addr-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .addr-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        @media (max-width: 640px) {
          .addr-row-2 { grid-template-columns: 1fr; }
          .addr-row-3 { grid-template-columns: 1fr 1fr; }
          .addr-row-3 > .addr-pincode { grid-column: 1 / -1; }
        }
      `}</style>
      <div className="addr-row-2">
        <div>
          <label className="label">Full name</label>
          <input className="input" name="fullName" required autoComplete="name" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" name="phone" required inputMode="tel" autoComplete="tel" placeholder="+91 98201 45678" />
        </div>
      </div>
      <div>
        <label className="label">Address line 1</label>
        <input className="input" name="line1" required autoComplete="address-line1" />
      </div>
      <div>
        <label className="label">Address line 2 (optional)</label>
        <input className="input" name="line2" autoComplete="address-line2" />
      </div>
      <div className="addr-row-3">
        <div>
          <label className="label">City</label>
          <input className="input" name="city" required autoComplete="address-level2" />
        </div>
        <div>
          <label className="label">State</label>
          <input className="input" name="state" required autoComplete="address-level1" />
        </div>
        <div className="addr-pincode">
          <label className="label">PIN code</label>
          <input className="input" name="pincode" required inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="postal-code" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', fontSize: 13 }}>
        <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <input type="radio" name="type" value="SHIPPING" defaultChecked /> Shipping
        </label>
        <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <input type="radio" name="type" value="BILLING" /> Billing
        </label>
        <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
          <input type="checkbox" name="isDefault" /> Set as default
        </label>
      </div>

      {state?.ok === false && (
        <div role="alert" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'rgba(220,60,60,0.08)', color: '#a82323', fontSize: 13 }}>
          {state.error}
        </div>
      )}
      {state?.ok === true && (
        <div role="status" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'rgba(60,140,90,0.08)', color: 'var(--ok)', fontSize: 13 }}>
          Saved.
        </div>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary btn-lg" style={{ marginTop: 4 }}>
        {pending ? 'Saving…' : 'Save address →'}
      </button>
    </form>
  );
}
