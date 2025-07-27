'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Extract tokens from URL
  const accessToken = searchParams?.get('access_token');
  const refreshToken = searchParams?.get('refresh_token');
  const error = searchParams?.get('error');
  const errorDescription = searchParams?.get('error_description');

  useEffect(() => {
    if (error) {
      toast.error(errorDescription || 'Invalid reset link');
      router.push('/login');
    }
  }, [error, errorDescription, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!accessToken || !refreshToken) {
      toast.error('Invalid or expired reset link');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password.trim(),
          access_token: accessToken,
          refresh_token: refreshToken
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        toast.success('Password updated successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?message=password_reset_success');
        }, 3000);
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  if (!accessToken || !refreshToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Invalid Reset Link
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button onClick={() => router.push('/login')} className="w-full">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        {!success ? (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                Set New Password
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Choose a strong password for your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="w-full px-3 py-2 pr-10 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:text-white"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            level <= passwordStrength 
                              ? strengthColors[passwordStrength - 1] 
                              : 'bg-neutral-200 dark:bg-neutral-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full px-3 py-2 pr-10 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:text-white"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                  Password Requirements:
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li className={password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>
                    • At least 8 characters long
                  </li>
                  <li className={/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
                    • Contains uppercase letter
                  </li>
                  <li className={/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
                    • Contains lowercase letter
                  </li>
                  <li className={/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
                    • Contains number
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={loading || password !== confirmPassword || password.length < 8}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Updating Password...
                  </div>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Password Updated!
            </h1>
            
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 mb-6">
              <p className="text-sm text-green-800 dark:text-green-200">
                🎉 You'll be redirected to the login page in a few seconds...
              </p>
            </div>

            <Button onClick={() => router.push('/login')} className="w-full">
              Sign In Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}