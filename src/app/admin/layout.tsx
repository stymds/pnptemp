import Link from 'next/link';
import { Wordmark } from '@/components/wordmark';
import { requireAdmin } from '@/lib/auth';
import { signOutAction } from '@/app/account/actions';

const nav = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Coupons', href: '/admin/coupons' },
  { label: 'Users', href: '/admin/users' },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <>
      <style>{`
        .admin-shell { display: grid; grid-template-columns: 240px 1fr; width: 100%; min-height: 100vh; background: var(--paper); }
        .admin-sidebar { background: var(--ink); color: var(--paper); padding: 24px 16px; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; }
        .admin-main { padding: 32px 48px; overflow: auto; min-width: 0; }
        .admin-mobile-bar-wrap { display: none; }
        @media (max-width: 768px) {
          .admin-shell { display: block; }
          .admin-sidebar { display: none; }
          .admin-main { padding: 20px 16px; }
          .admin-mobile-bar-wrap {
            display: block;
            position: sticky; top: 0; z-index: 10;
            background: var(--ink);
          }
          .admin-mobile-bar-wrap::after {
            content: '';
            position: absolute; top: 0; right: 0; bottom: 0;
            width: 32px; pointer-events: none;
            background: linear-gradient(to left, var(--ink), transparent);
          }
          .admin-mobile-bar {
            display: flex; align-items: center; gap: 2px;
            padding: 0 12px;
            overflow-x: auto; scrollbar-width: none;
          }
          .admin-mobile-bar::-webkit-scrollbar { display: none; }
        }
      `}</style>

      {/* Mobile top nav */}
      <div className="admin-mobile-bar-wrap">
        <div className="admin-mobile-bar">
          <Link href="/" style={{ marginRight: 12, filter: 'invert(1)', flexShrink: 0 }}>
            <Wordmark size={14} />
          </Link>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} style={{ padding: '14px 10px', color: 'rgba(255,255,255,0.8)', fontSize: 12, whiteSpace: 'nowrap' }}>
              {n.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="admin-shell">
        <aside className="admin-sidebar">
          <Link href="/" style={{ marginBottom: 32, display: 'block', filter: 'invert(1)' }}>
            <Wordmark size={16} />
          </Link>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', opacity: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Admin
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {nav.map((n) => (
              <Link key={n.href} href={n.href} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, fontSize: 12, opacity: 0.6 }}>
            <div style={{ marginBottom: 6 }}>{user.email}</div>
            <form action={signOutAction}>
              <button type="submit" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 1 }}>
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <main className="admin-main">
          {children}
        </main>
      </div>
    </>
  );
}
