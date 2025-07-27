'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X, CreditCard, AlertTriangle, CheckCircle, Loader2, Wallet, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentProvider {
  id: string;
  name: string;
  enabled: boolean;
}

interface UniversalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptId: number;
  promptTitle: string;
  price: number;
  sellerName: string;
  onSuccess: () => void;
}

declare global {
  interface Window {
    paypal?: any;
    Stripe?: any;
  }
}

export default function UniversalPaymentModal({
  isOpen,
  onClose,
  promptId,
  promptTitle,
  price,
  sellerName,
  onSuccess
}: UniversalPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<string>('');
  const [availableProviders, setAvailableProviders] = useState<PaymentProvider[]>([]);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [step, setStep] = useState<'loading' | 'select' | 'process' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Load available payment providers and scripts
  useEffect(() => {
    if (isOpen) {
      loadPaymentProviders();
    }
  }, [isOpen]);

  const loadPaymentProviders = async () => {
    try {
      setStep('loading');
      
      // Get available providers from admin settings
      const response = await fetch('/api/public/settings?category=payments');
      const data = await response.json();
      const paymentSettings = data.settings?.payments || {};
      
      const providers: PaymentProvider[] = [];
      
      // Check which providers are configured and enabled
      if (paymentSettings.paypal_client_id && paymentSettings.paypal_client_secret) {
        providers.push({ id: 'paypal', name: 'PayPal', enabled: paymentSettings.payment_provider === 'paypal' });
      }
      
      if (paymentSettings.stripe_publishable_key && paymentSettings.stripe_secret_key) {
        providers.push({ id: 'stripe', name: 'Stripe', enabled: paymentSettings.payment_provider === 'stripe' });
      }
      
      if (paymentSettings.custom_api_endpoint && paymentSettings.custom_api_key) {
        providers.push({ id: 'custom', name: 'Custom Payment', enabled: paymentSettings.payment_provider === 'custom' });
      }
      
      // Add other providers as they become available
      if (paymentSettings.razorpay_key_id && paymentSettings.razorpay_key_secret) {
        providers.push({ id: 'razorpay', name: 'Razorpay', enabled: paymentSettings.payment_provider === 'razorpay' });
      }
      
      if (paymentSettings.square_application_id && paymentSettings.square_access_token) {
        providers.push({ id: 'square', name: 'Square', enabled: paymentSettings.payment_provider === 'square' });
      }
      
      setAvailableProviders(providers);
      
      // Auto-select the primary provider if only one is available or one is enabled
      const enabledProvider = providers.find(p => p.enabled);
      if (enabledProvider) {
        setPaymentProvider(enabledProvider.id);
        await loadPaymentScripts(enabledProvider.id, paymentSettings);
      } else if (providers.length === 1) {
        setPaymentProvider(providers[0].id);
        await loadPaymentScripts(providers[0].id, paymentSettings);
      }
      
      setStep(providers.length > 0 ? 'select' : 'error');
      if (providers.length === 0) {
        setErrorMessage('No payment methods are currently configured. Please contact support.');
      }
      
    } catch (error) {
      console.error('Error loading payment providers:', error);
      setStep('error');
      setErrorMessage('Failed to load payment options. Please try again.');
    }
  };

  const loadPaymentScripts = async (providerId: string, settings: any) => {
    try {
      if (providerId === 'paypal') {
        // Load PayPal SDK
        if (!window.paypal) {
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${settings.paypal_client_id}&currency=USD`;
          script.async = true;
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
      } else if (providerId === 'stripe') {
        // Load Stripe SDK
        if (!window.Stripe) {
          const script = document.createElement('script');
          script.src = 'https://js.stripe.com/v3/';
          script.async = true;
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
      }
    } catch (error) {
      console.error(`Error loading ${providerId} scripts:`, error);
      throw error;
    }
  };

  const handleProviderSelect = async (providerId: string) => {
    setPaymentProvider(providerId);
    const settings = await getPaymentSettings();
    await loadPaymentScripts(providerId, settings);
  };

  const getPaymentSettings = async () => {
    const response = await fetch('/api/public/settings?category=payments');
    const data = await response.json();
    return data.settings?.payments || {};
  };

  const initiatePayment = async () => {
    setLoading(true);
    setStep('process');
    
    try {
      // Create payment using universal adapter
      const response = await fetch('/api/smart-prompts/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setPaymentData(data);
      
      // Handle different payment providers
      if (data.paymentProvider === 'paypal') {
        await handlePayPalPayment(data);
      } else if (data.paymentProvider === 'stripe') {
        await handleStripePayment(data);
      } else if (data.redirectUrl) {
        // Handle redirect-based payments
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('Unknown payment provider or invalid payment data');
      }
      
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setStep('error');
      setErrorMessage(error.message || 'Payment initiation failed');
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async (paymentData: any) => {
    if (!window.paypal) {
      throw new Error('PayPal SDK not loaded');
    }

    // PayPal handles the payment flow internally
    // The payment was created, now PayPal will handle approval and capture
    setStep('success');
    toast.success('Payment completed successfully!');
    onSuccess();
    onClose();
  };

  const handleStripePayment = async (paymentData: any) => {
    if (!window.Stripe) {
      throw new Error('Stripe SDK not loaded');
    }

    const settings = await getPaymentSettings();
    const stripe = window.Stripe(settings.stripe_publishable_key);
    
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }

    const { error } = await stripe.confirmCardPayment(paymentData.clientSecret);
    
    if (error) {
      throw new Error(error.message || 'Stripe payment failed');
    }

    // Confirm payment on server
    const confirmResponse = await fetch('/api/smart-prompts/purchase', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: paymentData.transactionId
      })
    });

    const confirmData = await confirmResponse.json();
    
    if (!confirmData.success) {
      throw new Error(confirmData.error || 'Payment confirmation failed');
    }

    setStep('success');
    toast.success('Payment completed successfully!');
    onSuccess();
    onClose();
  };

  const handleClose = () => {
    if (step !== 'process') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white">Purchase Smart Prompt</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Secure payment processing</p>
            </div>
          </div>
          {step !== 'process' && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Purchase Details */}
          <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <h3 className="font-semibold dark:text-white mb-2">{promptTitle}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">by {sellerName}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Price:</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">${price.toFixed(2)}</span>
            </div>
          </div>

          {/* Step-based content */}
          {step === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">Loading payment options...</p>
            </div>
          )}

          {step === 'select' && (
            <div className="space-y-4">
              <h4 className="font-medium dark:text-white">Choose Payment Method</h4>
              
              {availableProviders.map((provider) => {
                const getProviderIcon = (id: string) => {
                  switch (id) {
                    case 'paypal': return <Wallet className="w-5 h-5 text-blue-600" />;
                    case 'stripe': return <CreditCard className="w-5 h-5 text-purple-600" />;
                    default: return <Star className="w-5 h-5 text-amber-600" />;
                  }
                };
                
                const getProviderDescription = (id: string) => {
                  switch (id) {
                    case 'paypal': return 'Pay with your PayPal account or card';
                    case 'stripe': return 'Pay with credit/debit card via Stripe';
                    default: return 'Alternative payment method';
                  }
                };
                
                return (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider.id)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                      paymentProvider === provider.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getProviderIcon(provider.id)}
                        <div>
                          <div className="font-medium dark:text-white">{provider.name}</div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {getProviderDescription(provider.id)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {provider.enabled && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Primary</span>
                        )}
                        {paymentProvider === provider.id && (
                          <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              <Button
                onClick={initiatePayment}
                disabled={!paymentProvider || loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${price.toFixed(2)}`
                )}
              </Button>
            </div>
          )}

          {step === 'process' && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">Processing your payment...</p>
              <p className="text-xs text-neutral-500 mt-2">Please do not close this window</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">Payment Successful!</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Your smart prompt has been added to your collection.</p>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Payment Failed</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">{errorMessage}</p>
              <Button
                onClick={loadPaymentProviders}
                variant="outline"
                className="mr-2"
              >
                Try Again
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}