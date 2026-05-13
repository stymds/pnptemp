'use client';

import { useTransition } from 'react';
import { Icons } from '@/components/icons';
import { updateCartItemAction, removeCartItemAction } from './actions';

export function CartItemControls({ itemId, qty }: { itemId: string; qty: number }) {
  const [pending, startTransition] = useTransition();

  const set = (next: number) => {
    startTransition(async () => {
      await updateCartItemAction(itemId, next);
    });
  };

  const remove = () => {
    startTransition(async () => {
      await removeCartItemAction(itemId);
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', opacity: pending ? 0.5 : 1, pointerEvents: pending ? 'none' : 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 999, height: 32 }}>
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => set(qty - 1)}
          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {Icons.minus}
        </button>
        <span style={{ minWidth: 20, textAlign: 'center', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{qty}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => set(qty + 1)}
          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {Icons.plus}
        </button>
      </div>
      <button
        type="button"
        onClick={remove}
        style={{ fontSize: 12, color: 'var(--ink-3)', borderBottom: '1px solid var(--line)', paddingBottom: 2 }}
      >
        Remove
      </button>
    </div>
  );
}
