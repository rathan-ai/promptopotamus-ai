-- Debug Smart Prompt Purchases Issue
-- Let's check the current state of purchases and prompts

-- 1. Check all marketplace prompts
SELECT 
    'Marketplace Prompts' as section,
    id,
    title,
    price,
    is_marketplace,
    is_public,
    user_id,
    created_at
FROM saved_prompts 
WHERE is_marketplace = true AND is_public = true
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check smart_prompt_purchases table structure and data
SELECT 
    'Purchase Records' as section,
    spp.id,
    spp.prompt_id,
    spp.buyer_id,
    spp.seller_id,
    spp.purchase_price,
    spp.purchased_at,
    sp.title as prompt_title
FROM smart_prompt_purchases spp
JOIN saved_prompts sp ON spp.prompt_id = sp.id
ORDER BY spp.purchased_at DESC
LIMIT 5;

-- 3. Check for specific user's purchases (if any)
SELECT 
    'User Purchase Check' as section,
    p.email,
    p.username,
    COUNT(spp.id) as total_purchases,
    SUM(spp.purchase_price) as total_spent
FROM profiles p
LEFT JOIN smart_prompt_purchases spp ON p.id = spp.buyer_id
GROUP BY p.id, p.email, p.username
HAVING COUNT(spp.id) > 0
ORDER BY total_purchases DESC
LIMIT 5;

-- 4. Check PromptCoin transactions
SELECT 
    'PromptCoin Transactions' as section,
    pt.user_id,
    pt.amount,
    pt.transaction_type,
    pt.reference_type,
    pt.description,
    pt.created_at
FROM promptcoin_transactions pt
ORDER BY pt.created_at DESC
LIMIT 5;