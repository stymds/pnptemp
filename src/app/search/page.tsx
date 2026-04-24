'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/wordmark';
import { ProductCard } from '@/components/product-card';
import { Icons } from '@/components/icons';
import { products, editorial } from '@/lib/data';

export default function SearchPage() {
  const [q, setQ] = useState('r5');

  const suggestions = [
    { t: 'EOS R5 Mark II', k: 'Camera · 45MP · ₹3,39,990' },
    { t: 'EOS R5 (original)', k: 'Camera · Used · from ₹2,19,990' },
    { t: 'R5 battery grip BG-R10', k: 'Accessory · ₹29,990' },
    { t: 'r5 vs r6 mark ii', k: 'Buying guide · 8 min read' },
  ];
  const trending = ['RF 50mm f/1.8', 'Used 5D Mark IV', 'Speedlite EL-5', 'SELPHY Square', 'Tripod under ₹10k', 'Gimbal'];

  return (
    <div style={{ width: '100%', background: 'var(--paper)', minHeight: '100vh' }}>
      <div style={{ borderBottom: '1px solid var(--line)', padding: '20px 48px', display: 'flex', gap: 24, alignItems: 'center' }}>
        <Link href="/"><Wordmark size={16} /></Link>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}>{Icons.search}</span>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            autoFocus
            placeholder="Search cameras, lenses, accessories…"
            style={{
              width: '100%', height: 52, padding: '0 48px 0 48px',
              background: 'var(--paper-2)', border: '1.5px solid var(--ink)',
              borderRadius: 'var(--r-md)',
              fontSize: 16, outline: 'none', fontFamily: 'var(--serif)',
              letterSpacing: '-0.01em',
            }}
          />
          {q && (
            <button onClick={() => setQ('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: 999, background: 'var(--paper-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icons.close}
            </button>
          )}
        </div>
        <button style={{ fontSize: 12, color: 'var(--ink-3)' }}>Esc</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 0, minHeight: 560 }}>
        {/* Left: suggestions */}
        <div style={{ borderRight: '1px solid var(--line)', padding: '24px 32px' }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>Did you mean</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 32 }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{
                padding: '12px 14px', borderRadius: 'var(--r-md)',
                background: i === 0 ? 'var(--paper-2)' : 'transparent',
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              }}>
                <span style={{ color: 'var(--ink-3)' }}>{Icons.search}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.t}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{s.k}</div>
                </div>
                <span style={{ color: 'var(--ink-3)' }}>{Icons.arrowR}</span>
              </div>
            ))}
          </div>

          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>Trending</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 32 }}>
            {trending.map(t => <span key={t} className="chip">{t}</span>)}
          </div>

          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>Your recent</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {['eos r6 mark ii', 'tripod manfrotto', 'cf express 256gb'].map(r => (
              <div key={r} style={{ padding: '8px 0', fontSize: 13, color: 'var(--ink-2)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{r}</span>
                <button style={{ color: 'var(--ink-3)', opacity: 0.5 }}>×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: live results */}
        <div style={{ padding: '24px 48px' }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 18 }}>
            Top products · showing 3 of 12
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {products.slice(0, 3).map(p => <ProductCard key={p.id} product={p} size="sm" />)}
          </div>

          <div style={{ marginTop: 40 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>From the journal</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
              {editorial.slice(0, 2).map(e => (
                <div key={e.id} style={{ display: 'flex', gap: 16, padding: 16, border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ width: 60, height: 60, background: 'var(--ink)', borderRadius: 'var(--r-sm)', flexShrink: 0 }} />
                  <div>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>{e.kicker}</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.25 }}>{e.title}</div>
                    <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>{e.read}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
