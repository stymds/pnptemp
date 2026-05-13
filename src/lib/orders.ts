import 'server-only';
import { prisma } from '@/lib/db';
import type { Address, PaymentProvider, Prisma } from '@prisma/client';
import { validateCoupon, incrementCouponUsage, CouponError } from '@/lib/coupons';

export class OrderError extends Error {
  constructor(message: string, public code: 'CART_EMPTY' | 'OUT_OF_STOCK' | 'ADDRESS_NOT_FOUND' | 'CART_NOT_FOUND' | 'COUPON_INVALID') {
    super(message);
    this.name = 'OrderError';
  }
}

export interface CreateOrderInput {
  userId: string;
  addressId: string;
  paymentProvider: PaymentProvider;
  idempotencyKey: string;
  couponCode?: string | null;
}

function snapshotAddress(a: Address): Prisma.JsonObject {
  return {
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 ?? null,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    country: a.country,
  };
}

function shippingPaiseFor(subtotalPaise: number) {
  // Free shipping over ₹5,000; flat ₹299 otherwise.
  return subtotalPaise === 0 || subtotalPaise > 5000_00 ? 0 : 299_00;
}

/**
 * Idempotent. Same idempotencyKey returns the existing PENDING order.
 * Snapshots cart items + shipping address into the Order. Stock is NOT
 * decremented here — that happens in the payment webhook on `payment.captured`.
 */
export async function createOrderFromCart(input: CreateOrderInput) {
  const { userId, addressId, paymentProvider, idempotencyKey } = input;

  // Idempotency check first (cheap).
  const existing = await prisma.order.findUnique({
    where: { idempotencyKey },
    include: { items: true },
  });
  if (existing) return existing;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart) throw new OrderError('Cart not found', 'CART_NOT_FOUND');
  if (cart.items.length === 0) throw new OrderError('Cart is empty', 'CART_EMPTY');

  for (const it of cart.items) {
    if (it.qty > it.product.stockUnits) {
      throw new OrderError(
        `${it.product.name}: only ${it.product.stockUnits} in stock`,
        'OUT_OF_STOCK',
      );
    }
  }

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw new OrderError('Address not found', 'ADDRESS_NOT_FOUND');

  const subtotalPaise = cart.items.reduce(
    (s, it) => s + it.priceAtAddPaise * it.qty,
    0,
  );

  // Coupon — re-validate against current subtotal, abort if no longer valid.
  let discountPaise = 0;
  let couponCodeApplied: string | null = null;
  if (input.couponCode) {
    try {
      const result = await validateCoupon(input.couponCode, subtotalPaise);
      discountPaise = result.discountPaise;
      couponCodeApplied = result.code;
    } catch (e) {
      if (e instanceof CouponError) {
        throw new OrderError(`Coupon: ${e.message}`, 'COUPON_INVALID');
      }
      throw e;
    }
  }

  const discountedSubtotalPaise = Math.max(0, subtotalPaise - discountPaise);
  const shippingPaise = shippingPaiseFor(discountedSubtotalPaise);
  const taxPaise = 0; // GST is already included in product prices for now.
  const totalPaise = discountedSubtotalPaise + shippingPaise + taxPaise;

  const order = await prisma.order.create({
    data: {
      userId,
      status: 'PENDING',
      subtotalPaise,
      shippingPaise,
      taxPaise,
      totalPaise,
      discountPaise,
      couponCode: couponCodeApplied,
      currency: 'INR',
      paymentProvider,
      idempotencyKey,
      shippingSnapshot: snapshotAddress(address),
      items: {
        create: cart.items.map((it) => ({
          productId: it.productId,
          productName: it.product.name,
          productSlug: it.product.slug,
          unitPricePaise: it.priceAtAddPaise,
          qty: it.qty,
          totalPaise: it.priceAtAddPaise * it.qty,
        })),
      },
    },
    include: { items: true },
  });

  // Bump coupon usage counter (best-effort — DB write only; if it fails the
  // order still placed correctly, just usage tracking goes a bit off).
  if (couponCodeApplied) {
    try {
      await incrementCouponUsage(couponCodeApplied);
    } catch (e) {
      console.error('Failed to increment coupon usage', e);
    }
  }

  return order;
}

/**
 * Atomically mark an Order paid: status → PAID, decrement product stock,
 * insert a Payment row, and clear the user's cart. Idempotent — if the order
 * is already PAID, it's a no-op (returns the existing order).
 */
export async function markOrderPaid(params: {
  orderId: string;
  provider: PaymentProvider;
  providerOrderId: string;
  providerPaymentId: string;
  amountPaise: number;
  rawPayload: Prisma.InputJsonValue;
  providerEventId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: params.orderId },
      include: { items: true },
    });
    if (!order) throw new Error(`Order ${params.orderId} not found`);
    if (order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      return order; // already processed
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        providerOrderId: params.providerOrderId,
        providerPaymentId: params.providerPaymentId,
      },
    });

    for (const it of order.items) {
      await tx.product.update({
        where: { id: it.productId },
        data: { stockUnits: { decrement: it.qty } },
      });
    }

    await tx.payment.create({
      data: {
        orderId: order.id,
        provider: params.provider,
        eventStatus: 'CAPTURED',
        providerEventId: params.providerEventId ?? params.providerPaymentId,
        amountPaise: params.amountPaise,
        rawPayload: params.rawPayload,
      },
    });

    // Empty the user's cart now that the order is paid.
    await tx.cartItem.deleteMany({
      where: { cart: { userId: order.userId } },
    });

    return order;
  });
}
