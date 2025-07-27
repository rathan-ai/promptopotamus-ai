'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Coins, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { PromptCoinDisplay, PromptCoinPrice, PromptCoinBalance } from '@/components/ui/PromptCoinDisplay';
import { promptCoinsToUsd } from '@/lib/promptcoin-utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface PromptCoinPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promptId: number;
  amount: number; // PromptCoin amount
  promptTitle: string;
  sellerName: string;
}

interface UserBalance {
  total: number;
  analysis: number;
  enhancement: number;
  exam: number;
  export: number;
}

export default function PromptCoinPurchaseModal({
  isOpen,
  onClose,
  onSuccess,
  promptId,
  amount,
  promptTitle,
  sellerName
}: PromptCoinPurchaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const fetchUserBalance = async () => {
    try {
      setBalanceLoading(true);
      const response = await fetch('/api/user/balance');
      if (response.ok) {
        const data = await response.json();
        setUserBalance({
          total: data.total || 0,
          analysis: data.credits_analysis || 0,
          enhancement: data.credits_enhancement || 0,
          exam: data.credits_exam || 0,
          export: data.credits_export || 0
        });
      } else {
        setError('Failed to load balance');
      }
    } catch (err) {
      setError('Failed to load balance');
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserBalance();
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    setError(null);
  };

  const handlePurchase = async () => {
    if (!userBalance || userBalance.total < amount) {
      setError('Insufficient PromptCoins');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/smart-prompts/purchase-with-pc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          promptId,
          amount
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('🎉 Smart Prompt purchased successfully!');
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Purchase failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const hasInsufficientFunds = userBalance && userBalance.total < amount;
  const shortage = hasInsufficientFunds ? amount - userBalance.total : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold dark:text-white">Purchase Smart Prompt</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Purchase Summary */}
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-600 mb-6">
            <h3 className="font-semibold text-lg mb-2 dark:text-white">Purchase Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Smart Prompt:</span>
                <span className="font-medium dark:text-white">{promptTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Creator:</span>
                <span className="font-medium dark:text-white">{sellerName}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-600 pt-2 mt-2">
                <span className="font-semibold dark:text-white">Total:</span>
                <PromptCoinPrice amount={amount} />
              </div>
            </div>
          </div>

          {/* Balance Display */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50 mb-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center">
              <Coins className="w-4 h-4 mr-2" />
              Your PromptCoin Balance
            </h3>
            {balanceLoading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-blue-200 dark:bg-blue-800 rounded w-20"></div>
              </div>
            ) : userBalance ? (
              <PromptCoinBalance amount={userBalance.total} className="text-lg" />
            ) : (
              <span className="text-blue-700 dark:text-blue-300">Failed to load</span>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Insufficient Funds Warning */}
          {hasInsufficientFunds && (
            <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-orange-700 dark:text-orange-400 font-medium mb-2">
                    Insufficient PromptCoins
                  </p>
                  <p className="text-orange-600 dark:text-orange-300 text-sm mb-3">
                    You need <PromptCoinDisplay amount={shortage} size="sm" className="font-medium" /> more to purchase this prompt.
                  </p>
                  <Link href="/pricing">
                    <Button size="sm" variant="outline" className="text-orange-700 border-orange-300 hover:bg-orange-100">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Buy PromptCoins
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Purchase Button */}
          <div className="space-y-3">
            <Button
              onClick={handlePurchase}
              disabled={loading || balanceLoading || hasInsufficientFunds}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </div>
              ) : hasInsufficientFunds ? (
                'Insufficient PromptCoins'
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Purchase for <PromptCoinDisplay amount={amount} size="sm" className="ml-1" showSymbol={false} />
                </div>
              )}
            </Button>

            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>

          {/* Info */}
          <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 text-center">
            <div className="flex items-center justify-center">
              <Coins className="w-3 h-3 mr-1" />
              PromptCoins will be deducted from your balance instantly
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}