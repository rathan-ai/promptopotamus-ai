-- Quick schema check
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'smart_prompt_reviews' 
AND table_schema = 'public';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'smart_prompt_purchases' 
AND table_schema = 'public';