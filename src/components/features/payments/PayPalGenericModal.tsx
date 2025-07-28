'use client';

import { useState, useEffect } from 'react';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Button } from '@/components/ui/Button';
import { X, CreditCard, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface PayPalGenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId?: string) => void;
  amount: number;
  description: string;
  itemName: string;
  purchaseType?: 'promptcoin' | 'smart-prompt';
}

export default function PayPalGenericModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  description,
  itemName,
  purchaseType = 'promptcoin'
}: PayPalGenericModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
    setError(null);
    setPaypalOrderId(null);
  };

  const handleSuccess = (transactionId?: string) => {
    toast.success(`🎉 ${itemName} purchased successfully!`);
    onSuccess(transactionId);
    onClose();
    setError(null);
    setPaypalOrderId(null);
  };

  if (!isOpen) return null;

  const paypalOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: "USD",
    intent: "capture",
  };

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

          {/* Purchase Summary */}
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-600 mb-6">
            <h3 className="font-semibold text-lg mb-2 dark:text-white">Purchase Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Item:</span>
                <span className="font-medium dark:text-white">{itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Description:</span>
                <span className="font-medium dark:text-white">{description}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-600 pt-2 mt-2">
                <span className="font-semibold dark:text-white">Total:</span>
                <span className="font-bold text-lg text-green-600 dark:text-green-400">
                  ${amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* PayPal Payment */}
          {!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                Payment Unavailable
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                PayPal payment processing is currently not configured. Please contact support.
              </p>
              <Button onClick={handleClose} variant="outline">
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                <Lock className="w-3 h-3 mr-1" />
                Secure payment powered by PayPal
              </div>

              <PayPalScriptProvider options={paypalOptions}>
                <PayPalButtons
                  style={{ 
                    layout: "vertical",
                    shape: "rect",
                    color: "gold",
                    label: "paypal"
                  }}
                  createOrder={async (data, actions) => {
                    setLoading(true);
                    setError(null);
                    
                    try {
                      // For PromptCoin purchases, create order directly with PayPal
                      if (purchaseType === 'promptcoin') {
                        return actions.order.create({
                          purchase_units: [{
                            amount: {
                              currency_code: "USD",
                              value: amount.toFixed(2)
                            },
                            description: description
                          }]
                        });
                      } else {
                        // For smart prompt purchases, use the existing API
                        const response = await fetch('/api/smart-prompts/purchase', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            promptId: -1, // This should be passed as a prop for smart prompts
                            paymentProvider: 'paypal'
                          })
                        });

                        const data = await response.json();
                        
                        if (!response.ok || !data.paypalOrderId) {
                          throw new Error(data.error || 'Failed to create order');
                        }

                        setPaypalOrderId(data.paypalOrderId);
                        return data.paypalOrderId;
                      }
                    } catch (err) {
                      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
                      setError(errorMessage);
                      throw err;
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onApprove={async (data, actions) => {
                    try {
                      if (purchaseType === 'promptcoin') {
                        // For PromptCoin purchases, capture directly and pass transaction ID
                        const details = await actions.order?.capture();
                        if (details) {
                          handleSuccess(details.id);
                        }
                      } else {
                        // For smart prompt purchases, use the existing API
                        const response = await fetch('/api/smart-prompts/purchase', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            paypalOrderId: data.orderID,
                            paymentProvider: 'paypal',
                            status: 'approved'
                          })
                        });

                        const result = await response.json();
                        
                        if (response.ok && result.success) {
                          handleSuccess();
                        } else {
                          throw new Error(result.error || 'Payment failed to complete');
                        }
                      }
                    } catch (err) {
                      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
                      setError(errorMessage);
                      toast.error(errorMessage);
                    }
                  }}
                  onError={(err) => {
                    console.error('PayPal error:', err);
                    setError('Payment failed. Please try again.');
                    toast.error('Payment failed. Please try again.');
                  }}
                  onCancel={() => {
                    toast.info('Payment cancelled');
                  }}
                />
              </PayPalScriptProvider>

              {loading && (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Processing...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}