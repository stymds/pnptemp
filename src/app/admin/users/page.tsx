import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { UserRoleButton } from './UserRoleButton';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const me = await requireAdmin();
  const { q = '' } = await searchParams;

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: 'insensitive' } },
            { fullName: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    take: 200,
    include: { _count: { select: { orders: true } } },
  });

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 6 }}>Users</h1>
        <p className="muted" style={{ fontSize: 13 }}>{users.length} {q ? 'match' : 'total'}</p>
      </div>

      <form action="/admin/users" method="get" style={{ marginBottom: 24 }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by email or name…"
          className="input"
          style={{ maxWidth: 320 }}
        />
      </form>

      <style>{`
        .admin-users-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid var(--line);
        }
        .admin-users-meta {
          display: flex; align-items: center; gap: 16px;
          flex-wrap: wrap; justify-content: flex-end;
        }
        @media (max-width: 768px) {
          .admin-users-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .admin-users-meta {
            justify-content: space-between;
            gap: 10px 14px;
          }
        }
      `}</style>
      {users.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--paper-2)', borderRadius: 'var(--r-md)' }}>
          <p className="muted" style={{ fontSize: 13 }}>No users found.</p>
        </div>
      ) : (
        <div style={{ borderTop: '1px solid var(--ink)' }}>
          {users.map((u) => {
            const isMe = u.id === me.id;
            return (
              <div key={u.id} className="admin-users-row">
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 15 }}>
                    {u.fullName ?? <span className="muted">(no name)</span>}
                  </div>
                  <div className="muted mono" style={{ fontSize: 11, letterSpacing: '0.05em', wordBreak: 'break-all' }}>
                    {u.email}
                  </div>
                </div>
                <div className="admin-users-meta">
                  <span style={{
                    fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: u.role === 'ADMIN' ? 'var(--accent)' : 'var(--ink-3)',
                  }}>
                    {u.role}
                  </span>
                  <span className="muted" style={{ fontSize: 12 }}>
                    {u._count.orders} order{u._count.orders === 1 ? '' : 's'}
                  </span>
                  <UserRoleButton userId={u.id} currentRole={u.role} isMe={isMe} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
