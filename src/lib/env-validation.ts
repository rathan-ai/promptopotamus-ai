// Environment variable validation
export interface RequiredEnvVars {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // Payment (optional but validated if payment is enabled)
  STRIPE_SECRET_KEY?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  
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
  
  if (hasStripeSecret !== hasStripePublishable) {
    errors.push('Both STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be set together');
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
    throw new EnvironmentValidationError(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Helper to get optional environment variable with default
export function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

// Initialize validation (only run on server)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  try {
    validateEnvironmentVariables();
  } catch (error) {
    console.error('Environment validation failed:', error);
    // In production, fail fast
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}