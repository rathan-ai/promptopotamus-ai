/**
 * Standardized loading components for consistent loading states
 */

'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingDots({ size = 'md', className }: LoadingDotsProps) {
  const sizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-gray-400 rounded-full animate-pulse',
            sizes[size]
          )}
          style={{
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
}

export interface LoadingBarProps {
  progress?: number;
  className?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export function LoadingBar({ 
  progress, 
  className,
  color = 'blue' 
}: LoadingBarProps) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-600',
    yellow: 'bg-slate-500',
    red: 'bg-slate-500',
    purple: 'bg-slate-500'
  };

  return (
    <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2', className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300 ease-out',
          colors[color],
          !progress && 'animate-pulse'
        )}
        style={{ width: progress ? `${Math.min(progress, 100)}%` : '50%' }}
      />
    </div>
  );
}

export interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export function LoadingSkeleton({ 
  className, 
  lines = 3, 
  avatar = false 
}: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="flex items-start space-x-4">
        {avatar && (
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div 
              key={i}
              className={cn(
                'h-4 bg-gray-200 dark:bg-gray-700 rounded',
                i === lines - 1 && 'w-3/4'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn(
      'p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse',
      className
    )}>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        </div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export interface LoadingStateProps {
  loading: boolean;
  error?: string | null;
  children: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  className?: string;
}

export function LoadingState({
  loading,
  error,
  children,
  loadingComponent,
  errorComponent,
  className
}: LoadingStateProps) {
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        {loadingComponent || (
          <div className="text-center space-y-2">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        {errorComponent || (
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
        )}
      </div>
    );
  }

  return <>{children}</>;
}

export interface LoadingButtonProps {
  loading?: boolean;
  children: ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}

export function LoadingButton({
  loading = false,
  children,
  loadingText = 'Loading...',
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center space-x-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      <span>{loading ? loadingText : children}</span>
    </button>
  );
}

/**
 * Higher-order component for adding loading states
 */
export function withLoadingState<T extends object>(
  Component: React.ComponentType<T>,
  loadingProp: keyof T = 'loading' as keyof T
) {
  return function LoadingWrappedComponent(props: T) {
    const isLoading = props[loadingProp] as boolean;
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

/**
 * Loading overlay for existing content
 */
export interface LoadingOverlayProps {
  loading: boolean;
  children: ReactNode;
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  loading,
  children,
  message = 'Loading...',
  className
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center space-y-2">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}