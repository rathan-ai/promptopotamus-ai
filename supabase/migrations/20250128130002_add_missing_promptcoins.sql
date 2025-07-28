-- Add missing PromptCoin column and fix database inconsistencies

-- Add the missing promptcoins column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS promptcoins INTEGER DEFAULT 0;

-- Add other missing columns that should exist based on the consolidated schema
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'free' CHECK (type IN ('free', 'paid'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS paymentStatus VARCHAR(20) DEFAULT 'inactive' CHECK (paymentStatus IN ('active', 'inactive', 'cancelled', 'past_due'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscriptionId VARCHAR(255);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS customerId VARCHAR(255);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;

-- Now run a proper audit of what we have
DO $$
DECLARE
    audit_results TEXT := '';
    temp_count INTEGER;
BEGIN
    audit_results := audit_results || E'\n=== DATABASE INCONSISTENCY AUDIT ===\n';
    
    -- Check 1: Profiles with negative PromptCoins
    SELECT COUNT(*) INTO temp_count FROM profiles WHERE promptcoins < 0;
    audit_results := audit_results || 'Negative PromptCoin balances: ' || temp_count::text || E'\n';
    
    -- Check 2: Smart Prompts inconsistencies
    SELECT COUNT(*) INTO temp_count FROM saved_prompts WHERE is_public = true AND is_marketplace = false;
    audit_results := audit_results || 'Public but not marketplace prompts: ' || temp_count::text || E'\n';
    
    SELECT COUNT(*) INTO temp_count FROM saved_prompts WHERE is_marketplace = true AND price IS NULL;
    audit_results := audit_results || 'Marketplace prompts without prices: ' || temp_count::text || E'\n';
    
    SELECT COUNT(*) INTO temp_count FROM saved_prompts WHERE price < 0;
    audit_results := audit_results || 'Prompts with negative prices: ' || temp_count::text || E'\n';
    
    -- Check 3: Orphaned records
    SELECT COUNT(*) INTO temp_count 
    FROM saved_prompts sp
    LEFT JOIN profiles p ON sp.user_id = p.id
    WHERE p.id IS NULL;
    audit_results := audit_results || 'Orphaned prompts (no valid user): ' || temp_count::text || E'\n';
    
    SELECT COUNT(*) INTO temp_count
    FROM smart_prompt_purchases spp
    LEFT JOIN saved_prompts sp ON spp.prompt_id = sp.id
    WHERE sp.id IS NULL;
    audit_results := audit_results || 'Orphaned purchases (no valid prompt): ' || temp_count::text || E'\n';
    
    SELECT COUNT(*) INTO temp_count
    FROM smart_prompt_purchases spp
    LEFT JOIN profiles p ON spp.buyer_id = p.id
    WHERE p.id IS NULL;
    audit_results := audit_results || 'Purchases with invalid buyer: ' || temp_count::text || E'\n';
    
    -- Check 4: Self-purchases
    SELECT COUNT(*) INTO temp_count FROM smart_prompt_purchases WHERE buyer_id = seller_id;
    audit_results := audit_results || 'Self-purchases: ' || temp_count::text || E'\n';
    
    -- Check 5: PromptCoin transaction issues
    SELECT COUNT(*) INTO temp_count FROM promptcoin_transactions WHERE balance_after != balance_before + amount;
    audit_results := audit_results || 'Transaction balance calculation errors: ' || temp_count::text || E'\n';
    
    -- Check 6: Missing categories for marketplace prompts
    SELECT COUNT(*) INTO temp_count FROM saved_prompts WHERE is_marketplace = true AND (category IS NULL OR category = '');
    audit_results := audit_results || 'Marketplace prompts without categories: ' || temp_count::text || E'\n';
    
    -- Summary statistics
    audit_results := audit_results || E'\n=== SUMMARY STATISTICS ===\n';
    
    SELECT COUNT(*) INTO temp_count FROM profiles;
    audit_results := audit_results || 'Total users: ' || temp_count::text || E'\n';
    
    SELECT COUNT(*) INTO temp_count FROM saved_prompts WHERE is_marketplace = true;
    audit_results := audit_results || 'Marketplace prompts: ' || temp_count::text || E'\n';
    
    SELECT COUNT(*) INTO temp_count FROM smart_prompt_purchases;
    audit_results := audit_results || 'Total purchases: ' || temp_count::text || E'\n';
    
    SELECT COUNT(*) INTO temp_count FROM promptcoin_transactions;
    audit_results := audit_results || 'PromptCoin transactions: ' || temp_count::text || E'\n';
    
    RAISE NOTICE '%', audit_results;
END $$;

-- Fix any immediate issues found
UPDATE saved_prompts 
SET category = 'Other' 
WHERE is_marketplace = true AND (category IS NULL OR category = '');

UPDATE saved_prompts 
SET price = 0 
WHERE is_marketplace = true AND price IS NULL;

-- Create a view for ongoing monitoring
CREATE OR REPLACE VIEW database_consistency_monitor AS
SELECT 
    'Negative PromptCoin balances' as issue_type,
    COUNT(*)::text as count,
    'critical' as severity
FROM profiles 
WHERE promptcoins < 0

UNION ALL

SELECT 
    'Orphaned prompts',
    COUNT(*)::text,
    'critical'
FROM saved_prompts sp
LEFT JOIN profiles p ON sp.user_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'Orphaned purchases',
    COUNT(*)::text,
    'critical'
FROM smart_prompt_purchases spp
LEFT JOIN saved_prompts sp ON spp.prompt_id = sp.id
WHERE sp.id IS NULL

UNION ALL

SELECT 
    'Self-purchases',
    COUNT(*)::text,
    'warning'
FROM smart_prompt_purchases 
WHERE buyer_id = seller_id

UNION ALL

SELECT 
    'Transaction balance errors',
    COUNT(*)::text,
    'critical'
FROM promptcoin_transactions 
WHERE balance_after != balance_before + amount;

-- Grant access to monitor view
GRANT SELECT ON database_consistency_monitor TO authenticated;

SELECT 'Database audit and fixes completed successfully!' as status;