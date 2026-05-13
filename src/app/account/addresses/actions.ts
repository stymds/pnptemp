'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(80),
  phone: z.string().min(7, 'Phone is required').max(20),
  line1: z.string().min(2, 'Address line 1 is required').max(120),
  line2: z.string().max(120).optional().or(z.literal('').transform(() => undefined)),
  city: z.string().min(2, 'City is required').max(60),
  state: z.string().min(2, 'State is required').max(60),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a 6-digit Indian PIN'),
  country: z.string().default('IN'),
  type: z.enum(['SHIPPING', 'BILLING']).default('SHIPPING'),
  isDefault: z.boolean().default(false),
});

export type AddressFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

function readForm(formData: FormData) {
  return {
    fullName: String(formData.get('fullName') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    line1: String(formData.get('line1') ?? ''),
    line2: String(formData.get('line2') ?? ''),
    city: String(formData.get('city') ?? ''),
    state: String(formData.get('state') ?? ''),
    pincode: String(formData.get('pincode') ?? ''),
    country: 'IN',
    type: (String(formData.get('type') ?? 'SHIPPING') as 'SHIPPING' | 'BILLING'),
    isDefault: formData.get('isDefault') === 'on' || formData.get('isDefault') === 'true',
  };
}

function revalidate() {
  revalidatePath('/account/addresses');
  revalidatePath('/checkout');
}

export async function createAddressAction(
  _prev: AddressFormState,
  formData: FormData,
): Promise<AddressFormState> {
  try {
    const user = await requireUser();
    const parsed = addressSchema.parse(readForm(formData));

    if (parsed.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, type: parsed.type },
        data: { isDefault: false },
      });
    }
    // If this is the user's first address of this type, make it default automatically.
    const existingCount = await prisma.address.count({
      where: { userId: user.id, type: parsed.type },
    });

    await prisma.address.create({
      data: {
        ...parsed,
        userId: user.id,
        isDefault: parsed.isDefault || existingCount === 0,
      },
    });

    revalidate();
    return { ok: true };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { ok: false, error: e.issues[0]?.message ?? 'Validation failed' };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save address' };
  }
}

export async function deleteAddressAction(addressId: string) {
  const user = await requireUser();
  // Prevent cross-user deletion.
  await prisma.address.deleteMany({ where: { id: addressId, userId: user.id } });
  revalidate();
}

export async function setDefaultAddressAction(addressId: string) {
  const user = await requireUser();
  const target = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
  });
  if (!target) return;

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: user.id, type: target.type },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    }),
  ]);
  revalidate();
}
