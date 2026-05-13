import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import type { Prisma } from '@prisma/client';
import { verifyRazorpayWebhookSignature } from '@/lib/payments/razorpay';
import { markOrderPaid } from '@/lib/orders';
import { sendOrderConfirmation } from '@/lib/email/send';
import { prisma } from '@/lib/db';
import { webhookLimiter, clientIp } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RazorpayWebhookEvent {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        notes?: Record<string, string>;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        receipt?: string;
        notes?: Record<string, string>;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  const { success } = await webhookLimiter.limit(`rzp:${clientIp(request.headers)}`);
  if (!success) return NextResponse.json({ error: 'rate limited' }, { status: 429 });

  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  if (!signature || !verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  // Only handle payment.captured for now. payment.authorized is fired before
  // capture; payment.failed updates status to FAILED. We can extend later.
  if (event.event === 'payment.captured') {
    const payment = event.payload.payment?.entity;
    if (!payment) {
      return NextResponse.json({ error: 'missing payment payload' }, { status: 400 });
    }

    const internalOrderId = payment.notes?.internalOrderId;
    if (!internalOrderId) {
      // Could happen if the order was created outside our system; ignore safely.
      return NextResponse.json({ ok: true, ignored: 'no internalOrderId' });
    }

    try {
      await markOrderPaid({
        orderId: internalOrderId,
        provider: 'RAZORPAY',
        providerOrderId: payment.order_id,
        providerPaymentId: payment.id,
        amountPaise: payment.amount,
        rawPayload: event as unknown as Prisma.InputJsonValue,
        providerEventId: payment.id,
      });
    } catch (e) {
      console.error('markOrderPaid failed', e);
      return NextResponse.json({ error: 'mark paid failed' }, { status: 500 });
    }

    after(() => sendOrderConfirmation(internalOrderId));
  } else if (event.event === 'payment.failed') {
    const payment = event.payload.payment?.entity;
    const internalOrderId = payment?.notes?.internalOrderId;
    if (internalOrderId) {
      await prisma.order.updateMany({
        where: { id: internalOrderId, status: 'PENDING' },
        data: { status: 'CANCELLED' },
      });
      await prisma.payment.create({
        data: {
          orderId: internalOrderId,
          provider: 'RAZORPAY',
          eventStatus: 'FAILED',
          providerEventId: payment!.id,
          amountPaise: payment!.amount,
          rawPayload: event as unknown as Prisma.InputJsonValue,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
