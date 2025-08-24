'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PromptCoinsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to pricing page since PromptCoins have been removed
    router.push('/pricing');
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <p>Redirecting to pricing information...</p>
      </div>
    </div>
  );
}