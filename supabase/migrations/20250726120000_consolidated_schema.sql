-- Consolidated Migration: Complete Promptopotamus Schema
-- This migration consolidates all schema changes from the old migrations/ directory

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create affiliate_resources table
CREATE TABLE IF NOT EXISTS affiliate_resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    description TEXT,
    price VARCHAR(50),
    category VARCHAR(100),
    badge VARCHAR(100),
    color VARCHAR(50),
    icon VARCHAR(10),
    affiliate_link TEXT NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    rating DECIMAL(2,1) DEFAULT 5.0,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for affiliate resources
CREATE INDEX IF NOT EXISTS idx_affiliate_resources_active ON affiliate_resources(is_active);
CREATE INDEX IF NOT EXISTS idx_affiliate_resources_category ON affiliate_resources(category);

-- 2. Add subscription and payment fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'free' CHECK (type IN ('free', 'paid')),
ADD COLUMN IF NOT EXISTS paymentStatus VARCHAR(20) DEFAULT 'inactive' CHECK (paymentStatus IN ('active', 'inactive', 'cancelled', 'past_due')),
ADD COLUMN IF NOT EXISTS subscriptionId VARCHAR(255),
ADD COLUMN IF NOT EXISTS customerId VARCHAR(255),
ADD COLUMN IF NOT EXISTS billingCycle VARCHAR(20) DEFAULT 'monthly' CHECK (billingCycle IN ('monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS subscriptionStartDate TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscriptionEndDate TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS lastPaymentDate TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS nextPaymentDate TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS paymentMethod VARCHAR(50),
ADD COLUMN IF NOT EXISTS credits_analysis INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_enhancement INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_templates INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS promptcoins INTEGER DEFAULT 0;

-- Add indexes for payment queries
CREATE INDEX IF NOT EXISTS idx_profiles_payment_status ON profiles(paymentStatus);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_id ON profiles(subscriptionId) WHERE subscriptionId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_customer_id ON profiles(customerId) WHERE customerId IS NOT NULL;

-- 3. Create smart_prompt_purchases table
CREATE TABLE IF NOT EXISTS smart_prompt_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    smart_prompt_id UUID NOT NULL,
    purchase_price DECIMAL(10,2),
    promptcoins_used INTEGER DEFAULT 0,
    payment_provider VARCHAR(20) DEFAULT 'stripe' CHECK (payment_provider IN ('stripe', 'paypal', 'promptcoins', 'free', 'custom')),
    transaction_id VARCHAR(255),
    refund_status VARCHAR(20) DEFAULT NULL CHECK (refund_status IN ('pending', 'completed', 'failed', 'cancelled')),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure either payment or promptcoins used
    CONSTRAINT check_purchase_method CHECK (
        (purchase_price > 0 AND payment_provider IN ('stripe', 'paypal')) OR
        (promptcoins_used > 0 AND payment_provider = 'promptcoins') OR
        (payment_provider = 'free')
    )
);

-- Add indexes for purchases
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON smart_prompt_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_prompt_id ON smart_prompt_purchases(smart_prompt_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_provider ON smart_prompt_purchases(payment_provider);
CREATE INDEX IF NOT EXISTS idx_purchases_transaction_id ON smart_prompt_purchases(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_purchases_promptcoins ON smart_prompt_purchases(promptcoins_used) WHERE promptcoins_used > 0;

-- 4. Add PayPal support fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS paypal_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS paypal_payer_id VARCHAR(255);

-- 5. Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for admin settings
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_admin_settings_category ON admin_settings(category);

-- 6. Phase 6 Engagement Features
-- User experience points and achievements
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS study_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS learning_preferences JSONB DEFAULT '{}'::jsonb;

-- Social learning features
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent self-follows and duplicate follows
    CONSTRAINT unique_follow UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- User activity feed
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for social features
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- Smart prompt reviews and ratings
CREATE TABLE IF NOT EXISTS smart_prompt_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    smart_prompt_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One review per user per prompt
    CONSTRAINT unique_user_prompt_review UNIQUE(user_id, smart_prompt_id)
);

-- Review helpfulness tracking
CREATE TABLE IF NOT EXISTS review_helpfulness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES smart_prompt_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One helpfulness vote per user per review
    CONSTRAINT unique_user_review_helpfulness UNIQUE(review_id, user_id)
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_smart_prompt_reviews_prompt_id ON smart_prompt_reviews(smart_prompt_id);
CREATE INDEX IF NOT EXISTS idx_smart_prompt_reviews_user_id ON smart_prompt_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_prompt_reviews_rating ON smart_prompt_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review_id ON review_helpfulness(review_id);

-- Learning analytics
CREATE TABLE IF NOT EXISTS learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL, -- 'quiz', 'prompt_creation', 'template_use', etc.
    content_id VARCHAR(255), -- ID of quiz, prompt, template, etc.
    duration_minutes INTEGER,
    completion_rate DECIMAL(5,2), -- Percentage completion
    performance_score DECIMAL(5,2), -- Performance metric
    xp_earned INTEGER DEFAULT 0,
    session_data JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for learning analytics
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_type ON learning_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_started_at ON learning_sessions(started_at);

-- 7. PromptCoin transaction audit trail
CREATE TABLE IF NOT EXISTS promptcoin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL DEFAULT 0,
    balance_after INTEGER NOT NULL DEFAULT 0,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'earn', 'refund', 'admin_credit', 'admin_debit')),
    reference_type VARCHAR(30), -- 'recipe_purchase', 'credit_purchase', 'analysis', 'enhancement', etc.
    reference_id VARCHAR(255),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure amount makes sense for transaction type
    CONSTRAINT check_amount_sign CHECK (
        (transaction_type IN ('purchase', 'earn', 'refund', 'admin_credit') AND amount > 0) OR
        (transaction_type IN ('spend', 'admin_debit') AND amount < 0)
    )
);

