import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { NavWithCount } from '@/components/nav-with-count';
import { ProductCard } from '@/components/product-card';
import { ProductImage } from '@/components/product-image';
import { Icons } from '@/components/icons';
import { getFeaturedProducts, getCategoryTiles } from '@/lib/products';
import { getWishedSlugs } from '@/lib/wishlist';
import { HeroCarousel } from '@/components/hero-carousel';
import type { CarouselSlide } from '@/components/hero-carousel';

const slideTexts: { headline: ReactNode; sub: string; ctaText: string }[] = [
  {
    headline: (
      <>
        See it.<br />
        <span style={{ fontStyle: 'italic' }}>Make</span> it.
      </>
    ),
    sub: "The latest Canon bodies and lenses, available at India's oldest Canon Image Square in Secunderabad. Hands-on demos, expert fitting, and EMI from 0%.",
    ctaText: 'Shop Now',
  },
  {
    headline: (
      <>
        Capture every<br />frame.
      </>
    ),
    sub: 'From mirrorless to DSLR, telephoto to macro — every lens your vision demands, in stock at our Secunderabad showroom. Free pan-India delivery.',
    ctaText: 'Shop Now',
  },
  {
    headline: (
      <>
        Your next<br />
        <span style={{ fontStyle: 'italic' }}>camera</span> awaits.
      </>
    ),
    sub: 'Visit us at Secunderabad or order online. 14-day easy returns, 2-year Canon warranty on every product. 250+ happy customers.',
    ctaText: 'Shop Now',
  },
];

const genreTiles = [
  { label: 'Wildlife', image: '/images/genres/wildlife.jpg', href: '/cameras?category=lenses', sub: 'Telephoto & reach' },
  { label: 'Street', image: '/images/genres/street.jpg', href: '/cameras?category=mirrorless', sub: 'Compact & fast AF' },
  { label: 'Portrait', image: '/images/genres/portrait.jpg', href: '/cameras?category=mirrorless', sub: '85mm & primes' },
  { label: 'Wedding', image: '/images/genres/wedding.jpg', href: '/cameras?category=mirrorless', sub: 'Dual-slot & low-light' },
];

const testimonials = [
  {
    name: 'Rahul M.',
    rating: 5,
    text: "Best camera store in Hyderabad. The staff actually knows photography — I got personalised advice no online store could give. Bought my R6 Mark II here.",
    date: 'Mar 2025',
  },
  {
    name: 'Priya S.',
    rating: 5,
    text: 'The demo session before buying was excellent — they let me shoot in-store with different lenses. EMI process was seamless.',
    date: 'Jan 2025',
  },
  {
    name: 'Arjun K.',
    rating: 4,
    text: 'Great no-cost EMI options on Canon bodies and lenses. Professional, no-pressure sales. Will return for my next lens upgrade.',
    date: 'Feb 2025',
  },
  {
    name: 'Divya T.',
    rating: 5,
    text: "Paras N Paras has been here for decades for a reason — genuine products, honest advice, and after-sales support you can actually count on.",
    date: 'Apr 2025',
  },
];

const WA_STORE = 'https://wa.me/919348066111?text=Hi%2C%20I%27d%20like%20to%20visit%20your%20store.%20What%20are%20your%20opening%20hours%3F';

