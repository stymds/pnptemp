'use client';

import { useTransition } from 'react';
import { deleteAddressAction, setDefaultAddressAction } from './actions';

export function AddressActions({ addressId, isDefault }: { addressId: string; isDefault: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div style={{ display: 'flex', gap: 12, fontSize: 12, opacity: pending ? 0.5 : 1 }}>
      {!isDefault && (
        <button
          type="button"
          onClick={() => startTransition(() => setDefaultAddressAction(addressId))}
          style={{ borderBottom: '1px solid var(--line)', paddingBottom: 1 }}
        >
          Set as default
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          if (confirm('Delete this address?')) {
            startTransition(() => deleteAddressAction(addressId));
          }
        }}
        style={{ borderBottom: '1px solid var(--line)', paddingBottom: 1, color: '#a82323' }}
      >
        Delete
      </button>
    </div>
  );
}
