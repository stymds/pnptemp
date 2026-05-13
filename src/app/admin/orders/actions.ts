'use server';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import type { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { refundRazorpayPayment } from '@/lib/payments/razorpay';
import { refundStripePayment } from '@/lib/payments/stripe';
import { sendOrderShipped } from '@/lib/email/send';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

const PAID_STATUSES: OrderStatus[] = ['PAID', 'SHIPPED', 'DELIVERED'];
const ENDS_PAYMENT: OrderStatus[] = ['CANCELLED', 'REFUNDED'];

async function refundOrderViaProvider(order: {
  paymentProvider: 'RAZORPAY' | 'STRIPE';
  providerPaymentId: string | null;
  totalPaise: number;
  id: string;
}) {
  if (!order.providerPaymentId) {
    throw new Error('Cannot refund: this order has no providerPaymentId on file.');
  }
  if (order.paymentProvider === 'RAZORPAY') {
    const r = await refundRazorpayPayment({
      paymentId: order.providerPaymentId,
      amountPaise: order.totalPaise,
      notes: { internalOrderId: order.id },
    });
    return { provider: 'RAZORPAY' as const, refundId: r.id, status: r.status, amount: r.amount };
  }
  const r = await refundStripePayment({
    paymentIntentId: order.providerPaymentId,
    amountPaise: order.totalPaise,
  });
  return { provider: 'STRIPE' as const, refundId: r.id, status: r.status, amount: r.amount };
}

export async function transitionOrderStatusAction(
  orderId: string,
  next: OrderStatus,
) {
  await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Order not found');

  const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(next)) {
    throw new Error(`Cannot transition from ${order.status} to ${next}`);
  }

  const wasCharged = PAID_STATUSES.includes(order.status);
  const endsPayment = ENDS_PAYMENT.includes(next);
  const shouldRefund = wasCharged && endsPayment;

  // 1. Provider refund FIRST. If it fails, the status stays as-is — we do NOT
  //    flip locally because that would put the customer in a bad state
  //    (they were charged but our DB says cancelled/refunded).
  let refundResult: Awaited<ReturnType<typeof refundOrderViaProvider>> | null = null;
  if (shouldRefund) {
    refundResult = await refundOrderViaProvider({
      paymentProvider: order.paymentProvider,
      providerPaymentId: order.providerPaymentId,
      totalPaise: order.totalPaise,
      id: order.id,
    });
  }

  // 2. Now apply the local status change + restock + payment-event row.
  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: next } });

    if (shouldRefund) {
      const items = await tx.orderItem.findMany({ where: { orderId } });
      for (const it of items) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stockUnits: { increment: it.qty } },
        });
      }
      if (refundResult) {
        await tx.payment.create({
          data: {
            orderId,
            provider: refundResult.provider,
            eventStatus: 'REFUNDED',
            providerEventId: refundResult.refundId,
            amountPaise: refundResult.amount,
            rawPayload: {
              source: 'admin_refund',
              refundId: refundResult.refundId,
              status: refundResult.status,
            },
          },
        });
      }
    }
  });

  if (next === 'SHIPPED') {
    after(() => sendOrderShipped(orderId));
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin');
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath('/account/orders');
}
