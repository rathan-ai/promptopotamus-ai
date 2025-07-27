'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSkeleton } from '@/components/ui/Loading';

// Lazy load the login component to reduce initial bundle size
const LoginPageClient = dynamic(() => import('@/components/features/auth/LoginPageClient').then(mod => ({ default: mod.LoginPageClient })), {
  loading: () => <LoadingSkeleton lines={8} />,
  ssr: false
});

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSkeleton lines={8} />}>
      <LoginPageClient />
    </Suspense>
  );
}