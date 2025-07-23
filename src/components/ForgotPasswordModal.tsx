'use client';

import { useState } from 'react';
import { Mail, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        toast.success('Password reset link sent!');
      } else {
        toast.error(data.error || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSuccess(false);
    onClose();
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Reset Password
          </h2>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!success ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">
                    Forgot your password?
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    No worries! We'll send you reset instructions.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:text-white"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>

              <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-md">
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  💡 <strong>Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                Check Your Email
              </h3>
              
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-blue-800 dark:text-blue-200 font-medium">Next steps:</p>
                    <ul className="text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                      <li>• Check your email inbox</li>
                      <li>• Click the reset link in the email</li>
                      <li>• Create a new password</li>
                      <li>• Sign back in to your account</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleClose}
                className="w-full"
              >
                Got it, thanks!
              </Button>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}