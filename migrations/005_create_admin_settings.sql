-- Create admin settings table for dynamic platform configuration
CREATE TABLE IF NOT EXISTS admin_settings (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL, -- 'subscription', 'limits', 'features', 'payments', etc.
    key TEXT NOT NULL,      -- setting identifier
    value JSONB NOT NULL,   -- setting value (can store strings, numbers, objects, arrays)
    description TEXT,       -- human-readable description
    data_type TEXT NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json', 'array'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(category, key)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_category_key ON admin_settings(category, key);
CREATE INDEX IF NOT EXISTS idx_admin_settings_active ON admin_settings(is_active);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy for admin access only
CREATE POLICY "Admin users can manage settings" ON admin_settings
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
);

-- Insert default platform settings
INSERT INTO admin_settings (category, key, value, description, data_type) VALUES
-- Subscription Pricing
('subscription', 'free_tier_price', '0', 'Price for Free tier subscription', 'number'),
('subscription', 'pro_tier_price', '9.99', 'Price for Pro tier subscription', 'number'),
('subscription', 'premium_tier_price', '19.99', 'Price for Premium tier subscription', 'number'),

-- Tool Usage Limits
('limits', 'prompt_builder_free_daily', '3', 'Daily AI enhancements for free users in Prompt Builder', 'number'),
('limits', 'prompt_analyzer_free_daily', '5', 'Daily analyses for free users in Prompt Analyzer', 'number'),
('limits', 'prompt_builder_pro_daily', '25', 'Daily AI enhancements for Pro users in Prompt Builder', 'number'),
('limits', 'prompt_analyzer_pro_daily', '50', 'Daily analyses for Pro users in Prompt Analyzer', 'number'),
('limits', 'prompt_builder_premium_daily', '-1', 'Daily AI enhancements for Premium users (-1 = unlimited)', 'number'),
('limits', 'prompt_analyzer_premium_daily', '-1', 'Daily analyses for Premium users (-1 = unlimited)', 'number'),

-- Smart Prompts Settings
('smart_prompts', 'max_free_prompts_personal', '10', 'Maximum personal prompts for non-certified users', 'number'),
('smart_prompts', 'default_commission_rate', '0.20', 'Default platform commission rate (20%)', 'number'),
('smart_prompts', 'pro_commission_rate', '0.15', 'Commission rate for Pro subscription sellers', 'number'),
('smart_prompts', 'premium_commission_rate', '0.10', 'Commission rate for Premium subscription sellers', 'number'),
('smart_prompts', 'allow_user_pricing', 'true', 'Allow users to set their own Smart Prompt prices', 'boolean'),
('smart_prompts', 'min_price', '1.00', 'Minimum price for paid Smart Prompts', 'number'),
('smart_prompts', 'max_price', '99.99', 'Maximum price for paid Smart Prompts', 'number'),

-- Certification Settings
('certification', 'free_attempts_per_level', '3', 'Free certification attempts per level', 'number'),
('certification', 'attempt_cooldown_days', '9', 'Cooldown period after exhausting attempts', 'number'),
('certification', 'certificate_validity_months', '6', 'Certificate validity period in months', 'number'),
('certification', 'failure_cascade_threshold', '3', 'Consecutive failures to drop level', 'number'),

-- Feature Toggles
('features', 'marketplace_enabled', 'true', 'Enable Smart Prompts marketplace', 'boolean'),
('features', 'reviews_enabled', 'true', 'Enable prompt reviews and ratings', 'boolean'),
('features', 'social_features_enabled', 'false', 'Enable social features (following, sharing)', 'boolean'),
('features', 'analytics_enabled', 'true', 'Enable platform analytics tracking', 'boolean'),

-- Payment Settings
('payments', 'payment_provider', '"paypal"', 'Primary payment provider', 'string'),
('payments', 'currency', '"USD"', 'Platform currency', 'string'),
('payments', 'processing_fee', '0.029', 'Payment processing fee rate', 'number'),
('payments', 'paypal_client_id', '""', 'PayPal Client ID', 'string'),
('payments', 'paypal_client_secret', '""', 'PayPal Client Secret (encrypted)', 'string'),
('payments', 'paypal_environment', '"sandbox"', 'PayPal Environment (sandbox or live)', 'string'),
('payments', 'stripe_publishable_key', '""', 'Stripe Publishable Key', 'string'),
('payments', 'stripe_secret_key', '""', 'Stripe Secret Key (encrypted)', 'string'),
('payments', 'razorpay_key_id', '""', 'Razorpay Key ID', 'string'),
('payments', 'razorpay_key_secret', '""', 'Razorpay Key Secret (encrypted)', 'string'),
('payments', 'square_application_id', '""', 'Square Application ID', 'string'),
('payments', 'square_access_token', '""', 'Square Access Token (encrypted)', 'string'),
('payments', 'custom_api_endpoint', '""', 'Custom Payment API Endpoint', 'string'),
('payments', 'custom_api_key', '""', 'Custom Payment API Key (encrypted)', 'string'),

-- Communication Settings  
('communication', 'support_email', 'support@promptopotamus.com', 'Platform support email', 'string'),
('communication', 'company_name', 'Innorag Technologies Private Limited', 'Company name for certificates', 'string'),
('communication', 'platform_name', 'Promptopotamus', 'Platform display name', 'string');

-- Create admin users management table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'admin', -- 'admin', 'super_admin', 'moderator'
    permissions JSONB DEFAULT '[]'::jsonb, -- array of permissions
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    last_active TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for admin users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy for admin users management
CREATE POLICY "Super admins can manage admin users" ON admin_users
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
);

CREATE POLICY "Admins can view admin users" ON admin_users
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (
            auth.users.raw_user_meta_data->>'role' = 'super_admin' OR
            auth.users.raw_user_meta_data->>'is_admin' = 'true'
        )
    )
);

-- Function to get settings by category
CREATE OR REPLACE FUNCTION get_admin_settings(setting_category TEXT DEFAULT NULL)
RETURNS TABLE (
    category TEXT,
    key TEXT,
    value JSONB,
    description TEXT,
    data_type TEXT
) AS $$
BEGIN
    IF setting_category IS NULL THEN
        RETURN QUERY
        SELECT s.category, s.key, s.value, s.description, s.data_type
        FROM admin_settings s
        WHERE s.is_active = true
        ORDER BY s.category, s.key;
    ELSE
        RETURN QUERY
        SELECT s.category, s.key, s.value, s.description, s.data_type
        FROM admin_settings s
        WHERE s.is_active = true AND s.category = setting_category
        ORDER BY s.key;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a specific setting value
CREATE OR REPLACE FUNCTION get_setting_value(setting_category TEXT, setting_key TEXT)
RETURNS JSONB AS $$
DECLARE
    setting_value JSONB;
BEGIN
    SELECT value INTO setting_value
    FROM admin_settings
    WHERE category = setting_category 
    AND key = setting_key 
    AND is_active = true;
    
    RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update setting value (admin only)
CREATE OR REPLACE FUNCTION update_setting_value(
    setting_category TEXT,
    setting_key TEXT,
    setting_value JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    UPDATE admin_settings 
    SET value = setting_value,
        updated_at = NOW(),
        updated_by = auth.uid()
    WHERE category = setting_category 
    AND key = setting_key;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;