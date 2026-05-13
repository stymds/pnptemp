import Link from 'next/link';

export function Pagination({
  basePath,
  page,
  pageSize,
  total,
  extraQuery = {},
}: {
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  extraQuery?: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clamped = Math.min(Math.max(1, page), totalPages);

  function buildHref(targetPage: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(extraQuery)) {
      if (v) params.set(k, v);
    }
    if (targetPage > 1) params.set('page', String(targetPage));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  if (totalPages <= 1) return null;

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--line)',
    }}>
      <div className="muted" style={{ fontSize: 12 }}>
        Page {clamped} of {totalPages} · {total} total
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {clamped > 1 ? (
          <Link href={buildHref(clamped - 1)} className="btn btn-ghost btn-sm">← Prev</Link>
        ) : (
          <span className="btn btn-ghost btn-sm" style={{ opacity: 0.4, pointerEvents: 'none' }}>← Prev</span>
        )}
        {clamped < totalPages ? (
          <Link href={buildHref(clamped + 1)} className="btn btn-ghost btn-sm">Next →</Link>
        ) : (
          <span className="btn btn-ghost btn-sm" style={{ opacity: 0.4, pointerEvents: 'none' }}>Next →</span>
        )}
      </div>
    </div>
  );
}
