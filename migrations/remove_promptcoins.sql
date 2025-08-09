-- Migration: Remove PromptCoin system and switch to direct USD payments
-- Date: 2025-01-09
-- Description: Removes PromptCoin columns and tables, updates to pay-as-you-go model

-- 1. Drop PromptCoin-related columns from profiles table
ALTER TABLE profiles 
DROP COLUMN IF EXISTS credits_analysis,
DROP COLUMN IF EXISTS credits_enhancement,
DROP COLUMN IF EXISTS credits_exam,
DROP COLUMN IF EXISTS credits_export,
DROP COLUMN IF EXISTS payment_status;

-- 2. Rename promptcoin_transactions to payment_transactions if it exists
ALTER TABLE IF EXISTS promptcoin_transactions 
RENAME TO payment_transactions;

-- 3. Add currency column to payment_transactions if it doesn't exist
ALTER TABLE payment_transactions 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- 4. Update payment_transactions type column values
UPDATE payment_transactions 
SET type = 'smart_prompt_purchase' 
WHERE type = 'purchase' AND description LIKE '%Smart Prompt%';

UPDATE payment_transactions 
SET type = 'feature_payment' 
WHERE type = 'usage';

-- 5. Create exam_attempts table if it doesn't exist
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

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_level ON exam_attempts(exam_level);

-- 7. Update smart_prompt_purchases to ensure proper USD pricing
ALTER TABLE smart_prompt_purchases 
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS seller_earnings DECIMAL(10, 2);

-- Calculate platform fees for existing purchases (20% fee)
UPDATE smart_prompt_purchases 
SET platform_fee = ROUND(price * 0.20, 2),
    seller_earnings = ROUND(price * 0.80, 2)
WHERE platform_fee IS NULL;

-- 8. Add feature usage tracking table
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

-- 9. Update RLS policies for new tables
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own payment transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own exam attempts" ON exam_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own feature usage" ON feature_usage
  FOR SELECT USING (auth.uid() = user_id);

-- 10. Clean up any orphaned PromptCoin references
-- This is a safe cleanup that won't break existing functionality

COMMENT ON TABLE payment_transactions IS 'Direct USD payment transactions for all platform features';
COMMENT ON TABLE exam_attempts IS 'Tracks exam attempt purchases and usage';
COMMENT ON TABLE feature_usage IS 'Tracks pay-per-use feature consumption';

-- Migration complete
-- Note: Run this migration in a transaction and test in development first