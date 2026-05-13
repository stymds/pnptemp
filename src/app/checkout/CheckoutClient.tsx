'use client';

import { useEffect, useMemo, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { formatINR } from '@/lib/data';
import {
  startRazorpayCheckoutAction,
  verifyRazorpayCheckoutAction,
  startStripeCheckoutAction,
} from './actions';

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayConstructor = new (opts: Record<string, unknown>) => {
  open: () => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

interface AddressOption {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

type Provider = 'RAZORPAY' | 'STRIPE';

export function CheckoutClient({
  addresses,
  totalPaise,
  userEmail,
}: {
  addresses: AddressOption[];
  totalPaise: number;
  userEmail: string;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>(
    () => addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? '',
  );
  const [provider, setProvider] = useState<Provider>('RAZORPAY');
  // One idempotency key per checkout-intent. Stable across button clicks AND across providers
  // — if the user starts Razorpay, dismisses, switches to Stripe, the same Order is reused.
  const idempotencyKey = useMemo(
    () => (typeof crypto !== 'undefined' ? crypto.randomUUID() : Date.now().toString()),
    [],
  );

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && addresses[0]) setSelectedId(addresses[0].id);
  }, [addresses, selectedId]);

  async function payWithRazorpay() {
    if (!window.Razorpay) {
      setError('Razorpay script is still loading. Try again in a moment.');
      setPending(false);
      return;
    }

    const session = await startRazorpayCheckoutAction({
      addressId: selectedId,
      idempotencyKey,
    });

    const rzp = new window.Razorpay({
      key: session.keyId,
      amount: session.amountPaise,
      currency: 'INR',
      name: 'Paras n Paras',
      description: `Order ${session.internalOrderId.slice(-8).toUpperCase()}`,
      order_id: session.razorpayOrderId,
      prefill: { email: userEmail },
      theme: { color: '#1a1a1a' },
      handler: async (response: RazorpayHandlerResponse) => {
        try {
          await verifyRazorpayCheckoutAction({
            internalOrderId: session.internalOrderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          router.replace(`/account/orders/${session.internalOrderId}?paid=1`);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Payment verification failed');
          setPending(false);
        }
      },
      modal: {
        ondismiss: () => setPending(false),
      },
    });
    rzp.open();
  }

  async function payWithStripe() {
    const session = await startStripeCheckoutAction({
      addressId: selectedId,
      idempotencyKey,
    });
    // Hand off to Stripe's hosted checkout. They redirect back to success_url.
    window.location.href = session.url;
  }

  async function onPay() {
    setError(null);
    if (!selectedId) {
      setError('Pick a delivery address first.');
      return;
    }

    setPending(true);
    try {
      if (provider === 'RAZORPAY') await payWithRazorpay();
      else await payWithStripe();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start checkout');
      setPending(false);
    }
  }

  const providerOptions: Array<{
    key: Provider;
    label: string;
    sub: string;
    badge: string;
  }> = [
    { key: 'RAZORPAY', label: 'Razorpay', sub: 'UPI · Cards · Netbanking · EMI · COD', badge: 'Rz' },
    { key: 'STRIPE',   label: 'Stripe',   sub: 'International cards', badge: 'St' },
  ];

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Address picker */}
      <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Delivery address
          </span>
          <a href="/account/addresses" style={{ fontSize: 12, borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>
            Manage
          </a>
        </div>

        {addresses.length === 0 ? (
          <div style={{ padding: 16, background: 'var(--paper-2)', borderRadius: 'var(--r-md)' }}>
            <p style={{ fontSize: 13, marginBottom: 10 }}>You don&apos;t have a saved address yet.</p>
            <a href="/account/addresses" className="btn btn-primary btn-sm">Add address →</a>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {addresses.map((a) => (
              <label
                key={a.id}
                style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  padding: 14, borderRadius: 'var(--r-md)',
                  border: selectedId === a.id ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                  background: selectedId === a.id ? 'var(--paper-2)' : 'var(--paper)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedId === a.id}
                  onChange={() => setSelectedId(a.id)}
                  style={{ marginTop: 2, accentColor: 'var(--ink)' }}
                />
                <div style={{ flex: 1, fontSize: 13, lineHeight: 1.55 }}>
                  <div style={{ fontWeight: 500 }}>
                    {a.fullName}
                    {a.isDefault && (
                      <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        default
                      </span>
                    )}
                  </div>
                  <div className="muted">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.pincode}<br />
                    {a.phone}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Payment */}
      <div style={{ border: '1.5px solid var(--ink)', borderRadius: 'var(--r-md)', padding: 32 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
          <span style={{ width: 20, height: 20, borderRadius: 999, border: '1.5px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 11 }}>2</span>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>Payment</span>
        </div>

        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {providerOptions.map((opt) => {
            const active = provider === opt.key;
            return (
              <label
                key={opt.key}
                style={{
                  padding: 16, borderRadius: 'var(--r-md)',
                  display: 'flex', gap: 12, alignItems: 'center',
                  border: active ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                  background: active ? 'var(--paper-2)' : 'var(--paper)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="provider"
                  checked={active}
                  onChange={() => setProvider(opt.key)}
                  style={{ accentColor: 'var(--ink)' }}
                />
                <span style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500 }}>
                  {opt.badge}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{opt.label}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{opt.sub}</div>
                </div>
              </label>
            );
          })}
        </div>

        {error && (
          <div role="alert" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'rgba(220,60,60,0.08)', color: '#a82323', fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={onPay}
          disabled={pending || addresses.length === 0}
          className="btn btn-primary btn-lg btn-block"
        >
          {pending
            ? (provider === 'RAZORPAY' ? 'Opening Razorpay…' : 'Redirecting to Stripe…')
            : `Pay ${formatINR(Math.round(totalPaise / 100))} with ${provider === 'RAZORPAY' ? 'Razorpay' : 'Stripe'}`}
        </button>

        <div className="muted" style={{ fontSize: 11, marginTop: 12, textAlign: 'center', display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
          {Icons.shield} Secure checkout · By placing this order you agree to PnP&apos;s Terms.
        </div>
      </div>
    </>
  );
}
