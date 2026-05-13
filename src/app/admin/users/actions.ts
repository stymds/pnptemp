'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function toggleUserRoleAction(targetUserId: string) {
  const me = await requireAdmin();
  if (me.id === targetUserId) {
    throw new Error("You can't change your own role.");
  }
  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) throw new Error('User not found');

  const next = target.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
  await prisma.user.update({ where: { id: targetUserId }, data: { role: next } });
  revalidatePath('/admin/users');
}
