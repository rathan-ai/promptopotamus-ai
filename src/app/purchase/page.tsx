'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Metadata } from 'next';
import { Coins, Check, ArrowLeft, Shield, Clock, CreditCard, Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import PayPalPaymentModal from '@/components/features/payments/PayPalPaymentModal';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';


function PurchaseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    // Get user info using Supabase
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user) {
          setUser(user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [supabase.auth]);

  const parsedAmount = parseFloat(amount) || 0;
  const promptCoins = Math.round(parsedAmount * 100);

  const handlePurchase = async () => {
    // Validate amount
    if (!amount || parsedAmount < 1) {
      toast.error('Minimum purchase amount is $1');
      return;
    }
    
    if (parsedAmount > 1000) {
      toast.error('Maximum purchase amount is $1000');
      return;
    }

    // Require user to be logged in
    if (!user) {
      toast.error('Please log in to purchase PromptCoins');
      router.push('/login');
      return;
    }

    setIsProcessing(true);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (transactionId?: string) => {
    if (!amount || !user) return;

    try {
      // Call the PromptCoin purchase API
      const response = await fetch('/api/purchase/promptcoins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentProvider: 'paypal',
          transactionId: transactionId || `pc_${Date.now()}`,
          amount: parsedAmount
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`🎉 Successfully purchased ${promptCoins} PromptCoins!`);
        // Redirect to success page
        router.push(`/purchase/success?amount=${parsedAmount}&coins=${promptCoins}`);
      } else {
        toast.error(data.error || 'Purchase failed. Please contact support.');
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast.error('Purchase failed. Please contact support.');
    }
    
    setShowPaymentModal(false);
    setIsProcessing(false);
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setIsProcessing(false);
  };


  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Coins className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 dark:text-white">
          Purchase PromptCoins
        </h1>
        <p className="text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Enter any amount to get PromptCoins instantly
        </p>
      </div>

      {/* Simple Purchase Form */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-8">
        {/* Amount Input */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Enter Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl text-neutral-500">$</span>
            <input
              type="number"
              min="1"
              max="1000"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1.00"
              className="w-full pl-12 pr-4 py-4 text-2xl border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white font-mono"
            />
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Minimum: $1.00 • Maximum: $1,000.00
          </p>
        </div>

        {/* Conversion Display */}
        {amount && parsedAmount >= 1 && (
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  You'll receive: {promptCoins} PromptCoins
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Conversion rate: 100 PC = $1
                </p>
              </div>
              <Coins className="w-12 h-12 text-blue-600" />
            </div>
          </div>
        )}

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={isProcessing || !amount || parsedAmount < 1 || !user}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          size="lg"
        >
          {isProcessing ? (
            'Processing...'
          ) : !user ? (
            'Please Login First'
          ) : !amount || parsedAmount < 1 ? (
            'Enter Amount to Continue'
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Purchase ${amount} with PayPal
            </>
          )}
        </Button>
        
        {!user && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mt-4">
            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Login
            </Link> to complete your purchase
          </p>
        )}

        {/* Trust Indicators */}
        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Shield className="w-6 h-6 text-green-500 mb-2" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-6 h-6 text-green-500 mb-2" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">No Expiry</span>
            </div>
            <div className="flex flex-col items-center">
              <Check className="w-6 h-6 text-green-500 mb-2" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">Instant</span>
            </div>
          </div>
        </div>
      </div>

      {/* PayPal Payment Modal */}
      {showPaymentModal && amount && (
        <PayPalPaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          onSuccess={handlePaymentSuccess}
          amount={parsedAmount}
          description={`PromptCoins Purchase`}
          itemName={`${promptCoins} PromptCoins`}
        />
      )}
    </div>
  );
}

export default function PurchasePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PurchaseContent />
    </Suspense>
  );
}