import Link from 'next/link';
import { Footer } from '@/components/footer';
import { ProductImage } from '@/components/product-image';
import { Icons } from '@/components/icons';
import { NavWithCount } from '@/components/nav-with-count';
import { formatINR } from '@/lib/data';
import { getCart } from '@/lib/cart';
import { getAppliedCoupon } from '@/lib/coupons';
import { productImageSrc } from '@/lib/storage';
import { CartItemControls } from './CartItemControls';
import { CouponBox } from './CouponBox';

export default async function CartPage() {
  const cart = await getCart();
  const items = cart?.items ?? [];
  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const subtotalPaise = items.reduce((s, i) => s + i.priceAtAddPaise * i.qty, 0);
  const savingsPaise = items.reduce(
    (s, i) => s + Math.max(0, i.product.mrpPaise - i.priceAtAddPaise) * i.qty,
    0,
  );
  const coupon = await getAppliedCoupon(subtotalPaise);
  const discountPaise = coupon?.discountPaise ?? 0;

  const subtotal = Math.round(subtotalPaise / 100);
  const savings = Math.round(savingsPaise / 100);
  const discount = Math.round(discountPaise / 100);
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 299;
  const total = subtotal - discount + shipping;

  return (
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <NavWithCount />
      <section className="pnp-px" style={{ paddingTop: 40, paddingBottom: 24 }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          <Link href="/">Home</Link> / <span style={{ color: 'var(--ink)' }}>Your bag</span>
        </div>
        <div className="flex-wrap-mobile" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h1 className="fluid-h1" style={{ letterSpacing: '-0.03em' }}>Your bag</h1>
          <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
            {itemCount} ITEM{itemCount === 1 ? '' : 'S'}
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <section className="pnp-px" style={{ paddingBottom: 96 }}>
          <div style={{
            padding: '80px 24px', textAlign: 'center',
            background: 'var(--paper-2)', borderRadius: 'var(--r-lg)',
          }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-3)', marginBottom: 14, textTransform: 'uppercase' }}>
              Your bag is empty
            </div>
            <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>
              Browse the catalog and add something to get started.
            </p>
            <Link href="/cameras" className="btn btn-primary btn-lg">Shop cameras →</Link>
          </div>
        </section>
      ) : (
        <div className="split-summary pnp-px" style={{ paddingTop: 24, paddingBottom: 96 }}>
          {/* Items */}
          <div style={{ borderTop: '1px solid var(--ink)' }}>
            {items.map(it => {
              const img = it.product.images[0];
              const unitRupees = Math.round(it.priceAtAddPaise / 100);
              const mrpRupees = Math.round(it.product.mrpPaise / 100);
              return (
                <div key={it.id} className="cart-row" style={{
                  padding: '28px 0', borderBottom: '1px solid var(--line)',
                }}>
                  <div style={{ aspectRatio: '1/1', maxWidth: 140, width: '100%', background: 'var(--paper-2)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                    {img && <ProductImage src={productImageSrc(img.storagePath)} alt={img.alt} sizes="140px" />}
                  </div>
                  <div>
                    <div className="mono muted" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                      {it.product.category.name}
                    </div>
                    <Link href={`/cameras/${it.product.slug}`} style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 4, display: 'block', color: 'var(--ink)' }}>
                      {it.product.name}
                    </Link>
                    {it.product.tagline && (
                      <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>{it.product.tagline}</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: it.product.stockUnits > 0 ? 'var(--ok)' : 'var(--warn)', marginBottom: 14 }}>
                      {Icons.check} {it.product.stockUnits > 0 ? 'In stock · ships in 24h' : 'Out of stock'}
                    </div>
                    <CartItemControls itemId={it.id} qty={it.qty} />
                  </div>
                  <div className="cart-price" style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontFamily: 'var(--serif)' }}>{formatINR(unitRupees * it.qty)}</div>
                    {mrpRupees > unitRupees && <div className="strike" style={{ fontSize: 12, marginTop: 4 }}>{formatINR(mrpRupees * it.qty)}</div>}
                  </div>
                </div>
              );
            })}
            <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between' }}>
              <Link href="/cameras" className="btn btn-ghost btn-sm">← Continue shopping</Link>
              <div className="muted" style={{ fontSize: 12 }}>All prices inclusive of 18% GST</div>
            </div>
          </div>

          {/* Summary */}
          <aside className="checkout-summary-sticky" style={{ top: 80 }}>
            <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-lg)', padding: 32 }}>
              <h3 style={{ fontSize: 22, marginBottom: 20 }}>Order summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Subtotal ({itemCount} item{itemCount === 1 ? '' : 's'})</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="muted">You save</span>
                    <span style={{ color: 'var(--accent)' }}>−{formatINR(savings)}</span>
                  </div>
                )}
                {coupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="muted">Coupon ({coupon.code})</span>
                    <span style={{ color: 'var(--ok)' }}>−{formatINR(discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <CouponBox
                  appliedCode={coupon?.code ?? null}
                  appliedDescription={coupon?.description ?? null}
                  appliedDiscountRupees={discount}
                />
              </div>

              <hr className="hr" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '20px 0' }}>
                <span style={{ fontSize: 13 }}>Total payable</span>
                <span style={{ fontSize: 28, fontFamily: 'var(--serif)' }}>{formatINR(total)}</span>
              </div>
              <Link href="/checkout" className="btn btn-primary btn-lg btn-block" style={{ marginBottom: 10, display: 'flex' }}>Checkout →</Link>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                {Icons.shield} Secure checkout · SSL encrypted
              </div>
            </div>
          </aside>
        </div>
      )}
      <Footer />
    </div>
  );
}
