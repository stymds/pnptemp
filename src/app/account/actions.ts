'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}

const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(80).or(z.literal('').transform(() => null)).nullable(),
  phone: z.string().trim().min(7).max(20).or(z.literal('').transform(() => null)).nullable(),
});

export type ProfileFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  try {
    const user = await requireUser();
    const parsed = profileSchema.parse({
      fullName: String(formData.get('fullName') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { fullName: parsed.fullName, phone: parsed.phone },
    });
    revalidatePath('/account');
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { ok: false, error: e.issues[0]?.message ?? 'Validation failed' };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save' };
  }
}
