'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Icons } from './icons';
import { Wordmark } from './wordmark';

const iconBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 999,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--ink)', transition: 'background .15s',
  cursor: 'pointer',
};

const TICKER_ITEMS = [
  'Authorized Canon Image Square · Est. 1998',
  'EMI from 0%',
  'Pan India delivery',
  'Use welcome10 for 10% off on your first order',
];

function TopStrip() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{
      background: 'var(--ink)', color: 'var(--paper)',
      fontSize: 11, height: 34, overflow: 'hidden',
      fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase',
      display: 'flex', alignItems: 'center',
    }}>
      <style>{`
        @keyframes pnp-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .pnp-ticker-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: pnp-ticker 28s linear infinite;
          will-change: transform;
        }
        .pnp-ticker-track:hover { animation-play-state: paused; }
        .pnp-ticker-sep {
          margin: 0 20px;
          opacity: 0.35;
        }
      `}</style>
      <div className="pnp-ticker-track">
        {items.map((item, i) => (
          <span key={i} style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
            {item}
            <span className="pnp-ticker-sep">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

interface NavProps {
  cartCount?: number;
  compact?: boolean;
  isLoggedIn?: boolean;
}

export function Nav({ cartCount = 2, compact = false }: NavProps) {
  const [tickerVisible, setTickerVisible] = useState(true);
  const lastScrollY = useRef(0);
  const locked = useRef(false);

  useEffect(() => {
    const handler = () => {
      if (locked.current) return;
      const y = window.scrollY;
      if (y > lastScrollY.current && y > 60) {
        setTickerVisible(false);
        locked.current = true;
        setTimeout(() => {
          locked.current = false;
          lastScrollY.current = window.scrollY;
        }, 350);
      } else if (y < lastScrollY.current) {
        setTickerVisible(true);
        locked.current = true;
        setTimeout(() => {
          locked.current = false;
          lastScrollY.current = window.scrollY;
        }, 350);
      } else {
        lastScrollY.current = y;
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = ['Cameras', 'Lenses', 'Printers', 'Accessories', 'Used Gear', 'Workshops', 'Service'];
  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 20 }}>
      {!compact && (
        <div style={{ overflow: 'hidden', maxHeight: tickerVisible ? 34 : 0, transition: 'max-height 0.3s ease' }}>
          <TopStrip />
        </div>
      )}
      <header style={{
        background: 'rgba(250,249,246,0.9)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div className="pnp-px" style={{ display: 'flex', alignItems: 'center', paddingTop: 16, paddingBottom: 16, gap: 32 }}>
          <Link href="/" style={{ flexShrink: 0 }}><Wordmark size={24} /></Link>
          <nav className="hide-mobile" style={{ display: 'flex', gap: 28, flex: 1, marginLeft: 16 }}>
            {links.map(l => (
              <Link key={l} href={l === 'Cameras' ? '/cameras' : '#'} style={{
                fontSize: 13, color: 'var(--ink-2)',
                transition: 'color .15s', padding: '4px 0',
                borderBottom: '1px solid transparent',
              }}>
                {l}
              </Link>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <Link href="/search" style={iconBtn}>{Icons.search}</Link>
            <Link href="/account" style={iconBtn}>{Icons.user}</Link>
            <button style={iconBtn}>{Icons.heart}</button>
            <Link href="/cart" style={{ ...iconBtn, position: 'relative' }}>
              {Icons.bag}
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  background: 'var(--accent)', color: 'var(--paper)',
                  borderRadius: 999, minWidth: 16, height: 16,
                  fontSize: 9, fontFamily: 'var(--mono)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </header>
      </div>
    </>
  );
}

export function SiteNav({ cartCount = 2, compact = false, isLoggedIn = false }: NavProps) {
  return (
    <>
      <div className="sitenav-desktop"><Nav cartCount={cartCount} compact={compact} /></div>
      <div className="sitenav-mobile"><MobileNav cartCount={cartCount} isLoggedIn={isLoggedIn} /></div>
    </>
  );
}

const MOBILE_DRAWER_LINKS: Array<{ label: string; href: string }> = [
  { label: 'All cameras', href: '/cameras' },
  { label: 'Mirrorless', href: '/cameras?category=mirrorless' },
  { label: 'DSLR', href: '/cameras?category=dslr' },
  { label: 'Lenses', href: '/cameras?category=lenses' },
  { label: 'Printers', href: '/cameras?category=printers' },
  { label: 'Accessories', href: '/cameras?category=accessories' },
];

const MOBILE_DRAWER_ACCOUNT: Array<{ label: string; href: string }> = [
  { label: 'My account', href: '/account' },
  { label: 'Orders', href: '/account/orders' },
  { label: 'Wishlist', href: '/account/wishlist' },
  { label: 'Addresses', href: '/account/addresses' },
];

export function MobileNav({ cartCount = 2, isLoggedIn = false }: { cartCount?: number; isLoggedIn?: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh();
    router.push('/');
  }

  // Close on Escape + lock body scroll while drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(250,249,246,0.92)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--line)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          style={{ ...iconBtn, width: 36, height: 36 }}
        >
          {Icons.menu}
        </button>
        <Wordmark size={16} />
        <div style={{ display: 'flex', gap: 2 }}>
          <Link href="/search" style={{ ...iconBtn, width: 36, height: 36 }}>{Icons.search}</Link>
          <Link href="/cart" style={{ ...iconBtn, width: 36, height: 36, position: 'relative' }}>
            {Icons.bag}
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                background: 'var(--accent)', color: 'var(--paper)',
                borderRadius: 999, minWidth: 14, height: 14,
                fontSize: 9, fontFamily: 'var(--mono)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
              }}>{cartCount}</span>
            )}
          </Link>
        </div>
      </header>

      {/* Drawer + backdrop */}
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(20,18,16,0.45)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms ease',
        }}
      />
      <aside
        role="dialog"
        aria-label="Menu"
        aria-hidden={!open}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 51,
          width: 'min(86vw, 360px)',
          background: 'var(--paper)',
          borderRight: '1px solid var(--line)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 240ms cubic-bezier(.2,.7,.2,1)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderBottom: '1px solid var(--line)',
        }}>
          <Wordmark size={16} />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            style={{ ...iconBtn, width: 36, height: 36 }}
          >
            {Icons.close}
          </button>
        </div>

        <nav style={{ padding: '20px 8px 8px', display: 'flex', flexDirection: 'column' }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', padding: '0 12px 12px' }}>
            Shop
          </div>
          {MOBILE_DRAWER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                padding: '14px 12px',
                fontSize: 16, fontFamily: 'var(--serif)',
                color: 'var(--ink)',
                borderRadius: 'var(--r-md)',
              }}
            >
              {l.label}
            </Link>
          ))}

          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', padding: '20px 12px 12px' }}>
            Account
          </div>
          {MOBILE_DRAWER_ACCOUNT.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                padding: '12px 12px',
                fontSize: 14,
                color: 'var(--ink-2)',
                borderRadius: 'var(--r-md)',
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid var(--line)', display: 'flex', gap: 12 }}>
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
          >
            View cart{cartCount > 0 ? ` (${cartCount})` : ''}
          </Link>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={signOut}
              className="btn btn-ghost btn-sm"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="btn btn-ghost btn-sm"
            >
              Sign in
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
