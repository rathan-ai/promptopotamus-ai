'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Metadata } from 'next';
import { Coins, Check, ArrowLeft, Shield, Clock, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import PayPalPaymentModal from '@/components/PayPalPaymentModal';
import toast from 'react-hot-toast';

const packages = [
  {
    id: 'starter',
    name: 'Starter Pack',
    description: 'Perfect for getting started with AI prompting',
    price: 5,
    promptCoins: '500 PC',
    features: [
      '33 prompt enhancements (15 PC each)',
      '50 prompt analyses (10 PC each)',
      '10 exam attempts (50 PC each)',
      '100 export operations (5 PC each)',
      'Smart Recipe purchases',
      'All prompt templates',
      'Priority email support',
      'No expiration on credits'
    ],
    popular: false,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    description: 'Ideal for professionals and active users',
    price: 20,
    promptCoins: '2,000 PC',
    features: [
      '133 prompt enhancements (15 PC each)',
      '200 prompt analyses (10 PC each)',
      '40 exam attempts (50 PC each)',
      '400 export operations (5 PC each)',
      'Smart Recipe purchases',
      'All prompt templates',
      'Priority support',
      'No expiration on credits'
    ],
    popular: true,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    description: 'Perfect for power users and teams',
    price: 50,
    promptCoins: '5,000 PC',
    features: [
      '333 prompt enhancements (15 PC each)',
      '500 prompt analyses (10 PC each)',
      '100 exam attempts (50 PC each)',
      '1,000 export operations (5 PC each)',
      'Smart Recipe purchases',
      'All prompt templates',
      'Priority support',
      'No expiration on credits'
    ],
    popular: false,
    color: 'from-orange-500 to-red-500',
    bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
  }
];

function PurchaseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get package from URL params
    const packageParam = searchParams.get('package');
    if (packageParam && packages.find(p => p.id === packageParam)) {
      setSelectedPackage(packageParam);
    } else {
      // Default to pro package
      setSelectedPackage('pro');
    }

    // Get user info
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [searchParams]);

  const selectedPkg = packages.find(p => p.id === selectedPackage);

  const handlePurchase = async () => {
    if (!selectedPkg || !user) {
      toast.error('Please select a package and make sure you are logged in');
      return;
    }

    setIsProcessing(true);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (transactionId?: string) => {
    if (!selectedPkg || !user) return;

    try {
      // Call the PromptCoin purchase API
      const response = await fetch('/api/purchase/promptcoins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPkg.id,
          paymentProvider: 'paypal',
          transactionId: transactionId || `pc_${Date.now()}`,
          amount: selectedPkg.price
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`🎉 Successfully purchased ${selectedPkg.promptCoins}!`);
        // Redirect to success page
        router.push(`/purchase/success?package=${selectedPkg.id}`);
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
                      <h3 className="text-lg font-semibold dark:text-white">{pkg.name}</h3>
                      {pkg.popular && (
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{pkg.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">${pkg.price}</div>
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
        </div>

        {/* Order Summary */}
        <div>
          <div className="sticky top-6">
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
              <h3 className="text-xl font-bold dark:text-white mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium dark:text-white">{selectedPkg.name}</span>
                  <span className="font-bold dark:text-white">${selectedPkg.price}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <span>PromptCoins</span>
                  <span>{selectedPkg.promptCoins}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <span>Conversion Rate</span>
                  <span>100 PC = $1</span>
                </div>
                
                <hr className="border-neutral-200 dark:border-neutral-700" />
                
                <div className="flex justify-between items-center font-bold text-lg">
                  <span className="dark:text-white">Total</span>
                  <span className="text-green-600 dark:text-green-400">${selectedPkg.price}</span>
                </div>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={isProcessing || !user}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                size="lg"
              >
                {isProcessing ? (
                  'Processing...'
                ) : !user ? (
                  'Please Login First'
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Purchase with PayPal
                  </>
                )}
              </Button>
              
              {!user && (
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
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PayPal Payment Modal */}
      {showPaymentModal && selectedPkg && (
        <PayPalPaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          onSuccess={handlePaymentSuccess}
          amount={selectedPkg.price}
          description={`PromptCoin ${selectedPkg.name}`}
          itemName={`${selectedPkg.promptCoins} PromptCoins`}
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