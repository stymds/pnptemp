'use client';

import Link from 'next/link';
import { Icons } from './icons';
import { Wordmark } from './wordmark';

const iconBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 999,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--ink)', transition: 'background .15s',
  cursor: 'pointer',
};

function TopStrip() {
  return (
    <div style={{
      background: 'var(--ink)', color: 'var(--paper)',
      fontSize: 11, padding: '8px 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase',
    }}>
      <span>Authorized Canon Image Square · Est. 1998</span>
      <div style={{ display: 'flex', gap: 20 }}>
        <span>Free shipping above ₹5,000</span>
        <span>EMI from 0%</span>
        <span>Track order</span>
      </div>
    </div>
  );
}

interface NavProps {
  cartCount?: number;
  compact?: boolean;
}

export function Nav({ cartCount = 2, compact = false }: NavProps) {
  const links = ['Cameras', 'Lenses', 'Printers', 'Accessories', 'Used Gear', 'Workshops', 'Service'];
  return (
    <>
      {!compact && <TopStrip />}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(250,249,246,0.9)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '18px 32px', gap: 32 }}>
          <Link href="/" style={{ flexShrink: 0 }}><Wordmark size={20} /></Link>
          <nav style={{ display: 'flex', gap: 28, flex: 1, marginLeft: 16 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
    </>
  );
}

export function MobileNav({ cartCount = 2 }: { cartCount?: number }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(250,249,246,0.92)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--line)',
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <button style={{ ...iconBtn, width: 36, height: 36 }}>{Icons.menu}</button>
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
  );
}