export default async function HomePage() {
  const [featured, categoryTiles, wishedSlugs] = await Promise.all([
    getFeaturedProducts(7),
    getCategoryTiles(['mirrorless', 'dslr', 'lenses', 'accessories']),
    getWishedSlugs(),
  ]);

  const carouselProducts = featured.slice(0, 3);
  const bestsellers = featured.slice(3, 7);

  const slides: CarouselSlide[] = carouselProducts.map((p, i) => ({
    product: p,
    headline: slideTexts[i].headline,
    sub: slideTexts[i].sub,
    ctaText: slideTexts[i].ctaText,
    ctaHref: `/cameras/${p.id}`,
  }));

  return (
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <NavWithCount />

      {/* ── Hero Carousel ── */}
      <HeroCarousel slides={slides} />

      {/* ── Bestsellers ── */}
      <section className="pnp-section" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="flex-wrap-mobile" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Bestsellers | This month</div>
            <h2 className="fluid-h2" style={{ letterSpacing: '-0.03em' }}>What India&apos;s buying.</h2>
          </div>
          <Link href="/cameras" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>
            View all {Icons.arrowR}
          </Link>
        </div>
        <div className="grid-4">
          {bestsellers.map(p => (
            <ProductCard key={p.id} product={p} initialWished={wishedSlugs.has(p.id)} />
          ))}
        </div>
      </section>

      {/* ── Shop by Creator Type ── */}
      <section className="pnp-section" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="flex-wrap-mobile" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Find your fit</div>
            <h2 className="fluid-h2" style={{ letterSpacing: '-0.03em' }}>Shop by the shot.</h2>
          </div>
        </div>
        <div className="grid-4" style={{ gap: 16 }}>
          {genreTiles.map(g => (
            <Link
              key={g.label}
              href={g.href}
              style={{
                position: 'relative',
                display: 'block',
                borderRadius: 'var(--r-lg)',
                overflow: 'hidden',
                aspectRatio: '3/4',
                color: 'var(--paper)',
              }}
            >
              <Image
                src={g.image}
                alt={`${g.label} photography`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                style={{ objectFit: 'cover', transition: 'transform .5s cubic-bezier(.2,.7,.3,1)' }}
                className="genre-tile-img"
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)',
              }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '28px 24px',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {g.label}
                </div>
                <div style={{ fontSize: 12, opacity: 0.72 }}>{g.sub}</div>
                <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, opacity: 0.9 }}>
                  Shop {g.label.toLowerCase()} {Icons.arrowR}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="pnp-section" style={{ borderBottom: '1px solid var(--line)' }}>
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
            <Link
              key={c.slug}
              href={`/cameras?category=${c.slug}`}
              style={{
                background: 'var(--paper-2)',
                color: 'var(--ink)',
                padding: '32px 24px',
                borderRadius: 'var(--r-lg)',
                aspectRatio: '3/4',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform .25s',
              }}
            >
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

      {/* ── Testimonials ── */}
      <section className="pnp-section" style={{ borderBottom: '1px solid var(--line)' }}>
        <div style={{ marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Customer reviews | 4.4★ on Google</div>
          <h2 className="fluid-h2" style={{ letterSpacing: '-0.03em' }}>Trusted by photographers across India.</h2>
        </div>
        <div className="grid-4 scroll-x-mobile" style={{ gap: 20 }}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                background: 'var(--paper-2)',
                borderRadius: 'var(--r-lg)',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                border: '1px solid var(--line-2)',
                minWidth: 260,
              }}
            >
              <div className="stars" style={{ fontSize: 14 }}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j}>{Icons.star}</span>
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65, flex: 1, margin: 0 }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
                <div className="muted" style={{ fontSize: 11, fontFamily: 'var(--mono)' }}>{t.date}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Store Locator ── */}
      <section className="pnp-px" style={{ paddingTop: 96, paddingBottom: 96, background: 'var(--paper-2)', borderTop: '1px solid var(--line)' }}>
        <div style={{ marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Visit us in person</div>
          <h2 className="fluid-h2" style={{ letterSpacing: '-0.03em' }}>Find us in Secunderabad.</h2>
        </div>
        <div className="split-2" style={{ gap: 40, alignItems: 'stretch' }}>
          {/* Store info card */}
          <div style={{
            background: 'var(--paper)',
            borderRadius: 'var(--r-lg)',
            padding: '40px 36px',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.02em', marginBottom: 10 }}>
                Paras N Paras Canon Image Square
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  background: 'var(--accent)',
                  color: 'var(--paper)',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontFamily: 'var(--mono)',
                }}>
                  4.4★
                </span>
                <span className="muted" style={{ fontSize: 12 }}>250+ Google reviews</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>{Icons.pin}</span>
                <address style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65, fontStyle: 'normal', margin: 0 }}>
                  Rajeshwar Chambers, Rashtrapati Road,<br />
                  below Canara Bank, General Bazaar,<br />
                  Kalasiguda, Secunderabad, Telangana 500003
                </address>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0 }}>{Icons.mail}</span>
                <a href="tel:+919348066111" style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>
                  +91 93480 66111
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
              <a
                href="https://maps.google.com/?q=Paras+N+Paras+Canon+Image+Square,+Secunderabad,+Telangana"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Get Directions {Icons.arrowR}
              </a>
              <a
                href={WA_STORE}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-lg"
                style={{ width: '100%', justifyContent: 'center', color: '#25D366', borderColor: '#25D366' }}
              >
                <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path d="M16 2C8.28 2 2 8.28 2 16c0 2.45.65 4.73 1.78 6.72L2 30l7.49-1.96A13.94 13.94 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2Zm0 25.54a11.52 11.52 0 0 1-5.87-1.6l-.42-.25-4.45 1.16 1.18-4.34-.27-.45A11.51 11.51 0 0 1 4.46 16C4.46 9.62 9.62 4.46 16 4.46S27.54 9.62 27.54 16 22.38 27.54 16 27.54Zm6.32-8.64c-.35-.17-2.06-1.01-2.38-1.13-.32-.11-.55-.17-.78.17-.23.35-.9 1.13-1.1 1.36-.2.23-.4.26-.75.09-.35-.17-1.48-.55-2.82-1.74-1.04-.93-1.74-2.07-1.95-2.42-.2-.35-.02-.54.16-.71.16-.16.35-.4.52-.61.17-.2.23-.35.35-.58.12-.23.06-.43-.03-.61-.09-.17-.78-1.88-1.07-2.57-.28-.68-.57-.58-.78-.59h-.66c-.23 0-.6.09-.92.43-.32.35-1.2 1.17-1.2 2.86 0 1.69 1.23 3.32 1.4 3.55.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.06-.84 2.35-1.66.29-.81.29-1.51.2-1.66-.08-.14-.31-.23-.66-.4Z" />
                </svg>
                &nbsp;Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Google Maps iframe */}
          <div style={{
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
            border: '1px solid var(--line)',
            minHeight: 420,
          }}>
            <iframe
              src="https://maps.google.com/maps?q=Paras+N+Paras+Canon+Image+Square+Secunderabad+Telangana&output=embed&hl=en"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block', minHeight: 420 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Paras N Paras Canon Image Square location"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
