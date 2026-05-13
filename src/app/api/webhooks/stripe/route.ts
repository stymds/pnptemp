import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import type { Prisma } from '@prisma/client';
import { constructStripeWebhookEvent, type Stripe } from '@/lib/payments/stripe';
import { markOrderPaid } from '@/lib/orders';
import { sendOrderConfirmation } from '@/lib/email/send';
import { webhookLimiter, clientIp } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { success } = await webhookLimiter.limit(`stripe:${clientIp(request.headers)}`);
  if (!success) return NextResponse.json({ error: 'rate limited' }, { status: 429 });

  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'no signature' }, { status: 400 });

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = constructStripeWebhookEvent(rawBody, signature);
  } catch {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ ok: true, ignored: 'unpaid' });
    }

    const internalOrderId = session.metadata?.internalOrderId;
    if (!internalOrderId) {
      return NextResponse.json({ ok: true, ignored: 'no internalOrderId' });
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? '';

    try {
      await markOrderPaid({
        orderId: internalOrderId,
        provider: 'STRIPE',
        providerOrderId: session.id,
        providerPaymentId: paymentIntentId,
        amountPaise: session.amount_total ?? 0,
        rawPayload: event as unknown as Prisma.InputJsonValue,
        providerEventId: event.id,
      });
    } catch (e) {
      console.error('markOrderPaid failed (stripe)', e);
      return NextResponse.json({ error: 'mark paid failed' }, { status: 500 });
    }

    after(() => sendOrderConfirmation(internalOrderId));
  }

  return NextResponse.json({ ok: true });
}
