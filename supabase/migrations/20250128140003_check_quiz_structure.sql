-- Check quiz table structure and data

-- Show structure of quizzes table  
SELECT 
    'QUIZZES TABLE STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'quizzes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show structure of quiz_attempts table
SELECT 
    'QUIZ_ATTEMPTS TABLE STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data from quizzes table (first few rows)
SELECT 
    'SAMPLE QUIZ DATA' as info,
    *
FROM quizzes 
LIMIT 3;

-- Count total records in each table
SELECT 
    'quizzes' as table_name,
    COUNT(*) as record_count
FROM quizzes

UNION ALL

SELECT 
    'quiz_attempts',
    COUNT(*)
FROM quiz_attempts;