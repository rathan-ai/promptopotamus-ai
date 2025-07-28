-- Test and verify purchase data

-- First, let's see what users exist
SELECT id, username, promptcoins, created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Check what marketplace prompts exist
SELECT 
    id,
    title,
    price,
    user_id as creator_id,
    downloads_count,
    is_marketplace,
    is_public
FROM saved_prompts 
WHERE is_marketplace = true AND is_public = true
ORDER BY title;

-- Check existing purchase records
SELECT 
    buyer_id,
    prompt_id,
    purchase_price,
    purchased_at
FROM smart_prompt_purchases
ORDER BY purchased_at DESC;

-- For debugging: Show the relationship between profiles and purchases
SELECT 
    p.id as user_id,
    p.username,
    COUNT(spp.id) as purchase_count,
    STRING_AGG(sp.title, ', ') as purchased_prompts
FROM profiles p
LEFT JOIN smart_prompt_purchases spp ON p.id = spp.buyer_id
LEFT JOIN saved_prompts sp ON spp.prompt_id = sp.id
GROUP BY p.id, p.username
HAVING COUNT(spp.id) > 0
ORDER BY purchase_count DESC;