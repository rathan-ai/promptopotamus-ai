'use client';

import React from 'react';
import { Coins } from 'lucide-react';

interface PromptCoinDisplayProps {
  amount: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSymbol?: boolean;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'muted';
}

const sizeClasses = {
  xs: {
    text: 'text-xs',
    icon: 'w-3 h-3',
    gap: 'gap-1'
  },
  sm: {
    text: 'text-sm',
    icon: 'w-4 h-4',
    gap: 'gap-1'
  },
  md: {
    text: 'text-base',
    icon: 'w-4 h-4',
    gap: 'gap-1.5'
  },
  lg: {
    text: 'text-lg',
    icon: 'w-5 h-5',
    gap: 'gap-2'
  },
  xl: {
    text: 'text-xl',
    icon: 'w-6 h-6',
    gap: 'gap-2'
  }
};

const variantClasses = {
  default: 'text-amber-600 dark:text-amber-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-orange-600 dark:text-orange-400',
  muted: 'text-neutral-500 dark:text-neutral-400'
};

export function PromptCoinDisplay({
  amount,
  size = 'md',
  className = '',
  showSymbol = true,
  showLabel = false,
  variant = 'default'
}: PromptCoinDisplayProps) {
  const sizeStyle = sizeClasses[size];
  const variantStyle = variantClasses[variant];
  
  // Format amount with commas for large numbers
  const formattedAmount = amount.toLocaleString();

  return (
    <span className={`inline-flex items-center font-medium ${sizeStyle.gap} ${variantStyle} ${className}`}>
      {showSymbol && (
        <Coins className={`${sizeStyle.icon} fill-current`} />
      )}
      <span className={sizeStyle.text}>
        {formattedAmount}
        {showLabel && (
          <span className="ml-1">
            {amount === 1 ? 'PromptCoin' : 'PromptCoins'}
          </span>
        )}
      </span>
    </span>
  );
}

// Convenience components for common use cases
export function PromptCoinPrice({ amount, className }: { amount: number; className?: string }) {
  return (
    <PromptCoinDisplay 
      amount={amount} 
      size="lg" 
      variant="default"
      className={`font-bold ${className}`}
    />
  );
}

export function PromptCoinBalance({ amount, className }: { amount: number; className?: string }) {
  return (
    <PromptCoinDisplay 
      amount={amount} 
      size="md" 
      variant="success"
      showLabel
      className={className}
    />
  );
}

export function PromptCoinCost({ amount, className }: { amount: number; className?: string }) {
  return (
    <PromptCoinDisplay 
      amount={amount} 
      size="sm" 
      variant="muted"
      className={className}
    />
  );
}

export default PromptCoinDisplay;