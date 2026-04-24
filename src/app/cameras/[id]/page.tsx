'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';
import { CameraArt } from '@/components/camera-art';
import { Icons } from '@/components/icons';
import { products, formatINR } from '@/lib/data';

export default function PDPPage() {
  const [variant, setVariant] = useState('body');
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState('overview');
  const [qty, setQty] = useState(1);
  const [emi, setEmi] = useState(false);
  const product = products[0];

  const images = [
    { l: 'front', variant: 'body' as const },
    { l: 'top', variant: 'body' as const },
    { l: 'sensor', variant: 'lens' as const },
    { l: 'grip', variant: 'body' as const },
    { l: 'in hand', variant: 'body' as const },
  ];

  const specs = [
    ['Sensor', '45MP · Full-frame stacked BSI CMOS'],
    ['Processor', 'DIGIC X · Accelerator'],
    ['ISO range', '100–51,200 (exp. 50–102,400)'],
    ['Continuous', '30 fps electronic · 12 fps mech.'],
    ['Video', '8K 60p RAW · 4K 120p'],
    ['AF points', '1,053 zones · Eye/Face/Body'],
    ['Stabilisation', '5-axis IBIS · up to 8.5 stops'],
    ['Viewfinder', '5.76M-dot OLED · 120 Hz'],
    ['Storage', 'CFexpress Type B + SD UHS-II'],
    ['Weight', '746 g with battery'],
  ];

  return (
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <Nav cartCount={2} />

      <section style={{ padding: '28px 64px 0' }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/">Home</Link> &nbsp;/&nbsp; <Link href="/cameras">Cameras</Link> &nbsp;/&nbsp; Mirrorless &nbsp;/&nbsp;
          <span style={{ color: 'var(--ink)' }}>EOS R5 Mark II</span>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64, padding: '32px 64px 80px' }}>
        {/* Gallery */}
        <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 16, position: 'sticky', top: 80, alignSelf: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {images.map((im, i) => (
              <button key={i} onClick={() => setActiveImg(i)} style={{
                width: 72, height: 72, borderRadius: 'var(--r-md)',
                background: '#151515',
                border: i === activeImg ? '2px solid var(--ink)' : '2px solid transparent',
                padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CameraArt tone="dark" variant={im.variant} />
              </button>
            ))}
            <div style={{ width: 72, height: 72, borderRadius: 'var(--r-md)', background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>360°</div>
          </div>
          <div style={{
            background: '#0f0f0f', borderRadius: 'var(--r-lg)',
            aspectRatio: '4/5', display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 55% 40%, #242021 0%, #0a0a0a 70%)' }} />
            <div style={{ position: 'relative', width: '78%', height: '78%' }}>
              <CameraArt tone="dark" variant={images[activeImg].variant} />
            </div>
            <div style={{ position: 'absolute', top: 20, left: 20, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {String(activeImg + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')} · {images[activeImg].l}
            </div>
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 14, textTransform: 'uppercase' }}>
            ● New · In stock
          </div>
          <h1 style={{ fontSize: 52, letterSpacing: '-0.03em', marginBottom: 14 }}>{product.name}</h1>
          <p className="muted" style={{ fontSize: 15, marginBottom: 20, maxWidth: 520 }}>
            The R5 II raises the bar for hybrid shooters — 45MP full-frame stacked sensor, 8K RAW internal, and Canon&apos;s new Action Priority AI autofocus.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, fontSize: 13 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)' }}>
              {[1, 2, 3, 4, 5].map(i => <span key={i}>{Icons.star}</span>)}
            </span>
            <span style={{ color: 'var(--ink-2)' }}>{product.rating} · {product.reviews} reviews</span>
            <span className="muted">·</span>
            <a href="#" style={{ color: 'var(--ink-2)', borderBottom: '1px solid var(--line)' }}>Ask a question</a>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8 }}>
            <span style={{ fontSize: 36, fontFamily: 'var(--serif)', letterSpacing: '-0.02em' }}>{formatINR(product.price)}</span>
            <span className="strike" style={{ fontSize: 17 }}>{formatINR(product.mrp)}</span>
            <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>Save {formatINR(product.mrp - product.price)}</span>
          </div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 28 }}>Inclusive of all taxes · {product.emi}</div>

          {/* Variant */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Configuration</span>
              <span className="muted" style={{ fontSize: 12 }}>
                {variant === 'body' ? 'Body only' : variant === 'kit-24-105' ? 'With RF 24–105mm kit' : 'With RF 24–70mm f/2.8L'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { k: 'body', t: 'Body only', p: 339990 },
                { k: 'kit-24-105', t: '+ 24–105mm', p: 389990 },
                { k: 'kit-24-70', t: '+ 24–70 L', p: 529990 },
              ].map(v => (
                <button key={v.k} onClick={() => setVariant(v.k)} style={{
                  padding: '14px 12px',
                  borderRadius: 'var(--r-md)',
                  border: variant === v.k ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                  background: variant === v.k ? 'var(--paper-2)' : 'var(--paper)',
                  textAlign: 'left', cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{v.t}</div>
                  <div className="muted mono" style={{ fontSize: 11 }}>{formatINR(v.p)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* EMI */}
          <div style={{ marginBottom: 28, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 16 }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>EMI from ₹14,166/month</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>No-cost · 24 months · HDFC, ICICI, Axis</div>
              </div>
              <input type="checkbox" checked={emi} onChange={e => setEmi(e.target.checked)} />
            </label>
          </div>

          {/* Pincode */}
          <div style={{ marginBottom: 28 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Delivery</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" placeholder="Enter pincode" defaultValue="400050" style={{ maxWidth: 200 }} />
              <button className="btn btn-ghost btn-sm">Check</button>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ok)' }}>
              {Icons.check} Delivery by Mon, 28 Apr · Free over ₹5,000
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 999, height: 52 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 44, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.minus}</button>
              <span style={{ minWidth: 24, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{ width: 44, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.plus}</button>
            </div>
            <button className="btn btn-primary btn-lg btn-block" style={{ flex: 1 }}>Add to cart — {formatINR(product.price * qty)}</button>
            <button className="btn btn-ghost btn-lg" style={{ width: 52, padding: 0 }}>{Icons.heart}</button>
          </div>
          <button className="btn btn-accent btn-lg btn-block" style={{ marginBottom: 20 }}>Buy now · UPI / Card / EMI</button>

          {/* Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 0, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            {[
              { i: Icons.shield, t: '2-yr Canon warranty' },
              { i: Icons.truck, t: 'Free delivery' },
              { i: Icons.rotate, t: '14-day returns' },
              { i: Icons.pin, t: 'Showroom pickup' },
            ].map((x, i) => (
              <div key={i} style={{
                padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'center',
                borderRight: i % 2 === 0 ? '1px solid var(--line)' : 'none',
                borderBottom: i < 2 ? '1px solid var(--line)' : 'none',
              }}>
                <span style={{ color: 'var(--accent)' }}>{x.i}</span>
                <span style={{ fontSize: 12 }}>{x.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SPEC TABS */}
      <section style={{ padding: '0 64px 96px' }}>
        <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', display: 'flex', gap: 0, marginBottom: 40 }}>
          {['overview', 'specs', 'in the box', 'reviews', 'Q & A'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '20px 0', marginRight: 40,
              fontSize: 13, fontWeight: 500,
              color: tab === t ? 'var(--ink)' : 'var(--ink-3)',
              borderBottom: tab === t ? '1.5px solid var(--ink)' : '1.5px solid transparent',
              marginBottom: -1,
              textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80 }}>
          <div>
            <h2 style={{ fontSize: 36, marginBottom: 20, letterSpacing: '-0.02em' }}>Everything the R5 was, done again.</h2>
            <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.65, marginBottom: 16 }}>
              Canon's stacked back-illuminated sensor reads out nearly twice as fast, enabling 30 fps blackout-free stills and 8K 60p internal RAW.
            </p>
            <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.65 }}>
              Deep-learning autofocus now includes Action Priority, which predicts the decisive moment in sports and recognises people, dogs, cats, birds, horses, cars, bikes, trains and aircraft.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 0, borderTop: '1px solid var(--line)' }}>
            {specs.map(([k, v]) => (
              <div key={k} style={{ display: 'contents' }}>
                <div style={{ padding: '16px 0', borderBottom: '1px solid var(--line)', fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</div>
                <div style={{ padding: '16px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAIRS WELL WITH */}
      <section style={{ padding: '0 64px 96px', borderTop: '1px solid var(--line)', paddingTop: 80 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Pairs well with</div>
        <h2 style={{ fontSize: 40, marginBottom: 40, letterSpacing: '-0.02em' }}>Complete the kit.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
          {products.slice(5, 9).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <Footer />
    </div>
  );
}
