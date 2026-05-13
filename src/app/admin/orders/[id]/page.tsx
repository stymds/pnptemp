import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProductImage } from '@/components/product-image';
import { formatINR } from '@/lib/data';
import { productImageSrc } from '@/lib/storage';
import { OrderStatusButtons } from './OrderStatusButtons';

const STATUS_TONE: Record<string, string> = {
  PENDING: 'var(--accent)',
  PAID: 'var(--ok)',
  SHIPPED: 'var(--ok)',
  DELIVERED: 'var(--ok)',
  CANCELLED: '#a82323',
  REFUNDED: '#a82323',
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: { orderBy: { createdAt: 'desc' } },
      user: { select: { email: true, fullName: true, phone: true } },
    },
  });
  if (!order) notFound();

  const productIds = order.items.map((i) => i.productId);
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { images: { orderBy: { position: 'asc' }, take: 1 } },
      })
    : [];
  const thumbByProductId = new Map(products.map((p) => [p.id, p.images[0]?.storagePath ?? null]));

  const ship = order.shippingSnapshot as {
    fullName: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          <Link href="/admin/orders">Orders</Link> / <span style={{ color: 'var(--ink)' }}>{order.id.slice(-8).toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
          <h1 style={{ fontSize: 28, letterSpacing: '-0.02em' }}>Order {order.id.slice(-8).toUpperCase()}</h1>
          <span style={{
            fontSize: 11, color: STATUS_TONE[order.status],
            fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            ● {order.status}
          </span>
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
          Placed {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>

      <div className="grid-2" style={{ gap: 32, alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: 16, marginBottom: 12, borderTop: '1px solid var(--ink)', paddingTop: 14 }}>
            Items ({order.items.length})
          </h2>
          {order.items.map((it) => {
            const sp = thumbByProductId.get(it.productId);
            return (
              <div key={it.id} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ width: 64, height: 64, background: 'var(--paper-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden', flexShrink: 0 }}>
                  {sp && <ProductImage src={productImageSrc(sp)} alt={it.productName} sizes="64px" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 15 }}>{it.productName}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {it.productSlug} · qty {it.qty} · {formatINR(Math.round(it.unitPricePaise / 100))} each
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 14 }}>
                  {formatINR(Math.round(it.totalPaise / 100))}
                </div>
              </div>
            );
          })}

          <h2 style={{ fontSize: 16, margin: '24px 0 12px' }}>Payments ({order.payments.length})</h2>
          {order.payments.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>No payment events recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.payments.map((p) => (
                <div key={p.id} style={{ padding: 12, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', fontSize: 12, fontFamily: 'var(--mono)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{p.provider} · {p.eventStatus}</span>
                    <span>{formatINR(Math.round(p.amountPaise / 100))}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                    {p.providerEventId ?? '—'} · {new Date(p.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)', padding: 20 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
              Customer
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 15, marginBottom: 4 }}>
              {order.user.fullName ?? order.user.email}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
              {order.user.email}
              {order.user.phone && <><br />{order.user.phone}</>}
            </div>
          </div>

          <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)', padding: 20 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
              Shipping
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 15, marginBottom: 4 }}>{ship.fullName}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              {ship.line1}{ship.line2 ? `, ${ship.line2}` : ''}<br />
              {ship.city}, {ship.state} {ship.pincode}<br />
              {ship.country} · {ship.phone}
            </div>
          </div>

          <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)', padding: 20 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>
              Totals
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">Subtotal</span>
                <span>{formatINR(Math.round(order.subtotalPaise / 100))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">Shipping</span>
                <span>{order.shippingPaise === 0 ? 'Free' : formatINR(Math.round(order.shippingPaise / 100))}</span>
              </div>
            </div>
            <hr className="hr" style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 12 }}>Total</span>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>
                {formatINR(Math.round(order.totalPaise / 100))}
              </span>
            </div>
          </div>

          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>
              Status actions
            </div>
            <OrderStatusButtons orderId={order.id} currentStatus={order.status} />
          </div>
        </aside>
      </div>
    </>
  );
}
