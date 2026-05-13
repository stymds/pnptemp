'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin route error', error);
  }, [error]);

  return (
    <div style={{ padding: 32, maxWidth: 600 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#a82323', marginBottom: 12 }}>
        Error
      </div>
      <h1 style={{ fontSize: 24, letterSpacing: '-0.02em', marginBottom: 16 }}>
        Something went wrong.
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 8, lineHeight: 1.6 }}>
        {error.message || 'Unexpected error.'}
      </p>
      {error.digest && (
        <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 24 }}>
          Ref: {error.digest}
        </p>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={reset} className="btn btn-primary">Try again</button>
      </div>
    </div>
  );
}
