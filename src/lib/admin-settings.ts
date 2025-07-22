// Only client-side utilities - server-side functions moved to separate file

// Cache for settings to avoid repeated database calls
let settingsCache: Record<string, any> = {};
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Default values fallback
const DEFAULT_SETTINGS = {
  subscription: {
    free_tier_price: 0,
    pro_tier_price: 9.99,
    premium_tier_price: 19.99,
  },
  limits: {
    prompt_builder_free_daily: 3,
    prompt_analyzer_free_daily: 5,
    prompt_builder_pro_daily: 25,
    prompt_analyzer_pro_daily: 50,
    prompt_builder_premium_daily: -1,
    prompt_analyzer_premium_daily: -1,
  },
  smart_prompts: {
    max_free_prompts_personal: 10,
    default_commission_rate: 0.20,
    pro_commission_rate: 0.15,
    premium_commission_rate: 0.10,
    allow_user_pricing: true,
    min_price: 1.00,
    max_price: 99.99,
  },
  certification: {
    free_attempts_per_level: 3,
    attempt_cooldown_days: 9,
    certificate_validity_months: 6,
    failure_cascade_threshold: 3,
  },
  features: {
    marketplace_enabled: true,
    reviews_enabled: true,
    social_features_enabled: false,
    analytics_enabled: true,
  },
  payments: {
    payment_provider: 'paypal',
    currency: 'USD',
    processing_fee: 0.029,
  },
  communication: {
    support_email: 'support@promptopotamus.com',
    company_name: 'Innorag Technologies Private Limited',
    platform_name: 'Promptopotamus',
  },
};

// Client-side settings fetch (for components) - using API endpoint
export async function getSettings(category?: string): Promise<Record<string, any>> {
  const now = Date.now();
  
  // Return cached settings if still valid
  if (cacheExpiry > now && Object.keys(settingsCache).length > 0) {
    return category ? settingsCache[category] || {} : settingsCache;
  }

  try {
    // Use API endpoint for client-side calls
    const params = new URLSearchParams();
    if (category) {
      params.set('category', category);
    }
    
    const response = await fetch(`/api/public/settings?${params}`);
    
    if (!response.ok) {
      console.error('Error fetching settings from API:', response.statusText);
      return category ? DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS] || {} : DEFAULT_SETTINGS;
    }
    
    const { settings } = await response.json();

    // Merge with defaults to ensure all expected keys exist
    Object.keys(DEFAULT_SETTINGS).forEach(cat => {
      if (!settings[cat]) {
        settings[cat] = {};
      }
      Object.keys(DEFAULT_SETTINGS[cat as keyof typeof DEFAULT_SETTINGS]).forEach(key => {
        if (settings[cat][key] === undefined) {
          settings[cat][key] = (DEFAULT_SETTINGS[cat as keyof typeof DEFAULT_SETTINGS] as any)[key];
        }
      });
    });

    settingsCache = settings;
    cacheExpiry = now + CACHE_DURATION;

    return category ? settings[category] || {} : settings;
  } catch (error) {
    console.error('Error in getSettings:', error);
    return category ? DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS] || {} : DEFAULT_SETTINGS;
  }
}

// Server-side functions moved to server-admin-settings.ts to avoid import issues

// Utility function to get a specific setting value
export async function getSetting(category: string, key: string, defaultValue?: any): Promise<any> {
  const settings = await getSettings(category);
  return settings[key] ?? defaultValue ?? (DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS] as any)?.[key];
}

// Clear cache (useful after settings updates)
export function clearSettingsCache(): void {
  settingsCache = {};
  cacheExpiry = 0;
}

// Type definitions for better type safety
export interface SubscriptionSettings {
  free_tier_price: number;
  pro_tier_price: number;
  premium_tier_price: number;
}

export interface LimitSettings {
  prompt_builder_free_daily: number;
  prompt_analyzer_free_daily: number;
  prompt_builder_pro_daily: number;
  prompt_analyzer_pro_daily: number;
  prompt_builder_premium_daily: number;
  prompt_analyzer_premium_daily: number;
}

export interface SmartPromptSettings {
  max_free_prompts_personal: number;
  default_commission_rate: number;
  pro_commission_rate: number;
  premium_commission_rate: number;
  allow_user_pricing: boolean;
  min_price: number;
  max_price: number;
}

export interface CertificationSettings {
  free_attempts_per_level: number;
  attempt_cooldown_days: number;
  certificate_validity_months: number;
  failure_cascade_threshold: number;
}

export interface FeatureSettings {
  marketplace_enabled: boolean;
  reviews_enabled: boolean;
  social_features_enabled: boolean;
  analytics_enabled: boolean;
}

export interface PaymentSettings {
  payment_provider: string;
  currency: string;
  processing_fee: number;
}

export interface CommunicationSettings {
  support_email: string;
  company_name: string;
  platform_name: string;
}