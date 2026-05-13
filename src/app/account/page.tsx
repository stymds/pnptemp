import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Footer } from '@/components/footer';
import { NavWithCount } from '@/components/nav-with-count';
import { ProductImage } from '@/components/product-image';
import { Icons } from '@/components/icons';
import { formatINR } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { productImageSrc } from '@/lib/storage';
import { signOutAction } from './actions';
import { ProfileForm } from './ProfileForm';

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'var(--accent)',
  PAID: 'var(--ok)',
  SHIPPED: 'var(--ok)',
  DELIVERED: 'var(--ok)',
  CANCELLED: '#a82323',
  REFUNDED: '#a82323',
};

const sidebar = [
  { label: 'Orders', href: '/account/orders' },
  { label: 'Wishlist', href: '/account/wishlist' },
  { label: 'Addresses', href: '/account/addresses' },
  { label: 'Profile', href: '/account#profile' },
] as const;

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account');

  const [recentOrders, wishlistCount, addressCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { items: true },
    }),
    prisma.wishlistItem.count({ where: { userId: user.id } }),
    prisma.address.count({ where: { userId: user.id } }),
  ]);

  const productIds = Array.from(new Set(recentOrders.flatMap((o) => o.items.map((i) => i.productId))));
  const productThumbs = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { images: { orderBy: { position: 'asc' }, take: 1 } },
      })
    : [];
  const thumbByProductId = new Map(productThumbs.map((p) => [p.id, p.images[0]?.storagePath ?? null]));

  const displayName =
    user.fullName?.split(' ')[0] ||
    user.email.split('@')[0] ||
    'there';

  return (
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <NavWithCount />
      <section className="pnp-px" style={{ paddingTop: 48, paddingBottom: 32 }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
          My account
        </div>
        <div className="flex-wrap-mobile" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className="fluid-h1" style={{ letterSpacing: '-0.03em' }}>Hello, {displayName}.</h1>
            <p className="muted" style={{ fontSize: 15, marginTop: 10 }}>{user.email}</p>
          </div>
          <form action={signOutAction}>
            <button type="submit" className="btn btn-ghost">Sign out</button>
          </form>
        </div>
      </section>

      <div className="show-mobile pnp-px" style={{ paddingBottom: 16 }}>
        <div className="scroll-x-mobile">
          {sidebar.map((s) => (
            <Link key={s.href} href={s.href} className="chip">{s.label}</Link>
          ))}
        </div>
      </div>

      <div className="split-sidebar-240 pnp-px" style={{ paddingBottom: 96 }}>
        <aside className="hide-mobile">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, borderTop: '1px solid var(--ink)', paddingTop: 16 }}>
            {sidebar.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                style={{
                  textAlign: 'left', padding: '12px 14px', borderRadius: 'var(--r-md)',
                  fontSize: 13, color: 'var(--ink-2)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                {s.label} {Icons.chevR}
              </Link>
            ))}
          </nav>
        </aside>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {/* Stat cards */}
          <div className="grid-3" style={{ gap: 16 }}>
            <Link href="/account/orders" style={{ padding: 24, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', color: 'inherit' }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>Orders</div>
              <div style={{ fontSize: 28, fontFamily: 'var(--serif)', marginBottom: 4 }}>{recentOrders.length === 0 ? '—' : `${recentOrders.length}+`}</div>
              <div className="muted" style={{ fontSize: 12 }}>{recentOrders.length === 0 ? 'No orders yet' : 'View all'}</div>
            </Link>
            <Link href="/account/wishlist" style={{ padding: 24, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', color: 'inherit' }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>Wishlist</div>
              <div style={{ fontSize: 28, fontFamily: 'var(--serif)', marginBottom: 4 }}>{wishlistCount}</div>
              <div className="muted" style={{ fontSize: 12 }}>Saved item{wishlistCount === 1 ? '' : 's'}</div>
            </Link>
            <Link href="/account/addresses" style={{ padding: 24, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', color: 'inherit' }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>Addresses</div>
              <div style={{ fontSize: 28, fontFamily: 'var(--serif)', marginBottom: 4 }}>{addressCount}</div>
              <div className="muted" style={{ fontSize: 12 }}>{addressCount === 0 ? 'Add your first' : 'Manage'}</div>
            </Link>
          </div>

          {/* Recent orders */}
          <div>
            <style>{`
              .acc-recent-row {
                display: grid;
                grid-template-columns: 64px 1fr auto;
                gap: 16px;
                align-items: center;
                padding: 20px 0;
                border-bottom: 1px solid var(--line);
                color: inherit;
                text-decoration: none;
              }
              .acc-recent-row .acc-recent-thumb { width: 64px; height: 64px; }
              .acc-recent-row .acc-recent-meta { display: flex; align-items: center; gap: 18px; justify-content: flex-end; }
              @media (max-width: 640px) {
                .acc-recent-row {
                  grid-template-columns: 56px 1fr;
                  gap: 12px;
                  row-gap: 8px;
                  padding: 16px 0;
                }
                .acc-recent-row .acc-recent-thumb { width: 56px; height: 56px; }
                .acc-recent-row .acc-recent-meta { grid-column: 1 / -1; justify-content: space-between; }
              }
            `}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
              <h2 style={{ fontSize: 24 }}>Recent orders</h2>
              {recentOrders.length > 0 && (
                <Link href="/account/orders" style={{ fontSize: 12, borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>
                  View all →
                </Link>
              )}
            </div>

            {recentOrders.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', background: 'var(--paper-2)', borderRadius: 'var(--r-md)' }}>
                <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>Place your first order and it will show up here.</p>
                <Link href="/cameras" className="btn btn-ghost btn-sm">Browse cameras →</Link>
              </div>
            ) : (
              <div style={{ borderTop: '1px solid var(--ink)' }}>
                {recentOrders.map((order) => {
                  const first = order.items[0];
                  const sp = first ? thumbByProductId.get(first.productId) : null;
                  return (
                    <Link key={order.id} href={`/account/orders/${order.id}`} className="acc-recent-row">
                      <div className="acc-recent-thumb" style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                        {sp && first && <ProductImage src={productImageSrc(sp)} alt={first.productName} sizes="64px" />}
                      </div>
                      <div>
                        <div className="mono muted" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                          {order.id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>
                          {order.items.map((i) => i.productName).slice(0, 2).join(' · ')}
                          {order.items.length > 2 && ` +${order.items.length - 2}`}
                        </div>
                      </div>
                      <div className="acc-recent-meta">
                        <span style={{ fontSize: 12, color: STATUS_COLOR[order.status] ?? 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor' }} />
                          {order.status.toLowerCase()}
                        </span>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>
                          {formatINR(Math.round(order.totalPaise / 100))}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Profile */}
          <div id="profile" style={{ scrollMarginTop: 100 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>Profile</h2>
            <ProfileForm initialFullName={user.fullName ?? ''} initialPhone={user.phone ?? ''} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
