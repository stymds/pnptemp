'use client';

import { useState, useTransition } from 'react';
import { renameCategoryAction, deleteCategoryAction } from './actions';

interface Props {
  id: string;
  slug: string;
  name: string;
  productCount: number;
}

export function CategoryRow({ id, slug, name, productCount }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await renameCategoryAction(id, draft);
        setEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  function remove() {
    if (!confirm(`Delete category "${name}"? This will fail if it has products.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteCategoryAction(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  return (
    <div className="admin-categories-row">
      <style>{`
        .admin-categories-row {
          display: grid;
          grid-template-columns: 160px 1fr auto auto;
          gap: 16px;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid var(--line);
        }
        .admin-categories-meta {
          display: flex; align-items: center; gap: 12px;
        }
        @media (max-width: 768px) {
          .admin-categories-row {
            grid-template-columns: 1fr;
            gap: 6px;
          }
          .admin-categories-meta {
            justify-content: space-between;
          }
        }
      `}</style>
      <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {slug}
      </div>
      {editing ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            style={{ flex: 1 }}
          />
        </div>
      ) : (
        <div style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>{name}</div>
      )}
      <div className="admin-categories-meta">
        <div className="muted" style={{ fontSize: 12 }}>
          {productCount} product{productCount === 1 ? '' : 's'}
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, opacity: pending ? 0.5 : 1 }}>
          {editing ? (
            <>
              <button onClick={save} disabled={pending} style={{ borderBottom: '1px solid var(--ink)', paddingBottom: 1 }}>
                Save
              </button>
              <button onClick={() => { setEditing(false); setDraft(name); }} disabled={pending} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 1, color: 'var(--ink-3)' }}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 1 }}>
                Rename
              </button>
              <button onClick={remove} disabled={pending} style={{ color: '#a82323', borderBottom: '1px solid var(--line)', paddingBottom: 1 }}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      {error && (
        <div role="alert" style={{ gridColumn: '1 / -1', padding: '6px 10px', borderRadius: 'var(--r-md)', background: 'rgba(220,60,60,0.08)', color: '#a82323', fontSize: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}
