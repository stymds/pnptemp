import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      width: '100%', minHeight: '70vh',
      background: 'var(--paper)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>
          404 · Not found
        </div>
        <h1 className="fluid-h2" style={{ letterSpacing: '-0.03em', marginBottom: 16 }}>
          That page got away.
        </h1>
        <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>
          The page you&apos;re looking for has moved or doesn&apos;t exist.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary">Back to home</Link>
          <Link href="/cameras" className="btn btn-ghost">Browse cameras</Link>
        </div>
      </div>
    </div>
  );
}
