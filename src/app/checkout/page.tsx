'use client';

import { useState } from 'react';
import { Wordmark } from '@/components/wordmark';
import { CameraArt } from '@/components/camera-art';
import { Icons } from '@/components/icons';
import { products, formatINR } from '@/lib/data';

export default function CheckoutPage() {
  const [step] = useState(2);
  const [payment, setPayment] = useState('upi');
  const steps = ['Bag', 'Address', 'Payment', 'Review'];

  return (
    <div style={{ width: '100%', background: 'var(--paper)', minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid var(--line)', padding: '20px 64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--paper)' }}>
        <Wordmark size={18} />
        <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 999,
                  border: '1px solid ' + (i <= step ? 'var(--ink)' : 'var(--line)'),
                  background: i < step ? 'var(--ink)' : 'transparent',
                  color: i < step ? 'var(--paper)' : (i === step ? 'var(--ink)' : 'var(--ink-3)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontFamily: 'var(--mono)',
                }}>
                  {i < step
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : i + 1}
                </span>
                <span style={{ fontSize: 12, color: i <= step ? 'var(--ink)' : 'var(--ink-3)', fontWeight: i === step ? 500 : 400 }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div style={{ width: 40, height: 1, background: 'var(--line)', margin: '0 16px' }} />}
            </div>
          ))}
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em', display: 'flex', gap: 6, alignItems: 'center' }}>
          {Icons.shield} SECURE
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 64, padding: '48px 64px 96px', maxWidth: 1400, margin: '0 auto' }}>
        <div>
          {/* Address — collapsed */}
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ width: 20, height: 20, borderRadius: 999, background: 'var(--ok)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <span className="mono" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Delivery address</span>
              </div>
              <button style={{ fontSize: 12, borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>Change</button>
            </div>
            <div style={{ paddingLeft: 30, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              <div style={{ color: 'var(--ink)', fontWeight: 500 }}>Aditi Rao</div>
              412, Linking Road, Bandra West<br />
              Mumbai, Maharashtra — 400050<br />
              +91 98201 45678
            </div>
          </div>

          {/* Payment — active */}
          <div style={{ border: '1.5px solid var(--ink)', borderRadius: 'var(--r-md)', padding: 32 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
              <span style={{ width: 20, height: 20, borderRadius: 999, border: '1.5px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 11 }}>3</span>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>Payment method</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { k: 'upi', t: 'UPI', s: 'GPay · PhonePe · Paytm · BHIM', icon: '⎈' },
                { k: 'card', t: 'Credit / Debit card', s: 'Visa · Mastercard · RuPay · Amex', icon: '▭' },
                { k: 'emi', t: 'No-cost EMI', s: 'From ₹14,166/mo · 24 months', icon: '※' },
                { k: 'nb', t: 'Netbanking', s: 'All major banks', icon: '⏹' },
                { k: 'cod', t: 'Cash on delivery', s: 'Available on orders under ₹50,000', icon: '₹', dis: true },
              ].map(p => (
                <label key={p.k} style={{
                  display: 'flex', gap: 14, alignItems: 'center',
                  padding: 16, borderRadius: 'var(--r-md)',
                  border: payment === p.k ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                  background: payment === p.k ? 'var(--paper-2)' : 'var(--paper)',
                  opacity: p.dis ? 0.4 : 1,
                  cursor: p.dis ? 'not-allowed' : 'pointer',
                }}>
                  <input type="radio" name="pay" checked={payment === p.k} onChange={() => !p.dis && setPayment(p.k)} style={{ accentColor: 'var(--ink)' }} disabled={p.dis} />
                  <span style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--paper-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.t}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{p.s}</div>
                  </div>
                </label>
              ))}
            </div>

            {payment === 'upi' && (
              <div style={{ marginTop: 20, padding: 20, background: 'var(--paper-2)', borderRadius: 'var(--r-md)' }}>
                <label className="label">UPI ID</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" placeholder="name@bank" defaultValue="aditi@oksbi" />
                  <button className="btn btn-primary">Verify</button>
                </div>
                <div className="muted" style={{ fontSize: 11, marginTop: 10 }}>You&apos;ll receive a request on your UPI app to approve the payment.</div>
              </div>
            )}

            {payment === 'card' && (
              <div style={{ marginTop: 20, padding: 20, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">Card number</label>
                  <input className="input" placeholder="1234 5678 9012 3456" />
                </div>
                <div><label className="label">Expiry</label><input className="input" placeholder="MM / YY" /></div>
                <div><label className="label">CVV</label><input className="input" placeholder="•••" /></div>
                <div style={{ gridColumn: '1/-1' }}><label className="label">Name on card</label><input className="input" placeholder="Aditi Rao" /></div>
              </div>
            )}

            <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 24 }}>
              Pay {formatINR(369960)} securely
            </button>
            <div className="muted" style={{ fontSize: 11, marginTop: 12, textAlign: 'center' }}>
              By placing this order, you agree to PnP&apos;s Terms of Service &amp; Refund Policy.
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside style={{ position: 'sticky', top: 100, alignSelf: 'start' }}>
          <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-lg)', padding: 28 }}>
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>Your order</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {products.slice(0, 2).map(p => (
                <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, background: 'var(--paper)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                    <CameraArt tone="dark" variant={p.category === 'Lenses' ? 'lens' : 'body'} />
                    <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 999, width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)' }}>1</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{p.category}</div>
                  </div>
                  <div style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{formatINR(p.price)}</div>
                </div>
              ))}
            </div>
            <hr className="hr" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Subtotal</span><span>{formatINR(559980)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Shipping</span><span>Free</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">GST (included)</span><span>{formatINR(85420)}</span></div>
            </div>
            <hr className="hr" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 16 }}>
              <span style={{ fontSize: 13 }}>Total</span>
              <span style={{ fontSize: 24, fontFamily: 'var(--serif)' }}>{formatINR(559980)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, padding: 16, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
            <span style={{ color: 'var(--accent)' }}>{Icons.truck}</span>
            <div style={{ fontSize: 12 }}>
              <div style={{ fontWeight: 500 }}>Delivery by Mon, 28 Apr</div>
              <div className="muted">Bluedart · signature required</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
