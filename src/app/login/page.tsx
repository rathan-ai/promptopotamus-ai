import { Suspense } from 'react';
import { LoginPageClient } from '@/components/features/auth/LoginPageClient';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageClient />
    </Suspense>
  );
}