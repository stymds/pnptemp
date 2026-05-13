export default function Loading() {
  return (
    <div style={{
      width: '100%', minHeight: '60vh',
      background: 'var(--paper)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div
        aria-hidden
        style={{
          width: 28, height: 28,
          borderRadius: 999,
          border: '2px solid var(--line)',
          borderTopColor: 'var(--ink)',
          animation: 'pnp-spin 0.8s linear infinite',
        }}
      />
      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
        Loading
      </div>
      <style>{`@keyframes pnp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
