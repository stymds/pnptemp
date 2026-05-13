import 'server-only';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

/**
 * Returns the set of product slugs the current user has wishlisted.
 * Empty set for anonymous users.
 */
export async function getWishedSlugs(): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user) return new Set();
  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    select: { product: { select: { slug: true } } },
  });
  return new Set(items.map((i) => i.product.slug));
}
