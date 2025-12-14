-- Phase 6A: Social Learning, Gamification & Affiliate Integration (IDEMPOTENT VERSION)
-- This script can be run multiple times safely and will fix any existing issues

-- =============================================================================
-- CLEANUP: Remove any broken constraints and tables if they exist
-- =============================================================================

-- Drop broken foreign key constraints if they exist
ALTER TABLE IF EXISTS prompt_comments DROP CONSTRAINT IF EXISTS prompt_comments_prompt_id_fkey;

-- Drop and recreate prompt_comments table to fix type issues
DROP TABLE IF EXISTS prompt_comments CASCADE;

-- =============================================================================
-- TABLE CREATION: Create all tables with correct types and constraints
-- =============================================================================

-- Enhanced user profiles for social features
CREATE TABLE IF NOT EXISTS user_profiles_extended (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    bio TEXT,
    website VARCHAR(255),
    twitter_handle VARCHAR(255),
    linkedin_url VARCHAR(255),
    expertise_tags TEXT[], -- ['marketing', 'copywriting', 'ai-tools']
    reputation_score INTEGER DEFAULT 0,
    total_followers INTEGER DEFAULT 0,
    total_following INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- User follow system
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Achievement definitions
CREATE TABLE IF NOT EXISTS achievement_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    achievement_key VARCHAR(100) UNIQUE NOT NULL, -- 'first_prompt_created', 'streak_7_days'
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100), -- Icon identifier
    category VARCHAR(50), -- 'creation', 'engagement', 'social', 'learning'
    criteria JSONB NOT NULL, -- {'type': 'prompt_count', 'threshold': 1}
    reward_type VARCHAR(50) DEFAULT 'badge', -- 'badge', 'discount', 'feature_unlock'
    reward_value JSONB, -- {'discount_percent': 10, 'feature': 'premium_templates'}
    xp_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User achievements earned
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievement_definitions(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB, -- Additional context about how achievement was earned
    UNIQUE(user_id, achievement_id)
);

-- User engagement streaks
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    streak_type VARCHAR(50) NOT NULL, -- 'daily_login', 'prompt_creation', 'marketplace_activity'
    current_count INTEGER DEFAULT 0,
    longest_count INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, streak_type)
);

-- User experience points and levels
CREATE TABLE IF NOT EXISTS user_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    category_xp JSONB DEFAULT '{}', -- {'creation': 150, 'social': 75, 'learning': 200}
    last_xp_earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Comment system for paid prompts (CORRECTLY TYPED: prompt_id is INTEGER to match saved_prompts.id)
CREATE TABLE prompt_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id INTEGER NOT NULL REFERENCES saved_prompts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    parent_comment_id UUID REFERENCES prompt_comments(id) ON DELETE CASCADE, -- For replies
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate tracking system
CREATE TABLE IF NOT EXISTS affiliate_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_key VARCHAR(100) UNIQUE NOT NULL, -- 'openai', 'anthropic', 'jasper'
    partner_name VARCHAR(255) NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    commission_rate DECIMAL(5,4) DEFAULT 0.09, -- 9% = 0.09
    cookie_duration_days INTEGER DEFAULT 7,
    tracking_method VARCHAR(50) DEFAULT 'utm', -- 'utm', 'affiliate_code'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate click tracking
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Can be null for anonymous
    partner_id UUID REFERENCES affiliate_partners(id) ON DELETE CASCADE,
    click_source VARCHAR(100), -- 'prompt_creation', 'marketplace_browse', 'email_campaign'
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    referrer_url TEXT,
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(255),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate conversions tracking
CREATE TABLE IF NOT EXISTS affiliate_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    click_id UUID REFERENCES affiliate_clicks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES affiliate_partners(id) ON DELETE CASCADE,
    conversion_value DECIMAL(10,2), -- Sale amount
    commission_earned DECIMAL(10,2), -- Our 9% cut
    conversion_type VARCHAR(50), -- 'sale', 'signup', 'subscription'
    external_transaction_id VARCHAR(255), -- Partner's transaction ID
    converted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    attribution_method VARCHAR(50) DEFAULT 'last_click' -- 'first_click', 'last_click'
);

