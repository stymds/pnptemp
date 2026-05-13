import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Wordmark } from '@/components/wordmark';
import { ProductImage } from '@/components/product-image';
import { Icons } from '@/components/icons';
import { formatINR } from '@/lib/data';
import { requireUser } from '@/lib/auth';
import { getCart } from '@/lib/cart';
import { getAppliedCoupon } from '@/lib/coupons';
import { prisma } from '@/lib/db';
import { productImageSrc } from '@/lib/storage';
import { CheckoutClient } from './CheckoutClient';

export default async function CheckoutPage() {
  const user = await requireUser();

  const cart = await getCart();
  const items = cart?.items ?? [];
  if (items.length === 0) redirect('/cart');

  const addresses = await prisma.address.findMany({
    where: { userId: user.id, type: 'SHIPPING' },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  const subtotalPaise = items.reduce((s, i) => s + i.priceAtAddPaise * i.qty, 0);
  const coupon = await getAppliedCoupon(subtotalPaise);
  const discountPaise = coupon?.discountPaise ?? 0;
  const discountedSubtotal = Math.max(0, subtotalPaise - discountPaise);
  const shippingPaise = discountedSubtotal > 5000_00 || discountedSubtotal === 0 ? 0 : 299_00;
  const totalPaise = discountedSubtotal + shippingPaise;

  const steps = ['Bag', 'Address', 'Payment', 'Review'];
  const step = 2;

  return (
    <div style={{ width: '100%', background: 'var(--paper)', minHeight: '100vh' }}>
      <header className="pnp-px flex-wrap-mobile" style={{
        borderBottom: '1px solid var(--line)', paddingTop: 20, paddingBottom: 20,
        justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--paper)', gap: 16,
      }}>
        <Link href="/"><Wordmark size={18} /></Link>
        <div className="scroll-x-mobile" style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 999,
                  border: '1px solid ' + (i <= step ? 'var(--ink)' : 'var(--line)'),
                  background: i < step ? 'var(--ink)' : 'transparent',
                  color: i < step ? 'var(--paper)' : (i === step ? 'var(--ink)' : 'var(--ink-3)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontFamily: 'var(--mono)',
                }}>
                  {i < step
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : i + 1}
                </span>
                <span style={{ fontSize: 12, color: i <= step ? 'var(--ink)' : 'var(--ink-3)', fontWeight: i === step ? 500 : 400 }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div style={{ width: 40, height: 1, background: 'var(--line)', margin: '0 16px' }} />}
            </div>
          ))}
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em', display: 'flex', gap: 6, alignItems: 'center' }}>
          {Icons.shield} SECURE
        </div>
      </header>

      <div className="split-checkout pnp-px" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 1400, margin: '0 auto' }}>
        <div>
          <CheckoutClient
            addresses={addresses.map(a => ({
              id: a.id,
              fullName: a.fullName,
              phone: a.phone,
              line1: a.line1,
              line2: a.line2,
              city: a.city,
              state: a.state,
              pincode: a.pincode,
              isDefault: a.isDefault,
            }))}
            totalPaise={totalPaise}
            userEmail={user.email}
          />
        </div>

        {/* Summary */}
        <aside className="checkout-summary-sticky" style={{ top: 100 }}>
          <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-lg)', padding: 28 }}>
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>Your order</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {items.map(it => {
                const img = it.product.images[0];
                return (
                  <div key={it.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 56, height: 56, background: 'var(--paper)', borderRadius: 'var(--r-sm)', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                      {img && <ProductImage src={productImageSrc(img.storagePath)} alt={img.alt} sizes="56px" />}
                      <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 999, width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)' }}>
                        {it.qty}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.product.name}</div>
                      <div className="muted" style={{ fontSize: 11 }}>{it.product.category.name}</div>
                    </div>
                    <div style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                      {formatINR(Math.round((it.priceAtAddPaise * it.qty) / 100))}
                    </div>
                  </div>
                );
              })}
            </div>
            <hr className="hr" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">Subtotal</span>
                <span>{formatINR(Math.round(subtotalPaise / 100))}</span>
              </div>
              {coupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Coupon ({coupon.code})</span>
                  <span style={{ color: 'var(--ok)' }}>−{formatINR(Math.round(discountPaise / 100))}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">Shipping</span>
                <span>{shippingPaise === 0 ? 'Free' : formatINR(Math.round(shippingPaise / 100))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">GST</span>
                <span className="muted">Included</span>
              </div>
            </div>
            <hr className="hr" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 16 }}>
              <span style={{ fontSize: 13 }}>Total</span>
              <span style={{ fontSize: 24, fontFamily: 'var(--serif)' }}>
                {formatINR(Math.round(totalPaise / 100))}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
