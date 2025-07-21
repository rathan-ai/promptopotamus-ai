import { 
  createServerClient as createSupabaseServerClient, // Renamed the import here
  type CookieOptions 
} from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerClient() {
  const cookieStore = cookies();
  
  // Now we call the renamed import, resolving the conflict
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}