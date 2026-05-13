import Link from 'next/link';
import { prisma } from '@/lib/db';
import type { OrderStatus } from '@prisma/client';
import { formatINR } from '@/lib/data';
import { Pagination } from '../Pagination';

const PAGE_SIZE = 20;

const STATUS_TONE: Record<string, string> = {
  PENDING: 'var(--accent)',
  PAID: 'var(--ok)',
  SHIPPED: 'var(--ok)',
  DELIVERED: 'var(--ok)',
  CANCELLED: '#a82323',
  REFUNDED: '#a82323',
};

const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page: pageStr } = await searchParams;
  const statusFilter = STATUS_OPTIONS.find((s) => s === status);
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);

  const where = statusFilter ? { status: statusFilter } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { email: true, fullName: true } },
        items: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 6 }}>Orders</h1>
        <p className="muted" style={{ fontSize: 13 }}>{total} {statusFilter ?? 'total'}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <Link href="/admin/orders" className={'chip' + (!statusFilter ? ' active' : '')}>
          All
        </Link>
        {STATUS_OPTIONS.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={'chip' + (statusFilter === s ? ' active' : '')}>
            {s}
          </Link>
        ))}
      </div>

      <style>{`
        .admin-orders-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid var(--line);
          color: inherit;
        }
        .admin-orders-meta {
          display: flex; align-items: center; gap: 16px;
          justify-content: flex-end; flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .admin-orders-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .admin-orders-meta {
            justify-content: space-between;
            gap: 10px 14px;
          }
        }
      `}</style>
      {orders.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--paper-2)', borderRadius: 'var(--r-md)' }}>
          <p className="muted" style={{ fontSize: 13 }}>No orders match.</p>
        </div>
      ) : (
        <>
          <div style={{ borderTop: '1px solid var(--ink)' }}>
            {orders.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="admin-orders-row">
                <div style={{ minWidth: 0 }}>
                  <div className="mono muted" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                    {o.id.slice(-8).toUpperCase()} ·{' '}
                    {new Date(o.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 15 }}>
                    {o.user.fullName ?? o.user.email} · {o.items.length} item{o.items.length === 1 ? '' : 's'}
                  </div>
                </div>
                <div className="admin-orders-meta">
                  <span style={{
                    fontSize: 11, color: STATUS_TONE[o.status],
                    fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {o.status}
                  </span>
                  <span className="muted" style={{ fontSize: 11, fontFamily: 'var(--mono)' }}>
                    {o.paymentProvider}
                  </span>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 15 }}>
                    {formatINR(Math.round(o.totalPaise / 100))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            basePath="/admin/orders"
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            extraQuery={{ status: statusFilter }}
          />
        </>
      )}
    </>
  );
}
