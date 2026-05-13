'use client';

import { ProductImage } from './product-image';
import { WishlistButton } from './wishlist-button';
import { Product, formatINR } from '@/lib/data';

interface ProductCardProps {
  product: Product;
  size?: 'sm' | 'md';
  initialWished?: boolean;
}

export function ProductCard({ product, size = 'md', initialWished = false }: ProductCardProps) {
  return (
    <div className="card">
      <div className="card-media">
        <div className="card-media-inner">
          <ProductImage src={product.image} alt={product.imageAlt} />
        </div>
        {product.badge && (
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span className="badge soft">{product.badge}</span>
          </div>
        )}
        <WishlistButton slug={product.id} initialWished={initialWished} variant="card" />
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
