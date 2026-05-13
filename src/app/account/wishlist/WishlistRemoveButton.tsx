'use client';

import { useTransition } from 'react';
import { removeWishlistItemAction } from './actions';

export function WishlistRemoveButton({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => startTransition(() => removeWishlistItemAction(productId))}
      disabled={pending}
      style={{
        fontSize: 12, color: 'var(--ink-3)',
        borderBottom: '1px solid var(--line)', paddingBottom: 1,
        opacity: pending ? 0.5 : 1,
      }}
    >
      Remove
    </button>
  );
}
