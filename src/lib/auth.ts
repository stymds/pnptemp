import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db';

export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email ?? `${user.id}@no-email.local`,
      phone: user.phone ?? null,
    },
  });
  return dbUser;
});

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) redirect('/login');
  return u;
}

export async function requireAdmin() {
  const u = await getCurrentUser();
  if (!u) redirect('/login');
  if (u.role !== 'ADMIN') redirect('/');
  return u;
}
