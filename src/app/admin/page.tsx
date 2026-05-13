import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatINR } from '@/lib/data';

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

const STATUS_TONE: Record<string, string> = {
  PENDING: 'var(--accent)',
  PAID: 'var(--ok)',
  SHIPPED: 'var(--ok)',
  DELIVERED: 'var(--ok)',
  CANCELLED: '#a82323',
  REFUNDED: '#a82323',
};

export default async function AdminDashboardPage() {
  const today = startOfDay();

  const [todayPaidAgg, todayOrdersCount, productsCount, lowStockProducts, recentOrders] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: today } },
        _sum: { totalPaise: true },
      }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.product.findMany({
        where: { isPublished: true, stockUnits: { lt: 5 } },
        orderBy: { stockUnits: 'asc' },
        take: 8,
        include: { category: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { user: { select: { email: true, fullName: true } }, items: true },
      }),
    ]);

  const todayRevenuePaise = todayPaidAgg._sum.totalPaise ?? 0;

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, letterSpacing: '-0.02em', marginBottom: 8 }}>Dashboard</h1>
        <p className="muted" style={{ fontSize: 13 }}>
          {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid-3" style={{ gap: 16, marginBottom: 40 }}>
        {[
          { k: 'Today’s revenue', v: formatINR(Math.round(todayRevenuePaise / 100)), s: 'PAID + SHIPPED + DELIVERED' },
          { k: 'Today’s orders', v: String(todayOrdersCount), s: 'all statuses' },
          { k: 'Active products', v: String(productsCount), s: 'isPublished = true' },
        ].map((s, i) => (
          <div key={i} style={{ padding: 24, border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>
              {s.k}
            </div>
            <div style={{ fontSize: 32, fontFamily: 'var(--serif)', marginBottom: 4 }}>{s.v}</div>
            <div className="muted" style={{ fontSize: 12 }}>{s.s}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 32, alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18 }}>Low stock</h2>
            <Link href="/admin/products" style={{ fontSize: 12, borderBottom: '1px solid var(--ink)', paddingBottom: 1 }}>
              All products →
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <div style={{ padding: 24, background: 'var(--paper-2)', borderRadius: 'var(--r-md)' }}>
              <p className="muted" style={{ fontSize: 13 }}>Everything is well stocked.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--ink)' }}>
              {lowStockProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}/edit`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0', borderBottom: '1px solid var(--line)',
                    color: 'inherit', fontSize: 13,
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 15 }}>{p.name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{p.category.name}</div>
                  </div>
                  <span style={{
                    fontSize: 12, color: p.stockUnits === 0 ? '#a82323' : 'var(--accent)',
                    fontFamily: 'var(--mono)',
                  }}>
                    {p.stockUnits === 0 ? 'OUT OF STOCK' : `${p.stockUnits} left`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18 }}>Recent orders</h2>
            <Link href="/admin/orders" style={{ fontSize: 12, borderBottom: '1px solid var(--ink)', paddingBottom: 1 }}>
              All orders →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div style={{ padding: 24, background: 'var(--paper-2)', borderRadius: 'var(--r-md)' }}>
              <p className="muted" style={{ fontSize: 13 }}>No orders yet.</p>
            </div>
          ) : (
            <div style={{ borderTop: '1px solid var(--ink)' }}>
              <style>{`
                .admin-dash-recent-row {
                  display: grid;
                  grid-template-columns: 1fr auto;
                  gap: 12px;
                  align-items: center;
                  padding: 12px 0;
                  border-bottom: 1px solid var(--line);
                  color: inherit;
                  font-size: 13px;
                }
                .admin-dash-recent-meta {
                  display: flex; align-items: center; gap: 14px;
                  justify-content: flex-end;
                }
                @media (max-width: 768px) {
                  .admin-dash-recent-row { grid-template-columns: 1fr; gap: 6px; }
                  .admin-dash-recent-meta { justify-content: space-between; }
                }
              `}</style>
              {recentOrders.map((o) => (
                <Link key={o.id} href={`/admin/orders/${o.id}`} className="admin-dash-recent-row">
                  <div style={{ minWidth: 0 }}>
                    <div className="mono muted" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.id.slice(-8).toUpperCase()} · {o.user.email}
                    </div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 14 }}>
                      {o.items.length} item{o.items.length === 1 ? '' : 's'}
                    </div>
                  </div>
                  <div className="admin-dash-recent-meta">
                    <span style={{ fontSize: 11, color: STATUS_TONE[o.status], fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {o.status}
                    </span>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 14 }}>
                      {formatINR(Math.round(o.totalPaise / 100))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
