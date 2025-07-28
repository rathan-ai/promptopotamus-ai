-- Simplified Database Fix Migration
-- Fix the most critical database inconsistencies

-- Fix 1: Ensure all marketplace prompts have valid data
UPDATE saved_prompts 
SET 
    price = 0 
WHERE is_marketplace = true AND (price IS NULL OR price < 0);

UPDATE saved_prompts 
SET 
    downloads_count = 0 
WHERE downloads_count IS NULL;

UPDATE saved_prompts 
SET 
    rating_average = 0,
    rating_count = 0 
WHERE rating_average IS NULL OR rating_count IS NULL;

-- Fix 2: Clean up purchase records
DELETE FROM smart_prompt_purchases 
WHERE prompt_id NOT IN (SELECT id FROM saved_prompts);

UPDATE smart_prompt_purchases 
SET purchase_price = 0 
WHERE purchase_price IS NULL OR purchase_price < 0;

-- Fix 3: Update download counts based on actual purchases
UPDATE saved_prompts 
SET downloads_count = COALESCE(purchase_stats.purchase_count, 0)
FROM (
    SELECT 
        prompt_id,
        COUNT(*)::INTEGER as purchase_count
    FROM smart_prompt_purchases 
    GROUP BY prompt_id
) purchase_stats
WHERE saved_prompts.id = purchase_stats.prompt_id
AND saved_prompts.is_marketplace = true;

-- Fix 4: Ensure required fields for marketplace prompts
UPDATE saved_prompts 
SET 
    complexity_level = 'simple'
WHERE is_marketplace = true AND complexity_level IS NULL;

UPDATE saved_prompts 
SET 
    difficulty_level = 'beginner'
WHERE is_marketplace = true AND difficulty_level IS NULL;

UPDATE saved_prompts 
SET 
    category = 'Other'
WHERE is_marketplace = true AND (category IS NULL OR category = '');

-- Fix 5: Clean up PromptCoin transactions
DELETE FROM promptcoin_transactions 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Fix 6: Function to check purchase status easily
CREATE OR REPLACE FUNCTION user_has_purchased_prompt(user_uuid UUID, prompt_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM smart_prompt_purchases 
        WHERE buyer_id = user_uuid AND prompt_id = prompt_id_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 7: Create a comprehensive view for debugging purchases
CREATE OR REPLACE VIEW user_purchase_status AS
SELECT 
    p.id as user_id,
    COALESCE(p.username, p.id::text) as username,
    sp.id as prompt_id,
    sp.title,
    sp.price,
    CASE 
        WHEN spp.id IS NOT NULL THEN true 
        ELSE false 
    END as has_purchased,
    spp.purchased_at,
    spp.purchase_price
FROM profiles p
CROSS JOIN saved_prompts sp
LEFT JOIN smart_prompt_purchases spp ON (p.id = spp.buyer_id AND sp.id = spp.prompt_id)
WHERE sp.is_marketplace = true AND sp.is_public = true;

-- Grant access to authenticated users
GRANT SELECT ON user_purchase_status TO authenticated;

-- Create health check view
CREATE OR REPLACE VIEW database_health_check AS
SELECT 
    'Total Marketplace Prompts' as metric,
    COUNT(*)::TEXT as value
FROM saved_prompts 
WHERE is_marketplace = true AND is_public = true

UNION ALL

SELECT 
    'Total Purchases' as metric,
    COUNT(*)::TEXT as value
FROM smart_prompt_purchases

UNION ALL

SELECT 
    'Prompts with Purchases' as metric,
    COUNT(DISTINCT prompt_id)::TEXT as value
FROM smart_prompt_purchases

UNION ALL

SELECT 
    'Users with Purchases' as metric,
    COUNT(DISTINCT buyer_id)::TEXT as value
FROM smart_prompt_purchases;

GRANT SELECT ON database_health_check TO authenticated;