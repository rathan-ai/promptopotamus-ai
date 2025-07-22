import { getSettings } from '@/lib/admin-settings';

export interface PaymentProvider {
  id: string;
  name: string;
  enabled: boolean;
  credentials: Record<string, any>;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
  userId?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  clientSecret?: string;
  redirectUrl?: string;
  error?: string;
}

export interface PaymentAdapter {
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  confirmPayment(paymentId: string, paymentMethodId?: string): Promise<PaymentResponse>;
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse>;
  getPaymentStatus(paymentId: string): Promise<{ status: string; details?: any }>;
}

// PayPal Adapter
class PayPalAdapter implements PaymentAdapter {
  private clientId: string;
  private clientSecret: string;
  private environment: 'sandbox' | 'live';

  constructor(credentials: Record<string, any>) {
    this.clientId = credentials.client_id || '';
    this.clientSecret = credentials.client_secret || '';
    this.environment = credentials.environment === 'live' ? 'live' : 'sandbox';
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Get PayPal access token
      const tokenResponse = await this.getAccessToken();
      if (!tokenResponse.success) {
        return { success: false, error: 'Failed to get PayPal access token' };
      }

      // Create PayPal order
      const baseUrl = this.environment === 'live' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';

      const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenResponse.accessToken}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: request.currency.toUpperCase(),
              value: request.amount.toFixed(2)
            },
            description: request.description,
            custom_id: request.metadata?.orderId || request.userId
          }],
          application_context: {
            return_url: request.metadata?.returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
            cancel_url: request.metadata?.cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel`
          }
        })
      });

      const order = await orderResponse.json();
      
      if (!orderResponse.ok) {
        return { success: false, error: order.message || 'PayPal order creation failed' };
      }

      return {
        success: true,
        transactionId: order.id,
        clientSecret: order.id, // PayPal uses order ID as client secret
        redirectUrl: order.links?.find((link: any) => link.rel === 'approve')?.href
      };

    } catch (error) {
      console.error('PayPal payment creation error:', error);
      return { success: false, error: 'PayPal payment creation failed' };
    }
  }

  async confirmPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const tokenResponse = await this.getAccessToken();
      if (!tokenResponse.success) {
        return { success: false, error: 'Failed to get PayPal access token' };
      }

      const baseUrl = this.environment === 'live' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';

      const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${paymentId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenResponse.accessToken}`,
        }
      });

      const capture = await captureResponse.json();
      
      if (!captureResponse.ok) {
        return { success: false, error: capture.message || 'PayPal capture failed' };
      }

      return {
        success: true,
        transactionId: capture.id
      };

    } catch (error) {
      console.error('PayPal payment confirmation error:', error);
      return { success: false, error: 'PayPal payment confirmation failed' };
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    // PayPal refund implementation
    try {
      const tokenResponse = await this.getAccessToken();
      if (!tokenResponse.success) {
        return { success: false, error: 'Failed to get PayPal access token' };
      }

      const baseUrl = this.environment === 'live' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';

      const refundData: any = {};
      if (amount) {
        refundData.amount = {
          value: amount.toFixed(2),
          currency_code: 'USD' // TODO: Get from original transaction
        };
      }

      const refundResponse = await fetch(`${baseUrl}/v2/payments/captures/${transactionId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenResponse.accessToken}`,
        },
        body: JSON.stringify(refundData)
      });

      const refund = await refundResponse.json();
      
      if (!refundResponse.ok) {
        return { success: false, error: refund.message || 'PayPal refund failed' };
      }

      return {
        success: true,
        transactionId: refund.id
      };

    } catch (error) {
      console.error('PayPal refund error:', error);
      return { success: false, error: 'PayPal refund failed' };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<{ status: string; details?: any }> {
    try {
      const tokenResponse = await this.getAccessToken();
      if (!tokenResponse.success) {
        return { status: 'error', details: 'Failed to get PayPal access token' };
      }

      const baseUrl = this.environment === 'live' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';

      const response = await fetch(`${baseUrl}/v2/checkout/orders/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenResponse.accessToken}`,
        }
      });

      const order = await response.json();
      return { status: order.status?.toLowerCase() || 'unknown', details: order };

    } catch (error) {
      console.error('PayPal status check error:', error);
      return { status: 'error', details: error };
    }
  }

  private async getAccessToken(): Promise<{ success: boolean; accessToken?: string }> {
    try {
      const baseUrl = this.environment === 'live' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';

      const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('PayPal token error:', data);
        return { success: false };
      }

      return { success: true, accessToken: data.access_token };

    } catch (error) {
      console.error('PayPal token request error:', error);
      return { success: false };
    }
  }
}

