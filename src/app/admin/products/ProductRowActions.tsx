'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { deleteProductAction, togglePublishedAction } from './actions';

export function ProductRowActions({
  productId,
  isPublished,
  productName,
}: {
  productId: string;
  isPublished: boolean;
  productName: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div style={{ display: 'flex', gap: 14, fontSize: 12, opacity: pending ? 0.5 : 1, alignItems: 'center' }}>
      <Link href={`/admin/products/${productId}/edit`} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 1 }}>
        Edit
      </Link>
      <button
        type="button"
        onClick={() => startTransition(() => togglePublishedAction(productId))}
        style={{ borderBottom: '1px solid var(--line)', paddingBottom: 1 }}
      >
        {isPublished ? 'Hide' : 'Publish'}
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm(`Delete "${productName}"? This cannot be undone.`)) {
            startTransition(() => deleteProductAction(productId));
          }
        }}
        style={{ borderBottom: '1px solid var(--line)', paddingBottom: 1, color: '#a82323' }}
      >
        Delete
      </button>
    </div>
  );
}
