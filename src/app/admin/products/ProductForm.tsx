'use client';

import { useActionState } from 'react';
import type { Category } from '@prisma/client';
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from './actions';

interface InitialProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  categoryId: string;
  pricePaise: number;
  mrpPaise: number;
  emi: string | null;
  stockUnits: number;
  badge: string | null;
  swatch: string | null;
  isPublished: boolean;
}

export function ProductForm({
  mode,
  categories,
  initial,
}: {
  mode: 'create' | 'edit';
  categories: Category[];
  initial?: InitialProduct;
}) {
  const action =
    mode === 'create'
      ? createProductAction
      : updateProductAction.bind(null, initial!.id);

  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} encType="multipart/form-data" style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
      <style>{`
        .admin-form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .admin-form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        @media (max-width: 768px) {
          .admin-form-row-2 { grid-template-columns: 1fr; }
          .admin-form-row-3 { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="admin-form-row-2">
        <div>
          <label className="label">Slug *</label>
          <input
            className="input"
            name="slug"
            required
            defaultValue={initial?.slug ?? ''}
            placeholder="eos-r5-mk2"
            pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
            autoComplete="off"
          />
          <small className="muted" style={{ fontSize: 11 }}>Lowercase, dashes, no spaces. Used in the URL.</small>
        </div>
        <div>
          <label className="label">Category *</label>
          <select className="input" name="categoryId" required defaultValue={initial?.categoryId ?? ''}>
            <option value="">— pick one —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Name *</label>
        <input className="input" name="name" required defaultValue={initial?.name ?? ''} />
      </div>

      <div>
        <label className="label">Tagline</label>
        <input className="input" name="tagline" defaultValue={initial?.tagline ?? ''} placeholder="Full-frame | 45MP | 8K RAW" />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          className="input"
          name="description"
          rows={4}
          defaultValue={initial?.description ?? ''}
          style={{ resize: 'vertical', padding: 10, fontFamily: 'inherit' }}
        />
      </div>

      <div className="admin-form-row-3">
        <div>
          <label className="label">Price (₹) *</label>
          <input
            className="input"
            type="number"
            name="priceRupees"
            required
            min={0}
            step="1"
            defaultValue={initial ? Math.round(initial.pricePaise / 100) : ''}
          />
        </div>
        <div>
          <label className="label">MRP (₹) *</label>
          <input
            className="input"
            type="number"
            name="mrpRupees"
            required
            min={0}
            step="1"
            defaultValue={initial ? Math.round(initial.mrpPaise / 100) : ''}
          />
        </div>
        <div>
          <label className="label">Stock units *</label>
          <input
            className="input"
            type="number"
            name="stockUnits"
            required
            min={0}
            step="1"
            defaultValue={initial?.stockUnits ?? 0}
          />
        </div>
      </div>

      <div className="admin-form-row-3">
        <div>
          <label className="label">EMI text</label>
          <input className="input" name="emi" defaultValue={initial?.emi ?? ''} placeholder="From ₹14,166/mo" />
        </div>
        <div>
          <label className="label">Badge</label>
          <input className="input" name="badge" defaultValue={initial?.badge ?? ''} placeholder="New / Bestseller / Pro pick" />
        </div>
        <div>
          <label className="label">Swatch hex</label>
          <input className="input" name="swatch" defaultValue={initial?.swatch ?? ''} placeholder="#1a1a1a" />
        </div>
      </div>

      <div>
        <label className="label">Images {mode === 'edit' ? '(append more — existing ones managed below)' : '(first one is the main image)'}</label>
        <input
          className="input"
          type="file"
          name="images"
          accept="image/webp,image/png,image/jpeg,image/avif"
          multiple
          style={{ padding: 8 }}
        />
        <small className="muted" style={{ fontSize: 11 }}>WebP, PNG, JPEG, or AVIF. Max 10MB each.</small>
      </div>

      <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
        <input type="checkbox" name="isPublished" defaultChecked={initial?.isPublished ?? true} />
        Published (visible on the storefront)
      </label>

      {state?.ok === false && (
        <div role="alert" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'rgba(220,60,60,0.08)', color: '#a82323', fontSize: 13 }}>
          {state.error}
        </div>
      )}
      {state?.ok === true && mode === 'edit' && (
        <div role="status" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'rgba(60,140,90,0.08)', color: 'var(--ok)', fontSize: 13 }}>
          Saved.
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" disabled={pending} className="btn btn-primary btn-lg">
          {pending ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}
        </button>
        <a href="/admin/products" className="btn btn-ghost btn-lg">Cancel</a>
      </div>
    </form>
  );
}
