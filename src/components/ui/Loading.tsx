/**
 * Simplified loading components for consistent loading states
 */

'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Primary loading spinner component
 */
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin text-gray-400',
        sizes[size],
        className
      )} 
    />
  );
}

/**
 * Loading state wrapper for conditional rendering
 */
export interface LoadingStateProps {
  loading: boolean;
  error?: string | null;
  children: ReactNode;
  loadingText?: string;
  className?: string;
}

export function LoadingState({
  loading,
  error,
  children,
  loadingText = 'Loading...',
  className
}: LoadingStateProps) {
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center space-y-2">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-500">{loadingText}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-slate-600 text-xl">⚠</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Something went wrong
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Skeleton loader for content placeholders
 */
export interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  height?: 'sm' | 'md' | 'lg';
}

export function LoadingSkeleton({ 
  className, 
  lines = 3, 
  height = 'md'
}: LoadingSkeletonProps) {
  const heights = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6'
  };

  return (
    <div className={cn('animate-pulse space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className={cn(
            'bg-gray-200 dark:bg-gray-700 rounded',
            heights[height],
            i === lines - 1 && 'w-3/4'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Re-export commonly used components with their original names for backward compatibility
 */
export { LoadingSpinner as Spinner };
export { LoadingState as State };

/**
 * Default export for convenience
 */
export default {
  Spinner: LoadingSpinner,
  State: LoadingState,
  Skeleton: LoadingSkeleton
};