-- Add indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_promptcoin_transactions_user_id ON promptcoin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_promptcoin_transactions_type ON promptcoin_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_promptcoin_transactions_reference ON promptcoin_transactions(reference_type, reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_promptcoin_transactions_created_at ON promptcoin_transactions(created_at);

-- 8. Payment security events table
CREATE TABLE IF NOT EXISTS payment_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(30) NOT NULL,
    severity VARCHAR(10) NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    request_data JSONB DEFAULT '{}',
    response_data JSONB DEFAULT '{}',
    error_details TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for security monitoring
CREATE INDEX IF NOT EXISTS idx_security_events_type ON payment_security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON payment_security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON payment_security_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON payment_security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_unresolved ON payment_security_events(resolved_at) WHERE resolved_at IS NULL;

-- 9. Security functions
-- Function to log payment security events
CREATE OR REPLACE FUNCTION log_payment_security_event(
    p_event_type VARCHAR(30),
    p_severity VARCHAR(10) DEFAULT 'low',
    p_user_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_request_data JSONB DEFAULT '{}',
    p_response_data JSONB DEFAULT '{}',
    p_error_details TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO payment_security_events (
        event_type, severity, user_id, ip_address, user_agent,
        request_data, response_data, error_details
    ) VALUES (
        p_event_type, p_severity, p_user_id, p_ip_address, p_user_agent,
        p_request_data, p_response_data, p_error_details
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update PromptCoin balance with audit trail
CREATE OR REPLACE FUNCTION update_promptcoin_balance(
    p_user_id UUID,
    p_amount INTEGER,
    p_transaction_type VARCHAR(20),
    p_reference_type VARCHAR(30) DEFAULT NULL,
    p_reference_id VARCHAR(255) DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
    transaction_record RECORD;
BEGIN
    -- Get current balance
    SELECT COALESCE(promptcoins, 0) INTO current_balance
    FROM profiles 
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found: %', p_user_id;
    END IF;
    
    -- Calculate new balance
    new_balance := current_balance + p_amount;
    
    -- Prevent negative balances for spend transactions
    IF new_balance < 0 AND p_transaction_type = 'spend' THEN
        RAISE EXCEPTION 'Insufficient PromptCoin balance. Current: %, Requested: %', current_balance, ABS(p_amount);
    END IF;
    
    -- Update profile balance
    UPDATE profiles 
    SET promptcoins = new_balance,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Record transaction
    INSERT INTO promptcoin_transactions (
        user_id, amount, balance_before, balance_after,
        transaction_type, reference_type, reference_id, description, metadata
    ) VALUES (
        p_user_id, p_amount, current_balance, new_balance,
        p_transaction_type, p_reference_type, p_reference_id, p_description, p_metadata
    ) RETURNING * INTO transaction_record;
    
    -- Return transaction details
    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', transaction_record.id,
        'balance_before', current_balance,
        'balance_after', new_balance,
        'amount', p_amount,
        'transaction_type', p_transaction_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create helpful views
-- User PromptCoin balance view
CREATE OR REPLACE VIEW user_promptcoin_balance AS
SELECT 
    p.id as user_id,
    p.email,
    p.username,
    COALESCE(p.promptcoins, 0) as current_balance,
    (
        SELECT COUNT(*)
        FROM promptcoin_transactions pt
        WHERE pt.user_id = p.id
    ) as total_transactions,
    (
        SELECT SUM(amount)
        FROM promptcoin_transactions pt
        WHERE pt.user_id = p.id AND transaction_type = 'purchase'
    ) as total_purchased,
    (
        SELECT SUM(ABS(amount))
        FROM promptcoin_transactions pt
        WHERE pt.user_id = p.id AND transaction_type = 'spend'
    ) as total_spent
FROM profiles p;

-- Recent security events view
CREATE OR REPLACE VIEW recent_security_events AS
SELECT 
    event_type,
    severity,
    COUNT(*) as event_count,
    MAX(created_at) as last_occurrence,
    COUNT(DISTINCT user_id) as affected_users
FROM payment_security_events
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY event_type, severity
ORDER BY severity DESC, event_count DESC;

-- User activity summary view
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
    p.id as user_id,
    p.email,
    p.username,
    p.total_xp,
    p.current_level,
    p.study_streak,
    (
        SELECT COUNT(*)
        FROM user_follows uf
        WHERE uf.follower_id = p.id
    ) as following_count,
    (
        SELECT COUNT(*)
        FROM user_follows uf
        WHERE uf.following_id = p.id
    ) as followers_count,
    (
        SELECT COUNT(*)
        FROM smart_prompt_reviews spr
        WHERE spr.user_id = p.id
    ) as reviews_written,
    (
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM smart_prompt_reviews spr
        WHERE spr.user_id = p.id
    ) as avg_rating_given
FROM profiles p;

-- Row Level Security (RLS) Policies
-- Enable RLS on sensitive tables
ALTER TABLE promptcoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_prompt_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpfulness ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_prompt_purchases ENABLE ROW LEVEL SECURITY;

-- PromptCoin transactions - users can only see their own
CREATE POLICY "Users can view own promptcoin transactions" ON promptcoin_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- User follows - users can manage their own follows and see public follows
CREATE POLICY "Users can manage own follows" ON user_follows
    FOR ALL USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- User activities - users can manage their own activities, see public activities
CREATE POLICY "Users can view public activities" ON user_activities
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own activities" ON user_activities
    FOR ALL USING (auth.uid() = user_id);

-- Smart prompt reviews - users can manage their own reviews, see all public reviews
CREATE POLICY "Users can view all reviews" ON smart_prompt_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own reviews" ON smart_prompt_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON smart_prompt_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON smart_prompt_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Review helpfulness - users can vote on reviews
CREATE POLICY "Users can manage review helpfulness" ON review_helpfulness
    FOR ALL USING (auth.uid() = user_id);

-- Learning sessions - users can only see their own sessions
CREATE POLICY "Users can manage own learning sessions" ON learning_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Smart prompt purchases - users can only see their own purchases
CREATE POLICY "Users can view own purchases" ON smart_prompt_purchases
    FOR SELECT USING (auth.uid() = user_id);

-- Admin-only access for security events and admin settings
CREATE POLICY "Only service role can access security events" ON payment_security_events
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Only service role can access admin settings" ON admin_settings
    FOR ALL USING (auth.role() = 'service_role');

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description, category) VALUES
('promptcoin_exchange_rate', '{"usd_per_100_pc": 1.00}', 'Exchange rate: 100 PromptCoins = $1 USD', 'economy'),
('max_daily_promptcoin_earn', '{"limit": 500}', 'Maximum PromptCoins a user can earn per day', 'economy'),
('payment_providers', '{"enabled": ["stripe", "paypal", "promptcoins"]}', 'Enabled payment providers', 'payments'),
('security_monitoring', '{"enabled": true, "alert_thresholds": {"failed_payments": 5, "suspicious_activity": 3}}', 'Security monitoring configuration', 'security'),
('social_features', '{"enabled": true, "max_follows": 1000}', 'Social learning feature configuration', 'features')
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- Migration completed successfully
SELECT 'Consolidated schema migration completed successfully' as status;