// Stripe Adapter
class StripeAdapter implements PaymentAdapter {
  private secretKey: string;
  private publishableKey: string;

  constructor(credentials: Record<string, any>) {
    this.secretKey = credentials.secret_key || '';
    this.publishableKey = credentials.publishable_key || '';
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const stripe = require('stripe')(this.secretKey);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        description: request.description,
        metadata: request.metadata || {},
        customer: request.userId,
      });

      return {
        success: true,
        transactionId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      };

    } catch (error: any) {
      console.error('Stripe payment creation error:', error);
      return { success: false, error: error.message || 'Stripe payment creation failed' };
    }
  }

  async confirmPayment(paymentId: string, paymentMethodId?: string): Promise<PaymentResponse> {
    try {
      const stripe = require('stripe')(this.secretKey);

      const paymentIntent = await stripe.paymentIntents.confirm(paymentId, {
        payment_method: paymentMethodId
      });

      return {
        success: paymentIntent.status === 'succeeded',
        transactionId: paymentIntent.id
      };

    } catch (error: any) {
      console.error('Stripe payment confirmation error:', error);
      return { success: false, error: error.message || 'Stripe payment confirmation failed' };
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    try {
      const stripe = require('stripe')(this.secretKey);

      const refundData: any = { payment_intent: transactionId };
      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);

      return {
        success: true,
        transactionId: refund.id
      };

    } catch (error: any) {
      console.error('Stripe refund error:', error);
      return { success: false, error: error.message || 'Stripe refund failed' };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<{ status: string; details?: any }> {
    try {
      const stripe = require('stripe')(this.secretKey);
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
      
      return { status: paymentIntent.status, details: paymentIntent };

    } catch (error: any) {
      console.error('Stripe status check error:', error);
      return { status: 'error', details: error.message };
    }
  }
}

// Custom API Adapter
class CustomAPIAdapter implements PaymentAdapter {
  private apiEndpoint: string;
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(credentials: Record<string, any>) {
    this.apiEndpoint = credentials.api_endpoint || '';
    this.apiKey = credentials.api_key || '';
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...credentials.custom_headers
    };
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiEndpoint}/payments`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          description: request.description,
          metadata: request.metadata,
          user_id: request.userId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.message || 'Custom API payment creation failed' };
      }

      return {
        success: true,
        transactionId: data.id || data.transaction_id,
        clientSecret: data.client_secret,
        redirectUrl: data.redirect_url
      };

    } catch (error: any) {
      console.error('Custom API payment creation error:', error);
      return { success: false, error: error.message || 'Custom API payment creation failed' };
    }
  }

  async confirmPayment(paymentId: string, paymentMethodId?: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiEndpoint}/payments/${paymentId}/confirm`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          payment_method_id: paymentMethodId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.message || 'Custom API payment confirmation failed' };
      }

      return {
        success: data.success || data.status === 'confirmed',
        transactionId: data.id || data.transaction_id
      };

    } catch (error: any) {
      console.error('Custom API payment confirmation error:', error);
      return { success: false, error: error.message || 'Custom API payment confirmation failed' };
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    try {
      const body: any = { transaction_id: transactionId };
      if (amount) body.amount = amount;

      const response = await fetch(`${this.apiEndpoint}/payments/${transactionId}/refund`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.message || 'Custom API refund failed' };
      }

      return {
        success: true,
        transactionId: data.refund_id || data.id
      };

    } catch (error: any) {
      console.error('Custom API refund error:', error);
      return { success: false, error: error.message || 'Custom API refund failed' };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<{ status: string; details?: any }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/payments/${paymentId}`, {
        method: 'GET',
        headers: this.headers
      });

      const data = await response.json();
      return { status: data.status || 'unknown', details: data };

    } catch (error: any) {
      console.error('Custom API status check error:', error);
      return { status: 'error', details: error.message };
    }
  }
}

// Universal Payment Adapter Factory
export class UniversalPaymentAdapter {
  private adapter: PaymentAdapter | null = null;
  private provider: PaymentProvider | null = null;

  constructor() {
    // Will be initialized when first used
  }

  private async initializeAdapter(): Promise<void> {
    if (this.adapter && this.provider) return; // Already initialized

    try {
      // Get payment settings from admin configuration
      const paymentSettings = await getSettings('payments');
      const primaryProvider = paymentSettings.payment_provider || 'stripe';

      // Map provider credentials
      const providerCredentials: Record<string, any> = {};

      switch (primaryProvider.toLowerCase()) {
        case 'paypal':
          providerCredentials.client_id = paymentSettings.paypal_client_id || '';
          providerCredentials.client_secret = paymentSettings.paypal_client_secret || '';
          providerCredentials.environment = paymentSettings.paypal_environment || 'sandbox';
          this.adapter = new PayPalAdapter(providerCredentials);
          break;

        case 'stripe':
          providerCredentials.secret_key = paymentSettings.stripe_secret_key || process.env.STRIPE_SECRET_KEY || '';
          providerCredentials.publishable_key = paymentSettings.stripe_publishable_key || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
          this.adapter = new StripeAdapter(providerCredentials);
          break;

        case 'razorpay':
          // Razorpay adapter would go here
          throw new Error('Razorpay adapter not implemented yet');

        case 'square':
          // Square adapter would go here
          throw new Error('Square adapter not implemented yet');

        case 'custom':
          providerCredentials.api_endpoint = paymentSettings.custom_api_endpoint || '';
          providerCredentials.api_key = paymentSettings.custom_api_key || '';
          this.adapter = new CustomAPIAdapter(providerCredentials);
          break;

        default:
          // Default to Stripe if provider not recognized
          console.warn(`Unknown payment provider: ${primaryProvider}. Defaulting to Stripe.`);
          providerCredentials.secret_key = process.env.STRIPE_SECRET_KEY || '';
          providerCredentials.publishable_key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
          this.adapter = new StripeAdapter(providerCredentials);
      }

      this.provider = {
        id: primaryProvider,
        name: primaryProvider.charAt(0).toUpperCase() + primaryProvider.slice(1),
        enabled: true,
        credentials: providerCredentials
      };

    } catch (error) {
      console.error('Failed to initialize payment adapter:', error);
      // Fallback to environment-configured Stripe
      this.adapter = new StripeAdapter({
        secret_key: process.env.STRIPE_SECRET_KEY || '',
        publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
      });
      this.provider = {
        id: 'stripe',
        name: 'Stripe',
        enabled: true,
        credentials: {}
      };
    }
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    await this.initializeAdapter();
    if (!this.adapter) throw new Error('Payment adapter not initialized');
    return this.adapter.createPayment(request);
  }

  async confirmPayment(paymentId: string, paymentMethodId?: string): Promise<PaymentResponse> {
    await this.initializeAdapter();
    if (!this.adapter) throw new Error('Payment adapter not initialized');
    return this.adapter.confirmPayment(paymentId, paymentMethodId);
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    await this.initializeAdapter();
    if (!this.adapter) throw new Error('Payment adapter not initialized');
    return this.adapter.refundPayment(transactionId, amount);
  }

  async getPaymentStatus(paymentId: string): Promise<{ status: string; details?: any }> {
    await this.initializeAdapter();
    if (!this.adapter) throw new Error('Payment adapter not initialized');
    return this.adapter.getPaymentStatus(paymentId);
  }

  async getActiveProvider(): Promise<PaymentProvider | null> {
    await this.initializeAdapter();
    return this.provider;
  }

  // Method to get available providers from settings
  static async getAvailableProviders(): Promise<PaymentProvider[]> {
    try {
      const paymentSettings = await getSettings('payments');
      const providers: PaymentProvider[] = [];

      // Check which providers have credentials configured
      if (paymentSettings.paypal_client_id && paymentSettings.paypal_client_secret) {
        providers.push({
          id: 'paypal',
          name: 'PayPal',
          enabled: paymentSettings.payment_provider === 'paypal',
          credentials: {
            client_id: paymentSettings.paypal_client_id,
            environment: paymentSettings.paypal_environment
          }
        });
      }

      if (paymentSettings.stripe_secret_key && paymentSettings.stripe_publishable_key) {
        providers.push({
          id: 'stripe',
          name: 'Stripe',
          enabled: paymentSettings.payment_provider === 'stripe',
          credentials: {
            publishable_key: paymentSettings.stripe_publishable_key
          }
        });
      }

      if (paymentSettings.custom_api_endpoint && paymentSettings.custom_api_key) {
        providers.push({
          id: 'custom',
          name: 'Custom API',
          enabled: paymentSettings.payment_provider === 'custom',
          credentials: {
            api_endpoint: paymentSettings.custom_api_endpoint
          }
        });
      }

      return providers;

    } catch (error) {
      console.error('Failed to get available providers:', error);
      return [];
    }
  }
}

// Export singleton instance
export const paymentAdapter = new UniversalPaymentAdapter();