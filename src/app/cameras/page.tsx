'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';
import { CameraArt } from '@/components/camera-art';
import { Icons } from '@/components/icons';
import { products, formatINR } from '@/lib/data';

function PLPListRow({ product, wished, onWish }: { product: typeof products[0]; wished: boolean; onWish: () => void }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '160px 1fr auto',
      gap: 32, padding: '28px 0', borderBottom: '1px solid var(--line)',
      alignItems: 'center',
    }}>
      <div style={{ width: 160, height: 160, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CameraArt tone="dark" variant={product.category === 'Lenses' ? 'lens' : product.category === 'Flashes' ? 'flash' : 'body'} />
      </div>
      <div>
        <div className="mono muted" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          {product.category} · {product.stock}
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 6 }}>{product.name}</div>
        <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>{product.tagline}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)' }}>
            {Icons.star} <span style={{ color: 'var(--ink-2)' }}>{product.rating} ({product.reviews})</span>
          </span>
          {product.emi && <span className="muted">{product.emi}</span>}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 22, fontFamily: 'var(--serif)', marginBottom: 4 }}>{formatINR(product.price)}</div>
        {product.mrp > product.price && <div className="strike" style={{ fontSize: 13, marginBottom: 12 }}>{formatINR(product.mrp)}</div>}
        <Link href={`/cameras/${product.id}`} className="btn btn-primary btn-sm">Add to cart</Link>
      </div>
    </div>
  );
}

export default function PLPPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [wished, setWished] = useState<Set<string>>(new Set(['eos-r8']));

  const toggleWish = (id: string) => {
    setWished(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const filterGroups = [
    { t: 'Brand family', opts: ['EOS R', 'EOS', 'PowerShot', 'Cinema EOS'] },
    { t: 'Sensor', opts: ['Full-frame', 'APS-C'] },
    { t: 'Price', opts: ['Under ₹1,00,000', '₹1,00,000 – ₹2,00,000', '₹2,00,000 – ₹3,00,000', 'Above ₹3,00,000'] },
    { t: 'Megapixels', opts: ['20–24 MP', '24–32 MP', '32–45 MP', '45+ MP'] },
    { t: 'Video', opts: ['4K', '6K', '8K RAW'] },
  ];

  return (
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <Nav cartCount={2} />

      <section style={{ padding: '40px 64px 24px' }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
          <Link href="/">Home</Link> &nbsp;/&nbsp; Cameras &nbsp;/&nbsp; Mirrorless
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 64, letterSpacing: '-0.03em', marginBottom: 12 }}>Mirrorless</h1>
            <p className="muted" style={{ fontSize: 15, maxWidth: 560 }}>
              Full-frame and APS-C bodies from the EOS R system. All stock is fresh, sealed, with Canon India warranty.
            </p>
          </div>
          <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em' }}>24 PRODUCTS</div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 48, padding: '0 64px 96px' }}>
        {/* Filters */}
        <aside style={{ borderTop: '1px solid var(--ink)', paddingTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Refine</div>
            <button className="muted" style={{ fontSize: 11 }}>Clear all</button>
          </div>
          {filterGroups.map(g => (
            <div key={g.t} style={{ borderBottom: '1px solid var(--line)', padding: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{g.t}</div>
                {Icons.minus}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {g.opts.map((o, i) => (
                  <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer' }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: 3,
                      border: '1px solid var(--line)',
                      background: i === 0 && g.t === 'Sensor' ? 'var(--ink)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--paper)', flexShrink: 0,
                    }}>
                      {i === 0 && g.t === 'Sensor' && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {o}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Grid/List */}
        <div>
          <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 24, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="chip active">Full-frame <button onClick={e => e.stopPropagation()} style={{ marginLeft: 4, opacity: 0.6 }}>×</button></span>
              <span className="chip">4K+ Video <button style={{ marginLeft: 4, opacity: 0.6 }}>×</button></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', gap: 2, background: 'var(--paper-2)', borderRadius: 999, padding: 3 }}>
                <button onClick={() => setView('grid')} style={{
                  width: 32, height: 28, borderRadius: 999,
                  background: view === 'grid' ? 'var(--paper)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: view === 'grid' ? '0 1px 3px rgba(0,0,0,.06)' : 'none',
                }}>{Icons.grid}</button>
                <button onClick={() => setView('list')} style={{
                  width: 32, height: 28, borderRadius: 999,
                  background: view === 'list' ? 'var(--paper)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: view === 'list' ? '0 1px 3px rgba(0,0,0,.06)' : 'none',
                }}>{Icons.list}</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                Sort: <span style={{ fontWeight: 500 }}>Featured</span> {Icons.chevD}
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: view === 'grid' ? 'repeat(3,1fr)' : '1fr',
            gap: view === 'grid' ? 32 : 0,
          }}>
            {products.map(p => view === 'grid'
              ? <ProductCard key={p.id} product={p} wished={wished.has(p.id)} onWish={() => toggleWish(p.id)} />
              : <PLPListRow key={p.id} product={p} wished={wished.has(p.id)} onWish={() => toggleWish(p.id)} />
            )}
          </div>

          <div style={{ marginTop: 64, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost">Load more</button>
            <span className="muted" style={{ fontSize: 12 }}>Showing 12 of 24</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
