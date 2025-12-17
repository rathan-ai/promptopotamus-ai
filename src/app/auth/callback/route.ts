import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  // Debug logging (will show in Vercel logs)
  console.log('[Auth Callback] Starting callback handler');
  console.log('[Auth Callback] Code present:', !!code);
  console.log('[Auth Callback] Origin:', origin);
  console.log('[Auth Callback] Next redirect:', next);

  if (code) {
    const cookieStore = await cookies();

    // Create a response that we'll attach cookies to
    const response = NextResponse.redirect(new URL(next, origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // CRITICAL: Set cookies on the RESPONSE object, not cookieStore
            console.log('[Auth Callback] Setting cookie:', name);
            response.cookies.set({
              name,
              value,
              ...options,
              // Ensure secure cookies in production
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          },
          remove(name: string, options: CookieOptions) {
            console.log('[Auth Callback] Removing cookie:', name);
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('[Auth Callback] Exchange result:', {
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      userId: data?.user?.id,
      error: error?.message,
    });

    if (error) {
      console.error('[Auth Callback] Error exchanging code:', error.message);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, origin));
    }

    console.log('[Auth Callback] Success! Redirecting to:', next);
    console.log('[Auth Callback] Response cookies set:', response.cookies.getAll().map(c => c.name));

    return response;
  }

  console.error('[Auth Callback] No code provided');
  return NextResponse.redirect(new URL('/login?error=auth-code-error', origin));
}
