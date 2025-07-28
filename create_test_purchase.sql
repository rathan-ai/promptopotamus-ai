-- Create test purchase data to verify the purchase status display works

-- First, let's check what we have
WITH user_info AS (
    SELECT id, username 
    FROM profiles 
    WHERE username IS NOT NULL 
    LIMIT 1
),
prompt_info AS (
    SELECT id, title, price
    FROM saved_prompts 
    WHERE is_marketplace = true AND is_public = true
    AND title ILIKE '%blog post writer%'
    LIMIT 1
)
SELECT 
    'Current State' as check_type,
    u.id as user_id,
    u.username,
    p.id as prompt_id,
    p.title,
    p.price,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM smart_prompt_purchases spp 
            WHERE spp.buyer_id = u.id AND spp.prompt_id = p.id
        ) THEN 'Already Purchased'
        ELSE 'Not Purchased'
    END as purchase_status
FROM user_info u, prompt_info p;

-- If "The Ultimate Blog Post Writer" prompt exists but no purchase record,
-- let's create one for testing (only if it doesn't exist)
WITH test_user AS (
    SELECT id FROM profiles 
    WHERE username IS NOT NULL 
    LIMIT 1
),
test_prompt AS (
    SELECT id, price FROM saved_prompts 
    WHERE is_marketplace = true AND is_public = true
    AND title ILIKE '%blog post writer%'
    LIMIT 1
)
INSERT INTO smart_prompt_purchases (
    prompt_id,
    buyer_id,
    seller_id,
    purchase_price,
    purchased_at
)
SELECT 
    tp.id,
    tu.id,
    (SELECT user_id FROM saved_prompts WHERE id = tp.id), -- seller is the creator
    tp.price,
    NOW()
FROM test_user tu, test_prompt tp
WHERE NOT EXISTS (
    SELECT 1 FROM smart_prompt_purchases spp
    WHERE spp.buyer_id = tu.id AND spp.prompt_id = tp.id
)
AND EXISTS (SELECT 1 FROM test_user)
AND EXISTS (SELECT 1 FROM test_prompt);

-- Verify the test purchase was created
SELECT 
    'After Test Purchase' as check_type,
    spp.id as purchase_id,
    p.username as buyer,
    sp.title as prompt_title,
    spp.purchase_price,
    spp.purchased_at
FROM smart_prompt_purchases spp
JOIN profiles p ON spp.buyer_id = p.id
JOIN saved_prompts sp ON spp.prompt_id = sp.id
WHERE sp.title ILIKE '%blog post writer%'
ORDER BY spp.purchased_at DESC
LIMIT 1;