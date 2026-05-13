'use client';

import { useTransition } from 'react';
import { deleteProductImageAction } from '../../actions';

export function ProductImageRemoveButton({ imageId }: { imageId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm('Remove this image?')) {
          startTransition(() => deleteProductImageAction(imageId));
        }
      }}
      style={{ color: '#a82323', borderBottom: '1px solid var(--line)', paddingBottom: 1, opacity: pending ? 0.5 : 1 }}
    >
      Remove
    </button>
  );
}
