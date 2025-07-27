/**
 * Standardized modal component for consistent modal behavior
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  className?: string;
  overlayClassName?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closable = true,
  className,
  overlayClassName
}: BaseModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closable]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        overlayClassName
      )}
      onClick={closable ? onClose : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className={cn(
          "relative w-full bg-white dark:bg-gray-900 rounded-lg shadow-xl",
          "max-h-[90vh] overflow-hidden flex flex-col",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {closable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Modal variants for common use cases
 */

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false
}: ConfirmModalProps) {
  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 text-white'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closable={!loading}
    >
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          {description}
        </p>
        
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            className={variantStyles[variant]}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  description?: string;
  children: ReactNode;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  size?: BaseModalProps['size'];
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  size = 'md'
}: FormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      closable={!loading}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Processing...' : submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}