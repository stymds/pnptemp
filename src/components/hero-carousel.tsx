'use client';

import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ProductImage } from '@/components/product-image';
import { Icons } from '@/components/icons';
import { formatINR } from '@/lib/data';
import type { Product } from '@/lib/data';

export interface CarouselSlide {
  product: Product;
  headline: ReactNode;
  sub: string;
  ctaHref: string;
  ctaText: string;
}

export function HeroCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const dragging = useRef(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const total = slides.length;

  // Auto-advance — skips while the user is dragging
  useEffect(() => {
    const id = setInterval(() => {
      if (!dragging.current) setCurrent(c => (c + 1) % total);
    }, 5000);
    return () => clearInterval(id);
  }, [total]);

  const goTo = (idx: number) => setCurrent(idx);
  const prev = () => setCurrent(c => (c - 1 + total) % total);
  const next = () => setCurrent(c => (c + 1) % total);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    dragging.current = false;
    setDragOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    // Only track as a horizontal swipe if sideways movement dominates
    if (!dragging.current && Math.abs(dx) < Math.abs(dy)) return;
    dragging.current = true;
    // Rubber-band at edges so it doesn't drag past first/last slide freely
    const bounded =
      (current === 0 && dx > 0) || (current === total - 1 && dx < 0)
        ? dx * 0.25
        : dx;
    setDragOffset(bounded);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dragging.current) {
      if (dx < -50) next();
      else if (dx > 50) prev();
    }
    dragging.current = false;
    setDragOffset(0);
  };

  if (total === 0) return null;

  // translateX = base slide offset + live drag pixels
  const trackTransform = dragOffset !== 0
    ? `translateX(calc(-${(current / total) * 100}% + ${dragOffset}px))`
    : `translateX(-${(current / total) * 100}%)`;

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--line)',
        minHeight: '100dvh',
        touchAction: 'pan-y', // browser owns vertical scroll; we own horizontal
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides track */}
      <div style={{
        display: 'flex',
        width: `${total * 100}%`,
        transform: trackTransform,
        // No transition while finger is down — snaps back smoothly on release
        transition: dragOffset !== 0 ? 'none' : 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform',
      }}>
        {slides.map((slide, i) => (
          <div
            key={i}
            className="hero-split"
            style={{ width: `${100 / total}%`, minWidth: `${100 / total}%`, minHeight: '100dvh' }}
          >
            {/* Text side */}
            <div
              className="hero-text"
              style={{
                padding: '80px 64px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 32,
              }}
            >
              <div>
                <div className="eyebrow" style={{ marginBottom: 28 }}>
                  <span style={{ color: 'var(--accent)' }}>&bull;</span>
                  &nbsp;&nbsp;{slide.product.category}
                  {slide.product.badge ? ` | ${slide.product.badge}` : ''}
                </div>
                <h1 className="display fluid-display" style={{ marginBottom: 24 }}>
                  {slide.headline}
                </h1>
                <p style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: 460, lineHeight: 1.55 }}>
                  {slide.sub}
                </p>
                {slide.product.price > 0 && (
                  <div style={{
                    marginTop: 20,
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    color: 'var(--ink-3)',
                    letterSpacing: '0.06em',
                  }}>
                    {formatINR(slide.product.price)}
                    {slide.product.emi ? ` · ${slide.product.emi}` : ''}
                  </div>
                )}
              </div>
              <div className="flex-wrap-mobile" style={{ alignItems: 'center', gap: 12 }}>
                <Link href={slide.ctaHref} className="btn btn-primary btn-lg">
                  {slide.ctaText}
                </Link>
                <a
                  href={`https://wa.me/919348066111?text=${encodeURIComponent(`Hi, I'm interested in the ${slide.product.name}. Can you help?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-lg"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </div>

            {/* Image side */}
            <div
              className="hero-image"
              style={{
                background: 'var(--paper-2)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 60% 40%, rgba(196,74,45,.13) 0%, transparent 58%)',
              }} />
              <div style={{
                position: 'relative',
                width: '82%',
                height: '82%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ProductImage
                  src={slide.product.image}
                  alt={slide.product.imageAlt}
                  priority={i === 0}
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div style={{
                position: 'absolute',
                bottom: 28,
                left: 28,
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'var(--ink)',
                opacity: 0.55,
                textTransform: 'uppercase',
              }}>
                {slide.product.name}<br />{formatINR(slide.product.price)}
              </div>
              <div style={{
                position: 'absolute',
                top: 28,
                right: 28,
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: '0.1em',
                color: 'var(--ink-3)',
                textTransform: 'uppercase',
              }}>
                {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        zIndex: 10,
        alignItems: 'center',
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              borderRadius: 999,
              background: i === current ? 'var(--ink)' : 'var(--line)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'width .3s ease, background .3s ease',
            }}
          />
        ))}
      </div>

      {/* Prev / Next arrows — hidden on mobile */}
      <button
        className="hide-mobile"
        onClick={prev}
        aria-label="Previous slide"
        style={{
          position: 'absolute',
          left: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 44,
          height: 44,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(4px)',
          border: '1px solid var(--line)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--ink)',
        }}
      >
        {Icons.arrowL}
      </button>
      <button
        className="hide-mobile"
        onClick={next}
        aria-label="Next slide"
        style={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 44,
          height: 44,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(4px)',
          border: '1px solid var(--line)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--ink)',
        }}
      >
        {Icons.arrowR}
      </button>
    </section>
  );
}
