'use client';

import { useActionState } from 'react';
import { updateProfileAction, type ProfileFormState } from './actions';

export function ProfileForm({
  initialFullName,
  initialPhone,
}: {
  initialFullName: string;
  initialPhone: string;
}) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    updateProfileAction,
    null,
  );

  return (
    <form action={formAction} style={{ display: 'grid', gap: 12 }}>
      <style>{`
        .profile-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 640px) { .profile-row-2 { grid-template-columns: 1fr; } }
      `}</style>
      <div className="profile-row-2">
        <div>
          <label className="label">Full name</label>
          <input className="input" name="fullName" defaultValue={initialFullName} autoComplete="name" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" name="phone" defaultValue={initialPhone} inputMode="tel" autoComplete="tel" placeholder="+91 98201 45678" />
        </div>
      </div>

      {state?.ok === false && (
        <div role="alert" style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'rgba(220,60,60,0.08)', color: '#a82323', fontSize: 12 }}>
          {state.error}
        </div>
      )}
      {state?.ok === true && (
        <div role="status" style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'rgba(60,140,90,0.08)', color: 'var(--ok)', fontSize: 12 }}>
          Saved.
        </div>
      )}

      <button type="submit" disabled={pending} className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }}>
        {pending ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
