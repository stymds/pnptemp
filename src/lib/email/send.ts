import 'server-only';
import { Resend } from 'resend';
import { prisma } from '@/lib/db';
import { OrderConfirmationEmail } from './order-confirmation';
import { OrderShippedEmail } from './order-shipped';

let _resend: Resend | null = null;

function resend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  _resend = new Resend(key);
  return _resend;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Paras n Paras <onboarding@resend.dev>';

interface ShippingSnapshot {
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

/**
 * Send the order confirmation email. Idempotent — if the order already has
 * confirmationEmailSentAt set, it's a no-op. Race-safe via atomic UPDATE-claim.
 * Failures are logged and the claim is rolled back so a later retry can send.
 */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  // Atomic claim — only the first caller proceeds.
  const claim = await prisma.order.updateMany({
    where: { id: orderId, confirmationEmailSentAt: null },
    data: { confirmationEmailSentAt: new Date() },
  });
  if (claim.count === 0) return;

  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[email] RESEND_API_KEY not set — skipping confirmation for order ${orderId}`);
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: { select: { email: true, fullName: true } },
      },
    });
    if (!order) throw new Error(`Order ${orderId} not found`);

    const ship = order.shippingSnapshot as unknown as ShippingSnapshot;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    const props = {
      shortId: order.id.slice(-8).toUpperCase(),
      customerName: order.user.fullName ?? order.user.email.split('@')[0],
      items: order.items.map((it) => ({
        name: it.productName,
        qty: it.qty,
        unitPriceRupees: Math.round(it.unitPricePaise / 100),
        totalRupees: Math.round(it.totalPaise / 100),
      })),
      subtotalRupees: Math.round(order.subtotalPaise / 100),
      shippingRupees: Math.round(order.shippingPaise / 100),
      totalRupees: Math.round(order.totalPaise / 100),
      shipping: ship,
      orderUrl: `${siteUrl}/account/orders/${order.id}`,
    };

    await resend().emails.send({
      from: FROM,
      to: order.user.email,
      subject: `Order ${props.shortId} confirmed`,
      react: OrderConfirmationEmail(props),
    });
  } catch (e) {
    // Roll back the claim so a retry (e.g. from the webhook) can send.
    await prisma.order.update({
      where: { id: orderId },
      data: { confirmationEmailSentAt: null },
    });
    console.error(`[email] order confirmation failed for ${orderId}`, e);
  }
}

/**
 * Send shipping notification. NOT idempotent (an admin could conceivably
 * un-ship and re-ship; we leave the gating to the caller — which today is
 * `transitionOrderStatusAction` only firing this when status moves to SHIPPED).
 */
export async function sendOrderShipped(orderId: string): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[email] RESEND_API_KEY not set — skipping shipping notice for order ${orderId}`);
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: { select: { email: true, fullName: true } },
      },
    });
    if (!order) throw new Error(`Order ${orderId} not found`);

    const ship = order.shippingSnapshot as unknown as ShippingSnapshot;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const shortId = order.id.slice(-8).toUpperCase();

    await resend().emails.send({
      from: FROM,
      to: order.user.email,
      subject: `Order ${shortId} shipped`,
      react: OrderShippedEmail({
        shortId,
        customerName: order.user.fullName ?? order.user.email.split('@')[0],
        itemNames: order.items.map((it) => `${it.productName} (×${it.qty})`),
        shipping: ship,
        orderUrl: `${siteUrl}/account/orders/${order.id}`,
      }),
    });
  } catch (e) {
    console.error(`[email] shipping notice failed for ${orderId}`, e);
  }
}
