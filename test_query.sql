-- Test query to check Smart Prompts purchase status
SELECT 
    sp.id,
    sp.title,
    sp.price,
    sp.is_marketplace,
    sp.is_public,
    COUNT(spp.id) as purchase_count
FROM saved_prompts sp
LEFT JOIN smart_prompt_purchases spp ON sp.id = spp.prompt_id
WHERE sp.is_marketplace = true AND sp.is_public = true
GROUP BY sp.id, sp.title, sp.price, sp.is_marketplace, sp.is_public
ORDER BY sp.title
LIMIT 10;