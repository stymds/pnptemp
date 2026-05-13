'use client';

import { useState, useTransition } from 'react';
import { toggleUserRoleAction } from './actions';

export function UserRoleButton({
  userId,
  currentRole,
  isMe,
}: {
  userId: string;
  currentRole: 'ADMIN' | 'CUSTOMER';
  isMe: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isMe) {
    return <span className="muted" style={{ fontSize: 11, fontStyle: 'italic' }}>that&apos;s you</span>;
  }

  const next = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
  const label = currentRole === 'ADMIN' ? 'Demote to customer' : 'Make admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`${label}?`)) return;
          setError(null);
          startTransition(async () => {
            try {
              await toggleUserRoleAction(userId);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Failed');
            }
          });
        }}
        style={{
          fontSize: 12, borderBottom: '1px solid var(--line)', paddingBottom: 1,
          color: next === 'ADMIN' ? 'var(--ink)' : '#a82323',
          opacity: pending ? 0.5 : 1,
        }}
      >
        {pending ? 'Working…' : label}
      </button>
      {error && (
        <div role="alert" style={{ fontSize: 11, color: '#a82323' }}>{error}</div>
      )}
    </div>
  );
}
