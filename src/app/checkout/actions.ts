'use server';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { createOrderFromCart, markOrderPaid, OrderError } from '@/lib/orders';
import {
  createRazorpayOrder,
  verifyRazorpayPaymentSignature,
} from '@/lib/payments/razorpay';
import { createStripeCheckoutSession } from '@/lib/payments/stripe';
import { sendOrderConfirmation } from '@/lib/email/send';
import { getCart } from '@/lib/cart';
import { getAppliedCouponCode, clearAppliedCouponCookie } from '@/lib/coupons';
import { checkoutLimiter, verifyLimiter } from '@/lib/ratelimit';

export interface StartCheckoutResult {
  internalOrderId: string;
  razorpayOrderId: string;
  amountPaise: number;
  keyId: string;
}

export async function startRazorpayCheckoutAction(input: {
  addressId: string;
  idempotencyKey: string;
}): Promise<StartCheckoutResult> {
  const user = await requireUser();
  const { success } = await checkoutLimiter.limit(`u:${user.id}`);
  if (!success) throw new Error('Too many checkout attempts. Try again in a minute.');
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) throw new Error('NEXT_PUBLIC_RAZORPAY_KEY_ID is not set');

  const couponCode = await getAppliedCouponCode();

  let order;
  try {
    order = await createOrderFromCart({
      userId: user.id,
      addressId: input.addressId,
      paymentProvider: 'RAZORPAY',
      idempotencyKey: input.idempotencyKey,
      couponCode,
    });
  } catch (e) {
    if (e instanceof OrderError) throw new Error(e.message);
    throw e;
  }

  // Reuse existing providerOrderId if the user is retrying with the same key.
  let razorpayOrderId = order.providerOrderId;
  if (!razorpayOrderId) {
    const rzp = await createRazorpayOrder({
      internalOrderId: order.id,
      amountPaise: order.totalPaise,
      currency: 'INR',
    });
    razorpayOrderId = rzp.id;
    await prisma.order.update({
      where: { id: order.id },
      data: { providerOrderId: razorpayOrderId },
    });
  }

  return {
    internalOrderId: order.id,
    razorpayOrderId,
    amountPaise: order.totalPaise,
    keyId,
  };
}

export async function verifyRazorpayCheckoutAction(input: {
  internalOrderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const user = await requireUser();
  const { success } = await verifyLimiter.limit(`u:${user.id}`);
  if (!success) throw new Error('Too many verify attempts. Try again in a minute.');

  const ok = verifyRazorpayPaymentSignature({
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySignature: input.razorpaySignature,
  });
  if (!ok) throw new Error('Invalid payment signature');

  const order = await prisma.order.findUnique({ where: { id: input.internalOrderId } });
  if (!order) throw new Error('Order not found');
  if (order.providerOrderId !== input.razorpayOrderId) {
    throw new Error('Order id mismatch');
  }

  await markOrderPaid({
    orderId: order.id,
    provider: 'RAZORPAY',
    providerOrderId: input.razorpayOrderId,
    providerPaymentId: input.razorpayPaymentId,
    amountPaise: order.totalPaise,
    rawPayload: {
      source: 'client_verify',
      razorpayPaymentId: input.razorpayPaymentId,
    },
    providerEventId: input.razorpayPaymentId,
  });

  // Clear any applied coupon cookie now that the order is locked in.
  await clearAppliedCouponCookie();

  after(() => sendOrderConfirmation(order.id));

  revalidatePath('/cart');
  revalidatePath('/', 'layout');
  return { ok: true };
}

export interface StartStripeCheckoutResult {
  url: string;
  sessionId: string;
  internalOrderId: string;
}

export async function startStripeCheckoutAction(input: {
  addressId: string;
  idempotencyKey: string;
}): Promise<StartStripeCheckoutResult> {
  const user = await requireUser();
  const { success } = await checkoutLimiter.limit(`u:${user.id}`);
  if (!success) throw new Error('Too many checkout attempts. Try again in a minute.');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) throw new Error('NEXT_PUBLIC_SITE_URL is not set');

  const couponCode = await getAppliedCouponCode();

  let order;
  try {
    order = await createOrderFromCart({
      userId: user.id,
      addressId: input.addressId,
      paymentProvider: 'STRIPE',
      idempotencyKey: input.idempotencyKey,
      couponCode,
    });
  } catch (e) {
    if (e instanceof OrderError) throw new Error(e.message);
    throw e;
  }

  // Re-fetch cart for line item names — order.items are snapshots but we want
  // the Stripe session to display product names users recognize.
  const cart = await getCart();
  const items = cart?.items ?? [];

  const lineItems = items.length
    ? items.map((it) => ({
        name: it.product.name,
        quantity: it.qty,
        unitPricePaise: it.priceAtAddPaise,
      }))
    : order.items.map((it) => ({
        name: it.productName,
        quantity: it.qty,
        unitPricePaise: it.unitPricePaise,
      }));

  // Add a single line item for shipping if non-zero — Stripe Checkout
  // displays line items individually.
  if (order.shippingPaise > 0) {
    lineItems.push({
      name: 'Shipping',
      quantity: 1,
      unitPricePaise: order.shippingPaise,
    });
  }

  // If a coupon was applied, surface it as a negative line item so Stripe's
  // page total matches our internal total. Stripe doesn't accept negative
  // unit_amount on line_items though — so we instead reduce one of the
  // product line items proportionally. Easiest correct approach: treat the
  // discount as an inline "Discount" entry by collapsing into the first
  // product's line if needed. Pragmatic alternative: just post the totalPaise
  // to Stripe and don't show line items individually. We'll go with: rebuild
  // line items as a single combined "Order total" line when a discount is
  // present, so the Stripe page shows exactly what we charge.
  if (order.discountPaise > 0) {
    lineItems.length = 0;
    lineItems.push({
      name: order.couponCode
        ? `Order subtotal (after ${order.couponCode})`
        : 'Order subtotal',
      quantity: 1,
      unitPricePaise: order.totalPaise - order.shippingPaise,
    });
    if (order.shippingPaise > 0) {
      lineItems.push({
        name: 'Shipping',
        quantity: 1,
        unitPricePaise: order.shippingPaise,
      });
    }
  }

  const session = await createStripeCheckoutSession({
    internalOrderId: order.id,
    amountPaise: order.totalPaise,
    currency: 'inr',
    customerEmail: user.email,
    successUrl: `${siteUrl}/account/orders/${order.id}?paid=1`,
    cancelUrl: `${siteUrl}/checkout`,
    lineItems,
  });

  // Store the Stripe session id so webhooks can find the order.
  if (!order.providerOrderId) {
    await prisma.order.update({
      where: { id: order.id },
      data: { providerOrderId: session.id },
    });
  }

  return {
    url: session.url,
    sessionId: session.id,
    internalOrderId: order.id,
  };
}
