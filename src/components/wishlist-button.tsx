'use client';

import { useState, useTransition } from 'react';
import { Icons } from '@/components/icons';
import { toggleWishlistAction } from '@/app/account/wishlist/actions';

interface Props {
  slug: string;
  initialWished: boolean;
  /** "card" floats over a tile; "icon" is a simple round button used on PDP */
  variant?: 'card' | 'icon';
  className?: string;
  style?: React.CSSProperties;
}

export function WishlistButton({ slug, initialWished, variant = 'card', className, style }: Props) {
  const [wished, setWished] = useState(initialWished);
  const [pending, startTransition] = useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !wished;
    setWished(next); // optimistic
    startTransition(async () => {
      try {
        const result = await toggleWishlistAction(slug);
        setWished(result.wished);
      } catch {
        setWished(!next); // revert on error
      }
    });
  }

  const baseStyle: React.CSSProperties =
    variant === 'card'
      ? {
          color: wished ? 'var(--accent)' : 'var(--ink)',
          opacity: pending ? 0.6 : 1,
        }
      : {
          color: wished ? 'var(--accent)' : 'var(--ink)',
          opacity: pending ? 0.6 : 1,
        };

  const cls = variant === 'card' ? 'card-wish' + (wished ? ' on' : '') : className;

  return (
    <button
      type="button"
      aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={wished}
      onClick={onClick}
      disabled={pending}
      className={cls}
      style={{ ...baseStyle, ...style }}
    >
      {Icons.heart}
    </button>
  );
}
