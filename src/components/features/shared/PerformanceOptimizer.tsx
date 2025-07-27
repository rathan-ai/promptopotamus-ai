'use client';

import { useEffect } from 'react';
import { 
  initializePerformanceOptimizations,
  initializePerformanceMonitoring,
  trackBundleMetrics 
} from '@/lib/performance';

/**
 * Performance optimization component that runs on app initialization
 */
export default function PerformanceOptimizer() {
  useEffect(() => {
    // Initialize performance optimizations after component mount
    initializePerformanceOptimizations();
    
    // Start performance monitoring
    initializePerformanceMonitoring();
    trackBundleMetrics();
    
    // Generate performance report in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        import('@/lib/performance').then(({ generatePerformanceReport }) => {
          generatePerformanceReport();
        });
      }, 3000);
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}