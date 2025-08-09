-- Update Smart Prompt Prices to reasonable 10-50 cents range
-- Based on complexity and value

-- Update simple prompts to 10-20 cents
UPDATE saved_prompts 
SET price = CASE 
    WHEN downloads_count > 10 THEN 0.20
    WHEN downloads_count > 5 THEN 0.15
    ELSE 0.10
END
WHERE complexity_level = 'simple' 
AND is_marketplace = true
AND price > 0.50;

-- Update smart prompts to 20-35 cents
UPDATE saved_prompts 
SET price = CASE 
    WHEN downloads_count > 10 THEN 0.35
    WHEN downloads_count > 5 THEN 0.30
    WHEN rating_average >= 4.5 THEN 0.25
    ELSE 0.20
END
WHERE complexity_level = 'smart' 
AND is_marketplace = true
AND price > 0.50;

-- Update recipe prompts to 35-50 cents
UPDATE saved_prompts 
SET price = CASE 
    WHEN downloads_count > 10 THEN 0.50
    WHEN downloads_count > 5 THEN 0.45
    WHEN rating_average >= 4.5 THEN 0.40
    ELSE 0.35
END
WHERE complexity_level = 'recipe' 
AND is_marketplace = true
AND price > 0.50;

-- Set reasonable prices for prompts with very high prices
UPDATE saved_prompts 
SET price = 0.50
WHERE is_marketplace = true 
AND price > 0.50;

-- Keep free prompts free
UPDATE saved_prompts 
SET price = 0
WHERE is_marketplace = true 
AND (price IS NULL OR price = 0);

-- Log the changes
SELECT 
    complexity_level,
    COUNT(*) as count,
    MIN(price) as min_price,
    MAX(price) as max_price,
    AVG(price) as avg_price
FROM saved_prompts
WHERE is_marketplace = true
GROUP BY complexity_level
ORDER BY complexity_level;