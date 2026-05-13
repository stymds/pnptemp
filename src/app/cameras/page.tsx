import Link from 'next/link';
import { Footer } from '@/components/footer';
import { NavWithCount } from '@/components/nav-with-count';
import { Icons } from '@/components/icons';
import { listProducts } from '@/lib/products';
import { getWishedSlugs } from '@/lib/wishlist';
import { PLPClient } from './PLPClient';

const filterGroups = [
  { t: 'Brand family', opts: ['EOS R', 'EOS', 'PowerShot', 'Cinema EOS'] },
  { t: 'Sensor', opts: ['Full-frame', 'APS-C'] },
  { t: 'Price', opts: ['Under ₹1,00,000', '₹1,00,000 – ₹2,00,000', '₹2,00,000 – ₹3,00,000', 'Above ₹3,00,000'] },
  { t: 'Megapixels', opts: ['20–24 MP', '24–32 MP', '32–45 MP', '45+ MP'] },
  { t: 'Video', opts: ['4K', '6K', '8K RAW'] },
];

export default async function CamerasPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [products, wishedSlugs] = await Promise.all([
    listProducts({ categorySlug: category }),
    getWishedSlugs(),
  ]);

  return (
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <NavWithCount />

      <section className="pnp-px" style={{ paddingTop: 40, paddingBottom: 24 }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
          <Link href="/">Home</Link> &nbsp;/&nbsp; Cameras{category ? ` /  ${category}` : ''}
        </div>
        <div className="flex-wrap-mobile" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className="fluid-h1" style={{ letterSpacing: '-0.03em', marginBottom: 12 }}>
              {category ? category[0].toUpperCase() + category.slice(1) : 'All cameras & gear'}
            </h1>
            <p className="muted" style={{ fontSize: 15, maxWidth: 560 }}>
              Full-frame and APS-C bodies from the EOS R system. All stock is fresh, sealed, with Canon India warranty.
            </p>
          </div>
          <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
            {String(products.length).padStart(2, '0')} PRODUCTS
          </div>
        </div>
      </section>

      <div className="split-sidebar-260 pnp-px" style={{ paddingBottom: 96 }}>
        <details className="show-mobile" style={{ borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--line)', paddingTop: 16, paddingBottom: 16 }}>
          <summary className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Filters &amp; Sort</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{Icons.filter}</span>
          </summary>
          <div style={{ marginTop: 16 }}>
            {filterGroups.slice(0, 3).map(g => (
              <div key={g.t} style={{ borderBottom: '1px solid var(--line)', padding: '12px 0' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{g.t}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {g.opts.map(o => <span key={o} className="chip">{o}</span>)}
                </div>
              </div>
            ))}
          </div>
        </details>

        <aside className="hide-mobile" style={{ borderTop: '1px solid var(--ink)', paddingTop: 24 }}>
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
                {g.opts.map(o => (
                  <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer' }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: 3,
                      border: '1px solid var(--line)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }} />
                    {o}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <PLPClient products={products} initialWishedSlugs={Array.from(wishedSlugs)} />
      </div>

      <Footer />
    </div>
  );
}
