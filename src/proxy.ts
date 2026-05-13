import { NextRequest } from 'next/server';
import { refreshSupabaseSession } from '@/lib/supabase/proxy-helper';

export async function proxy(request: NextRequest) {
  return refreshSupabaseSession(request);
}

export const config = {
  matcher: [
    // Skip static assets and webhook endpoints (those carry their own signature, not a session cookie).
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
