'use client';

import { useActionState, useState, useTransition } from 'react';
import { Icons } from '@/components/icons';
import { submitReviewAction, deleteOwnReviewAction, type ReviewFormState } from './review-actions';

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
  authorName: string;
  isMine: boolean;
}

interface Props {
  productId: string;
  productSlug: string;
  reviews: ReviewItem[];
  averageRating: number;
  reviewsCount: number;
  canReview: boolean;
  isSignedIn: boolean;
  currentUserReview: { rating: number; title: string | null; body: string | null } | null;
}

function StarRow({ value, size = 14 }: { value: number; size?: number }) {
  const full = Math.round(value);
  return (
    <span style={{ display: 'inline-flex', gap: 2, color: 'var(--accent)' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            opacity: i <= full ? 1 : 0.25,
            display: 'inline-flex',
            width: size,
            height: size,
          }}
        >
          {Icons.star}
        </span>
      ))}
    </span>
  );
}

export function ReviewsSection({
  productId,
  productSlug,
  reviews,
  averageRating,
  reviewsCount,
  canReview,
  isSignedIn,
  currentUserReview,
}: Props) {
  const [rating, setRating] = useState<number>(currentUserReview?.rating ?? 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [showForm, setShowForm] = useState<boolean>(!currentUserReview);

  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(
    submitReviewAction,
    null,
  );
  const [deletePending, startDelete] = useTransition();

  const histogram = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => Math.round(r.rating) === stars).length,
  }));
  const maxBucket = Math.max(1, ...histogram.map((h) => h.count));

  return (
    <section className="pnp-px" style={{ paddingTop: 80, paddingBottom: 80, borderTop: '1px solid var(--line)' }}>
      <style>{`
        .reviews-split { display: grid; grid-template-columns: 300px 1fr; gap: 64px; align-items: flex-start; }
        @media (max-width: 640px) { .reviews-split { grid-template-columns: 1fr; gap: 32px; } }
      `}</style>
      <div className="eyebrow" style={{ marginBottom: 12 }}>Customer reviews</div>
      <h2 className="fluid-h3" style={{ marginBottom: 32, letterSpacing: '-0.02em' }}>
        What buyers are saying.
      </h2>

      <div className="reviews-split">
        {/* Aggregate */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 56, fontFamily: 'var(--serif)', letterSpacing: '-0.02em' }}>
              {reviewsCount === 0 ? '—' : averageRating.toFixed(1)}
            </span>
            {reviewsCount > 0 && <span className="muted" style={{ fontSize: 13 }}>/ 5</span>}
          </div>
          {reviewsCount > 0 && <StarRow value={averageRating} size={18} />}
          <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
            {reviewsCount === 0 ? 'No reviews yet.' : `${reviewsCount} verified review${reviewsCount === 1 ? '' : 's'}.`}
          </p>

          {reviewsCount > 0 && (
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {histogram.map((h) => (
                <div key={h.stars} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                  <span style={{ width: 16, color: 'var(--ink-3)' }}>{h.stars}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--paper-2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(h.count / maxBucket) * 100}%`, height: '100%', background: 'var(--accent)' }} />
                  </div>
                  <span className="muted" style={{ width: 24, textAlign: 'right' }}>{h.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form + list */}
        <div>
          {/* Write/edit area */}
          {!isSignedIn ? (
            <div style={{ padding: 20, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', marginBottom: 32 }}>
              <p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
                Sign in to leave a review (only verified buyers can review).
              </p>
              <a href={`/login?next=/cameras/${productSlug}`} className="btn btn-ghost btn-sm">Sign in →</a>
            </div>
          ) : !canReview ? (
            <div style={{ padding: 20, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', marginBottom: 32 }}>
              <p className="muted" style={{ fontSize: 13 }}>
                Only customers who&apos;ve purchased this product can leave a review.
              </p>
            </div>
          ) : currentUserReview && !showForm ? (
            <div style={{ padding: 20, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div>
                  <div className="mono muted" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                    Your review
                  </div>
                  <StarRow value={currentUserReview.rating} size={14} />
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                  <button onClick={() => setShowForm(true)} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 1 }}>Edit</button>
                  <button
                    disabled={deletePending}
                    onClick={() => {
                      if (confirm('Delete your review?')) startDelete(() => deleteOwnReviewAction(productId));
                    }}
                    style={{ color: '#a82323', borderBottom: '1px solid var(--line)', paddingBottom: 1 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {currentUserReview.title && (
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, marginTop: 8 }}>{currentUserReview.title}</div>
              )}
              {currentUserReview.body && (
                <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.55 }}>{currentUserReview.body}</p>
              )}
            </div>
          ) : (
            <form action={formAction} style={{ display: 'grid', gap: 12, marginBottom: 32, padding: 20, border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
              <input type="hidden" name="productId" value={productId} />
              <input type="hidden" name="productSlug" value={productSlug} />
              <input type="hidden" name="rating" value={rating} />

              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {currentUserReview ? 'Edit your review' : 'Write a review'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Rating</span>
                <span
                  style={{ display: 'inline-flex', gap: 4, cursor: 'pointer' }}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i)}
                      onMouseEnter={() => setHoverRating(i)}
                      aria-label={`${i} star${i === 1 ? '' : 's'}`}
                      style={{
                        color: 'var(--accent)',
                        opacity: i <= (hoverRating || rating) ? 1 : 0.25,
                        display: 'inline-flex', width: 22, height: 22,
                      }}
                    >
                      {Icons.star}
                    </button>
                  ))}
                </span>
              </div>

              <div>
                <label className="label">Title (optional)</label>
                <input className="input" name="title" defaultValue={currentUserReview?.title ?? ''} placeholder="Stunning low-light performance" />
              </div>
              <div>
                <label className="label">Review (optional)</label>
                <textarea
                  className="input"
                  name="body"
                  rows={4}
                  defaultValue={currentUserReview?.body ?? ''}
                  placeholder="What did you like? What surprised you?"
                  style={{ resize: 'vertical', padding: 10, fontFamily: 'inherit' }}
                />
              </div>

              {state?.ok === false && (
                <div role="alert" style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'rgba(220,60,60,0.08)', color: '#a82323', fontSize: 12 }}>
                  {state.error}
                </div>
              )}
              {state?.ok === true && (
                <div role="status" style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'rgba(60,140,90,0.08)', color: 'var(--ok)', fontSize: 12 }}>
                  Posted. Thank you.
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={pending} className="btn btn-primary">
                  {pending ? 'Saving…' : currentUserReview ? 'Update review' : 'Post review'}
                </button>
                {currentUserReview && (
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
                )}
              </div>
            </form>
          )}

          {/* List */}
          {reviews.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>Be the first to review this product.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--line)' }}>
              {reviews.map((r) => (
                <div key={r.id} style={{ padding: '20px 0', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <StarRow value={r.rating} size={13} />
                    {r.verifiedPurchase && (
                      <span className="mono" style={{ fontSize: 10, color: 'var(--ok)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        verified
                      </span>
                    )}
                  </div>
                  {r.title && <div style={{ fontFamily: 'var(--serif)', fontSize: 17, marginBottom: 6 }}>{r.title}</div>}
                  {r.body && <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 8 }}>{r.body}</p>}
                  <div className="muted" style={{ fontSize: 11 }}>
                    {r.authorName} ·{' '}
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {r.isMine && <span style={{ marginLeft: 8 }}>· you</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
