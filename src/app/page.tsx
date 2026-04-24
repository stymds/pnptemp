'use client';

import Link from 'next/link';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';
import { CameraArt } from '@/components/camera-art';
import { Icons } from '@/components/icons';
import { products, editorial, formatINR } from '@/lib/data';

export default function HomePage() {
  const featured = products.slice(0, 4);

  return (
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <Nav cartCount={2} />

      {/* HERO */}
      <section style={{ borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', minHeight: 640 }}>
          <div style={{ padding: '80px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 28 }}>
                <span style={{ color: 'var(--accent)' }}>●</span>&nbsp;&nbsp;New · EOS R System
              </div>
              <h1 className="display" style={{ fontSize: 108, marginBottom: 24 }}>
                See it.<br />
                <span style={{ fontStyle: 'italic' }}>Make</span> it.
              </h1>
              <p style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: 460, lineHeight: 1.55 }}>
                The EOS R5 Mark II arrives at Paras n Paras — India's oldest Canon Image Square. Hands-on demos, expert fitting, and EMI from 0%.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Link href="/cameras/eos-r5-mk2" className="btn btn-primary btn-lg">Shop the R5 II</Link>
              <button className="btn btn-ghost btn-lg">Book a demo →</button>
            </div>
          </div>
          <div style={{
            background: '#111',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 60% 40%, #2a2521 0%, #0a0a0a 70%)' }} />
            <div style={{ position: 'relative', width: '85%', height: '85%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CameraArt tone="dark" variant="body" />
            </div>
            <div style={{
              position: 'absolute', bottom: 32, left: 32,
              color: 'var(--paper)', fontFamily: 'var(--mono)', fontSize: 11,
              letterSpacing: '0.1em', opacity: 0.7, textTransform: 'uppercase',
            }}>
              EOS R5 Mark II · body<br />
              {formatINR(339990)} · In store now
            </div>
            <div style={{
              position: 'absolute', top: 32, right: 32,
              fontFamily: 'var(--mono)', fontSize: 10,
              letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
            }}>
              Ref 01 / 24
            </div>
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section style={{ padding: '28px 64px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 40 }}>
          {[
            { i: Icons.shield, t: '2-year Canon warranty', s: 'On every camera & lens' },
            { i: Icons.truck, t: 'Free pan-India delivery', s: 'Orders above ₹5,000' },
            { i: Icons.rotate, t: '14-day easy returns', s: 'No questions asked' },
            { i: Icons.pin, t: 'Walk-in showroom', s: 'Mumbai · Delhi · Bengaluru' },
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

      {/* CATEGORIES */}
      <section style={{ padding: '96px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Shop by category</div>
            <h2 style={{ fontSize: 52, letterSpacing: '-0.03em' }}>Every lens for every frame.</h2>
          </div>
          <Link href="/cameras" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>
            All categories {Icons.arrowR}
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[
            { k: 'Mirrorless', n: 'Mirrorless', c: 24, bg: '#0e0e0e', variant: 'body' as const, tone: 'dark' as const },
            { k: 'DSLR', n: 'DSLR', c: 18, bg: '#1a1817', variant: 'body' as const, tone: 'dark' as const },
            { k: 'Lenses', n: 'Lenses', c: 62, bg: '#151515', variant: 'lens' as const, tone: 'dark' as const },
            { k: 'Accessories', n: 'Accessories', c: 140, bg: 'var(--paper-2)', variant: 'flash' as const, tone: 'light' as const },
          ].map(c => (
            <Link key={c.k} href="/cameras" style={{
              background: c.bg,
              color: c.tone === 'dark' ? 'var(--paper)' : 'var(--ink)',
              padding: '32px 24px',
              borderRadius: 'var(--r-lg)',
              aspectRatio: '3/4',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
              transition: 'transform .25s',
            }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', opacity: 0.5, textTransform: 'uppercase' }}>
                  {String(c.c).padStart(2, '0')} products
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 32, marginTop: 8, letterSpacing: '-0.02em' }}>{c.n}</div>
              </div>
              <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CameraArt tone={c.tone} variant={c.variant} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                Shop now {Icons.arrowR}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* EDITORIAL FEATURE */}
      <section style={{ background: 'var(--paper-2)', padding: '120px 64px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div style={{
            aspectRatio: '4/5', background: '#1a1a1a', borderRadius: 'var(--r-lg)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div className="ph dark" style={{ borderRadius: 'var(--r-lg)', height: '100%' }}>photograph · field work</div>
            <div style={{ position: 'absolute', bottom: 24, left: 24, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Shot on EOS R5 II · f/2.8 · 1/1000
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Field notes · Ladakh 2026</div>
            <h2 style={{ fontSize: 56, marginBottom: 24, letterSpacing: '-0.03em' }}>
              A week above<br />the treeline.
            </h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 32, maxWidth: 460 }}>
              Anvita Sharma took the R5 II and a single prime to 14,000 feet. What she brought back is a quiet case for carrying less, and seeing more.
            </p>
            <button className="btn btn-ghost">Read the story</button>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={{ padding: '96px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Bestsellers · This month</div>
            <h2 style={{ fontSize: 52, letterSpacing: '-0.03em' }}>What India&apos;s buying.</h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['All', 'Cameras', 'Lenses', 'Accessories'].map((x, i) => (
              <span key={x} className={'chip' + (i === 0 ? ' active' : '')}>{x}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* WORKSHOP CTA */}
      <section style={{ padding: '0 64px 96px' }}>
        <div style={{
          background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 'var(--r-lg)', padding: '80px 64px',
          display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 64, alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: 20, textTransform: 'uppercase' }}>
              PnP Workshops
            </div>
            <h2 style={{ fontSize: 56, color: 'var(--paper)', marginBottom: 20, letterSpacing: '-0.03em' }}>
              Learn where<br /><span style={{ fontStyle: 'italic' }}>photography happens.</span>
            </h2>
            <p style={{ opacity: 0.7, fontSize: 16, maxWidth: 480, lineHeight: 1.6, marginBottom: 32 }}>
              Weekend intensives at our Bandra studio. Street, portrait, product, and low-light — taught by working Canon Ambassadors.
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
