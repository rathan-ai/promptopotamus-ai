// Environment variable validation
export interface RequiredEnvVars {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // Payment (optional but validated if payment is enabled)
  STRIPE_SECRET_KEY?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  
  // PayPal
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  PAYPAL_WEBHOOK_ID?: string;
  
  // Email
  EMAIL_API_KEY?: string;
  RESEND_API_KEY?: string;
  
  // Site
  NEXT_PUBLIC_SITE_URL: string;
}

export class EnvironmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

export function validateEnvironmentVariables(): void {
  const errors: string[] = [];
  
  // Required variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SITE_URL'
  ];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }
  
  // Validate Supabase URLs
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
    }
  }
  
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SITE_URL);
    } catch {
      errors.push('NEXT_PUBLIC_SITE_URL is not a valid URL');
    }
  }
  
  // Check for payment configuration consistency
  const hasStripeSecret = !!process.env.STRIPE_SECRET_KEY;
  const hasStripePublishable = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const hasStripeWebhook = !!process.env.STRIPE_WEBHOOK_SECRET;
  
  if (hasStripeSecret !== hasStripePublishable) {
    errors.push('Both STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be set together');
  }
  
  if ((hasStripeSecret || hasStripePublishable) && !hasStripeWebhook) {
    console.warn('STRIPE_WEBHOOK_SECRET is not set. Webhook verification will fail.');
  }

  // Check PayPal configuration consistency (optional)
  const hasPayPalClientId = !!process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_ID.trim() !== '';
  const hasPayPalClientSecret = !!process.env.PAYPAL_CLIENT_SECRET && process.env.PAYPAL_CLIENT_SECRET.trim() !== '';
  const hasPayPalWebhook = !!process.env.PAYPAL_WEBHOOK_ID && process.env.PAYPAL_WEBHOOK_ID.trim() !== '';
  
  // Only validate PayPal if BOTH client ID and secret are properly set
  if (hasPayPalClientId && hasPayPalClientSecret) {
    if (!hasPayPalWebhook) {
      console.warn('PAYPAL_WEBHOOK_ID is not set. PayPal webhook verification will fail.');
    }
  } else if (hasPayPalClientId || hasPayPalClientSecret) {
    // Only warn, don't error, if PayPal is partially configured during build
    console.warn('PayPal is partially configured. Both PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are needed for PayPal payments.');
  }
  
  // Throw error if any validation failed
  if (errors.length > 0) {
    throw new EnvironmentValidationError(
      `Environment variable validation failed:\n${errors.join('\n')}`
    );
  }
}

// Helper to get required environment variable
export function getRequiredEnv(key: keyof RequiredEnvVars): string {
  const value = process.env[key];
  if (!value) {
    // Only throw in server environment, log warning on client
    if (typeof window === 'undefined') {
      throw new EnvironmentValidationError(`Missing required environment variable: ${key}`);
    } else {
      console.warn(`Missing environment variable on client: ${key}`);
      return '';
    }
  }
  return value;
}

// Helper to get optional environment variable with default
export function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

// Initialize validation (only run on server, but skip during build)
if (typeof window === 'undefined' && 
    process.env.NODE_ENV !== 'test' && 
    process.env.NODE_ENV !== 'development' &&
    !process.env.VERCEL_ENV) { // Skip during Vercel build
  try {
    validateEnvironmentVariables();
  } catch (error) {
    console.error('Environment validation failed:', error);
    // In production, fail fast (but not during build)
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}