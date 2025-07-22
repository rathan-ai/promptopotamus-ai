'use client';

import { useState } from 'react';
import { X, Crown, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { track } from '@vercel/analytics';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

const plans = [
  {
    id: 'pro',
    name: 'Pro',
    price: '$9',
    period: '/month',
    icon: Star,
    color: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    popular: true,
    features: [
      'Unlimited prompt analysis',
      'Access to Pro templates',
      'Enhanced AI suggestions',
      'Priority support',
      'Export prompts to PDF'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$19',
    period: '/month',
    icon: Crown,
    color: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    popular: false,
    features: [
      'Everything in Pro',
      'Access to Premium templates',
      'Custom prompt templates',
      'Advanced analytics dashboard',
      'Team collaboration features',
      '1-on-1 expert consultation'
    ]
  }
];

export default function UpgradeModal({ isOpen, onClose, source = 'unknown' }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    track('upgrade_plan_selected', {
      plan: planId,
      source: source,
      price: plans.find(p => p.id === planId)?.price || 'unknown'
    });
  };

  const handleUpgrade = async (planId: string) => {
    setIsProcessing(true);
    
    track('upgrade_attempt', {
      plan: planId,
      source: source,
      price: plans.find(p => p.id === planId)?.price || 'unknown'
    });

    // TODO: Replace with actual payment integration
    // For now, simulate a process and show options
    setTimeout(() => {
      setIsProcessing(false);
      
      // Show contact options
      const plan = plans.find(p => p.id === planId);
      const message = `Hi! I'm interested in upgrading to the ${plan?.name} plan (${plan?.price}${plan?.period}). Please send me payment instructions.`;
      const mailtoLink = `mailto:support@promptopotamus.com?subject=Upgrade to ${plan?.name} Plan&body=${encodeURIComponent(message)}`;
      
      window.open(mailtoLink, '_blank');
      
      track('upgrade_contact_initiated', {
        plan: planId,
        source: source,
        method: 'email'
      });
      
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Upgrade Your Experience
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Unlock premium features and unlimited access
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

        {/* Plans */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              
              return (
                <div
                  key={plan.id}
                  className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                    isSelected 
                      ? plan.color + ' border-opacity-100' 
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`inline-flex p-3 rounded-full mb-3 ${plan.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isProcessing}
                    className={`w-full ${plan.buttonColor}`}
                  >
                    {isProcessing && selectedPlan === plan.id ? (
                      'Processing...'
                    ) : (
                      `Choose ${plan.name}`
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
                href="mailto:support@promptopotamus.com" 
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
                onClick={() => track('upgrade_contact_email_clicked', { source })}
              >
                support@promptopotamus.com
              </a>
            </p>
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              💰 30-day money-back guarantee • Cancel anytime • Secure payments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}