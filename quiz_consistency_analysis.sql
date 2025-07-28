-- Quiz Consistency Analysis Report
-- This script analyzes the quiz questions data to identify consistency issues
-- with answer options and correct answer distribution

-- ============================================================================
-- SECTION 1: DATABASE STRUCTURE OVERVIEW
-- ============================================================================

SELECT 'QUIZ DATABASE STRUCTURE ANALYSIS' as section_title;

-- Show table structure
SELECT 
    'QUIZZES TABLE STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'quizzes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- SECTION 2: BASIC DATA STATISTICS
-- ============================================================================

SELECT 'BASIC DATA STATISTICS' as section_title;

-- Total questions count
SELECT 
    'Total Questions' as metric,
    COUNT(*) as value,
    '' as notes
FROM quizzes

UNION ALL

-- Questions by difficulty
SELECT 
    'Questions per Difficulty',
    COUNT(*)::text,
    difficulty
FROM quizzes
GROUP BY difficulty
ORDER BY difficulty;

-- Questions with missing data
SELECT 
    'Questions Missing Text' as metric,
    COUNT(*) as value,
    'Critical Issue' as notes
FROM quizzes
WHERE question IS NULL OR TRIM(question) = ''

UNION ALL

SELECT 
    'Questions Missing Options',
    COUNT(*),
    'Critical Issue'
FROM quizzes
WHERE options IS NULL;

-- ============================================================================
-- SECTION 3: OPTIONS STRUCTURE ANALYSIS
-- ============================================================================

SELECT 'OPTIONS STRUCTURE ANALYSIS' as section_title;

-- Sample options format analysis
WITH options_analysis AS (
    SELECT 
        id,
        difficulty,
        question,
        options,
        CASE 
            WHEN options IS NULL THEN 'NULL_OPTIONS'
            WHEN jsonb_typeof(options) = 'array' THEN 'ARRAY_FORMAT'
            WHEN jsonb_typeof(options) = 'object' THEN 'OBJECT_FORMAT'
            ELSE 'UNKNOWN_FORMAT'
        END as options_format,
        CASE 
            WHEN options IS NOT NULL AND jsonb_typeof(options) = 'array' THEN jsonb_array_length(options)
            WHEN options IS NOT NULL AND jsonb_typeof(options) = 'object' THEN jsonb_object_keys(options)::text
            ELSE NULL
        END as options_count_or_keys
    FROM quizzes
    LIMIT 10
)
SELECT 
    id,
    difficulty,
    LEFT(question, 60) || '...' as question_preview,
    options_format,
    options_count_or_keys,
    LEFT(options::text, 100) || '...' as options_preview
FROM options_analysis
ORDER BY id;

-- Count different option formats
SELECT 
    'Options Format Distribution' as analysis_type,
    CASE 
        WHEN options IS NULL THEN 'NULL_OPTIONS'
        WHEN jsonb_typeof(options) = 'array' THEN 'ARRAY_FORMAT'
        WHEN jsonb_typeof(options) = 'object' THEN 'OBJECT_FORMAT'
        ELSE 'UNKNOWN_FORMAT'
    END as format_type,
    COUNT(*) as count
FROM quizzes
GROUP BY 
    CASE 
        WHEN options IS NULL THEN 'NULL_OPTIONS'
        WHEN jsonb_typeof(options) = 'array' THEN 'ARRAY_FORMAT'
        WHEN jsonb_typeof(options) = 'object' THEN 'OBJECT_FORMAT'
        ELSE 'UNKNOWN_FORMAT'
    END
ORDER BY count DESC;

-- ============================================================================
-- SECTION 4: CORRECT ANSWER DISTRIBUTION ANALYSIS
-- ============================================================================

SELECT 'CORRECT ANSWER DISTRIBUTION ANALYSIS' as section_title;

-- Analyze correct answer patterns (assuming object format with correct_answer key)
WITH correct_answers AS (
    SELECT 
        id,
        difficulty,
        options,
        CASE 
            WHEN options ? 'correct_answer' THEN options->>'correct_answer'
            WHEN options ? 'correct' THEN options->>'correct'
            WHEN options ? 'answer' THEN options->>'answer'
            ELSE 'NO_CORRECT_ANSWER_FIELD'
        END as correct_answer
    FROM quizzes
    WHERE options IS NOT NULL
)
SELECT 
    'Correct Answer Distribution by Letter' as analysis,
    correct_answer,
    COUNT(*) as frequency,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM correct_answers
WHERE correct_answer != 'NO_CORRECT_ANSWER_FIELD'
GROUP BY correct_answer
ORDER BY frequency DESC;

-- Check for bias by difficulty level
WITH correct_answers_by_difficulty AS (
    SELECT 
        difficulty,
        CASE 
            WHEN options ? 'correct_answer' THEN options->>'correct_answer'
            WHEN options ? 'correct' THEN options->>'correct'
            WHEN options ? 'answer' THEN options->>'answer'
            ELSE 'NO_CORRECT_ANSWER_FIELD'
        END as correct_answer
    FROM quizzes
    WHERE options IS NOT NULL
)
SELECT 
    'Answer Distribution by Difficulty' as analysis,
    difficulty,
    correct_answer,
    COUNT(*) as frequency,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY difficulty), 2) as percentage_within_difficulty
FROM correct_answers_by_difficulty
WHERE correct_answer != 'NO_CORRECT_ANSWER_FIELD'
GROUP BY difficulty, correct_answer
ORDER BY difficulty, frequency DESC;

-- ============================================================================
-- SECTION 5: OPTION CONTENT ANALYSIS
-- ============================================================================

SELECT 'OPTION CONTENT ANALYSIS' as section_title;

