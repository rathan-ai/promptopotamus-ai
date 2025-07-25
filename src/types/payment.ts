// Payment Provider Types
export interface PaymentProvider {
  id: string;
  name: string;
  enabled: boolean;
  credentials: PaymentCredentials;
}

// Provider-specific credential types
export interface StripeCredentials {
  secret_key: string;
  publishable_key: string;
}

export interface PayPalCredentials {
  client_id: string;
  client_secret: string;
  environment: 'sandbox' | 'live';
}

export interface CustomAPICredentials {
  api_endpoint: string;
  api_key: string;
  custom_headers?: Record<string, string>;
}

export type PaymentCredentials = StripeCredentials | PayPalCredentials | CustomAPICredentials;

// Payment Request/Response Types
export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  metadata?: PaymentMetadata;
  userId?: string;
}

export interface PaymentMetadata {
  orderId?: string;
  userId?: string;
  level?: string;
  type?: 'subscription' | 'quiz_attempts' | 'one_time';
  attempts?: number;
  returnUrl?: string;
  cancelUrl?: string;
  [key: string]: any; // Allow additional metadata fields
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  clientSecret?: string;
  redirectUrl?: string;
  error?: string;
}

export interface PaymentStatus {
  status: string;
  details?: any;
}

// Payment Adapter Interface
export interface PaymentAdapter {
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  confirmPayment(paymentId: string, paymentMethodId?: string): Promise<PaymentResponse>;
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
}

// Configuration Types
export interface PaymentConfiguration {
  payment_provider: 'stripe' | 'paypal' | 'razorpay' | 'square' | 'custom';
  stripe_secret_key?: string;
  stripe_publishable_key?: string;
  paypal_client_id?: string;
  paypal_client_secret?: string;
  paypal_environment?: 'sandbox' | 'live';
  custom_api_endpoint?: string;
  custom_api_key?: string;
  currency?: string;
  [key: string]: any;
}