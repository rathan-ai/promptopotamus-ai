-- Migration to upgrade saved_prompts to smart_prompts system
-- This migration extends the existing saved_prompts table for marketplace functionality

-- First, let's add new columns to the existing saved_prompts table
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS complexity_level VARCHAR(20) CHECK (complexity_level IN ('simple', 'smart', 'recipe')) DEFAULT 'simple';
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]';
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS recipe_steps JSONB DEFAULT '[]';
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS use_cases TEXT[] DEFAULT '{}';
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner';
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS ai_model_compatibility TEXT[] DEFAULT '{}';

-- Marketplace specific columns
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS is_marketplace BOOLEAN DEFAULT false;
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS downloads_count INTEGER DEFAULT 0;
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS rating_average DECIMAL(3,2) DEFAULT 0;
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Example usage and metadata
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS example_inputs JSONB DEFAULT '{}';
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS example_outputs TEXT[] DEFAULT '{}';

-- Timestamps
ALTER TABLE saved_prompts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create smart prompt purchases table
CREATE TABLE IF NOT EXISTS smart_prompt_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id INTEGER REFERENCES saved_prompts(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    purchase_price DECIMAL(10,2) NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prompt_id, buyer_id)
);

-- Create smart prompt reviews table
CREATE TABLE IF NOT EXISTS smart_prompt_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id INTEGER REFERENCES saved_prompts(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prompt_id, reviewer_id)
);

-- Create user prompt collections table
CREATE TABLE IF NOT EXISTS user_prompt_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id INTEGER REFERENCES saved_prompts(id) ON DELETE CASCADE,
    collection_type VARCHAR(20) CHECK (collection_type IN ('purchased', 'favorite', 'created')) DEFAULT 'favorite',
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, prompt_id, collection_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_prompts_marketplace ON saved_prompts(is_marketplace, is_public) WHERE is_marketplace = true;
CREATE INDEX IF NOT EXISTS idx_saved_prompts_category ON saved_prompts(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_saved_prompts_complexity ON saved_prompts(complexity_level);
CREATE INDEX IF NOT EXISTS idx_saved_prompts_rating ON saved_prompts(rating_average DESC, rating_count DESC);
CREATE INDEX IF NOT EXISTS idx_smart_prompt_purchases_buyer ON smart_prompt_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_smart_prompt_purchases_seller ON smart_prompt_purchases(seller_id);

-- Add RLS policies for marketplace functionality
ALTER TABLE saved_prompts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can always see their own prompts
CREATE POLICY IF NOT EXISTS "Users can see their own prompts" ON saved_prompts
    FOR ALL USING (auth.uid() = user_id);

-- Policy: Users can see public marketplace prompts
CREATE POLICY IF NOT EXISTS "Users can see public marketplace prompts" ON saved_prompts
    FOR SELECT USING (is_marketplace = true AND is_public = true);

-- Policy: Users can see prompts they've purchased
CREATE POLICY IF NOT EXISTS "Users can see purchased prompts" ON saved_prompts
    FOR SELECT USING (
        is_marketplace = true AND 
        id IN (
            SELECT prompt_id FROM smart_prompt_purchases 
            WHERE buyer_id = auth.uid()
        )
    );

-- Policy: Only certified users can create marketplace prompts
CREATE POLICY IF NOT EXISTS "Only certified users can create marketplace prompts" ON saved_prompts
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND (
            is_marketplace = false OR 
            EXISTS (
                SELECT 1 FROM user_certificates 
                WHERE user_id = auth.uid() 
                AND expires_at > NOW()
            )
        )
    );

-- Policy: Only certified users can update prompts to marketplace
CREATE POLICY IF NOT EXISTS "Only certified users can set marketplace status" ON saved_prompts
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid() AND (
            is_marketplace = false OR 
            EXISTS (
                SELECT 1 FROM user_certificates 
                WHERE user_id = auth.uid() 
                AND expires_at > NOW()
            )
        )
    );

-- Purchases table policies
ALTER TABLE smart_prompt_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can see their purchases" ON smart_prompt_purchases
    FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can create purchases" ON smart_prompt_purchases
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Reviews table policies
ALTER TABLE smart_prompt_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can see reviews" ON smart_prompt_reviews
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can create reviews for purchased prompts" ON smart_prompt_reviews
    FOR INSERT WITH CHECK (
        reviewer_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM smart_prompt_purchases 
            WHERE prompt_id = smart_prompt_reviews.prompt_id 
            AND buyer_id = auth.uid()
        )
    );

-- Collections table policies
ALTER TABLE user_prompt_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage their collections" ON user_prompt_collections
    FOR ALL USING (user_id = auth.uid());

-- Update function to automatically set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_saved_prompts_updated_at ON saved_prompts;
CREATE TRIGGER update_saved_prompts_updated_at
    BEFORE UPDATE ON saved_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();