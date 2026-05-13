import { SiteNav } from '@/components/nav';
import { getCartItemCount } from '@/lib/cart';
import { getCurrentUser } from '@/lib/auth';

export async function NavWithCount({ compact = false }: { compact?: boolean }) {
  const [count, user] = await Promise.all([getCartItemCount(), getCurrentUser()]);
  return <SiteNav cartCount={count} compact={compact} isLoggedIn={!!user} />;
}
