'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Metadata } from 'next';
import { Coins, Check, ArrowLeft, Shield, Clock, CreditCard, Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import PayPalPaymentModal from '@/components/features/payments/PayPalPaymentModal';
import toast from 'react-hot-toast';
import { PROMPTCOIN_PACKAGES } from '@/features/payments/constants';
import { createClient } from '@/lib/supabase/client';

const packages = PROMPTCOIN_PACKAGES;


function PurchaseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    // Get package from URL params
    const packageParam = searchParams.get('package');
    if (packageParam && packages.find(p => p.id === packageParam)) {
      setSelectedPackage(packageParam);
    } else {
      // Default to free package
      setSelectedPackage('free');
    }

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
  }, [searchParams, supabase.auth]);

  const selectedPkg = packages.find(p => p.id === selectedPackage);
  
  // Create dynamic package for custom amount
  const effectivePkg = selectedPkg?.id === 'custom' && customAmount ? {
    ...selectedPkg,
    price: parseFloat(customAmount) || 0,
    promptCoins: `${Math.round((parseFloat(customAmount) || 0) * 100)} PC`
  } : selectedPkg;

  const handlePurchase = async () => {
    if (!effectivePkg) {
      toast.error('Please select a package');
      return;
    }

    // Handle free option
    if (effectivePkg.id === 'free') {
      toast.success('Continue using Promptopotamus with daily free limits!');
      router.push('/dashboard');
      return;
    }

    // For custom amount, validate input
    if (effectivePkg.id === 'custom') {
      if (!customAmount || parseFloat(customAmount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      if (parseFloat(customAmount) > 1000) {
        toast.error('Maximum amount is $1000');
        return;
      }
    }

    // For paid options, require user to be logged in
    if (!user) {
      toast.error('Please log in to purchase PromptCoins');
      router.push('/login');
      return;
    }

    setIsProcessing(true);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (transactionId?: string) => {
    if (!effectivePkg || !user) return;

    try {
      // Call the PromptCoin purchase API
      const response = await fetch('/api/purchase/promptcoins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: effectivePkg.id,
          paymentProvider: 'paypal',
          transactionId: transactionId || `pc_${Date.now()}`,
          amount: effectivePkg.price
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`🎉 Successfully purchased ${effectivePkg.promptCoins}!`);
        // Redirect to success page
        router.push(`/purchase/success?package=${effectivePkg.id}&amount=${effectivePkg.price}`);
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

  if (!selectedPkg) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Link href="/pricing" className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pricing
        </Link>
        
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Coins className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-display gradient-text mb-4">
          Complete Your Purchase
        </h1>
        <p className="text-body-large text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Get instant access to PromptCoins that never expire
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Package Selection */}
        <div>
          <h2 className="text-2xl font-bold dark:text-white mb-6">Choose Your Package</h2>
          
          <div className="space-y-4 mb-8">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                  selectedPackage === pkg.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold dark:text-white">
                        {pkg.id === 'custom' && <Coins className="w-5 h-5 text-purple-500 inline mr-2" />}
                        {pkg.name}
                      </h3>
                      {pkg.popular && (
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </span>
                      )}
                      {pkg.id === 'free' && (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                          Free
                        </span>
                      )}
                      {pkg.id === 'custom' && (
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{pkg.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {pkg.price === 0 ? 'Free' : `$${pkg.price}`}
                    </div>
                    <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{pkg.promptCoins}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {pkg.features.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          {selectedPackage === 'custom' && (
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
              <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                Enter Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0.01"
                  max="1000"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-purple-900/30 dark:text-white"
                />
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                You'll receive {customAmount ? Math.round(parseFloat(customAmount) * 100) : 0} PromptCoins (100 PC = $1)
              </p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="sticky top-6">
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
              <h3 className="text-xl font-bold dark:text-white mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium dark:text-white">{effectivePkg?.name}</span>
                  <span className="font-bold dark:text-white">
                    {effectivePkg?.price === 0 ? 'Free' : `$${effectivePkg?.price}`}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <span>PromptCoins</span>
                  <span>{effectivePkg?.promptCoins}</span>
                </div>
                
                {effectivePkg?.price && effectivePkg.price > 0 && (
                  <div className="flex justify-between items-center text-sm text-neutral-600 dark:text-neutral-400">
                    <span>Conversion Rate</span>
                    <span>100 PC = $1</span>
                  </div>
                )}
                
                <hr className="border-neutral-200 dark:border-neutral-700" />
                
                <div className="flex justify-between items-center font-bold text-lg">
                  <span className="dark:text-white">Total</span>
                  <span className="text-green-600 dark:text-green-400">
                    {effectivePkg?.price === 0 ? 'Free' : `$${effectivePkg?.price}`}
                  </span>
                </div>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={isProcessing || (effectivePkg?.price && effectivePkg.price > 0 && !user)}
                className={`w-full ${
                  effectivePkg?.id === 'free' 
                    ? 'bg-green-600 hover:bg-green-700'
                    : effectivePkg?.id === 'custom'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                }`}
                size="lg"
              >
                {isProcessing ? (
                  'Processing...'
                ) : effectivePkg?.id === 'free' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Continue Free
                  </>
                ) : effectivePkg?.id === 'custom' ? (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    {customAmount ? `Purchase $${customAmount}` : 'Enter Amount'}
                  </>
                ) : effectivePkg?.price && effectivePkg.price > 0 && !user ? (
                  'Please Login First'
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Purchase with PayPal
                  </>
                )}
              </Button>
              
              {effectivePkg?.price && effectivePkg.price > 0 && !user && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mt-3">
                  <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Login
                  </Link> to complete your purchase
                </p>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure payment processing</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                <Clock className="w-4 h-4 text-green-500" />
                <span>PromptCoins never expire</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                <Check className="w-4 h-4 text-green-500" />
                <span>Instant PromptCoin delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PayPal Payment Modal */}
      {showPaymentModal && effectivePkg && (
        <PayPalPaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          onSuccess={handlePaymentSuccess}
          amount={effectivePkg.price}
          description={`PromptCoin ${effectivePkg.name}`}
          itemName={`${effectivePkg.promptCoins} PromptCoins`}
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