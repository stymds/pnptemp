'use client';

import { useState } from 'react';
import { ProductImage } from '@/components/product-image';
import { Icons } from '@/components/icons';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { WishlistButton } from '@/components/wishlist-button';
import type { Product } from '@/lib/data';
import { formatINR } from '@/lib/data';

const specs: Array<[string, string]> = [
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

export function PDPClient({ product, initialWished }: { product: Product; initialWished: boolean }) {
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState('overview');
  const [qty, setQty] = useState(1);
  const [emi, setEmi] = useState(false);

  const images = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [{ src: product.image, alt: product.imageAlt, label: 'main' }];
  const safeIndex = Math.min(activeImg, images.length - 1);
  const current = images[safeIndex];

  return (
    <>
      <style>{`
        .pdp-gallery { display: grid; grid-template-columns: 72px 1fr; gap: 16px; align-self: start; }
        .pdp-thumbs { display: flex; flex-direction: column; gap: 10px; }
        .pdp-specs { display: grid; grid-template-columns: repeat(2,1fr); gap: 0; border-top: 1px solid var(--line); }
        .pdp-overview-split { display: grid; grid-template-columns: 1fr 1.2fr; gap: 80px; }
        @media (max-width: 640px) {
          .pdp-gallery { grid-template-columns: 1fr; gap: 12px; }
          .pdp-thumbs { flex-direction: row; overflow-x: auto; scrollbar-width: none; order: 1; }
          .pdp-thumbs::-webkit-scrollbar { display: none; }
          .pdp-main-img { order: 0; }
          .pdp-specs { grid-template-columns: 1fr 1.4fr; }
          .pdp-overview-split { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>
      <div className="split-2 pnp-px" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {/* Gallery */}
        <div className="pdp-gallery">
          <div className="pdp-thumbs">
            {images.map((im, i) => (
              <button key={i} onClick={() => setActiveImg(i)} style={{
                width: 72, height: 72, flexShrink: 0, borderRadius: 'var(--r-md)',
                background: 'var(--paper-2)',
                border: i === safeIndex ? '2px solid var(--ink)' : '2px solid transparent',
                padding: 0, overflow: 'hidden',
              }}>
                <ProductImage src={im.src} alt={im.alt} sizes="72px" />
              </button>
            ))}
          </div>
          <div className="pdp-main-img" style={{
            background: 'var(--paper-2)', borderRadius: 'var(--r-lg)',
            aspectRatio: '4/5', display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <ProductImage src={current.src} alt={current.alt} priority sizes="(max-width: 900px) 100vw, 50vw" />
            </div>
            <div style={{ position: 'absolute', top: 20, left: 20, color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {String(safeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')} | {current.label}
            </div>
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 14, textTransform: 'uppercase' }}>
            ● {product.stock}
          </div>
          <h1 className="fluid-h2" style={{ letterSpacing: '-0.03em', marginBottom: 14 }}>{product.name}</h1>
          {product.tagline && (
            <p className="muted" style={{ fontSize: 15, marginBottom: 20, maxWidth: 520 }}>{product.tagline}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, fontSize: 13 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)' }}>
              {[1, 2, 3, 4, 5].map(i => <span key={i}>{Icons.star}</span>)}
            </span>
            <span style={{ color: 'var(--ink-2)' }}>{product.rating} · {product.reviews} reviews</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 36, fontFamily: 'var(--serif)', letterSpacing: '-0.02em' }}>{formatINR(product.price)}</span>
            {product.mrp > product.price && (
              <>
                <span className="strike" style={{ fontSize: 17 }}>{formatINR(product.mrp)}</span>
                <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>Save {formatINR(product.mrp - product.price)}</span>
              </>
            )}
          </div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 28 }}>
            Inclusive of all taxes{product.emi ? ` · ${product.emi}` : ''}
          </div>

          {product.emi && (
            <div style={{ marginBottom: 28, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 16 }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{product.emi}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>No-cost · 24 months · HDFC, ICICI, Axis</div>
                </div>
                <input type="checkbox" checked={emi} onChange={e => setEmi(e.target.checked)} />
              </label>
            </div>
          )}

          <div style={{ marginBottom: 28 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Delivery</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" placeholder="Enter pincode" defaultValue="400050" style={{ maxWidth: 200 }} />
              <button className="btn btn-ghost btn-sm">Check</button>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ok)' }}>
              {Icons.check} Free over ₹5,000
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 999, height: 52 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 44, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.minus}</button>
              <span style={{ minWidth: 24, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{ width: 44, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.plus}</button>
            </div>
            <AddToCartButton
              slug={product.id}
              qty={qty}
              className="btn btn-primary btn-lg"
              style={{ flex: 1, minWidth: 240 }}
            >
              Add to cart — {formatINR(product.price * qty)}
            </AddToCartButton>
            <WishlistButton
              slug={product.id}
              initialWished={initialWished}
              variant="icon"
              className="btn btn-ghost btn-lg"
              style={{ width: 52, padding: 0 }}
            />
          </div>

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

      <section className="pnp-px" style={{ paddingBottom: 96 }}>
        <div className="scroll-x-mobile" style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', display: 'flex', gap: 0, marginBottom: 40 }}>
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
        <div className="pdp-overview-split">
          <div>
            <h2 className="fluid-h3" style={{ marginBottom: 20, letterSpacing: '-0.02em' }}>{product.name}.</h2>
            <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.65, marginBottom: 16 }}>
              {product.tagline}
            </p>
            <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.65 }}>
              All units come with full Canon India warranty, original accessories, and free in-store setup.
            </p>
          </div>
          <div className="pdp-specs">
            {specs.map(([k, v]) => (
              <div key={k} style={{ display: 'contents' }}>
                <div style={{ padding: '16px 0', borderBottom: '1px solid var(--line)', fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</div>
                <div style={{ padding: '16px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
