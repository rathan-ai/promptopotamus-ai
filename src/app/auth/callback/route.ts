import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { triggerWelcomeEmail } from '@/lib/email-triggers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if this is a new user (created within the last 5 minutes)
      const userCreatedAt = new Date(data.user.created_at);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const isNewUser = userCreatedAt > fiveMinutesAgo;

      if (isNewUser) {
        // Trigger welcome email for new users (fire and forget)
        const userName = data.user.user_metadata?.full_name ||
                        data.user.user_metadata?.name ||
                        data.user.email?.split('@')[0] ||
                        'there';

        triggerWelcomeEmail(data.user.id, userName).catch(() => {
          // Silently fail - don't block auth flow for email issues
        });
      }

      return NextResponse.redirect(origin);
    }
  }

  // Redirect to an error page if something goes wrong
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}