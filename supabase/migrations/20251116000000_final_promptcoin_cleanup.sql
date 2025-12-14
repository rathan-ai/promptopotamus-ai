-- Final PromptCoin Cleanup Migration
-- Date: 2025-11-16
-- Description: Comprehensive cleanup of all PromptCoin economy references
-- This migration safely removes all PromptCoin-related database objects

-- ============================================================
-- STEP 1: Drop dependent views and triggers
-- ============================================================

DROP VIEW IF EXISTS user_promptcoin_balance CASCADE;
DROP TRIGGER IF EXISTS trigger_promptcoin_audit ON profiles CASCADE;

-- ============================================================
-- STEP 2: Drop PromptCoin-related functions
-- ============================================================

DROP FUNCTION IF EXISTS calculate_promptcoin_balance() CASCADE;
DROP FUNCTION IF EXISTS update_promptcoin_balance() CASCADE;
DROP FUNCTION IF EXISTS audit_promptcoin_changes() CASCADE;
DROP FUNCTION IF EXISTS log_promptcoin_transaction(UUID, INTEGER, VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS purchase_smart_prompt_with_pc(UUID, UUID, UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS deduct_promptcoins(UUID, INTEGER, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS add_promptcoins(UUID, INTEGER, VARCHAR, VARCHAR) CASCADE;

-- ============================================================
-- STEP 3: Drop PromptCoin-related columns from profiles
-- ============================================================

ALTER TABLE profiles
DROP COLUMN IF EXISTS credits_analysis CASCADE,
DROP COLUMN IF EXISTS credits_enhancement CASCADE,
DROP COLUMN IF EXISTS credits_exam CASCADE,
DROP COLUMN IF EXISTS credits_export CASCADE,
DROP COLUMN IF EXISTS credits_templates CASCADE,
DROP COLUMN IF EXISTS promptcoins CASCADE;

-- ============================================================
-- STEP 4: Handle promptcoin_transactions table
-- ============================================================

-- Check if promptcoin_transactions table exists and drop it
-- (We're switching to direct payment tracking via payment_security_events)
DROP TABLE IF EXISTS promptcoin_transactions CASCADE;

-- ============================================================
-- STEP 5: Update smart_prompt_purchases table
-- ============================================================

-- Remove PromptCoin-specific columns
ALTER TABLE smart_prompt_purchases
DROP COLUMN IF EXISTS promptcoins_used CASCADE,
DROP COLUMN IF EXISTS promptcoin_amount CASCADE;

-- Update payment_provider constraint to remove 'promptcoins' option
ALTER TABLE smart_prompt_purchases
DROP CONSTRAINT IF EXISTS check_purchase_method,
DROP CONSTRAINT IF EXISTS smart_prompt_purchases_payment_provider_check;

-- Add updated constraint without PromptCoins
ALTER TABLE smart_prompt_purchases
ADD CONSTRAINT smart_prompt_purchases_payment_provider_check
CHECK (payment_provider IN ('stripe', 'paypal', 'free', 'custom'));

-- Ensure we have proper USD pricing columns
ALTER TABLE smart_prompt_purchases
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50) DEFAULT 'stripe',
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);

-- Migrate any old price data to amount_paid if needed
UPDATE smart_prompt_purchases
SET amount_paid = purchase_price
WHERE amount_paid IS NULL AND purchase_price IS NOT NULL;

-- ============================================================
-- STEP 6: Drop PromptCoin-related indexes
-- ============================================================

DROP INDEX IF EXISTS idx_purchases_promptcoins;
DROP INDEX IF EXISTS idx_promptcoin_transactions_user_id;
DROP INDEX IF EXISTS idx_promptcoin_transactions_type;

-- ============================================================
-- STEP 7: Update payment_security_events metadata
-- ============================================================

-- Clean up any PromptCoin references in event metadata
-- This is informational only, doesn't change data
COMMENT ON TABLE payment_security_events IS 'Security monitoring and audit trail for direct USD payments (PromptCoin system removed 2025-11-16)';

-- ============================================================
-- STEP 8: Add helper function for download count increment
-- ============================================================

CREATE OR REPLACE FUNCTION increment_download_count(p_prompt_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE saved_prompts
  SET downloads_count = COALESCE(downloads_count, 0) + 1
  WHERE id = p_prompt_id;
END;
$$;

-- ============================================================
-- STEP 9: Verify and update RLS policies
-- ============================================================

-- Ensure smart_prompt_purchases has proper RLS
ALTER TABLE smart_prompt_purchases ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own purchases" ON smart_prompt_purchases;
DROP POLICY IF EXISTS "Users can view promptcoin purchases" ON smart_prompt_purchases;

-- Create new policy for USD purchases
CREATE POLICY "Users can view own purchases" ON smart_prompt_purchases
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (SELECT user_id FROM saved_prompts WHERE id = smart_prompt_id)
  );

-- ============================================================
-- STEP 10: Create migration summary view
-- ============================================================

-- Create a simple view showing USD-based earnings for sellers
CREATE OR REPLACE VIEW seller_earnings_summary AS
SELECT
    sp.user_id as seller_id,
    p.email,
    p.full_name,
    COUNT(DISTINCT spp.id) as total_sales,
    COALESCE(SUM(spp.amount_paid), 0) as total_revenue_usd,
    COALESCE(SUM(spp.amount_paid * 0.80), 0) as seller_earnings_usd,
    COALESCE(SUM(spp.amount_paid * 0.20), 0) as platform_fees_usd,
    MAX(spp.created_at) as last_sale_date
FROM saved_prompts sp
LEFT JOIN smart_prompt_purchases spp ON spp.smart_prompt_id = sp.id
LEFT JOIN profiles p ON p.id = sp.user_id
WHERE sp.is_marketplace = true
GROUP BY sp.user_id, p.email, p.full_name;

GRANT SELECT ON seller_earnings_summary TO authenticated;

-- ============================================================
-- STEP 11: Clean up old migration tracking
-- ============================================================

-- Record this migration in comments
COMMENT ON TABLE smart_prompt_purchases IS 'Smart Prompt marketplace purchases (Direct USD payments only - PromptCoins removed 2025-11-16)';
COMMENT ON TABLE profiles IS 'User profiles (PromptCoin credits removed 2025-11-16, now uses direct USD payments)';

-- ============================================================
-- FINAL: Log migration completion
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PromptCoin Cleanup Migration Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Removed:';
    RAISE NOTICE '  - PromptCoin credit columns from profiles';
    RAISE NOTICE '  - promptcoin_transactions table';
    RAISE NOTICE '  - PromptCoin-related functions and triggers';
    RAISE NOTICE '  - PromptCoin purchase constraints';
    RAISE NOTICE '';
    RAISE NOTICE 'Added:';
    RAISE NOTICE '  - Direct USD payment tracking in smart_prompt_purchases';
    RAISE NOTICE '  - seller_earnings_summary view (USD-based)';
    RAISE NOTICE '  - increment_download_count() helper function';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Update application code to remove PromptCoin references';
    RAISE NOTICE '  2. Test Smart Prompt purchases with Stripe/PayPal';
    RAISE NOTICE '  3. Remove old PromptCoin migration files';
    RAISE NOTICE '========================================';
END $$;
