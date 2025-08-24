/**
 * Standardized input components for consistent form behavior
 */

'use client';

import { forwardRef, ReactNode } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, BaseInputProps>(({
  label,
  description,
  error,
  success,
  leftIcon,
  rightIcon,
  containerClassName,
  className,
  disabled,
  ...props
}, ref) => {
  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {props.required && <span className="text-slate-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border rounded-md transition-colors",
            "bg-white dark:bg-gray-800",
            "border-gray-300 dark:border-gray-600",
            "text-gray-900 dark:text-white",
            "placeholder-gray-500 dark:placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error && "border-slate-500 focus:ring-slate-500",
            success && "border-emerald-600 focus:ring-emerald-600",
            disabled && "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900",
            className
          )}
          disabled={disabled}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
        
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
        
        {success && !error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600">
            <CheckCircle className="w-4 h-4" />
          </div>
        )}
      </div>
      
      {description && !error && !success && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-slate-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="text-sm text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {success}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export interface PasswordInputProps extends Omit<BaseInputProps, 'type'> {
  showStrength?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  showStrength = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };
  
  const passwordStrength = showStrength && props.value ? getPasswordStrength(String(props.value)) : 0;
  
  const strengthColors = ['bg-slate-500', 'bg-orange-500', 'bg-slate-500', 'bg-blue-500', 'bg-emerald-600'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div>
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        {...props}
      />
      
      {showStrength && props.value && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded",
                  i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Password strength: {strengthLabels[passwordStrength - 1] || 'None'}
          </p>
        </div>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  containerClassName?: string;
  resize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  description,
  error,
  success,
  containerClassName,
  className,
  disabled,
  resize = true,
  ...props
}, ref) => {
  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {props.required && <span className="text-slate-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border rounded-md transition-colors",
            "bg-white dark:bg-gray-800",
            "border-gray-300 dark:border-gray-600",
            "text-gray-900 dark:text-white",
            "placeholder-gray-500 dark:placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            error && "border-slate-500 focus:ring-slate-500",
            success && "border-emerald-600 focus:ring-emerald-600",
            disabled && "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900",
            !resize && "resize-none",
            className
          )}
          disabled={disabled}
          {...props}
        />
        
        {error && (
          <div className="absolute right-3 top-3 text-slate-500">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
        
        {success && !error && (
          <div className="absolute right-3 top-3 text-emerald-600">
            <CheckCircle className="w-4 h-4" />
          </div>
        )}
      </div>
      
      {description && !error && !success && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-slate-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="text-sm text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {success}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  containerClassName?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  description,
  error,
  success,
  containerClassName,
  className,
  disabled,
  options,
  placeholder,
  ...props
}, ref) => {
  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {props.required && <span className="text-slate-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border rounded-md transition-colors appearance-none",
            "bg-white dark:bg-gray-800",
            "border-gray-300 dark:border-gray-600",
            "text-gray-900 dark:text-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            error && "border-slate-500 focus:ring-slate-500",
            success && "border-emerald-600 focus:ring-emerald-600",
            disabled && "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900",
            className
          )}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {description && !error && !success && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-slate-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="text-sm text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {success}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';