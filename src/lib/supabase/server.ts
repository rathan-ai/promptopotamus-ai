import { 
  createServerClient as createSupabaseServerClient, // Renamed the import here
  type CookieOptions 
} from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getRequiredEnv } from '@/lib/env-validation';

export async function createServerClient() {
  const cookieStore = await cookies();
  
  // Now we call the renamed import, resolving the conflict
  return createSupabaseServerClient(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This can be ignored if you have middleware refreshing user sessions.

          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // This can be ignored if you have middleware refreshing user sessions.

          }
        },
      },
    }
  );
}