'use client';

import { CameraArt } from './camera-art';
import { Icons } from './icons';
import { Product, formatINR } from '@/lib/data';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onWish?: () => void;
  wished?: boolean;
  size?: 'sm' | 'md';
}

export function ProductCard({ product, onClick, onWish, wished = false, size = 'md' }: ProductCardProps) {
  const variant = product.category === 'Lenses' ? 'lens'
    : product.category === 'Flashes' ? 'flash' : 'body';
  return (
    <div className="card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card-media">
        <div className="card-media-inner">
          <CameraArt tone="dark" variant={variant} />
        </div>
        {product.badge && (
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span className="badge soft">{product.badge}</span>
          </div>
        )}
        <button
          className={'card-wish' + (wished ? ' on' : '')}
          onClick={(e) => { e.stopPropagation(); onWish?.(); }}
          style={{ color: wished ? 'var(--accent)' : 'var(--ink)' }}
        >
          {Icons.heart}
        </button>
      </div>
      <div style={{ paddingTop: 14 }}>
        <div className="mono muted" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
          {product.category}
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: size === 'sm' ? 16 : 18, letterSpacing: '-0.01em', marginBottom: 4 }}>
          {product.name}
        </div>
        <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>{product.tagline}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{formatINR(product.price)}</span>
          {product.mrp > product.price && (
            <span className="strike" style={{ fontSize: 12 }}>{formatINR(product.mrp)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
