'use client';

import { useTransition, useState } from 'react';
import { addToCartBySlugAction } from '@/app/cart/actions';

interface Props {
  slug: string;
  qty?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function AddToCartButton({ slug, qty = 1, className, style, children }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onClick() {
    setError(null);
    setDone(false);
    startTransition(async () => {
      try {
        await addToCartBySlugAction(slug, qty);
        setDone(true);
        // brief acknowledgement; cart count in nav updates via revalidatePath
        setTimeout(() => setDone(false), 1500);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not add to cart');
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={className}
        style={style}
      >
        {pending ? 'Adding…' : done ? 'Added ✓' : children}
      </button>
      {error && (
        <div role="alert" style={{ marginTop: 8, fontSize: 12, color: '#a82323' }}>{error}</div>
      )}
    </>
  );
}
