// Core application constants

export const APP_CONFIG = {
  name: 'Promptopotamus',
  description: 'AI Prompt Engineering & Smart Prompts Marketplace',
  version: '1.0.0',
  author: 'Innorag Technologies Private Limited',
  url: 'https://promptopotamus.com',
  supportEmail: 'contact@innorag.com',
  enterpriseEmail: 'contact@innorag.com'
};

export const ROUTES = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  PRICING: '/pricing',
  TEMPLATES: '/templates',
  
  // Auth routes
  LOGIN: '/login',
  SIGNUP: '/signup',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Dashboard routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  
  // Feature routes
  SMART_PROMPTS: '/smart-prompts',
  CERTIFICATES: '/certificates',
  RESOURCES: '/resources',
  
  // Purchase routes
  PURCHASE: '/purchase',
  PURCHASE_SUCCESS: '/purchase/success',
  PURCHASE_CANCEL: '/purchase/cancel',
  
  // Help routes
  REFUND_POLICY: '/refund-policy',
  
  // Admin routes
  ADMIN: '/admin'
} as const;

export const API_ROUTES = {
  // Auth
  PROFILE: '/api/profile',
  
  // Prompts
  SMART_PROMPTS: '/api/smart-prompts',
  SMART_PROMPTS_MY: '/api/smart-prompts/my-prompts',
  SMART_PROMPTS_PURCHASE: '/api/smart-prompts/purchase',
  
  // Admin
  ADMIN_STATS: '/api/admin/stats',
  ADMIN_USERS: '/api/admin/users',
  
  // Webhooks
  WEBHOOK_STRIPE: '/api/webhooks/stripe',
  WEBHOOK_PAYPAL: '/api/webhooks/paypal'
} as const;

export const UI_CONFIG = {
  // Breakpoints (matching Tailwind defaults)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Animation durations
  animations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  
  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080
  }
};

export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
  },
  promptTitle: {
    minLength: 3,
    maxLength: 100,
    message: 'Title must be between 3 and 100 characters'
  },
  promptDescription: {
    minLength: 10,
    maxLength: 500,
    message: 'Description must be between 10 and 500 characters'
  }
};

export const LIMITS = {
  // Free user limits
  freeUser: {
    promptsPerDay: 10,
    analysisPerDay: 5,
    enhancementPerDay: 3,
    examAttemptsPerDay: 3,
    exportPerDay: 0
  },
  
  // File upload limits
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedDocTypes: ['application/pdf', 'text/plain']
  },
  
  // API limits
  api: {
    rateLimitPerMinute: 60,
    rateLimitPerHour: 1000,
    maxRequestSize: 10 * 1024 * 1024 // 10MB
  }
};

export const FEATURES = {
  // Feature flags
  flags: {
    smartPrompts: true,
    certificates: true,
    affiliates: true,
    analytics: true,
    webauthn: false,
    darkMode: true
  },
  
  // Payment providers
  payments: {
    stripe: true,
    paypal: true,
    crypto: false
  },
  
  // Social providers
  social: {
    google: true,
    github: true,
    discord: false
  }
};

export const MESSAGES = {
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.',
    unauthorized: 'You need to be logged in to access this feature.',
    forbidden: 'You don\'t have permission to access this resource.',
    notFound: 'The requested resource was not found.',
    validation: 'Please check your input and try again.',
    payment: 'Payment processing failed. Please try again or contact support.',
    quota: 'You have reached your usage limit. Please upgrade your plan.'
  },
  success: {
    saved: 'Changes saved successfully!',
    created: 'Created successfully!',
    updated: 'Updated successfully!',
    deleted: 'Deleted successfully!',
    purchased: 'Purchase completed successfully!',
    sent: 'Sent successfully!'
  }
} as const;

// Export types for constants
export type RouteKey = keyof typeof ROUTES;
export type APIRouteKey = keyof typeof API_ROUTES;
export type ErrorMessage = keyof typeof MESSAGES.errors;
export type SuccessMessage = keyof typeof MESSAGES.success;