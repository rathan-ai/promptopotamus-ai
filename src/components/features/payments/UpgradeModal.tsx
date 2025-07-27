'use client';

import { useState } from 'react';
import { X, Coins, Star, Check, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { track } from '@vercel/analytics';
import PayPalPaymentModal from './PayPalPaymentModal';
import { addPromptCoinsFromPayment } from '@/lib/subscription';
import toast from 'react-hot-toast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

const packages = [
  {
    id: 'starter',
    name: 'Starter Pack',
    price: '$5',
    promptCoins: '500 PC',
    icon: Star,
    color: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    popular: true,
    features: [
      '33 prompt enhancements',
      '50 prompt analyses',
      '10 exam attempts',
      '100 export operations',
      'Smart Recipe purchases',
      'Credits never expire'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    price: '$20',
    promptCoins: '2,000 PC',
    icon: Coins,
    color: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    popular: false,
    features: [
      '133 prompt enhancements',
      '200 prompt analyses',
      '40 exam attempts',
      '400 export operations',
      'Smart Recipe purchases',
      'Credits never expire'
    ]
  }
];

export default function UpgradeModal({ isOpen, onClose, source = 'unknown' }: UpgradeModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  if (!isOpen) return null;

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    track('promptcoin_package_selected', {
      package: packageId,
      source: source,
      price: packages.find(p => p.id === packageId)?.price || 'unknown'
    });
  };

  const handlePurchase = async (packageId: string) => {
    setIsProcessing(true);
    
    track('promptcoin_purchase_attempt', {
      package: packageId,
      source: source,
      price: packages.find(p => p.id === packageId)?.price || 'unknown'
    });

    // Get the selected package details
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) {
      setIsProcessing(false);
      return;
    }

    // Extract numeric price from string (e.g., "$5" -> 5)
    const price = parseFloat(pkg.price.replace('$', ''));
    setPaymentAmount(price);
    
    // Show PayPal payment modal
    setShowPayPalModal(true);
    setIsProcessing(false);
  };

  const handlePaymentSuccess = async () => {
    track('promptcoin_payment_success', {
      package: selectedPackage,
      source: source,
      amount: paymentAmount
    });
    
    try {
      // Get user ID from auth context or session
      const response = await fetch('/api/profile');
      const { user } = await response.json();
      
      if (user && selectedPackage) {
        // Calculate PromptCoins to add based on package
        const pkg = packages.find(p => p.id === selectedPackage);
        if (!pkg) return;
        
        const promptCoinsAmount = paymentAmount * 100; // Convert USD to PC (100 PC = $1)
        
        // Distribute PromptCoins evenly across categories
        const perCategory = Math.floor(promptCoinsAmount / 4);
        const promptCoinsToAdd = {
          analysis: perCategory,
          enhancement: perCategory,
          exam: perCategory,
          export: promptCoinsAmount - (perCategory * 3) // remainder goes to export
        };
        
        const success = await addPromptCoinsFromPayment(
          user.id,
          promptCoinsToAdd,
          'paypal',
          `pc_${Date.now()}`,
          paymentAmount
        );
        
        if (success) {
          toast.success(`🎉 Successfully purchased ${pkg.promptCoins}!`);
        } else {
          toast.error('Payment successful but PromptCoin credit failed. Please contact support.');
        }
      }
    } catch (error) {
      console.error('Error adding PromptCoins:', error);
      toast.error('Payment successful but PromptCoin credit failed. Please contact support.');
    }
    
    setShowPayPalModal(false);
    onClose();
  };

  const handlePaymentClose = () => {
    setShowPayPalModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Buy PromptCoins
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Credits that never expire - pay only for what you use
              </p>
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
          <div className="grid md:grid-cols-2 gap-6">
            {packages.map((pkg) => {
              const Icon = pkg.icon;
              const isSelected = selectedPackage === pkg.id;
              
              return (
                <div
                  key={pkg.id}
                  className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                    isSelected 
                      ? pkg.color + ' border-opacity-100' 
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                  onClick={() => handlePackageSelect(pkg.id)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`inline-flex p-3 rounded-full mb-3 ${pkg.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {pkg.name}
                    </h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {pkg.price}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                        {pkg.promptCoins}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isProcessing}
                    className={`w-full ${pkg.buttonColor}`}
                  >
                    {isProcessing && selectedPackage === pkg.id ? (
                      'Processing...'
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Buy with PayPal
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Contact Info */}
          <div className="mt-8 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Questions? Contact us at{' '}
              <a 
                href="mailto:payment@innorag.com" 
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
                onClick={() => track('upgrade_contact_email_clicked', { source })}
              >
                payment@innorag.com
              </a>
            </p>
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              💰 30-day money-back guarantee • Credits never expire • Secure payments
            </p>
          </div>
        </div>
      </div>
      
      {/* PayPal Payment Modal */}
      {showPayPalModal && selectedPackage && (
        <PayPalPaymentModal
          isOpen={showPayPalModal}
          onClose={handlePaymentClose}
          onSuccess={handlePaymentSuccess}
          promptId={-1} // Using -1 to indicate PromptCoin purchase
          amount={paymentAmount}
          promptTitle={`${packages.find(p => p.id === selectedPackage)?.name} Purchase`}
          sellerName="Promptopotamus"
        />
      )}
    </div>
  );
}