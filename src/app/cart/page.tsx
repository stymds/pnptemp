'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { CameraArt } from '@/components/camera-art';
import { Icons } from '@/components/icons';
import { products, formatINR, Product } from '@/lib/data';

interface CartItem extends Product {
  qty: number;
  config: string;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([
    { ...products[0], qty: 1, config: 'Body only' },
    { ...products[7], qty: 1, config: 'Lens only' },
    { ...products[11], qty: 2, config: 'Standard' },
  ]);

  const update = (id: string, d: number) => setItems(its => its.map(it => it.id === id ? { ...it, qty: Math.max(1, it.qty + d) } : it));
  const remove = (id: string) => setItems(its => its.filter(it => it.id !== id));
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const savings = items.reduce((s, i) => s + (i.mrp - i.price) * i.qty, 0);
  const shipping = subtotal > 5000 ? 0 : 299;
  const total = subtotal + shipping;

  return (
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <Nav cartCount={items.length} />
      <section style={{ padding: '40px 64px 24px' }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          <Link href="/">Home</Link> / <span style={{ color: 'var(--ink)' }}>Your bag</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h1 style={{ fontSize: 56, letterSpacing: '-0.03em' }}>Your bag</h1>
          <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em' }}>{items.length} ITEMS</div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, padding: '24px 64px 96px' }}>
        {/* Items */}
        <div style={{ borderTop: '1px solid var(--ink)' }}>
          {items.map(it => (
            <div key={it.id} style={{
              display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: 24,
              padding: '28px 0', borderBottom: '1px solid var(--line)',
            }}>
              <div style={{ width: 140, height: 140, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CameraArt tone="dark" variant={it.category === 'Lenses' ? 'lens' : it.category === 'Flashes' ? 'flash' : 'body'} />
              </div>
              <div>
                <div className="mono muted" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{it.category}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 4 }}>{it.name}</div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>{it.config} · {it.tagline}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ok)', marginBottom: 14 }}>
                  {Icons.check} In stock · ships in 24h
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 999, height: 32 }}>
                    <button onClick={() => update(it.id, -1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.minus}</button>
                    <span style={{ minWidth: 20, textAlign: 'center', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{it.qty}</span>
                    <button onClick={() => update(it.id, 1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.plus}</button>
                  </div>
                  <button style={{ fontSize: 12, color: 'var(--ink-3)', borderBottom: '1px solid var(--line)', paddingBottom: 2 }}>Save for later</button>
                  <button onClick={() => remove(it.id)} style={{ fontSize: 12, color: 'var(--ink-3)', borderBottom: '1px solid var(--line)', paddingBottom: 2 }}>Remove</button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontFamily: 'var(--serif)' }}>{formatINR(it.price * it.qty)}</div>
                {it.mrp > it.price && <div className="strike" style={{ fontSize: 12, marginTop: 4 }}>{formatINR(it.mrp * it.qty)}</div>}
              </div>
            </div>
          ))}
          <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between' }}>
            <Link href="/cameras" className="btn btn-ghost btn-sm">← Continue shopping</Link>
            <div className="muted" style={{ fontSize: 12 }}>All prices inclusive of 18% GST</div>
          </div>
        </div>

        {/* Summary */}
        <aside style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
          <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-lg)', padding: 32 }}>
            <h3 style={{ fontSize: 22, marginBottom: 20 }}>Order summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">You save</span>
                <span style={{ color: 'var(--accent)' }}>−{formatINR(savings)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
              </div>
            </div>
            <hr className="hr" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '20px 0' }}>
              <span style={{ fontSize: 13 }}>Total payable</span>
              <span style={{ fontSize: 28, fontFamily: 'var(--serif)' }}>{formatINR(total)}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input className="input" placeholder="Promo code" style={{ flex: 1 }} />
              <button className="btn btn-ghost btn-sm">Apply</button>
            </div>
            <Link href="/checkout" className="btn btn-primary btn-lg btn-block" style={{ marginBottom: 10, display: 'flex' }}>Checkout →</Link>
            <button className="btn btn-ghost btn-block" style={{ marginBottom: 20 }}>Pay with UPI</button>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
              {Icons.shield} Secure checkout · SSL encrypted
            </div>
          </div>
          <div style={{ marginTop: 20, padding: 20, border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Need help deciding?</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 10 }}>Talk to a PnP advisor — free 15-min call.</div>
            <button style={{ fontSize: 12, borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>Book a call →</button>
          </div>
        </aside>
      </div>
      <Footer />
    </div>
  );
}
