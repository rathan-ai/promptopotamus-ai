import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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

// GET - Fetch public settings (no authentication required for basic settings)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const supabase = await createServerClient();
    
    let query = supabase
      .from('admin_settings')
      .select('category, key, value, data_type')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: settings, error } = await query.order('category').order('key');

    if (error) {
      console.error('Error fetching public settings:', error);
      return NextResponse.json({ 
        success: true, 
        settings: category ? { [category]: DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS] } : DEFAULT_SETTINGS 
      });
    }

    // Group settings by category
    const groupedSettings: Record<string, any> = {};
    settings?.forEach(setting => {
      if (!groupedSettings[setting.category]) {
        groupedSettings[setting.category] = {};
      }
      
      // Parse the value based on data type
      let value = setting.value;
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch {
          // If parsing fails, keep as string
        }
      }
      
      groupedSettings[setting.category][setting.key] = value;
    });

    // Merge with defaults to ensure all expected keys exist
    Object.keys(DEFAULT_SETTINGS).forEach(cat => {
      if (!groupedSettings[cat]) {
        groupedSettings[cat] = {};
      }
      Object.keys(DEFAULT_SETTINGS[cat as keyof typeof DEFAULT_SETTINGS]).forEach(key => {
        if (groupedSettings[cat][key] === undefined) {
          groupedSettings[cat][key] = (DEFAULT_SETTINGS[cat as keyof typeof DEFAULT_SETTINGS] as any)[key];
        }
      });
    });

    return NextResponse.json({ 
      success: true, 
      settings: category ? { [category]: groupedSettings[category] } : groupedSettings
    });

  } catch (error) {
    console.error('Error in public settings API:', error);
    return NextResponse.json({ 
      success: true, 
      settings: category ? { [category]: DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS] } : DEFAULT_SETTINGS 
    });
  }
}