'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { X, CreditCard, Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promptId: number;
  amount: number;
  promptTitle: string;
  sellerName: string;
}

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  promptTitle: string;
  sellerName: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function PaymentForm({ clientSecret, amount, promptTitle, sellerName, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Notify our backend about successful payment
        const response = await fetch('/api/smart-prompts/purchase', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            status: 'succeeded'
          })
        });

        if (response.ok) {
          onSuccess();
        } else {
          onError('Payment succeeded but failed to complete purchase');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      onError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Purchase Summary */}
      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-600">
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
            <span className="font-bold text-lg text-green-600 dark:text-green-400">
              ${amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center dark:text-white">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Information
        </h3>
        
        <div className="border border-neutral-300 dark:border-neutral-600 rounded-lg p-4 bg-white dark:bg-neutral-700">
          <CardElement
            options={cardElementOptions}
            onChange={(event) => setCardComplete(event.complete)}
          />
        </div>

        <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
          <Lock className="w-3 h-3 mr-1" />
          Your payment information is secure and encrypted
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || !cardComplete || isProcessing}
        className="w-full flex items-center justify-center"
        size="lg"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

export default function StripePaymentModal({
  isOpen,
  onClose,
  onSuccess,
  promptId,
  amount,
  promptTitle,
  sellerName
}: StripePaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !clientSecret) {
      initializePayment();
    }
  }, [isOpen]);

  const initializePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/smart-prompts/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId })
      });

      const data = await response.json();

      if (response.ok && data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        setError(data.error || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    toast.success('🎉 Smart Prompt purchased successfully!');
    onSuccess();
    onClose();
    // Reset state for next use
    setClientSecret(null);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    toast.error(errorMessage);
  };

  const handleClose = () => {
    onClose();
    // Reset state
    setClientSecret(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold dark:text-white">Complete Purchase</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">Preparing payment...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                Payment Error
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
              <Button onClick={initializePayment} variant="outline">
                Try Again
              </Button>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise}>
              <PaymentForm
                clientSecret={clientSecret}
                amount={amount}
                promptTitle={promptTitle}
                sellerName={sellerName}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </Elements>
          ) : null}
        </div>
      </div>
    </div>
  );
}