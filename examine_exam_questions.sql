-- Examine exam questions data for consistency issues

-- First, let's find the exam questions table
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name LIKE '%quiz%' OR table_name LIKE '%exam%' OR table_name LIKE '%question%'
ORDER BY table_name, ordinal_position;

-- Check what tables exist that might contain exam data
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%quiz%' 
     OR table_name LIKE '%exam%' 
     OR table_name LIKE '%question%'
     OR table_name LIKE '%certification%'
     OR table_name LIKE '%assessment%')
ORDER BY table_name;