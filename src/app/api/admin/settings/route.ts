import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Default values fallback (same as public API)
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
    paypal_client_id: '',
    paypal_client_secret: '',
    paypal_environment: 'sandbox',
    stripe_publishable_key: '',
    stripe_secret_key: '',
    razorpay_key_id: '',
    razorpay_key_secret: '',
    square_application_id: '',
    square_access_token: '',
    custom_api_endpoint: '',
    custom_api_key: '',
  },
  communication: {
    support_email: 'info@innorag.com',
    company_name: 'Innorag Technologies Private Limited',
    platform_name: 'Promptopotamus',
  },
};

// GET - Fetch admin settings
export async function GET(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check admin privileges using profiles table
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('admin_settings')
      .select('category, key, value, description, data_type, updated_at')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: settings, error } = await query.order('category').order('key');

    if (error) {
      console.error('Error fetching admin settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Group settings by category for easier frontend handling
    const groupedSettings: Record<string, any> = {};
    settings?.forEach(setting => {
      if (!groupedSettings[setting.category]) {
        groupedSettings[setting.category] = {};
      }
      
      // Parse the value based on data type (same as public API)
      let value = setting.value;
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch {
          // If parsing fails, keep as string
        }
      }
      
      // Store the parsed value directly (matching public API format)
      groupedSettings[setting.category][setting.key] = value;
    });

    // Merge with defaults to ensure all expected keys exist (same as public API)
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
      settings: category ? { [category]: groupedSettings[category] } : groupedSettings,
      raw: settings // Also provide raw format for specific use cases
    });

  } catch (error) {
    console.error('Error in admin settings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update admin settings
export async function PUT(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check admin privileges using profiles table
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { category, key, value, description } = await req.json();

    if (!category || !key || value === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: category, key, and value are required' 
      }, { status: 400 });
    }

    const updateData: any = {
      value: typeof value === 'object' ? value : JSON.parse(JSON.stringify(value)),
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    if (description) {
      updateData.description = description;
    }

    const { data, error } = await supabase
      .from('admin_settings')
      .update(updateData)
      .eq('category', category)
      .eq('key', key)
      .select();

    if (error) {
      console.error('Error updating admin setting:', error);
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Setting updated successfully',
      setting: data[0]
    });

  } catch (error) {
    console.error('Error in admin settings update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new admin setting
export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check admin privileges using profiles table
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { category, key, value, description, data_type = 'string' } = await req.json();

    if (!category || !key || value === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: category, key, and value are required' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('admin_settings')
      .insert({
        category,
        key,
        value: typeof value === 'object' ? value : JSON.parse(JSON.stringify(value)),
        description,
        data_type,
        created_at: new Date().toISOString(),
        updated_by: user.id
      })
      .select();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ 
          error: 'Setting already exists for this category and key' 
        }, { status: 409 });
      }
      console.error('Error creating admin setting:', error);
      return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Setting created successfully',
      setting: data[0]
    });

  } catch (error) {
    console.error('Error in admin settings creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}