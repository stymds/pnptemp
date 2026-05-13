import Link from 'next/link';
import { Footer } from '@/components/footer';
import { NavWithCount } from '@/components/nav-with-count';
import { ProductImage } from '@/components/product-image';
import { Icons } from '@/components/icons';
import { formatINR } from '@/lib/data';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { productImageSrc } from '@/lib/storage';

const STATUS_TONE: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'Pending',   color: 'var(--accent)', bg: 'rgba(196,127,69,0.12)' },
  PAID:      { label: 'Paid',      color: 'var(--ok)',     bg: 'rgba(60,140,90,0.12)'  },
  SHIPPED:   { label: 'Shipped',   color: 'var(--ok)',     bg: 'rgba(60,140,90,0.12)'  },
  DELIVERED: { label: 'Delivered', color: 'var(--ok)',     bg: 'rgba(60,140,90,0.12)'  },
  CANCELLED: { label: 'Cancelled', color: '#a82323',       bg: 'rgba(220,60,60,0.10)'  },
  REFUNDED:  { label: 'Refunded',  color: '#a82323',       bg: 'rgba(220,60,60,0.10)'  },
};

export default async function OrdersListPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  const productIds = Array.from(new Set(orders.flatMap((o) => o.items.map((i) => i.productId))));
  const productThumbs = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { images: { orderBy: { position: 'asc' }, take: 1 } },
      })
    : [];
  const thumbByProductId = new Map(productThumbs.map((p) => [p.id, p.images[0]?.storagePath ?? null]));

  return (
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <NavWithCount />

      <section className="pnp-px" style={{ paddingTop: 40, paddingBottom: 24 }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          <Link href="/account">My account</Link> / <span style={{ color: 'var(--ink)' }}>Orders</span>
        </div>
        <h1 className="fluid-h1" style={{ letterSpacing: '-0.03em' }}>Orders</h1>
        <p className="muted" style={{ fontSize: 15, marginTop: 10 }}>
          {orders.length === 0 ? 'You haven’t placed any orders yet.' : `${orders.length} order${orders.length === 1 ? '' : 's'}.`}
        </p>
      </section>

      <section className="pnp-px" style={{ paddingBottom: 96 }}>
        <style>{`
          .acc-orders-row {
            display: grid;
            grid-template-columns: auto 1fr auto auto;
            gap: 24px;
            padding: 24px 0;
            border-bottom: 1px solid var(--line);
            align-items: center;
            color: inherit;
            text-decoration: none;
          }
          .acc-orders-row .acc-orders-thumbs > div { width: 56px; height: 56px; }
          @media (max-width: 640px) {
            .acc-orders-row {
              grid-template-columns: auto 1fr;
              gap: 12px 14px;
              row-gap: 8px;
              padding: 18px 0;
            }
            .acc-orders-row .acc-orders-status { grid-column: 1 / -1; justify-self: start; }
            .acc-orders-row .acc-orders-total { grid-column: 1 / -1; text-align: left; display: flex; justify-content: space-between; align-items: baseline; }
            .acc-orders-row .acc-orders-thumbs > div { width: 44px; height: 44px; }
          }
        `}</style>
        {orders.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', background: 'var(--paper-2)', borderRadius: 'var(--r-lg)' }}>
            <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>Your placed orders will show up here.</p>
            <Link href="/cameras" className="btn btn-primary btn-lg">Browse cameras →</Link>
          </div>
        ) : (
          <div style={{ borderTop: '1px solid var(--ink)' }}>
            {orders.map((o) => {
              const tone = STATUS_TONE[o.status] ?? STATUS_TONE.PENDING;
              const firstItems = o.items.slice(0, 3);
              return (
                <Link key={o.id} href={`/account/orders/${o.id}`} className="acc-orders-row">
                  <div className="acc-orders-thumbs" style={{ display: 'flex', gap: 6 }}>
                    {firstItems.map((it) => {
                      const sp = thumbByProductId.get(it.productId);
                      return (
                        <div key={it.id} style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden', position: 'relative' }}>
                          {sp && <ProductImage src={productImageSrc(sp)} alt={it.productName} sizes="56px" />}
                        </div>
                      );
                    })}
                    {o.items.length > firstItems.length && (
                      <div style={{ borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper-2)', fontSize: 12, color: 'var(--ink-3)' }}>
                        +{o.items.length - firstItems.length}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mono muted" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                      {o.id.slice(-8).toUpperCase()} ·{' '}
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>
                      {firstItems.map((i) => i.productName).join(' · ')}
                      {o.items.length > firstItems.length && ` +${o.items.length - firstItems.length} more`}
                    </div>
                  </div>

                  <span className="acc-orders-status" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 999,
                    fontSize: 11, fontWeight: 500,
                    color: tone.color, background: tone.bg,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor' }} />
                    {tone.label}
                  </span>

                  <div className="acc-orders-total" style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontFamily: 'var(--serif)' }}>
                      {formatINR(Math.round(o.totalPaise / 100))}
                    </div>
                    <div className="muted" style={{ fontSize: 11, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      View {Icons.chevR}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
