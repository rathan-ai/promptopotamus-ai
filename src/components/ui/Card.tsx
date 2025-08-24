/**
 * Standardized card components for consistent layout
 */

'use client';

import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
  children,
  ...props
}, ref) => {
  const variants = {
    default: 'bg-white dark:bg-[#1E293B] shadow-sm',
    outline: 'border border-[#E5E7EB] dark:border-[#334155] bg-transparent',
    ghost: 'bg-[#F9FAFB] dark:bg-[#0F172A] border-0',
    elevated: 'bg-white dark:bg-[#1E293B] shadow-md border-0'
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg overflow-hidden transition-all duration-200',
        variants[variant],
        paddings[padding],
        hover && 'hover:shadow-md cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({
  className,
  title,
  description,
  action,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-start justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-[#334155]', className)}
      {...props}
    >
      <div className="space-y-1.5">
        {title && (
          <h3 className="text-lg font-semibold leading-none tracking-tight text-[#6B7280] dark:text-[#94A3B8]-900 dark:text-white">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]-600 dark:text-[#6B7280] dark:text-[#94A3B8]-400">
            {description}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="flex items-center space-x-2">
          {action}
        </div>
      )}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(({
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('p-6 pt-0', className)}
    {...props}
  />
));

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(({
  className,
  justify = 'start',
  ...props
}, ref) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center px-6 py-3 bg-[#F9FAFB] dark:bg-[#0F172A] border-t border-[#E5E7EB] dark:border-[#334155]',
        justifyClasses[justify],
        className
      )}
      {...props}
    />
  );
});

CardFooter.displayName = 'CardFooter';

/**
 * Specialized card variants for common use cases
 */

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: ReactNode;
  description?: string;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  description,
  className 
}: StatsCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B7280] dark:text-[#94A3B8]-600 dark:text-[#6B7280] dark:text-[#94A3B8]-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-[#6B7280] dark:text-[#94A3B8]-900 dark:text-white">
              {value}
            </p>
            {change && (
              <p className={cn(
                "text-xs",
                change.type === 'increase' ? "text-emerald-600" : "text-slate-600"
              )}>
                {change.type === 'increase' ? '↗' : '↘'} {Math.abs(change.value)}%
              </p>
            )}
            {description && (
              <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]-500 dark:text-[#6B7280] dark:text-[#94A3B8]-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {icon && (
            <div className="text-[#6B7280] dark:text-[#94A3B8]-400 dark:text-[#6B7280] dark:text-[#94A3B8]-500">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  features?: string[];
  action?: ReactNode;
  className?: string;
  popular?: boolean;
}

export function FeatureCard({
  title,
  description,
  icon,
  features,
  action,
  className,
  popular = false
}: FeatureCardProps) {
  return (
    <Card 
      className={cn(
        'relative',
        popular && 'ring-2 ring-blue-500',
        className
      )}
      variant={popular ? 'elevated' : 'default'}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Popular
          </span>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]-600 dark:text-[#6B7280] dark:text-[#94A3B8]-400">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>
      
      {features && (
        <CardContent>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      )}
      
      {action && (
        <CardFooter>
          {action}
        </CardFooter>
      )}
    </Card>
  );
}