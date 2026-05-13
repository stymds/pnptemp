import Link from 'next/link';
import { Wordmark } from '@/components/wordmark';
import { ProductCard } from '@/components/product-card';
import { Icons } from '@/components/icons';
import { searchProducts } from '@/lib/products';
import { getWishedSlugs } from '@/lib/wishlist';

const trending = ['RF 50mm f/1.8', 'Used 5D Mark IV', 'Speedlite EL-5', 'SELPHY Square', 'Tripod under ₹10k', 'Gimbal'];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const [results, wishedSlugs] = await Promise.all([
    q ? searchProducts(q) : Promise.resolve([]),
    getWishedSlugs(),
  ]);

  return (
    <div style={{ width: '100%', background: 'var(--paper)', minHeight: '100vh' }}>
      <div className="pnp-px" style={{ borderBottom: '1px solid var(--line)', paddingTop: 20, paddingBottom: 20, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href="/"><Wordmark size={16} /></Link>
        <form action="/search" method="get" style={{ flex: 1, position: 'relative', minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}>{Icons.search}</span>
          <input
            name="q"
            defaultValue={q}
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
        </form>
        <Link href="/" style={{ fontSize: 12, color: 'var(--ink-3)' }}>Esc</Link>
      </div>

      <div className="pnp-px" style={{ paddingTop: 32, paddingBottom: 96 }}>
        {!q && (
          <>
            <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              Trending searches
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 48 }}>
              {trending.map((t) => (
                <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="chip">{t}</Link>
              ))}
            </div>
          </>
        )}

        {q && (
          <>
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 28, letterSpacing: '-0.02em' }}>
                {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;{q}&rdquo;
              </h1>
            </div>

            {results.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center', background: 'var(--paper-2)', borderRadius: 'var(--r-md)' }}>
                <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
                  No matches. Try one of the trending searches:
                </p>
                <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {trending.slice(0, 4).map((t) => (
                    <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="chip">{t}</Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid-4">
                {results.map((p) => (
                  <Link key={p.id} href={`/cameras/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <ProductCard product={p} initialWished={wishedSlugs.has(p.id)} />
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