-- Sample questions with full options (first 5 questions for detailed review)
SELECT 
    'DETAILED SAMPLE QUESTIONS' as sample_type,
    id,
    difficulty,
    question,
    jsonb_pretty(options) as formatted_options
FROM quizzes
WHERE id <= 5
ORDER BY id;

-- Check for identical options across questions
WITH option_fingerprints AS (
    SELECT 
        id,
        difficulty,
        options,
        md5(options::text) as options_hash
    FROM quizzes
    WHERE options IS NOT NULL
)
SELECT 
    'Identical Option Sets' as analysis,
    options_hash,
    COUNT(*) as question_count,
    array_agg(id ORDER BY id) as question_ids
FROM option_fingerprints
GROUP BY options_hash, options
HAVING COUNT(*) > 1
ORDER BY question_count DESC
LIMIT 10;

-- ============================================================================
-- SECTION 6: RANDOMIZATION ASSESSMENT
-- ============================================================================

SELECT 'RANDOMIZATION ASSESSMENT' as section_title;

-- Check if options are being properly randomized by examining answer patterns
-- This assumes the frontend should randomize option order, but correct answer stays fixed

-- Look for questions where all options might be identical
WITH suspicious_questions AS (
    SELECT 
        id,
        difficulty,
        question,
        options,
        CASE 
            WHEN options ? 'A' AND options ? 'B' AND options ? 'C' AND options ? 'D' THEN
                CASE 
                    WHEN options->>'A' = options->>'B' 
                     AND options->>'B' = options->>'C' 
                     AND options->>'C' = options->>'D' THEN 'ALL_IDENTICAL'
                    WHEN options->>'A' = options->>'B' 
                      OR options->>'B' = options->>'C' 
                      OR options->>'C' = options->>'D' 
                      OR options->>'A' = options->>'C'
                      OR options->>'A' = options->>'D'
                      OR options->>'B' = options->>'D' THEN 'SOME_IDENTICAL'
                    ELSE 'UNIQUE_OPTIONS'
                END
            ELSE 'DIFFERENT_FORMAT'
        END as option_uniqueness
    FROM quizzes
    WHERE options IS NOT NULL
)
SELECT 
    'Option Uniqueness Analysis' as analysis,
    option_uniqueness,
    COUNT(*) as question_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM suspicious_questions
GROUP BY option_uniqueness
ORDER BY question_count DESC;

-- ============================================================================
-- SECTION 7: SPECIFIC PROBLEM IDENTIFICATION
-- ============================================================================

SELECT 'PROBLEM IDENTIFICATION' as section_title;

-- Find questions with identical options (the main issue reported)
SELECT 
    'QUESTIONS WITH IDENTICAL OPTIONS' as problem_type,
    id,
    difficulty,
    LEFT(question, 80) as question_preview,
    jsonb_pretty(options) as options_detail
FROM quizzes
WHERE options IS NOT NULL
  AND jsonb_typeof(options) = 'object'
  AND (
    (options ? 'A' AND options ? 'B' AND options->>'A' = options->>'B')
    OR (options ? 'B' AND options ? 'C' AND options->>'B' = options->>'C')
    OR (options ? 'C' AND options ? 'D' AND options->>'C' = options->>'D')
    OR (options ? 'A' AND options ? 'C' AND options->>'A' = options->>'C')
    OR (options ? 'A' AND options ? 'D' AND options->>'A' = options->>'D')
    OR (options ? 'B' AND options ? 'D' AND options->>'B' = options->>'D')
  )
LIMIT 20;

-- ============================================================================
-- SECTION 8: RECOMMENDATIONS
-- ============================================================================

SELECT 'ANALYSIS COMPLETE - RECOMMENDATIONS' as section_title;

-- Summary statistics for final report
WITH summary_stats AS (
    SELECT 
        COUNT(*) as total_questions,
        COUNT(CASE WHEN options IS NULL THEN 1 END) as missing_options,
        COUNT(CASE WHEN question IS NULL OR TRIM(question) = '' THEN 1 END) as missing_questions,
        COUNT(CASE 
            WHEN options IS NOT NULL 
             AND jsonb_typeof(options) = 'object'
             AND (
                (options ? 'A' AND options ? 'B' AND options->>'A' = options->>'B')
                OR (options ? 'B' AND options ? 'C' AND options->>'B' = options->>'C')
                OR (options ? 'C' AND options ? 'D' AND options->>'C' = options->>'D')
                OR (options ? 'A' AND options ? 'C' AND options->>'A' = options->>'C')
                OR (options ? 'A' AND options ? 'D' AND options->>'A' = options->>'D')
                OR (options ? 'B' AND options ? 'D' AND options->>'B' = options->>'D')
            ) THEN 1 END) as problematic_questions
    FROM quizzes
)
SELECT 
    'SUMMARY REPORT' as report_section,
    'Total Questions: ' || total_questions::text as stat1,
    'Missing Options: ' || missing_options::text as stat2,
    'Missing Question Text: ' || missing_questions::text as stat3,
    'Questions with Identical Options: ' || problematic_questions::text as stat4,
    'Data Quality: ' || 
        CASE 
            WHEN problematic_questions = 0 AND missing_options = 0 AND missing_questions = 0 THEN 'EXCELLENT'
            WHEN problematic_questions < (total_questions * 0.1) THEN 'GOOD - Minor Issues'
            WHEN problematic_questions < (total_questions * 0.3) THEN 'FAIR - Significant Issues'
            ELSE 'POOR - Major Data Quality Issues'
        END as overall_assessment
FROM summary_stats;

-- End of analysis
SELECT 'Quiz Consistency Analysis Complete' as final_status;