import Link from 'next/link';
import { notFound } from 'next/navigation';
import { after } from 'next/server';
import { Footer } from '@/components/footer';
import { NavWithCount } from '@/components/nav-with-count';
import { ProductImage } from '@/components/product-image';
import { Icons } from '@/components/icons';
import { formatINR } from '@/lib/data';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { productImageSrc } from '@/lib/storage';
import { tryConfirmStripeOrder } from '@/lib/payments/stripe';
import { sendOrderConfirmation } from '@/lib/email/send';

const STATUS_COPY: Record<string, { label: string; tone: 'wait' | 'ok' | 'fail' }> = {
  PENDING: { label: 'Awaiting payment', tone: 'wait' },
  PAID: { label: 'Payment received', tone: 'ok' },
  SHIPPED: { label: 'Shipped', tone: 'ok' },
  DELIVERED: { label: 'Delivered', tone: 'ok' },
  CANCELLED: { label: 'Cancelled', tone: 'fail' },
  REFUNDED: { label: 'Refunded', tone: 'fail' },
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { paid } = await searchParams;

  let order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: {
      items: true,
      payments: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!order) notFound();

  // Stripe Checkout doesn't return signed payload to the redirect — only via
  // webhook. If we landed here from a Stripe redirect (?paid=1) and the order
  // is still PENDING, ask Stripe directly. This is the dev-mode fallback for
  // when no webhook tunnel is set up; in prod the webhook normally wins this
  // race. tryConfirmStripeOrder + markOrderPaid are both idempotent.
  if (paid === '1' && order.status === 'PENDING' && order.paymentProvider === 'STRIPE') {
    try {
      const confirmed = await tryConfirmStripeOrder(order.id);
      if (confirmed) {
        after(() => sendOrderConfirmation(order!.id));
        // Refetch with fresh status.
        order = await prisma.order.findFirst({
          where: { id, userId: user.id },
          include: {
            items: true,
            payments: { orderBy: { createdAt: 'desc' } },
          },
        });
        if (!order) notFound();
      }
    } catch (e) {
      console.error('tryConfirmStripeOrder failed', e);
    }
  }

  // After the Stripe-confirm refresh above, narrow the type once more.
  if (!order) notFound();

  // Pull product images for the line items in one query.
  const productIds = order.items.map((it) => it.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { images: { orderBy: { position: 'asc' }, take: 1 } },
  });
  const imgByProductId = new Map(
    products.map((p) => [p.id, p.images[0]?.storagePath ?? null]),
  );

  const status = STATUS_COPY[order.status] ?? { label: order.status, tone: 'wait' as const };
  const justPaid = paid === '1' && order.status === 'PAID';
  const stillPending = paid === '1' && order.status === 'PENDING';

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
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <NavWithCount />

      <section className="pnp-px" style={{ paddingTop: 40, paddingBottom: 24 }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          <Link href="/account">My account</Link> / <Link href="/account/orders">Orders</Link> / <span style={{ color: 'var(--ink)' }}>{order.id.slice(-8).toUpperCase()}</span>
        </div>
        <div className="flex-wrap-mobile" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
          <div>
            <h1 className="fluid-h1" style={{ letterSpacing: '-0.03em' }}>Order {order.id.slice(-8).toUpperCase()}</h1>
            <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>
              Placed {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 999,
            fontSize: 12, fontWeight: 500,
            background: status.tone === 'ok' ? 'rgba(60,140,90,0.1)' : status.tone === 'fail' ? 'rgba(220,60,60,0.1)' : 'rgba(196,127,69,0.12)',
            color: status.tone === 'ok' ? 'var(--ok)' : status.tone === 'fail' ? '#a82323' : 'var(--accent)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor' }} />
            {status.label}
          </span>
        </div>

        {justPaid && (
          <div role="status" style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(60,140,90,0.08)', borderRadius: 'var(--r-md)', color: 'var(--ok)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            {Icons.check} Payment received. We&apos;ll email you when your order ships.
          </div>
        )}
        {stillPending && (
          <div role="status" style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(196,127,69,0.08)', borderRadius: 'var(--r-md)', color: 'var(--accent)', fontSize: 14 }}>
            Payment confirmation is taking a moment. Refresh the page in a few seconds — webhooks usually land within 10 seconds.
          </div>
        )}
      </section>

      <div className="split-2 pnp-px" style={{ paddingBottom: 96, gap: 64, alignItems: 'flex-start' }}>
        {/* Items */}
        <div>
          <h2 style={{ fontSize: 18, marginBottom: 16, borderTop: '1px solid var(--ink)', paddingTop: 16 }}>
            Items ({order.items.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {order.items.map((it) => {
              const storagePath = imgByProductId.get(it.productId);
              return (
                <div key={it.id} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ width: 80, height: 80, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', overflow: 'hidden', flexShrink: 0 }}>
                    {storagePath && <ProductImage src={productImageSrc(storagePath)} alt={it.productName} sizes="80px" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Link href={`/cameras/${it.productSlug}`} style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink)' }}>
                      {it.productName}
                    </Link>
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                      Qty {it.qty} · {formatINR(Math.round(it.unitPricePaise / 100))} each
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>
                    {formatINR(Math.round(it.totalPaise / 100))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: address + totals */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)', padding: 24 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>Shipping to</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, marginBottom: 4 }}>{ship.fullName}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              {ship.line1}{ship.line2 ? `, ${ship.line2}` : ''}<br />
              {ship.city}, {ship.state} {ship.pincode}<br />
              {ship.country} · {ship.phone}
            </div>
          </div>

          <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)', padding: 24 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>Totals</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">Subtotal</span>
                <span>{formatINR(Math.round(order.subtotalPaise / 100))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">Shipping</span>
                <span>{order.shippingPaise === 0 ? 'Free' : formatINR(Math.round(order.shippingPaise / 100))}</span>
              </div>
            </div>
            <hr className="hr" style={{ margin: '14px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 13 }}>Total paid</span>
              <span style={{ fontSize: 22, fontFamily: 'var(--serif)' }}>{formatINR(Math.round(order.totalPaise / 100))}</span>
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>
              {order.paymentProvider === 'RAZORPAY' ? 'Razorpay' : 'Stripe'}
              {order.providerPaymentId && ` · ${order.providerPaymentId.slice(-10)}`}
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
