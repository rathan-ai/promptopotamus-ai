-- Migration: Remove PromptCoin system and switch to direct USD payments
-- Date: 2025-01-09
-- Description: Removes PromptCoin columns and tables, updates to pay-as-you-go model
-- Version: 3.0 - Fixed column names

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

-- 5. Handle promptcoin_transactions to payment_transactions conversion
DO $$ 
BEGIN
    -- Check if promptcoin_transactions exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promptcoin_transactions') THEN
        -- Check if payment_transactions already exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_transactions') THEN
            -- Create payment_transactions as a proper payment tracking table
            CREATE TABLE payment_transactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'USD',
                description TEXT,
                transaction_id VARCHAR(255) UNIQUE,
                payment_provider VARCHAR(50),
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            -- Migrate data from promptcoin_transactions to payment_transactions
            INSERT INTO payment_transactions (id, user_id, type, amount, description, created_at, metadata)
            SELECT 
                id,
                user_id,
                CASE 
                    WHEN transaction_type = 'purchase' THEN 'promptcoin_purchase'
                    WHEN transaction_type = 'spend' THEN 'feature_usage'
                    WHEN transaction_type = 'earn' THEN 'earning'
                    WHEN transaction_type = 'refund' THEN 'refund'
                    ELSE transaction_type
                END as type,
                CAST(amount AS DECIMAL(10, 2)) / 100.0 as amount, -- Convert PromptCoins to USD (100 PC = $1)
                description,
                created_at,
                metadata
            FROM promptcoin_transactions;
            
            -- Drop the old table
            DROP TABLE promptcoin_transactions CASCADE;
        ELSE
            -- payment_transactions already exists, just ensure it has all needed columns
            ALTER TABLE payment_transactions 
            ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
            ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50);
            
            -- Migrate any remaining promptcoin_transactions data
            INSERT INTO payment_transactions (user_id, type, amount, description, created_at, metadata)
            SELECT 
                user_id,
                'legacy_promptcoin',
                CAST(amount AS DECIMAL(10, 2)) / 100.0 as amount,
                COALESCE(description, 'Legacy PromptCoin transaction'),
                created_at,
                jsonb_build_object(
                    'original_type', transaction_type,
                    'reference_type', reference_type,
                    'reference_id', reference_id,
                    'original_amount_pc', amount
                )
            FROM promptcoin_transactions
            WHERE NOT EXISTS (
                SELECT 1 FROM payment_transactions pt 
                WHERE pt.id = promptcoin_transactions.id
            );
            
            -- Drop the old table
            DROP TABLE IF EXISTS promptcoin_transactions CASCADE;
        END IF;
    ELSE
        -- promptcoin_transactions doesn't exist, ensure payment_transactions exists
        CREATE TABLE IF NOT EXISTS payment_transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'USD',
            description TEXT,
            transaction_id VARCHAR(255) UNIQUE,
            payment_provider VARCHAR(50),
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- 6. Update payment_transactions type values for consistency
UPDATE payment_transactions 
SET type = 'smart_prompt_purchase' 
WHERE type IN ('promptcoin_purchase', 'purchase') 
  AND (description LIKE '%Smart Prompt%' OR description LIKE '%recipe%');

UPDATE payment_transactions 
SET type = 'feature_payment' 
WHERE type IN ('spend', 'usage', 'feature_usage');

-- 7. Create exam_attempts table if it doesn't exist
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

-- 8. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON payment_transactions(type);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_level ON exam_attempts(exam_level);

-- 9. Update smart_prompt_purchases to ensure proper USD pricing
ALTER TABLE smart_prompt_purchases 
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS seller_earnings DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);

-- Copy purchase_price to price column if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'smart_prompt_purchases' 
               AND column_name = 'purchase_price') THEN
        UPDATE smart_prompt_purchases 
        SET price = purchase_price
        WHERE price IS NULL;
    END IF;
END $$;

-- Calculate platform fees for existing purchases (20% fee)
UPDATE smart_prompt_purchases 
SET platform_fee = ROUND(COALESCE(price, purchase_price, 0) * 0.20, 2),
    seller_earnings = ROUND(COALESCE(price, purchase_price, 0) * 0.80, 2)
WHERE platform_fee IS NULL;

-- 10. Add feature usage tracking table
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

-- 11. Update RLS policies for new tables
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

-- 12. Create a new view for user earnings (replacement for promptcoin balance)
CREATE OR REPLACE VIEW user_earnings AS
SELECT 
    p.id as user_id,
    COALESCE(p.full_name, p.username, 'User') as display_name,
    COALESCE(SUM(spp.seller_earnings), 0) as total_earnings,
    COUNT(DISTINCT spp.id) as total_sales,
    MAX(spp.purchased_at) as last_sale_date
FROM profiles p
LEFT JOIN smart_prompt_purchases spp ON spp.seller_id = p.id
GROUP BY p.id, p.full_name, p.username;

-- Grant permissions on the new view
GRANT SELECT ON user_earnings TO authenticated;

-- 13. Clean up any orphaned PromptCoin references
COMMENT ON TABLE payment_transactions IS 'Direct USD payment transactions for all platform features';
COMMENT ON TABLE exam_attempts IS 'Tracks exam attempt purchases and usage';
COMMENT ON TABLE feature_usage IS 'Tracks pay-per-use feature consumption';
COMMENT ON VIEW user_earnings IS 'Tracks user earnings from Smart Prompt sales';

-- 14. Display migration summary
DO $$
DECLARE
    payment_count INTEGER;
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO payment_count FROM payment_transactions;
    SELECT COUNT(DISTINCT user_id) INTO user_count FROM payment_transactions;
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Migrated % payment records for % users', payment_count, user_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update application code to use payment_transactions table';
    RAISE NOTICE '2. Test payment flows with new USD-based system';
    RAISE NOTICE '3. Update any reporting queries to use new table structure';
    RAISE NOTICE '===========================================';
END $$;

-- Migration complete!