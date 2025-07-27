'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error?: Error;
    resetError: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback) {
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: DefaultErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          We encountered an unexpected error. Please try refreshing the page or go back to the home page.
        </p>

        {isDevelopment && error && (
          <div className="mb-6 p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-left">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Error Details (Development):
            </h3>
            <pre className="text-xs text-neutral-700 dark:text-neutral-300 overflow-auto">
              {error.name}: {error.message}
              {error.stack && '\n\nStack Trace:\n' + error.stack}
            </pre>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={resetError}
            className="flex items-center gap-2"
            size="sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Convenience wrapper for page-level error boundaries
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to external error reporting service in production
        if (process.env.NODE_ENV === 'production') {
          // Add your error reporting service here (e.g., Sentry, LogRocket, etc.)
          console.error('Page Error:', error, errorInfo);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Convenience wrapper for component-level error boundaries
export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: React.ReactNode;
  componentName?: string;
}) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              {componentName ? `${componentName} Error` : 'Component Error'}
            </h3>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            This component failed to load. Please try refreshing the page.
          </p>
          <Button
            onClick={resetError}
            size="sm"
            variant="outline"
            className="text-red-700 dark:text-red-300 border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      )}
      onError={(error, errorInfo) => {
        console.error(`${componentName || 'Component'} Error:`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}