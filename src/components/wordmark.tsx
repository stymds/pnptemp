import Image from 'next/image';

interface WordmarkProps {
  size?: number;
  tone?: 'ink' | 'paper';
}

// Logo is the master file at /public/logo.png (256x256, designed for light
// backgrounds). For dark backgrounds (tone="paper"), we invert it via CSS.
// Admin sidebar already wraps with filter:invert at the parent — that ends
// up double-inverting the image here when tone="paper" is also set, which
// produces the original. In practice they're never combined, so this is fine.
export function Wordmark({ size = 22, tone = 'ink' }: WordmarkProps) {
  const color = tone === 'paper' ? 'var(--paper)' : 'var(--ink)';
  const tileSize = size + 8;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Image
        src="/images/logo.png"
        alt="Paras n Paras"
        width={256}
        height={256}
        priority
        style={{
          width: tileSize,
          height: tileSize,
          objectFit: 'contain',
          flexShrink: 0,
          filter: tone === 'paper' ? 'invert(1)' : 'none',
        }}
      />
      <div style={{ lineHeight: 1, color }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: size, fontStyle: 'italic', letterSpacing: '-0.02em' }}>
          Paras<span style={{ opacity: 0.5, fontStyle: 'normal' }}>·</span>Paras
        </div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.55, marginTop: 3 }}>
          Canon Image Square
        </div>
      </div>
    </div>
  );
}
