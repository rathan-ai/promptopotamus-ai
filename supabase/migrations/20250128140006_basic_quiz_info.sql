-- Basic Quiz Information - Avoid problematic JSON

-- Count total questions
SELECT COUNT(*) as total_questions FROM quizzes;

-- Show difficulty distribution  
SELECT 
    difficulty,
    COUNT(*) as count
FROM quizzes
GROUP BY difficulty
ORDER BY difficulty;

-- Show first few questions without parsing options
SELECT 
    id,
    difficulty,
    CASE 
        WHEN LENGTH(question) > 80 THEN LEFT(question, 80) || '...'
        ELSE question
    END as question_text
FROM quizzes
ORDER BY id
LIMIT 8;

-- Check for potential issues
SELECT 
    'Total questions' as check_type,
    COUNT(*)::text as value
FROM quizzes

UNION ALL

SELECT 
    'Questions without text',
    COUNT(*)::text
FROM quizzes
WHERE question IS NULL OR TRIM(question) = ''

UNION ALL

SELECT 
    'Questions without options',
    COUNT(*)::text
FROM quizzes
WHERE options IS NULL;

-- Show some sample options to understand format (carefully)
SELECT 
    id,
    difficulty,
    CASE 
        WHEN options IS NOT NULL AND LENGTH(options::text) > 0 THEN 
            CASE 
                WHEN LENGTH(options::text) > 100 THEN LEFT(options::text, 100) || '...'
                ELSE options::text
            END
        ELSE 'NO OPTIONS'
    END as options_sample
FROM quizzes
WHERE id <= 5
ORDER BY id;

SELECT 'Basic quiz information gathered successfully' as status;