'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to your monitoring later — for now just to console.
    console.error('Route error', error);
  }, [error]);

  return (
    <div style={{
      width: '100%', minHeight: '70vh',
      background: 'var(--paper)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}>
          Something went wrong
        </div>
        <h1 className="fluid-h2" style={{ letterSpacing: '-0.03em', marginBottom: 16 }}>
          Apologies — that didn&apos;t go through.
        </h1>
        <p className="muted" style={{ fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          {error.message || 'An unexpected error occurred while loading this page.'}
          {error.digest && (
            <span className="mono" style={{ display: 'block', marginTop: 8, fontSize: 11 }}>
              Ref: {error.digest}
            </span>
          )}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} className="btn btn-primary">Try again</button>
          <Link href="/" className="btn btn-ghost">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
