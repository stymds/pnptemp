interface WordmarkProps {
  size?: number;
  tone?: 'ink' | 'paper';
}

export function Wordmark({ size = 22, tone = 'ink' }: WordmarkProps) {
  const color = tone === 'paper' ? 'var(--paper)' : 'var(--ink)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: size + 8, height: size + 8,
        borderRadius: 6,
        background: color,
        color: tone === 'paper' ? 'var(--ink)' : 'var(--paper)',
        fontFamily: 'var(--serif)',
        fontSize: size * 0.72,
        fontWeight: 500,
        letterSpacing: '-0.06em',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontStyle: 'italic',
      }}>P</div>
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
