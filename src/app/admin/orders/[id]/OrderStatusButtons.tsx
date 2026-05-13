'use client';

import { useState, useTransition } from 'react';
import type { OrderStatus } from '@prisma/client';
import { transitionOrderStatusAction } from '../actions';

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

const NEXT_FOR: Record<OrderStatus, Array<{ to: OrderStatus; label: string; tone: 'primary' | 'danger' }>> = {
  PENDING: [{ to: 'CANCELLED', label: 'Cancel', tone: 'danger' }],
  PAID: [
    { to: 'SHIPPED', label: 'Mark shipped →', tone: 'primary' },
    { to: 'CANCELLED', label: 'Cancel + restock', tone: 'danger' },
  ],
  SHIPPED: [{ to: 'DELIVERED', label: 'Mark delivered →', tone: 'primary' }],
  DELIVERED: [{ to: 'REFUNDED', label: 'Refund + restock', tone: 'danger' }],
  CANCELLED: [],
  REFUNDED: [],
};

export function OrderStatusButtons({ orderId, currentStatus }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const choices = NEXT_FOR[currentStatus];
  if (choices.length === 0) {
    return <p className="muted" style={{ fontSize: 12 }}>No further transitions.</p>;
  }

  function go(to: OrderStatus, label: string) {
    setError(null);
    if (label.toLowerCase().includes('cancel') || label.toLowerCase().includes('refund')) {
      if (!confirm(`${label} — are you sure?`)) return;
    }
    startTransition(async () => {
      try {
        await transitionOrderStatusAction(orderId, to);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {choices.map((c) => (
        <button
          key={c.to}
          type="button"
          disabled={pending}
          onClick={() => go(c.to, c.label)}
          className={c.tone === 'primary' ? 'btn btn-primary' : 'btn btn-ghost'}
          style={c.tone === 'danger' ? { color: '#a82323', borderColor: '#a82323' } : undefined}
        >
          {pending ? 'Working…' : c.label}
        </button>
      ))}
      {error && (
        <div role="alert" style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'rgba(220,60,60,0.08)', color: '#a82323', fontSize: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}
