import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { CameraArt } from '@/components/camera-art';
import { Icons } from '@/components/icons';
import { formatINR } from '@/lib/data';

const orders = [
  { id: 'PNP-24041901', date: '19 Apr 2026', status: 'Delivered', items: 'EOS R6 Mark II · RF 50mm f/1.8', total: 236980 },
  { id: 'PNP-24031202', date: '12 Mar 2026', status: 'Delivered', items: 'Speedlite EL-5', total: 59990 },
  { id: 'PNP-24013106', date: '31 Jan 2026', status: 'Delivered', items: 'Gadget Bag 2400 · LP-E6NH × 2', total: 22970 },
];

const navItems = [
  ['Orders', true], ['Wishlist', false], ['Addresses', false], ['Payments', false],
  ['Loyalty · Silver', false], ['Service requests', false], ['Profile', false], ['Sign out', false],
] as const;

export default function AccountPage() {
  return (
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <Nav cartCount={2} />
      <section style={{ padding: '48px 64px 32px' }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>My account</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 56, letterSpacing: '-0.03em' }}>Hello, Aditi.</h1>
            <p className="muted" style={{ fontSize: 15, marginTop: 10 }}>Member since 2019 · PnP Silver · 2,340 points</p>
          </div>
          <button className="btn btn-ghost">Sign out</button>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 48, padding: '0 64px 96px' }}>
        <aside>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, borderTop: '1px solid var(--ink)', paddingTop: 16 }}>
            {navItems.map(([l, a]) => (
              <button key={l} style={{
                textAlign: 'left', padding: '12px 14px', borderRadius: 'var(--r-md)',
                background: a ? 'var(--paper-2)' : 'transparent',
                fontSize: 13, fontWeight: a ? 500 : 400,
                color: a ? 'var(--ink)' : 'var(--ink-2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>{l} {a && Icons.chevR}</button>
            ))}
          </nav>
        </aside>

        <div>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
            {[
              { k: 'Lifetime spend', v: '₹8,42,970', s: '12 orders' },
              { k: 'Loyalty points', v: '2,340', s: '₹2,340 off your next order' },
              { k: 'Next tier', v: 'Gold', s: '₹1,57,030 to go' },
            ].map((s, i) => (
              <div key={i} style={{ padding: 24, border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>{s.k}</div>
                <div style={{ fontSize: 28, fontFamily: 'var(--serif)', marginBottom: 4 }}>{s.v}</div>
                <div className="muted" style={{ fontSize: 12 }}>{s.s}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
            <h2 style={{ fontSize: 28 }}>Recent orders</h2>
            <a style={{ fontSize: 12, borderBottom: '1px solid var(--ink)', paddingBottom: 2, cursor: 'pointer' }}>View all →</a>
          </div>

          <div style={{ borderTop: '1px solid var(--ink)' }}>
            {orders.map(o => (
              <div key={o.id} style={{
                padding: '24px 0', borderBottom: '1px solid var(--line)',
                display: 'grid', gridTemplateColumns: '80px 1fr 180px auto', gap: 24, alignItems: 'center',
              }}>
                <div style={{ width: 64, height: 64, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CameraArt tone="dark" variant="body" />
                </div>
                <div>
                  <div className="mono muted" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{o.id} · {o.date}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{o.items}</div>
                </div>
                <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ok)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--ok)' }} />
                  {o.status}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontFamily: 'var(--serif)', marginBottom: 6 }}>{formatINR(o.total)}</div>
                  <button style={{ fontSize: 11, borderBottom: '1px solid var(--ink)', paddingBottom: 1 }}>View details →</button>
                </div>
              </div>
            ))}
          </div>

          {/* Loyalty panel */}
          <div style={{ marginTop: 48, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: 12, textTransform: 'uppercase' }}>PnP Loyalty · Silver</div>
              <h3 style={{ fontSize: 32, color: 'var(--paper)', marginBottom: 10 }}>Almost Gold.</h3>
              <p style={{ opacity: 0.7, fontSize: 14, lineHeight: 1.55, marginBottom: 20 }}>
                Spend ₹1,57,030 more this year to unlock free sensor cleaning, a 10% lens rental discount, and invites to curated workshops.
              </p>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '62%', background: 'var(--accent)' }} />
              </div>
              <div style={{ marginTop: 10, fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.1em', opacity: 0.6, textTransform: 'uppercase' }}>
                ₹8,42,970 / ₹10,00,000
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              {['Free sensor cleaning', '10% off rentals', 'Priority service queue', 'Invite-only workshops'].map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--accent)' }}>{Icons.check}</span>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
