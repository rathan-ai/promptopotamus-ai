// Application constants and configuration

// Quiz Configuration
export const QUIZ_CONFIG = {
  PASSING_SCORE_PERCENTAGE: 75,
  QUIZ_LENGTH: 25,
  TIME_LIMIT_IN_MINUTES: 25,
  ATTEMPTS_PER_PURCHASE: 3,
  ATTEMPT_PRICE: 9.99,
  DEFAULT_CURRENCY: 'usd'
} as const;

// Certificate Configuration
export const CERTIFICATE_CONFIG = {
  VALIDITY_MONTHS: 6,
  LEVELS: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    MASTER: 'master'
  }
} as const;

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  PREMIUM: 'premium'
} as const;

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
} as const;

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
} as const;

// Payment Providers
export const PAYMENT_PROVIDERS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  RAZORPAY: 'razorpay',
  SQUARE: 'square',
  CUSTOM: 'custom'
} as const;

// PayPal Configuration
export const PAYPAL_CONFIG = {
  ENVIRONMENTS: {
    SANDBOX: 'sandbox',
    LIVE: 'live'
  },
  API_URLS: {
    SANDBOX: 'https://api-m.sandbox.paypal.com',
    LIVE: 'https://api-m.paypal.com'
  }
} as const;

// API Rate Limits (requests per minute)
export const RATE_LIMITS = {
  EMAIL_SEND: 10,
  QUIZ_START: 5,
  PAYMENT_CREATE: 20
} as const;

// Email Campaign Types
export const EMAIL_CAMPAIGN_TYPES = {
  WEEKLY_DIGEST: 'weekly_digest',
  ACHIEVEMENT: 'achievement',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  SUBSCRIPTION_UPDATE: 'subscription_update'
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0
} as const;