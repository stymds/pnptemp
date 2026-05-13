import Link from 'next/link';
import { Footer } from '@/components/footer';
import { NavWithCount } from '@/components/nav-with-count';
import { ProductCard } from '@/components/product-card';
import { EditorialImage, ProductImage } from '@/components/product-image';
import { Icons } from '@/components/icons';
import { editorial, formatINR } from '@/lib/data';
import { getFeaturedProducts, getCategoryTiles, getProductBySlug } from '@/lib/products';
import { getWishedSlugs } from '@/lib/wishlist';

export default async function HomePage() {
  const [hero, featured, categoryTiles, wishedSlugs] = await Promise.all([
    getProductBySlug('eos-r5-mk2'),
    getFeaturedProducts(4),
    getCategoryTiles(['mirrorless', 'dslr', 'lenses', 'accessories']),
    getWishedSlugs(),
  ]);

  return (
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <NavWithCount />

      <section style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="hero-split">
          <div className="hero-text" style={{ padding: '80px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 32 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 28 }}>
                <span style={{ color: 'var(--accent)' }}>&bull;</span>&nbsp;&nbsp;New | EOS R System
              </div>
              <h1 className="display fluid-display" style={{ marginBottom: 24 }}>
                See it.<br />
                <span style={{ fontStyle: 'italic' }}>Make</span> it.
              </h1>
              <p style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: 460, lineHeight: 1.55 }}>
                The EOS R5 Mark II arrives at Paras n Paras - India&apos;s oldest Canon Image Square. Hands-on demos, expert fitting, and EMI from 0%.
              </p>
            </div>
            <div className="flex-wrap-mobile" style={{ alignItems: 'center', gap: 12 }}>
              <Link href="/cameras/eos-r5-mk2" className="btn btn-primary btn-lg">Shop the R5 II</Link>
              <button className="btn btn-ghost btn-lg">Book a demo -&gt;</button>
            </div>
          </div>
          <div className="hero-image" style={{
            background: 'var(--paper-2)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 60% 40%, rgba(196,74,45,.16) 0%, transparent 58%)' }} />
            <div style={{ position: 'relative', width: '85%', height: '85%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {hero && <ProductImage src={hero.image} alt={hero.imageAlt} priority sizes="(max-width: 900px) 100vw, 50vw" />}
            </div>
            {hero && (
              <div style={{
                position: 'absolute', bottom: 32, left: 32,
                color: 'var(--ink)', fontFamily: 'var(--mono)', fontSize: 11,
                letterSpacing: '0.1em', opacity: 0.7, textTransform: 'uppercase',
              }}>
                {hero.name} | body<br />
                {formatINR(hero.price)} | In store now
              </div>
            )}
            <div style={{
              position: 'absolute', top: 32, right: 32,
              fontFamily: 'var(--mono)', fontSize: 10,
              letterSpacing: '0.1em', color: 'var(--ink-3)',
              textTransform: 'uppercase',
            }}>
              Ref 01 / 24
            </div>
          </div>
        </div>
      </section>

      <section className="pnp-px" style={{ paddingTop: 28, paddingBottom: 28, borderBottom: '1px solid var(--line)' }}>
        <div className="grid-4" style={{ gap: 40 }}>
          {[
            { i: Icons.shield, t: '2-year Canon warranty', s: 'On every camera & lens' },
            { i: Icons.truck, t: 'Free pan-India delivery', s: 'Orders above Rs. 5,000' },
            { i: Icons.rotate, t: '14-day easy returns', s: 'No questions asked' },
            { i: Icons.pin, t: 'Walk-in showroom', s: 'Mumbai | Delhi | Bengaluru' },
          ].map((x, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--accent)', marginTop: 2 }}>{x.i}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{x.t}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{x.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pnp-section">
        <div className="flex-wrap-mobile" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Shop by category</div>
            <h2 className="fluid-h2" style={{ letterSpacing: '-0.03em' }}>Every lens for every frame.</h2>
          </div>
          <Link href="/cameras" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>
            All categories {Icons.arrowR}
          </Link>
        </div>
        <div className="grid-4" style={{ gap: 16 }}>
          {categoryTiles.map(c => (
            <Link key={c.slug} href={`/cameras?category=${c.slug}`} style={{
              background: 'var(--paper-2)',
              color: 'var(--ink)',
              padding: '32px 24px',
              borderRadius: 'var(--r-lg)',
              aspectRatio: '3/4',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
              transition: 'transform .25s',
            }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', opacity: 0.5, textTransform: 'uppercase' }}>
                  {String(c.count).padStart(2, '0')} products
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 32, marginTop: 8, letterSpacing: '-0.02em' }}>{c.name}</div>
              </div>
              <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.product && <ProductImage src={c.product.image} alt={c.product.imageAlt} sizes="25vw" />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                Shop now {Icons.arrowR}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="pnp-px" style={{ background: 'var(--paper-2)', paddingTop: 120, paddingBottom: 120, borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="split-2" style={{ gap: 80, alignItems: 'center' }}>
          <div style={{
            aspectRatio: '4/5', background: '#1a1a1a', borderRadius: 'var(--r-lg)',
            position: 'relative', overflow: 'hidden',
          }}>
            <EditorialImage src="/images/editorial/r5-field-notes.webp" alt="Canon EOS R5 Mark II official product detail image" sizes="(max-width: 900px) 100vw, 50vw" />
            <div style={{ position: 'absolute', bottom: 24, left: 24, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Shot on EOS R5 II | f/2.8 | 1/1000
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Field notes | Ladakh 2026</div>
            <h2 className="fluid-h2" style={{ marginBottom: 24, letterSpacing: '-0.03em' }}>
              A week above<br />the treeline.
            </h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 32, maxWidth: 460 }}>
              Anvita Sharma took the R5 II and a single prime to 14,000 feet. What she brought back is a quiet case for carrying less, and seeing more.
            </p>
            <button className="btn btn-ghost">Read the story</button>
          </div>
        </div>
      </section>

      <section className="pnp-section">
        <div className="flex-wrap-mobile" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Bestsellers | This month</div>
            <h2 className="fluid-h2" style={{ letterSpacing: '-0.03em' }}>What India&apos;s buying.</h2>
          </div>
          <div className="scroll-x-mobile" style={{ display: 'flex', gap: 8 }}>
            {['All', 'Cameras', 'Lenses', 'Accessories'].map((x, i) => (
              <span key={x} className={'chip' + (i === 0 ? ' active' : '')}>{x}</span>
            ))}
          </div>
        </div>
        <div className="grid-4">
          {featured.map(p => (
            <ProductCard key={p.id} product={p} initialWished={wishedSlugs.has(p.id)} />
          ))}
        </div>
      </section>

      <section className="pnp-px" style={{ paddingBottom: 96 }}>
        <div className="split-2" style={{
          background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 'var(--r-lg)', padding: 'clamp(40px, 6vw, 80px)',
          gridTemplateColumns: '1.2fr 1fr', alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: 20, textTransform: 'uppercase' }}>
              PnP Workshops
            </div>
            <h2 className="fluid-h2" style={{ color: 'var(--paper)', marginBottom: 20, letterSpacing: '-0.03em' }}>
              Learn where<br /><span style={{ fontStyle: 'italic' }}>photography happens.</span>
            </h2>
            <p style={{ opacity: 0.7, fontSize: 16, maxWidth: 480, lineHeight: 1.6, marginBottom: 32 }}>
              Weekend intensives at our Bandra studio. Street, portrait, product, and low-light - taught by working Canon Ambassadors.
            </p>
            <button className="btn btn-accent btn-lg">See the calendar</button>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {editorial.map(e => (
              <div key={e.id} style={{ padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 6, textTransform: 'uppercase' }}>{e.kicker}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{e.title}</div>
                </div>
                <div style={{ opacity: 0.6, fontSize: 12 }}>{e.read}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
