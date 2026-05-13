import { SiteNav } from '@/components/nav';
import { getCartItemCount } from '@/lib/cart';

export async function NavWithCount({ compact = false }: { compact?: boolean }) {
  const count = await getCartItemCount();
  return <SiteNav cartCount={count} compact={compact} />;
}
