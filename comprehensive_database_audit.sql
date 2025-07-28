-- Comprehensive Database Schema Audit
-- This script will identify all potential inconsistencies across the entire database

-- ===========================================
-- SECTION 1: TABLE STRUCTURE VALIDATION
-- ===========================================

-- Check for missing or inconsistent columns across related tables
SELECT 
    'Missing Columns Check' as audit_type,
    'profiles table structure' as check_name,
    CASE 
        WHEN COUNT(column_name) FILTER (WHERE column_name = 'promptcoins') = 0 THEN 'MISSING: promptcoins column'
        WHEN COUNT(column_name) FILTER (WHERE column_name = 'total_xp') = 0 THEN 'MISSING: total_xp column'
        WHEN COUNT(column_name) FILTER (WHERE column_name = 'current_level') = 0 THEN 'MISSING: current_level column'
        ELSE 'OK'
    END as status
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'

UNION ALL

SELECT 
    'Missing Columns Check',
    'saved_prompts marketplace columns',
    CASE 
        WHEN COUNT(column_name) FILTER (WHERE column_name = 'is_marketplace') = 0 THEN 'MISSING: is_marketplace column'
        WHEN COUNT(column_name) FILTER (WHERE column_name = 'is_public') = 0 THEN 'MISSING: is_public column'
        WHEN COUNT(column_name) FILTER (WHERE column_name = 'price') = 0 THEN 'MISSING: price column'
        ELSE 'OK'
    END
FROM information_schema.columns 
WHERE table_name = 'saved_prompts' AND table_schema = 'public';

-- ===========================================
-- SECTION 2: DATA CONSISTENCY CHECKS
-- ===========================================

-- Check 1: Profiles table inconsistencies
SELECT 
    'Profiles Data' as audit_type,
    'NULL usernames' as check_name,
    COUNT(*)::text as count,
    'Users without usernames (may cause display issues)' as description
FROM profiles 
WHERE username IS NULL

UNION ALL

SELECT 
    'Profiles Data',
    'Negative PromptCoin balances',
    COUNT(*)::text,
    'Users with negative balances (should not be possible)'
FROM profiles 
WHERE promptcoins < 0

UNION ALL

SELECT 
    'Profiles Data',
    'Orphaned auth users',
    COUNT(*)::text,
    'Auth users without profile records'
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Check 2: Smart Prompts inconsistencies
SELECT 
    'Smart Prompts Data' as audit_type,
    'Public but not marketplace' as check_name,
    COUNT(*)::text as count,
    'Prompts marked public but not marketplace (inconsistent state)' as description
FROM saved_prompts 
WHERE is_public = true AND is_marketplace = false

UNION ALL

SELECT 
    'Smart Prompts Data',
    'Marketplace prompts without prices',
    COUNT(*)::text,
    'Marketplace prompts with NULL prices'
FROM saved_prompts 
WHERE is_marketplace = true AND price IS NULL

UNION ALL

SELECT 
    'Smart Prompts Data',
    'Negative prices',
    COUNT(*)::text,
    'Prompts with negative prices'
FROM saved_prompts 
WHERE price < 0

UNION ALL

SELECT 
    'Smart Prompts Data',
    'Missing categories',
    COUNT(*)::text,
    'Marketplace prompts without categories'
FROM saved_prompts 
WHERE is_marketplace = true AND (category IS NULL OR category = '')

UNION ALL

SELECT 
    'Smart Prompts Data',
    'Orphaned prompts',
    COUNT(*)::text,
    'Prompts with non-existent user_id'
FROM saved_prompts sp
LEFT JOIN profiles p ON sp.user_id = p.id
WHERE p.id IS NULL;

-- Check 3: Purchase system inconsistencies
SELECT 
    'Purchase System' as audit_type,
    'Orphaned purchases' as check_name,
    COUNT(*)::text as count,
    'Purchases referencing non-existent prompts' as description
FROM smart_prompt_purchases spp
LEFT JOIN saved_prompts sp ON spp.prompt_id = sp.id
WHERE sp.id IS NULL

UNION ALL

SELECT 
    'Purchase System',
    'Invalid buyer references',
    COUNT(*)::text,
    'Purchases with non-existent buyer_id'
FROM smart_prompt_purchases spp
LEFT JOIN profiles p ON spp.buyer_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'Purchase System',
    'Invalid seller references',
    COUNT(*)::text,
    'Purchases with non-existent seller_id'
FROM smart_prompt_purchases spp
LEFT JOIN profiles p ON spp.seller_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'Purchase System',
    'Self-purchases',
    COUNT(*)::text,
    'Users who purchased their own prompts'
FROM smart_prompt_purchases spp
WHERE spp.buyer_id = spp.seller_id

UNION ALL

SELECT 
    'Purchase System',
    'Price mismatches',
    COUNT(*)::text,
    'Purchases where purchase_price differs significantly from current prompt price'
FROM smart_prompt_purchases spp
JOIN saved_prompts sp ON spp.prompt_id = sp.id
WHERE ABS(spp.purchase_price - sp.price) > 0.01 AND sp.price > 0;

-- Check 4: PromptCoin transaction consistency
SELECT 
    'PromptCoin System' as audit_type,
    'Balance calculation errors' as check_name,
    COUNT(*)::text as count,
    'Transactions where balance_after != balance_before + amount' as description
