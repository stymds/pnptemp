'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createCategoryAction, type CategoryFormState } from './actions';

export function CategoryAddForm() {
  const [state, action, pending] = useActionState<CategoryFormState, FormData>(
    createCategoryAction,
    null,
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="admin-cat-add-form" style={{ alignItems: 'end', marginBottom: 24, padding: 16, border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
      <style>{`
        .admin-cat-add-form { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; }
        @media (max-width: 768px) {
          .admin-cat-add-form { grid-template-columns: 1fr; }
        }
      `}</style>
      <div>
        <label className="label">Slug</label>
        <input className="input" name="slug" required placeholder="lenses" pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?" />
      </div>
      <div>
        <label className="label">Display name</label>
        <input className="input" name="name" required placeholder="Lenses" />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? 'Adding…' : 'Add category'}
      </button>
      {state?.ok === false && (
        <div role="alert" style={{ gridColumn: '1 / -1', padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'rgba(220,60,60,0.08)', color: '#a82323', fontSize: 12 }}>
          {state.error}
        </div>
      )}
    </form>
  );
}
