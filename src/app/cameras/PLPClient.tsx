'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { ProductImage } from '@/components/product-image';
import { Icons } from '@/components/icons';
import type { Product } from '@/lib/data';
import { formatINR } from '@/lib/data';

function PLPListRow({ product }: { product: Product }) {
  return (
    <div className="plp-list-row" style={{
      display: 'grid', gridTemplateColumns: '160px 1fr auto',
      gap: 32, padding: '28px 0', borderBottom: '1px solid var(--line)',
      alignItems: 'center',
    }}>
      <div style={{ aspectRatio: '1/1', maxWidth: 160, width: '100%', background: 'var(--paper-2)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
        <ProductImage src={product.image} alt={product.imageAlt} sizes="160px" />
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
      <div className="cart-price" style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 22, fontFamily: 'var(--serif)', marginBottom: 4 }}>{formatINR(product.price)}</div>
        {product.mrp > product.price && <div className="strike" style={{ fontSize: 13, marginBottom: 12 }}>{formatINR(product.mrp)}</div>}
        <Link href={`/cameras/${product.id}`} className="btn btn-primary btn-sm">View</Link>
      </div>
    </div>
  );
}

export function PLPClient({
  products,
  initialWishedSlugs,
}: {
  products: Product[];
  initialWishedSlugs: string[];
}) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const wishedSet = new Set(initialWishedSlugs);

  // Force grid view on mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setView('grid'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div>
      <style>{`
        .plp-list-row { display: grid; grid-template-columns: 160px 1fr auto; gap: 32px; }
        .plp-view-toggle { display: flex; }
        @media (max-width: 640px) {
          .plp-list-row { grid-template-columns: 96px 1fr; gap: 16px; }
          .plp-list-row .cart-price { grid-column: 1 / -1; }
          .plp-view-toggle { display: none; }
        }
      `}</style>
      <div className="flex-wrap-mobile" style={{ borderTop: '1px solid var(--ink)', paddingTop: 24, marginBottom: 32, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="muted mono" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {products.length} result{products.length === 1 ? '' : 's'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="plp-view-toggle" style={{ gap: 2, background: 'var(--paper-2)', borderRadius: 999, padding: 3 }}>
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

      {products.length === 0 ? (
        <div style={{ padding: '64px 24px', textAlign: 'center', background: 'var(--paper-2)', borderRadius: 'var(--r-md)' }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-3)', marginBottom: 12, textTransform: 'uppercase' }}>No products</div>
          <p className="muted" style={{ fontSize: 14 }}>Try a different category or clear filters.</p>
        </div>
      ) : (
        <div
          className={view === 'grid' ? 'grid-3' : ''}
          style={view === 'grid' ? {} : { display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}
        >
          {products.map(p => view === 'grid'
            ? (
              <Link key={p.id} href={`/cameras/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <ProductCard product={p} initialWished={wishedSet.has(p.id)} />
              </Link>
            )
            : <PLPListRow key={p.id} product={p} />
          )}
        </div>
      )}
    </div>
  );
}
