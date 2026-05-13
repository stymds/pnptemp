import 'server-only';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { markOrderPaid } from '@/lib/orders';

let _client: Stripe | null = null;

function client(): Stripe {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  _client = new Stripe(key);
  return _client;
}

export interface StripeSessionResult {
  id: string;
  url: string;
}

export async function createStripeCheckoutSession(args: {
  internalOrderId: string;
  amountPaise: number;
  currency?: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  lineItems: Array<{ name: string; quantity: number; unitPricePaise: number }>;
}): Promise<StripeSessionResult> {
  const session = await client().checkout.sessions.create({
    mode: 'payment',
    line_items: args.lineItems.map((li) => ({
      quantity: li.quantity,
      price_data: {
        currency: args.currency ?? 'inr',
        product_data: { name: li.name },
        unit_amount: li.unitPricePaise,
      },
    })),
    customer_email: args.customerEmail,
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    metadata: { internalOrderId: args.internalOrderId },
    payment_intent_data: {
      metadata: { internalOrderId: args.internalOrderId },
    },
  });
  if (!session.url) throw new Error('Stripe did not return a checkout URL');
  return { id: session.id, url: session.url };
}

export function constructStripeWebhookEvent(rawBody: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  return client().webhooks.constructEvent(rawBody, signature, secret);
}

/**
 * Refund a captured Stripe payment by PaymentIntent id. Pass amountPaise for
 * partial refund; omit for full. Throws if Stripe rejects.
 */
export async function refundStripePayment(args: {
  paymentIntentId: string;
  amountPaise?: number;
}): Promise<{ id: string; status: string; amount: number }> {
  const refund = await client().refunds.create({
    payment_intent: args.paymentIntentId,
    ...(typeof args.amountPaise === 'number' ? { amount: args.amountPaise } : {}),
  });
  return {
    id: refund.id,
    status: refund.status ?? 'unknown',
    amount: refund.amount,
  };
}

/**
 * Fallback for when no webhook is configured (dev without `stripe listen`):
 * if the given order is PENDING + STRIPE, ask Stripe for the latest session
 * status and call markOrderPaid if it's `paid`. Returns true if status
 * transitioned to PAID. Idempotent — repeated calls on a PAID order no-op.
 */
export async function tryConfirmStripeOrder(orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return false;
  if (order.status !== 'PENDING') return false;
  if (order.paymentProvider !== 'STRIPE') return false;
  if (!order.providerOrderId) return false;

  const session = await client().checkout.sessions.retrieve(order.providerOrderId);
  if (session.payment_status !== 'paid') return false;

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? '';

  await markOrderPaid({
    orderId: order.id,
    provider: 'STRIPE',
    providerOrderId: session.id,
    providerPaymentId: paymentIntentId,
    amountPaise: session.amount_total ?? 0,
    rawPayload: {
      source: 'page_verify',
      sessionId: session.id,
      paymentStatus: session.payment_status,
    },
    providerEventId: session.id,
  });
  return true;
}

export type { Stripe };
