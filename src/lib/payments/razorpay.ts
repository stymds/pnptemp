import 'server-only';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';

let _client: Razorpay | null = null;

function client(): Razorpay {
  if (_client) return _client;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set');
  }
  _client = new Razorpay({ key_id, key_secret });
  return _client;
}

export interface RazorpayOrderResult {
  id: string;
  amount: number; // paise
  currency: string;
  status: string;
}

/**
 * Create a Razorpay Order. The Razorpay Order ID is what the client-side
 * Checkout overlay needs in order to authorize a payment.
 */
export async function createRazorpayOrder(args: {
  internalOrderId: string;
  amountPaise: number;
  currency?: string;
}): Promise<RazorpayOrderResult> {
  const order = await client().orders.create({
    amount: args.amountPaise,
    currency: args.currency ?? 'INR',
    // Razorpay caps `receipt` at 40 chars; cuids are 25 so this is safe.
    receipt: args.internalOrderId,
    notes: { internalOrderId: args.internalOrderId },
  });
  return {
    id: order.id,
    amount: typeof order.amount === 'number' ? order.amount : Number(order.amount),
    currency: order.currency,
    status: order.status,
  };
}

/**
 * Verify the HMAC SHA256 signature of a Razorpay webhook payload.
 * `rawBody` MUST be the unparsed request body string.
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET is not set');
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Verify the signature returned by the client-side Razorpay Checkout overlay
 * after a payment attempt. Used to validate the payment on the server before
 * we redirect to the success page (the webhook is the authoritative source,
 * but this guards against forged success redirects).
 */
/**
 * Refund a captured Razorpay payment. Pass amountPaise for partial refund;
 * omit it for a full refund. Throws if the API rejects.
 */
export async function refundRazorpayPayment(args: {
  paymentId: string;
  amountPaise?: number;
  notes?: Record<string, string>;
}): Promise<{ id: string; status: string; amount: number }> {
  const opts: { amount?: number; notes?: Record<string, string> } = {};
  if (typeof args.amountPaise === 'number') opts.amount = args.amountPaise;
  if (args.notes) opts.notes = args.notes;
  const refund = await client().payments.refund(args.paymentId, opts);
  return {
    id: refund.id,
    status: refund.status ?? 'unknown',
    amount: typeof refund.amount === 'number' ? refund.amount : Number(refund.amount ?? 0),
  };
}

export function verifyRazorpayPaymentSignature(args: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error('RAZORPAY_KEY_SECRET is not set');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${args.razorpayOrderId}|${args.razorpayPaymentId}`)
    .digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(args.razorpaySignature, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
