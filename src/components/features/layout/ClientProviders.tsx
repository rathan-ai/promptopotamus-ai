'use client';

import dynamic from 'next/dynamic';
import { Provider } from 'jotai';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';

// Lazy load non-critical client components
const Analytics = dynamic(
  () => import("@vercel/analytics/react").then(mod => ({ default: mod.Analytics })),
  { ssr: false }
);

const IssueReportWidget = dynamic(
  () => import("@/components/features/shared/IssueReportWidget"),
  { ssr: false }
);

const PerformanceOptimizer = dynamic(
  () => import("@/components/features/shared/PerformanceOptimizer"),
  { ssr: false }
);

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <Provider>
      <AuthProvider>
        <Toaster />
        {children}
        <IssueReportWidget />
        <PerformanceOptimizer />
        <Analytics />
      </AuthProvider>
    </Provider>
  );
}