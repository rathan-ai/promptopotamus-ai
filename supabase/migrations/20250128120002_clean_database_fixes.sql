-- Clean Database Fixes - Final Version
-- This migration focuses only on essential data cleanup

-- Fix 1: Ensure all marketplace prompts have valid prices
UPDATE saved_prompts 
SET price = 0 
WHERE is_marketplace = true AND (price IS NULL OR price < 0);

-- Fix 2: Set default values for NULL fields
UPDATE saved_prompts 
SET 
    downloads_count = 0 
WHERE downloads_count IS NULL;

UPDATE saved_prompts 
SET 
    rating_average = 0,
    rating_count = 0 
WHERE rating_average IS NULL OR rating_count IS NULL;

-- Fix 3: Clean up orphaned purchase records
DELETE FROM smart_prompt_purchases 
WHERE prompt_id NOT IN (SELECT id FROM saved_prompts);

-- Fix 4: Update download counts based on actual purchases
WITH purchase_counts AS (
    SELECT 
        prompt_id,
        COUNT(*)::INTEGER as purchase_count
    FROM smart_prompt_purchases 
    GROUP BY prompt_id
)
UPDATE saved_prompts 
SET downloads_count = purchase_counts.purchase_count
FROM purchase_counts
WHERE saved_prompts.id = purchase_counts.prompt_id
AND saved_prompts.is_marketplace = true;

-- Fix 5: Ensure required fields for marketplace prompts
UPDATE saved_prompts 
SET complexity_level = 'simple'
WHERE is_marketplace = true AND complexity_level IS NULL;

UPDATE saved_prompts 
SET difficulty_level = 'beginner'
WHERE is_marketplace = true AND difficulty_level IS NULL;

UPDATE saved_prompts 
SET category = 'Other'
WHERE is_marketplace = true AND (category IS NULL OR category = '');

-- Fix 6: Create function to check if user has purchased a prompt
CREATE OR REPLACE FUNCTION check_user_purchase(user_uuid UUID, prompt_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM smart_prompt_purchases 
        WHERE buyer_id = user_uuid AND prompt_id = prompt_id_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 7: Create database health summary
CREATE OR REPLACE VIEW marketplace_health AS
SELECT 
    'Total Marketplace Prompts' as metric,
    COUNT(*)::TEXT as value,
    'Prompts available for purchase' as description
FROM saved_prompts 
WHERE is_marketplace = true AND is_public = true

UNION ALL

SELECT 
    'Total Purchases' as metric,
    COUNT(*)::TEXT as value,
    'All purchase transactions' as description
FROM smart_prompt_purchases

UNION ALL

SELECT 
    'Free Prompts' as metric,
    COUNT(*)::TEXT as value,
    'Marketplace prompts with zero price' as description
FROM saved_prompts 
WHERE is_marketplace = true AND is_public = true AND price = 0

UNION ALL

SELECT 
    'Paid Prompts' as metric,
    COUNT(*)::TEXT as value,
    'Marketplace prompts with non-zero price' as description
FROM saved_prompts 
WHERE is_marketplace = true AND is_public = true AND price > 0;

-- Grant access to authenticated users
GRANT SELECT ON marketplace_health TO authenticated;

-- Success message
SELECT 'Database consistency fixes applied successfully!' as status;