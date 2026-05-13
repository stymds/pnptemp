import Link from 'next/link';
import { Footer } from '@/components/footer';
import { NavWithCount } from '@/components/nav-with-count';
import { Icons } from '@/components/icons';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AddressForm } from './AddressForm';
import { AddressActions } from './AddressActions';

export default async function AddressesPage() {
  const user = await requireUser();
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <div style={{ width: '100%', background: 'var(--paper)' }}>
      <NavWithCount />

      <section className="pnp-px" style={{ paddingTop: 40, paddingBottom: 24 }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          <Link href="/account">My account</Link> / <span style={{ color: 'var(--ink)' }}>Addresses</span>
        </div>
        <h1 className="fluid-h1" style={{ letterSpacing: '-0.03em' }}>Addresses</h1>
        <p className="muted" style={{ fontSize: 15, marginTop: 10, maxWidth: 560 }}>
          Saved addresses for shipping and billing. The default address is used at checkout.
        </p>
      </section>

      <div className="split-2 pnp-px" style={{ paddingBottom: 96, gap: 64, alignItems: 'flex-start' }}>
        {/* Existing addresses */}
        <div>
          <h2 style={{ fontSize: 18, marginBottom: 16, borderTop: '1px solid var(--ink)', paddingTop: 16 }}>
            Saved ({addresses.length})
          </h2>

          {addresses.length === 0 ? (
            <div style={{
              padding: '32px 24px', textAlign: 'center',
              background: 'var(--paper-2)', borderRadius: 'var(--r-md)',
            }}>
              <p className="muted" style={{ fontSize: 13 }}>No addresses yet. Add one on the right.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {addresses.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: 18,
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-md)',
                    background: a.isDefault ? 'var(--paper-2)' : 'var(--paper)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
                      {a.type}
                      {a.isDefault && (
                        <span style={{ marginLeft: 10, color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {Icons.check} default
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18, marginBottom: 4 }}>{a.fullName}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ''}<br />
                    {a.city}, {a.state} {a.pincode}<br />
                    {a.country} · {a.phone}
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <AddressActions addressId={a.id} isDefault={a.isDefault} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add form */}
        <div>
          <h2 style={{ fontSize: 18, marginBottom: 16, borderTop: '1px solid var(--ink)', paddingTop: 16 }}>
            Add new
          </h2>
          <AddressForm />
        </div>
      </div>

      <Footer />
    </div>
  );
}
