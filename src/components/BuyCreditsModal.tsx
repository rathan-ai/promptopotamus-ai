'use client';

import { useState } from 'react';
import { X, Coins, Zap, Check, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { track } from '@vercel/analytics';
import UniversalPaymentModal from './UniversalPaymentModal';
import toast from 'react-hot-toast';

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'analysis' | 'enhancement' | 'exam' | 'export';
  source?: string;
}

const promptCoinPackages = {
  analysis: [
    {
      id: 'pc_starter',
      name: 'Starter Pack',
      credits: 50, // 5 analyses at 10 PC each
      price: 4.99,
      popular: false,
      description: 'Perfect for trying out analysis features',
      pcPerAction: 10
    },
    {
      id: 'pc_creator',
      name: 'Creator Pack',
      credits: 150, // 15 analyses at 10 PC each
      price: 12.99,
      popular: true,
      description: 'Best value for regular users',
      savings: '13% off',
      pcPerAction: 10
    },
    {
      id: 'pc_pro',
      name: 'Pro Pack',
      credits: 500, // 50 analyses at 10 PC each
      price: 29.99,
      popular: false,
      description: 'Perfect for teams and power users',
      savings: '40% off',
      pcPerAction: 10
    }
  ],
  enhancement: [
    {
      id: 'pc_starter_enh',
      name: 'Starter Pack',
      credits: 45, // 3 enhancements at 15 PC each
      price: 4.99,
      popular: false,
      description: 'Try AI-powered prompt improvements',
      pcPerAction: 15
    },
    {
      id: 'pc_creator_enh',
      name: 'Creator Pack',
      credits: 150, // 10 enhancements at 15 PC each
      price: 12.99,
      popular: true,
      description: 'Great for content creators',
      savings: '13% off',
      pcPerAction: 15
    },
    {
      id: 'pc_pro_enh',
      name: 'Pro Pack',
      credits: 375, // 25 enhancements at 15 PC each
      price: 29.99,
      popular: false,
      description: 'Professional enhancement package',
      savings: '40% off',
      pcPerAction: 15
    }
  ],
  exam: [
    {
      id: 'pc_exam_basic',
      name: 'Basic Pack',
      credits: 150, // 3 exam attempts at 50 PC each
      price: 9.99,
      popular: true,
      description: 'Standard exam attempt package',
      pcPerAction: 50
    },
    {
      id: 'pc_exam_plus',
      name: 'Plus Pack',
      credits: 300, // 6 exam attempts at 50 PC each
      price: 17.99,
      popular: false,
      description: 'Extra attempts for confidence',
      savings: '10% off',
      pcPerAction: 50
    }
  ],
  export: [
    {
      id: 'pc_export_basic',
      name: 'Basic Pack',
      credits: 25, // 5 exports at 5 PC each
      price: 2.99,
      popular: true,
      description: 'Export your prompts to PDF',
      pcPerAction: 5
    },
    {
      id: 'pc_export_bulk',
      name: 'Bulk Pack',
      credits: 100, // 20 exports at 5 PC each
      price: 8.99,
      popular: false,
      description: 'Bulk export package',
      savings: '25% off',
      pcPerAction: 5
    }
  ]
};

const typeConfig = {
  analysis: {
    title: 'Buy Analysis PromptCoins',
    icon: Zap,
    color: 'text-blue-600',
    description: 'Get AI-powered feedback on your prompts'
  },
  enhancement: {
    title: 'Buy Enhancement PromptCoins',
    icon: Coins,
    color: 'text-green-600',
    description: 'Improve your prompts with AI suggestions'
  },
  exam: {
    title: 'Buy Exam PromptCoins',
    icon: CreditCard,
    color: 'text-purple-600',
    description: 'Purchase additional certification attempts'
  },
  export: {
    title: 'Buy Export PromptCoins',
    icon: X,
    color: 'text-orange-600',
    description: 'Export your prompts to PDF format'
  }
};

export default function BuyCreditsModal({ isOpen, onClose, type, source = 'unknown' }: BuyCreditsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  if (!isOpen) return null;

  const config = typeConfig[type];
  const packages = promptCoinPackages[type];
  const IconComponent = config.icon;

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      setPaymentAmount(pkg.price);
      track('promptcoins_package_selected', {
        package: packageId,
        type,
        source,
        price: pkg.price,
        credits: pkg.credits
      });
    }
  };

  const handlePurchase = () => {
    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    track('promptcoins_purchase_initiated', {
      package: selectedPackage,
      type,
      source,
      amount: paymentAmount
    });

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    track('promptcoins_purchase_success', {
      package: selectedPackage,
      type,
      source,
      amount: paymentAmount
    });

    toast.success('PromptCoins purchased successfully! 🎉');
    setShowPaymentModal(false);
    onClose();
    // TODO: Update user PromptCoins in database
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700`}>
                  <IconComponent className={`w-6 h-6 ${config.color}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {config.title}
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                    {config.description}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Packages */}
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg) => {
                const isSelected = selectedPackage === pkg.id;
                const pricePerCredit = pkg.price / pkg.credits;
                
                return (
                  <div
                    key={pkg.id}
                    className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                    onClick={() => handlePackageSelect(pkg.id)}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {pkg.savings && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          {pkg.savings}
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                        {pkg.name}
                      </h3>
                      <div className="mb-2">
                        <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                          ${pkg.price}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        {pkg.description}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {Math.floor(pkg.credits / (pkg as any).pcPerAction)} {type === 'exam' ? 'attempts' : `${type}s`} • ${pricePerCredit.toFixed(2)} per {type === 'exam' ? 'attempt' : type}
                      </p>
                    </div>

                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-700 px-3 py-2 rounded-lg">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                          {pkg.credits} PromptCoins
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={handlePurchase}
                disabled={!selectedPackage}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Purchase PromptCoins
              </Button>
            </div>

            {/* Features */}
            <div className="mt-8 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <h4 className="font-semibold mb-3 dark:text-white">What you get:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Instant PromptCoin activation
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  No expiration date
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Secure payment processing
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Email receipt included
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <UniversalPaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          promptId={-2} // Using -2 to indicate credits purchase
          promptTitle={packages.find(p => p.id === selectedPackage)?.name || 'Credits Package'}
          price={paymentAmount}
          sellerName="Promptopotamus"
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}