FROM promptcoin_transactions 
WHERE balance_after != balance_before + amount

UNION ALL

SELECT 
    'PromptCoin System',
    'Orphaned transactions',
    COUNT(*)::text,
    'Transactions for non-existent users'
FROM promptcoin_transactions pt
LEFT JOIN profiles p ON pt.user_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'PromptCoin System',
    'Profile balance mismatches',
    COUNT(*)::text,
    'Users where profile balance != sum of transactions'
FROM (
    SELECT 
        p.id,
        p.promptcoins as profile_balance,
        COALESCE(SUM(pt.amount), 0) as calculated_balance
    FROM profiles p
    LEFT JOIN promptcoin_transactions pt ON p.id = pt.user_id
    GROUP BY p.id, p.promptcoins
    HAVING p.promptcoins != COALESCE(SUM(pt.amount), 0)
) balance_check;

-- Check 5: Reviews system inconsistencies  
SELECT 
    'Reviews System' as audit_type,
    'Orphaned reviews' as check_name,
    COUNT(*)::text as count,
    'Reviews for non-existent prompts' as description
FROM smart_prompt_reviews spr
LEFT JOIN saved_prompts sp ON spr.prompt_id = sp.id
WHERE sp.id IS NULL

UNION ALL

SELECT 
    'Reviews System',
    'Invalid reviewer references',
    COUNT(*)::text,
    'Reviews by non-existent users'
FROM smart_prompt_reviews spr
LEFT JOIN profiles p ON spr.reviewer_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'Reviews System',
    'Rating calculation mismatches',
    COUNT(*)::text,
    'Prompts where calculated rating != stored rating'
FROM (
    SELECT 
        sp.id,
        sp.rating_average as stored_rating,
        sp.rating_count as stored_count,
        COALESCE(AVG(spr.rating), 0) as calculated_rating,
        COUNT(spr.id) as calculated_count
    FROM saved_prompts sp
    LEFT JOIN smart_prompt_reviews spr ON sp.id = spr.prompt_id
    WHERE sp.is_marketplace = true
    GROUP BY sp.id, sp.rating_average, sp.rating_count
    HAVING 
        ABS(sp.rating_average - COALESCE(AVG(spr.rating), 0)) > 0.1 OR
        sp.rating_count != COUNT(spr.id)
) rating_check;

-- Check 6: Social features inconsistencies
SELECT 
    'Social Features' as audit_type,
    'Self-follows' as check_name,
    COUNT(*)::text as count,
    'Users following themselves (should be prevented by constraint)' as description
FROM user_follows 
WHERE follower_id = following_id

UNION ALL

SELECT 
    'Social Features',
    'Orphaned follows - follower',
    COUNT(*)::text,
    'Follows with non-existent follower'
FROM user_follows uf
LEFT JOIN profiles p ON uf.follower_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'Social Features',
    'Orphaned follows - following',
    COUNT(*)::text,
    'Follows with non-existent following user'
FROM user_follows uf
LEFT JOIN profiles p ON uf.following_id = p.id
WHERE p.id IS NULL;

-- Check 7: Admin settings and security
SELECT 
    'Admin System' as audit_type,
    'Missing critical settings' as check_name,
    CASE 
        WHEN COUNT(*) FILTER (WHERE setting_key = 'promptcoin_exchange_rate') = 0 THEN 'MISSING: promptcoin_exchange_rate'
        WHEN COUNT(*) FILTER (WHERE setting_key = 'payment_providers') = 0 THEN 'MISSING: payment_providers'
        ELSE COUNT(*)::text || ' settings found'
    END as count,
    'Critical admin settings status' as description
FROM admin_settings 
WHERE setting_key IN ('promptcoin_exchange_rate', 'payment_providers', 'security_monitoring')

UNION ALL

SELECT 
    'Security System',
    'Unresolved security events',
    COUNT(*)::text,
    'Security events that need attention'
FROM payment_security_events 
WHERE resolved_at IS NULL AND severity IN ('high', 'critical');

-- ===========================================
-- SECTION 3: CONSTRAINT AND INDEX VALIDATION
-- ===========================================

-- Check for missing or weak constraints
SELECT 
    'Constraints' as audit_type,
    'Foreign key violations' as check_name,
    'Check manually' as count,
    'Review all foreign key relationships' as description

UNION ALL

-- Check for missing indexes on frequently queried columns
SELECT 
    'Performance',
    'Missing indexes',
    'Review needed',
    'Check if all foreign keys and frequently queried columns have indexes';

-- ===========================================
-- SECTION 4: SUMMARY AND RECOMMENDATIONS
-- ===========================================

-- Create a summary view of all critical issues
SELECT 
    'SUMMARY' as audit_type,
    'Critical Issues Found' as check_name,
    COUNT(*)::text as count,
    'Issues requiring immediate attention' as description
FROM (
    -- Count all the critical issues we found above
    SELECT 1 FROM profiles WHERE promptcoins < 0
    UNION ALL
    SELECT 1 FROM saved_prompts WHERE is_public = true AND is_marketplace = false
    UNION ALL
    SELECT 1 FROM smart_prompt_purchases spp LEFT JOIN saved_prompts sp ON spp.prompt_id = sp.id WHERE sp.id IS NULL
    UNION ALL
    SELECT 1 FROM promptcoin_transactions WHERE balance_after != balance_before + amount
) critical_issues;