import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { mergeGuestCartIntoUser } from '@/lib/cart';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/account';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  if (data.user) {
    try {
      await mergeGuestCartIntoUser(data.user.id);
    } catch (e) {
      // non-fatal: log and continue. User can still proceed; guest items just won't merge.
      console.error('mergeGuestCartIntoUser failed', e);
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
