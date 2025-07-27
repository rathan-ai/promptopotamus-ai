-- Quick Check and Add Free Prompt Recipes
-- Run this in your Supabase SQL Editor

-- First, let's check current state
SELECT 
    'Current users in auth.users:' as info,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Current saved_prompts:' as info,
    COUNT(*) as count
FROM saved_prompts
UNION ALL
SELECT 
    'Free marketplace prompts:' as info,
    COUNT(*) as count
FROM saved_prompts 
WHERE price = 0 AND is_public = true AND is_marketplace = true;

-- Check if our test prompts already exist
SELECT 
    id, title, user_id, price, is_public, is_marketplace, created_at
FROM saved_prompts 
WHERE title LIKE '%Ultimate Blog Post Writer%' 
   OR title LIKE '%Code Review%' 
   OR title LIKE '%Email Marketing%'
   OR title LIKE '%Productivity System%'
ORDER BY created_at DESC;

-- If the above shows no results, let's add them manually
-- First, get a user ID to use (replace with your actual admin user ID if you have one)
-- You can get your user ID by running: SELECT id, email FROM auth.users;

-- Then run this insert (uncomment and replace YOUR_USER_ID_HERE with actual ID):

/*
INSERT INTO saved_prompts (
    user_id, title, prompt_text, description, 
    category, complexity_level, difficulty_level,
    is_marketplace, is_public, price,
    tags, ai_model_compatibility, use_cases,
    created_at, updated_at
) VALUES 
-- Simple Blog Post Creator
(
    'YOUR_USER_ID_HERE'::uuid,
    '📝 Blog Post Creator',
    'You are an expert content writer. Write a comprehensive blog post about {{topic}} for {{audience}}. Make it engaging, well-structured, and SEO-optimized with clear headlines and actionable insights.',
    'Create professional blog posts with proper structure and SEO optimization.',
    'Writing & Content',
    'smart',
    'intermediate',
    true, true, 0,
    ARRAY['writing', 'content', 'blog', 'seo'],
    ARRAY['ChatGPT', 'Claude', 'Gemini'],
    ARRAY['Content Marketing', 'Blogging', 'SEO'],
    NOW(), NOW()
),
-- Code Review Helper  
(
    'YOUR_USER_ID_HERE'::uuid,
    '💻 Code Review Expert',
    'You are a senior software engineer. Review this {{programming_language}} code and provide detailed feedback on quality, performance, security, and best practices:\n\n```\n{{code_input}}\n```\n\nProvide specific improvements and refactored code.',
    'Get expert code reviews with improvements and optimizations.',
    'Development & Technology', 
    'smart',
    'advanced',
    true, true, 0,
    ARRAY['coding', 'review', 'development'],
    ARRAY['ChatGPT', 'Claude'],
    ARRAY['Code Review', 'Programming', 'Best Practices'],
    NOW(), NOW()
),
-- Email Marketing Campaign
(
    'YOUR_USER_ID_HERE'::uuid,
    '📧 Email Campaign Creator',
    'You are an email marketing expert. Create a high-converting email campaign for {{campaign_purpose}}. Include subject line variations, compelling content, clear CTAs, and optimization tips for {{target_audience}}.',
    'Create professional email marketing campaigns with high conversion rates.',
    'Marketing & Sales',
    'smart', 
    'intermediate',
    true, true, 0,
    ARRAY['email', 'marketing', 'campaigns'],
    ARRAY['ChatGPT', 'Claude', 'GPT-4'],
    ARRAY['Email Marketing', 'Sales', 'Conversion'],
    NOW(), NOW()
),
-- Productivity System
(
    'YOUR_USER_ID_HERE'::uuid,
    '⚡ Productivity System Designer',
    'You are a productivity expert. Design a personalized productivity system for {{user_role}} with current challenges: {{challenges}}. Include workflow analysis, tool recommendations, daily routines, and implementation plan.',
    'Get a personalized productivity system designed for your specific needs.',
    'Personal Development',
    'recipe',
    'intermediate', 
    true, true, 0,
    ARRAY['productivity', 'organization', 'workflow'],
    ARRAY['ChatGPT', 'Claude', 'Gemini'],
    ARRAY['Productivity', 'Time Management', 'Organization'],
    NOW(), NOW()
);
*/

-- After running the insert, verify the prompts were added:
-- SELECT title, category, price, is_marketplace, is_public FROM saved_prompts WHERE price = 0 ORDER BY created_at DESC;