-- Email automation system
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_key VARCHAR(100) UNIQUE NOT NULL, -- 'weekly_digest', 'achievement_earned'
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(50), -- 'weekly', 'triggered', 'one_time'
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,
    trigger_criteria JSONB, -- Conditions for triggered emails
    send_schedule JSONB, -- {'day_of_week': 1, 'hour': 9} for weekly
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email send log
CREATE TABLE IF NOT EXISTS email_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    email_address VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
    external_message_id VARCHAR(255), -- From email service provider
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- User email preferences
CREATE TABLE IF NOT EXISTS user_email_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    weekly_digest BOOLEAN DEFAULT true,
    achievement_notifications BOOLEAN DEFAULT true,
    marketplace_updates BOOLEAN DEFAULT true,
    affiliate_recommendations BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- =============================================================================
-- INDEXES: Create all indexes (idempotent with IF NOT EXISTS)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_user_id ON user_profiles_extended(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_type ON user_streaks(streak_type);
CREATE INDEX IF NOT EXISTS idx_user_experience_user ON user_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_comments_prompt ON prompt_comments(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_comments_user ON prompt_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_comments_parent ON prompt_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_key ON affiliate_partners(partner_key);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user ON affiliate_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_partner ON affiliate_clicks(partner_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_session ON affiliate_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_click ON affiliate_conversions(click_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_key ON email_campaigns(campaign_key);
CREATE INDEX IF NOT EXISTS idx_email_sends_user ON email_sends(user_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_user_email_preferences_user ON user_email_preferences(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY: Enable and create policies (idempotent)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_email_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent cleanup)
DROP POLICY IF EXISTS "Users can view all public profiles" ON user_profiles_extended;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles_extended;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles_extended;
DROP POLICY IF EXISTS "Users can view all follows" ON user_follows;
DROP POLICY IF EXISTS "Users can manage their own follows" ON user_follows;
DROP POLICY IF EXISTS "Users can view all achievements" ON user_achievements;
DROP POLICY IF EXISTS "System can insert achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can view their own streaks" ON user_streaks;
DROP POLICY IF EXISTS "System can manage all streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can view their own XP" ON user_experience;
DROP POLICY IF EXISTS "System can manage all XP" ON user_experience;
DROP POLICY IF EXISTS "Users can view comments on prompts they purchased" ON prompt_comments;
DROP POLICY IF EXISTS "Users can create comments on purchased prompts" ON prompt_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON prompt_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON prompt_comments;
DROP POLICY IF EXISTS "Users can view their own email preferences" ON user_email_preferences;
DROP POLICY IF EXISTS "Users can manage their own email preferences" ON user_email_preferences;

-- Create RLS policies
CREATE POLICY "Users can view all public profiles" ON user_profiles_extended FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON user_profiles_extended FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON user_profiles_extended FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view all follows" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follows" ON user_follows FOR ALL USING (follower_id = auth.uid());

CREATE POLICY "Users can view all achievements" ON user_achievements FOR SELECT USING (true);
CREATE POLICY "System can insert achievements" ON user_achievements FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own streaks" ON user_streaks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can manage all streaks" ON user_streaks FOR ALL USING (true);

CREATE POLICY "Users can view their own XP" ON user_experience FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can manage all XP" ON user_experience FOR ALL USING (true);

CREATE POLICY "Users can view comments on prompts they purchased" ON prompt_comments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM smart_prompt_purchases 
        WHERE buyer_id = auth.uid() AND prompt_id = prompt_comments.prompt_id
    ) OR user_id = auth.uid()
);
CREATE POLICY "Users can create comments on purchased prompts" ON prompt_comments FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM smart_prompt_purchases 
        WHERE buyer_id = auth.uid() AND prompt_id = prompt_comments.prompt_id
    )
);
CREATE POLICY "Users can update their own comments" ON prompt_comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own comments" ON prompt_comments FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own email preferences" ON user_email_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own email preferences" ON user_email_preferences FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- SEED DATA: Insert initial data (idempotent with ON CONFLICT)
-- =============================================================================

-- Insert initial achievement definitions
INSERT INTO achievement_definitions (achievement_key, name, description, icon, category, criteria, xp_points) VALUES
('first_prompt_created', 'First Creator', 'Created your first Smart Prompt', 'star', 'creation', '{"type": "prompt_count", "threshold": 1}', 50),
('prompt_master_5', 'Prompt Artisan', 'Created 5 Smart Prompts', 'trophy', 'creation', '{"type": "prompt_count", "threshold": 5}', 100),
('prompt_master_10', 'Prompt Expert', 'Created 10 Smart Prompts', 'crown', 'creation', '{"type": "prompt_count", "threshold": 10}', 200),
('first_sale', 'First Sale', 'Made your first prompt sale', 'dollar-sign', 'creation', '{"type": "sales_count", "threshold": 1}', 100),
('sales_master_10', 'Sales Champion', 'Made 10 prompt sales', 'trending-up', 'creation', '{"type": "sales_count", "threshold": 10}', 300),
('first_purchase', 'Smart Shopper', 'Purchased your first Smart Prompt', 'shopping-cart', 'engagement', '{"type": "purchases_count", "threshold": 1}', 25),
('review_writer', 'Helpful Reviewer', 'Left 5 helpful reviews', 'message-circle', 'engagement', '{"type": "reviews_count", "threshold": 5}', 75),
('streak_7_days', 'Week Warrior', '7-day login streak', 'calendar', 'engagement', '{"type": "streak_days", "threshold": 7}', 100),
('streak_30_days', 'Monthly Master', '30-day login streak', 'flame', 'engagement', '{"type": "streak_days", "threshold": 30}', 500),
('social_butterfly', 'Social Butterfly', 'Followed 10 creators', 'users', 'social', '{"type": "follows_count", "threshold": 10}', 50),
('popular_creator', 'Popular Creator', 'Gained 25 followers', 'heart', 'social', '{"type": "followers_count", "threshold": 25}', 200),
('comment_contributor', 'Active Commenter', 'Left 20 helpful comments', 'message-square', 'social', '{"type": "comments_count", "threshold": 20}', 150),
('certified_promptling', 'Certified Promptling', 'Earned Level 1 Certification', 'award', 'learning', '{"type": "certificate_earned", "level": "promptling"}', 200),
('certified_promptosaur', 'Certified Promptosaur', 'Earned Level 2 Certification', 'award', 'learning', '{"type": "certificate_earned", "level": "promptosaur"}', 400),
('certified_promptopotamus', 'Certified Promptopotamus', 'Earned Level 3 Certification', 'award', 'learning', '{"type": "certificate_earned", "level": "promptopotamus"}', 800)
ON CONFLICT (achievement_key) DO NOTHING;

-- Insert initial affiliate partners
INSERT INTO affiliate_partners (partner_key, partner_name, base_url, commission_rate) VALUES
('openai', 'OpenAI', 'https://platform.openai.com', 0.09),
('anthropic', 'Anthropic Claude', 'https://claude.ai', 0.09),
('jasper', 'Jasper AI', 'https://jasper.ai', 0.09)
ON CONFLICT (partner_key) DO NOTHING;

-- Insert initial email campaigns
INSERT INTO email_campaigns (campaign_key, campaign_name, campaign_type, subject_template, html_template, text_template, send_schedule) VALUES
('weekly_digest', 'Weekly Promptopotamus Digest', 'weekly', 
 'Your Weekly AI Prompt Updates 🚀', 
 '<h1>Your Weekly Digest</h1><p>Hi {{user_name}},</p><p>Here''s what''s happening in your AI prompt journey...</p>',
 'Your Weekly Digest\n\nHi {{user_name}},\n\nHere''s what''s happening in your AI prompt journey...',
 '{"day_of_week": 1, "hour": 9}'
),
('achievement_earned', 'Achievement Unlocked!', 'triggered',
 '🏆 You earned: {{achievement_name}}',
 '<h1>Achievement Unlocked!</h1><p>Congratulations! You just earned: <strong>{{achievement_name}}</strong></p>',
 'Achievement Unlocked!\n\nCongratulations! You just earned: {{achievement_name}}',
 NULL
)
ON CONFLICT (campaign_key) DO NOTHING;

-- =============================================================================
-- VALIDATION: Verify the migration completed successfully
-- =============================================================================

-- This will show a success message if all tables were created
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'user_profiles_extended', 'user_follows', 'achievement_definitions', 
        'user_achievements', 'user_streaks', 'user_experience', 
        'prompt_comments', 'affiliate_partners', 'affiliate_clicks', 
        'affiliate_conversions', 'email_campaigns', 'email_sends', 
        'user_email_preferences'
    );
    
    IF table_count = 13 THEN
        RAISE NOTICE 'SUCCESS: All 13 engagement feature tables created successfully!';
        RAISE NOTICE 'Foreign key constraint for prompt_comments.prompt_id -> saved_prompts.id is properly typed as INTEGER.';
    ELSE
        RAISE NOTICE 'WARNING: Only % out of 13 expected tables were found.', table_count;
    END IF;
END $$;