-- Migration: Remove PromptCoin system and switch to direct USD payments
-- Date: 2025-01-09
-- Description: Removes PromptCoin columns and tables, updates to pay-as-you-go model
-- Version: 2.0 - Handles dependencies

-- 1. Drop dependent views first
DROP VIEW IF EXISTS user_promptcoin_balance CASCADE;

-- 2. Drop dependent triggers
DROP TRIGGER IF EXISTS trigger_promptcoin_audit ON profiles;

-- 3. Drop any functions related to PromptCoins
DROP FUNCTION IF EXISTS calculate_promptcoin_balance() CASCADE;
DROP FUNCTION IF EXISTS update_promptcoin_balance() CASCADE;
DROP FUNCTION IF EXISTS audit_promptcoin_changes() CASCADE;

-- 4. Now safely drop PromptCoin-related columns from profiles table
ALTER TABLE profiles 
DROP COLUMN IF EXISTS credits_analysis CASCADE,
DROP COLUMN IF EXISTS credits_enhancement CASCADE,
DROP COLUMN IF EXISTS credits_exam CASCADE,
DROP COLUMN IF EXISTS credits_export CASCADE,
DROP COLUMN IF EXISTS payment_status CASCADE;

-- 5. Rename promptcoin_transactions to payment_transactions if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promptcoin_transactions') THEN
        ALTER TABLE promptcoin_transactions RENAME TO payment_transactions;
    END IF;
END $$;

-- 6. Add currency column to payment_transactions if it doesn't exist
ALTER TABLE payment_transactions 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- 7. Update payment_transactions type column values
UPDATE payment_transactions 
SET type = 'smart_prompt_purchase' 
WHERE type = 'purchase' AND description LIKE '%Smart Prompt%';

UPDATE payment_transactions 
SET type = 'feature_payment' 
WHERE type = 'usage';

-- 8. Create exam_attempts table if it doesn't exist
CREATE TABLE IF NOT EXISTS exam_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_level VARCHAR(50) NOT NULL,
  payment_amount DECIMAL(10, 2) NOT NULL,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  payment_provider VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  exam_result JSONB
);

-- 9. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_level ON exam_attempts(exam_level);

-- 10. Update smart_prompt_purchases to ensure proper USD pricing
ALTER TABLE smart_prompt_purchases 
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS seller_earnings DECIMAL(10, 2);

-- Calculate platform fees for existing purchases (20% fee)
UPDATE smart_prompt_purchases 
SET platform_fee = ROUND(price * 0.20, 2),
    seller_earnings = ROUND(price * 0.80, 2)
WHERE platform_fee IS NULL;

-- 11. Add feature usage tracking table
CREATE TABLE IF NOT EXISTS feature_usage (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  payment_amount DECIMAL(10, 2) NOT NULL,
  payment_provider VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_type ON feature_usage(feature_type);

-- 12. Update RLS policies for new tables
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own payment transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can view own exam attempts" ON exam_attempts;
DROP POLICY IF EXISTS "Users can view own feature usage" ON feature_usage;

-- Create new policies
CREATE POLICY "Users can view own payment transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own exam attempts" ON exam_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own feature usage" ON feature_usage
  FOR SELECT USING (auth.uid() = user_id);

-- 13. Create a new view for user earnings (replacement for promptcoin balance)
CREATE OR REPLACE VIEW user_earnings AS
SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    COALESCE(SUM(spp.seller_earnings), 0) as total_earnings,
    COUNT(DISTINCT spp.id) as total_sales,
    MAX(spp.created_at) as last_sale_date
FROM profiles p
LEFT JOIN smart_prompt_purchases spp ON spp.seller_id = p.id
GROUP BY p.id, p.email, p.full_name;

-- Grant permissions on the new view
GRANT SELECT ON user_earnings TO authenticated;

-- 14. Clean up any orphaned PromptCoin references
COMMENT ON TABLE payment_transactions IS 'Direct USD payment transactions for all platform features';
COMMENT ON TABLE exam_attempts IS 'Tracks exam attempt purchases and usage';
COMMENT ON TABLE feature_usage IS 'Tracks pay-per-use feature consumption';
COMMENT ON VIEW user_earnings IS 'Tracks user earnings from Smart Prompt sales';

-- 15. List any remaining objects that might reference PromptCoins (for manual review)
DO $$
BEGIN
    RAISE NOTICE 'Migration complete. Please manually review the following:';
    RAISE NOTICE '1. Any custom functions that referenced credits columns';
    RAISE NOTICE '2. Any application code that queries the old columns';
    RAISE NOTICE '3. Any scheduled jobs or cron tasks related to PromptCoins';
END $$;

-- Migration complete
-- Note: This migration drops dependent objects. Make sure to backup your database first!