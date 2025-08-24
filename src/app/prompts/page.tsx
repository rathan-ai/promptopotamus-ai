'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PromptsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to smart-prompts page
    router.push('/smart-prompts');
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="spinner"></div>
    </div>
  );
}