'use client';

import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import { triggerWelcomeEmail } from '@/lib/email-triggers';

export function LoginPageClient() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    // Check for success message from password reset
    const message = searchParams?.get('message');
    if (message === 'password_reset_success') {
      toast.success('Password updated successfully! Please sign in with your new password.');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        toast.success('Logged in successfully!');
        router.push('/dashboard');
        router.refresh();
      }
      
      if (event === 'SIGNED_UP' && session?.user) {
        // Trigger welcome email for new registrations
        try {
          const userName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'New User';
          toast.success('Welcome to Promptopotamus! Check your email for getting started tips.');
          
          // Note: In a real implementation, this would be called from a server-side hook
          console.log('New user registered:', session.user.id, userName);
        } catch (error) {
          console.error('Error handling new user registration:', error);
        }
        
        router.push('/dashboard');
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, searchParams]);
  
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
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Forgot your password?
          </button>
        </div>
      </div>

      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}