-- Query current database status after fixes

-- Check marketplace health
SELECT * FROM marketplace_health;

-- Check specific prompts and their purchase status
SELECT 
    id,
    title,
    price,
    downloads_count,
    is_marketplace,
    is_public,
    category,
    created_at
FROM saved_prompts 
WHERE is_marketplace = true 
ORDER BY downloads_count DESC, title;

-- Check all purchase records
SELECT 
    spp.id,
    spp.prompt_id,
    spp.buyer_id,
    spp.purchase_price,
    spp.purchased_at,
    sp.title as prompt_title,
    sp.price as current_price
FROM smart_prompt_purchases spp
JOIN saved_prompts sp ON spp.prompt_id = sp.id
ORDER BY spp.purchased_at DESC;

-- Check if "The Ultimate Blog Post Writer" exists and its purchase status
SELECT 
    sp.id,
    sp.title,
    sp.price,
    sp.downloads_count,
    COUNT(spp.id) as total_purchases
FROM saved_prompts sp
LEFT JOIN smart_prompt_purchases spp ON sp.id = spp.prompt_id
WHERE sp.title ILIKE '%blog post writer%'
GROUP BY sp.id, sp.title, sp.price, sp.downloads_count;