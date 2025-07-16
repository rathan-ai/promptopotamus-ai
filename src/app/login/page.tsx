'use client';

import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        toast.success('Logged in successfully!');
        router.push('/');
        router.refresh(); // Refresh to ensure server components update
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);
  
  // Constructs the correct callback URL for both local and production environments
  const getURL = () => {
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ?? // Use site URL in production
      process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Vercel's automatic URL
      'http://localhost:3000/'; // Default to localhost
    
    url = url.includes('http') ? url : `https://${url}`;
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
    return `${url}auth/callback`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-neutral-800/50 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600 dark:text-indigo-400">Welcome to Promptopotamus</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#4f46e5',
                  brandAccent: '#4338ca',
                  brandButtonText: 'white',
                },
              },
            },
          }}
          theme="dark"
          providers={['google']}
          redirectTo={getURL()}
        />
      </div>
    </div>
  );
}