'use client';

import { useState } from 'react';
import { X, AlertTriangle, Gift, Calendar, Users, MessageSquare, Star, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface UnsubscribeFlowProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: 'pro' | 'premium';
  onDowngrade?: (tier: 'free') => void;
  onRetain?: () => void;
}

const feedbackReasons = [
  { id: 'cost', label: 'Too expensive', icon: '💰' },
  { id: 'usage', label: 'Not using it enough', icon: '⏰' },
  { id: 'features', label: 'Missing features I need', icon: '🔧' },
  { id: 'quality', label: 'Quality not as expected', icon: '📊' },
  { id: 'complexity', label: 'Too complicated to use', icon: '🤔' },
  { id: 'alternatives', label: 'Found a better alternative', icon: '🔄' },
  { id: 'temporary', label: 'Temporary break', icon: '⏸️' },
  { id: 'other', label: 'Other reason', icon: '📝' }
];

const retentionOffers = {
  cost: {
    title: '50% Off Next 3 Months',
    description: 'We value your feedback. Continue with 50% discount on your current plan.',
    icon: Gift,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  usage: {
    title: 'Downgrade to Pro',
    description: 'Keep essential features at a lower cost. Upgrade anytime when you need more.',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  features: {
    title: 'Feature Request Priority',
    description: 'Tell us what you need. We\'ll prioritize your feature requests and notify you when ready.',
    icon: Star,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  quality: {
    title: 'Premium Support Call',
    description: 'Let our team help you get the most out of Promptopotamus with a personalized session.',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  complexity: {
    title: 'Free Training Session',
    description: 'Book a 1-on-1 training session to master all features and boost your productivity.',
    icon: Users,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50'
  },
  temporary: {
    title: 'Pause Subscription',
    description: 'Pause for up to 6 months. Your data and settings will be preserved.',
    icon: Calendar,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
};

export default function UnsubscribeFlow({ 
  isOpen, 
  onClose, 
  currentTier, 
  onDowngrade,
  onRetain 
}: UnsubscribeFlowProps) {
  const [step, setStep] = useState<'reason' | 'offer' | 'confirm' | 'feedback'>('reason');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [retainOffered, setRetainOffered] = useState(false);

  if (!isOpen) return null;

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
    
    // Show retention offer for certain reasons
    if (retentionOffers[reasonId as keyof typeof retentionOffers]) {
      setStep('offer');
      setRetainOffered(true);
    } else {
      setStep('confirm');
    }
  };

  const handleRetainOffer = () => {
    onRetain?.();
    toast.success('Great! We\'ve applied your retention offer. Check your email for details.');
    onClose();
  };

  const handleConfirmCancel = async () => {
    // Here you would integrate with your subscription management system
    try {
      // Mock API call - replace with actual subscription cancellation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onDowngrade?.('free');
      setStep('feedback');
    } catch (error) {
      toast.error('Error cancelling subscription. Please try again.');
    }
  };

  const handleFeedbackSubmit = async () => {
    // Submit feedback to your analytics/CRM system
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Thank you for your feedback. We\'re sorry to see you go.');
      onClose();
    } catch (error) {
      toast.error('Error submitting feedback. Please try again.');
    }
  };

  const getCurrentOffer = () => {
    return retentionOffers[selectedReason as keyof typeof retentionOffers];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold dark:text-white">
            {step === 'reason' && 'Before you go...'}
            {step === 'offer' && 'Wait! We have an offer'}
            {step === 'confirm' && 'Confirm cancellation'}
            {step === 'feedback' && 'Help us improve'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Reason Selection */}
          {step === 'reason' && (
            <div className="space-y-4">
              <p className="text-neutral-600 dark:text-neutral-400">
                We'd love to understand why you're cancelling your {currentTier} subscription. 
                Your feedback helps us improve Promptopotamus for everyone.
              </p>

              <div className="grid grid-cols-1 gap-3">
                {feedbackReasons.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => handleReasonSelect(reason.id)}
                    className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                  >
                    <span className="text-xl">{reason.icon}</span>
                    <span className="dark:text-white">{reason.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Retention Offer */}
          {step === 'offer' && (
            <div className="space-y-4">
              {(() => {
                const offer = getCurrentOffer();
                if (!offer) return null;
                
                const OfferIcon = offer.icon;
                return (
                  <div className={`p-4 rounded-lg ${offer.bgColor}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <OfferIcon className={`w-6 h-6 ${offer.color}`} />
                      <h3 className={`font-semibold ${offer.color}`}>{offer.title}</h3>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                      {offer.description}
                    </p>
                    
                    <div className="flex gap-3">
                      <Button onClick={handleRetainOffer} className="flex-1">
                        Accept Offer
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setStep('confirm')}
                        className="flex-1"
                      >
                        No Thanks
                      </Button>
                    </div>
                  </div>
                );
              })()}

              <div className="text-center">
                <button
                  onClick={() => setStep('confirm')}
                  className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Continue with cancellation
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm Cancellation */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-200">
                    You're about to cancel your {currentTier} subscription
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    You'll lose access to premium features but can resubscribe anytime.
                  </p>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2 dark:text-white">What you'll lose:</h4>
                <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
                  <li>• AI enhancements and analyses</li>
                  <li>• Access to premium templates</li>
                  <li>• Priority customer support</li>
                  <li>• Advanced analytics and insights</li>
                  {currentTier === 'premium' && (
                    <>
                      <li>• Team collaboration features</li>
                      <li>• Custom template creation</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleConfirmCancel}
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  Yes, Cancel Subscription
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Keep My Subscription
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Final Feedback */}
          {step === 'feedback' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold mb-2 dark:text-white">
                  Your subscription has been cancelled
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  You'll continue to have access until your current billing period ends.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Any final thoughts? (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Help us understand what we could have done better..."
                  rows={4}
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-700 dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleFeedbackSubmit} className="flex-1">
                  Submit Feedback
                </Button>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Skip
                </Button>
              </div>

              <div className="text-center pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Changed your mind?
                </p>
                <Button variant="outline" size="sm">
                  <Crown className="w-4 h-4 mr-2" />
                  Reactivate Subscription
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}