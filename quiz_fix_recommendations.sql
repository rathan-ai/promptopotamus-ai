-- Quiz Fix Recommendations and Solutions
-- This script provides solutions to fix the quiz consistency issues

-- ============================================================================
-- SECTION 1: IMMEDIATE DATA FIXES
-- ============================================================================

-- Fix 1: Update questions with identical options
-- First, let's create a backup of problematic questions
CREATE TABLE IF NOT EXISTS quiz_backup_before_fix AS
SELECT * FROM quizzes
WHERE options IS NOT NULL
  AND jsonb_typeof(options) = 'object'
  AND (
    (options ? 'A' AND options ? 'B' AND options->>'A' = options->>'B')
    OR (options ? 'B' AND options ? 'C' AND options->>'B' = options->>'C')
    OR (options ? 'C' AND options ? 'D' AND options->>'C' = options->>'D')
    OR (options ? 'A' AND options ? 'C' AND options->>'A' = options->>'C')
    OR (options ? 'A' AND options ? 'D' AND options->>'A' = options->>'D')
    OR (options ? 'B' AND options ? 'D' AND options->>'B' = options->>'D')
  );

-- Fix 2: Example of how to fix specific problematic questions
-- (This is a template - you'll need to customize based on actual data)

/*
UPDATE quizzes 
SET options = jsonb_build_object(
    'A', 'Corrected Option A',
    'B', 'Corrected Option B', 
    'C', 'Corrected Option C',
    'D', 'Corrected Option D',
    'correct_answer', 'A'  -- or whichever is correct
)
WHERE id = [SPECIFIC_QUESTION_ID];
*/

-- ============================================================================
-- SECTION 2: CODE IMPROVEMENTS FOR RANDOMIZATION
-- ============================================================================

-- The main issue is that the current system doesn't randomize option order
-- Here are the recommended changes:

-- Current API code pattern (from route.ts):
/*
const { data: allQuestions, error } = await supabase
    .from('quizzes')
    .select('id, question, options')
    .eq('difficulty', level);

const shuffled = allQuestions.sort(() => 0.5 - Math.random());
const selectedQuestions = shuffled.slice(0, QUIZ_LENGTH);
*/

-- RECOMMENDED IMPROVEMENT:
-- Add a function to randomize option order while preserving correct answer

-- ============================================================================
-- SECTION 3: DATABASE SCHEMA ENHANCEMENTS
-- ============================================================================

-- Enhancement 1: Add a separate correct_answer column for clarity
-- ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS correct_answer_key VARCHAR(1);

-- Enhancement 2: Create a function to validate option structure
CREATE OR REPLACE FUNCTION validate_quiz_options(options_json JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if options is an object with A, B, C, D keys
    IF jsonb_typeof(options_json) != 'object' THEN
        RETURN FALSE;
    END IF;
    
    -- Check if all required keys exist
    IF NOT (options_json ? 'A' AND options_json ? 'B' AND options_json ? 'C' AND options_json ? 'D') THEN
        RETURN FALSE;
    END IF;
    
    -- Check if all options are unique
    IF (options_json->>'A' = options_json->>'B' 
        OR options_json->>'A' = options_json->>'C' 
        OR options_json->>'A' = options_json->>'D'
        OR options_json->>'B' = options_json->>'C' 
        OR options_json->>'B' = options_json->>'D'
        OR options_json->>'C' = options_json->>'D') THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Enhancement 3: Add a constraint to prevent invalid options
-- ALTER TABLE quizzes ADD CONSTRAINT valid_options_check 
-- CHECK (validate_quiz_options(options));

-- ============================================================================
-- SECTION 4: FRONTEND RANDOMIZATION FUNCTION
-- ============================================================================

-- TypeScript function to add to your quiz utilities:
/*
interface QuizOption {
  A: string;
  B: string;
  C: string;
  D: string;
  correct_answer: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption;
}

interface RandomizedQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

function randomizeQuestionOptions(question: QuizQuestion): RandomizedQuestion {
  const { options } = question;
  const optionKeys = ['A', 'B', 'C', 'D'] as const;
  const correctKey = options.correct_answer;
  
  // Create array of option values
  const optionValues = optionKeys.map(key => options[key]);
  
  // Find the correct answer index before shuffling
  const correctIndex = optionKeys.indexOf(correctKey);
  const correctValue = optionValues[correctIndex];
  
  // Shuffle the options using Fisher-Yates algorithm
  const shuffledOptions = [...optionValues];
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }
  
  // Find the new index of the correct answer
  const newCorrectIndex = shuffledOptions.indexOf(correctValue);
  
  return {
    id: question.id,
    question: question.question,
    options: shuffledOptions,
    correctIndex: newCorrectIndex
  };
}

// Usage in your quiz component:
const randomizedQuestions = questions.map(randomizeQuestionOptions);
*/

-- ============================================================================
-- SECTION 5: DATA QUALITY CHECKS
-- ============================================================================

-- Create a function to run regular data quality checks
CREATE OR REPLACE FUNCTION check_quiz_data_quality()
RETURNS TABLE(
    check_name TEXT,
    issue_count INTEGER,
    severity TEXT,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Check for questions with identical options
    SELECT 
        'Identical Options'::TEXT,
        COUNT(*)::INTEGER,
        'HIGH'::TEXT,
        'Questions where multiple choice options are identical'::TEXT
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
    
    UNION ALL
    
    -- Check for missing options
    SELECT 
        'Missing Options',
        COUNT(*)::INTEGER,
        'CRITICAL',
        'Questions without options data'
    FROM quizzes
    WHERE options IS NULL
    
    UNION ALL
    
    -- Check for missing correct answer
    SELECT 
        'Missing Correct Answer',
        COUNT(*)::INTEGER,
        'HIGH',
        'Questions without specified correct answer'
    FROM quizzes
    WHERE options IS NOT NULL 
      AND NOT (options ? 'correct_answer' OR options ? 'correct' OR options ? 'answer')
    
    UNION ALL
    
    -- Check answer distribution bias
    SELECT 
        'Answer Distribution Bias',
        CASE 
            WHEN MAX(answer_count) > (total_with_answers * 0.4) THEN 1
            ELSE 0
        END,
        'MEDIUM',
        'Correct answers heavily biased toward one option'
    FROM (
        SELECT 
            COUNT(*) as total_with_answers,
            MAX(cnt) as answer_count
        FROM (
            SELECT 
                CASE 
                    WHEN options ? 'correct_answer' THEN options->>'correct_answer'
                    WHEN options ? 'correct' THEN options->>'correct'
                    WHEN options ? 'answer' THEN options->>'answer'
                END as correct_answer,
                COUNT(*) as cnt
            FROM quizzes
            WHERE options IS NOT NULL
            GROUP BY correct_answer
        ) answer_dist
    ) bias_check;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 6: MONITORING AND ALERTS
-- ============================================================================

-- Create a view for ongoing monitoring
CREATE OR REPLACE VIEW quiz_quality_dashboard AS
SELECT 
    'Total Questions' as metric,
    COUNT(*)::TEXT as value,
    'INFO' as status
FROM quizzes

UNION ALL

SELECT 
    'Questions by Difficulty',
    difficulty || ': ' || COUNT(*)::TEXT,
    'INFO'
FROM quizzes
GROUP BY difficulty

UNION ALL

SELECT 
    'Problematic Questions',
    COUNT(*)::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'WARNING' ELSE 'OK' END
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
  );

-- ============================================================================
-- SECTION 7: SAMPLE DATA FIXES
-- ============================================================================

-- Example fixes for common patterns (customize based on your actual data):

-- Pattern 1: All options are the same
/*
UPDATE quizzes 
SET options = jsonb_build_object(
    'A', 'Option A - Unique answer 1',
    'B', 'Option B - Unique answer 2', 
    'C', 'Option C - Unique answer 3',
    'D', 'Option D - Unique answer 4',
    'correct_answer', options->>'correct_answer'  -- preserve existing correct answer
)
WHERE id IN (
    SELECT id FROM quizzes 
    WHERE options->>'A' = options->>'B' 
      AND options->>'B' = options->>'C' 
      AND options->>'C' = options->>'D'
);
*/

-- Pattern 2: Some options are identical
/*
-- You'll need to manually review and fix these based on the question content
-- Example for a specific question:
UPDATE quizzes 
SET options = jsonb_build_object(
    'A', 'Corrected unique option A',
    'B', 'Corrected unique option B', 
    'C', 'Corrected unique option C',
    'D', 'Corrected unique option D',
    'correct_answer', 'B'  -- specify the correct answer
)
WHERE id = [SPECIFIC_ID];
*/

-- ============================================================================
-- FINAL RECOMMENDATIONS SUMMARY
-- ============================================================================

SELECT 'IMPLEMENTATION CHECKLIST' as section;

SELECT 'IMMEDIATE ACTIONS NEEDED:' as priority,
       '1. Run quiz_consistency_analysis.sql to identify all problematic questions' as action
UNION ALL
SELECT '', '2. Backup existing quiz data before making changes'
UNION ALL
SELECT '', '3. Manually review and fix questions with identical options'
UNION ALL
SELECT '', '4. Implement frontend option randomization'
UNION ALL
SELECT '', '5. Add data validation constraints'
UNION ALL
SELECT 'LONG-TERM IMPROVEMENTS:', '1. Implement automated data quality checks'
UNION ALL
SELECT '', '2. Add monitoring dashboard for quiz quality'
UNION ALL
SELECT '', '3. Create automated tests for quiz randomization'
UNION ALL
SELECT '', '4. Implement better answer distribution balancing';