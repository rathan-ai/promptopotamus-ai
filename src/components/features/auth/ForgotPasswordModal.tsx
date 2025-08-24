'use client';

import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { FormModal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { isValidEmail } from '@/lib/utils/validation';
import toast from 'react-hot-toast';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
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
        setError(data.error || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSuccess(false);
    setError('');
    onClose();
  };

  if (success) {
    return (
      <FormModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={(e) => e.preventDefault()}
        title="Check Your Email"
        size="sm"
        submitText="Got it, thanks!"
        cancelText=""
        loading={false}
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          </div>
          
          <p className="text-gray-600 dark:text-gray-400">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 text-left">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
              Next steps:
            </p>
            <ul className="text-sm text-slate-700 dark:text-blue-300 space-y-1">
              <li>• Check your email inbox</li>
              <li>• Click the reset link in the email</li>
              <li>• Create a new password</li>
              <li>• Sign back in to your account</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 <strong>Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
          </p>
        </div>
      </FormModal>
    );
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Reset Password"
      description="No worries! We'll send you reset instructions."
      submitText="Send Reset Link"
      loading={loading}
      size="sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            Forgot your password?
          </h3>
        </div>
      </div>

      <Input
        type="email"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        disabled={loading}
        error={error}
        required
        autoFocus
      />
    </FormModal>
  );
}