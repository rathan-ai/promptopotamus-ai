-- Add Interesting Free Prompt Recipes for All Users (Fixed Version)
-- This migration adds high-quality, free prompt recipes across various categories

-- First, let's check if we have any users and create prompts accordingly
DO $$
DECLARE
    system_user_id UUID;
    user_count INTEGER;
BEGIN
    -- Check if we have any users in auth.users
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    -- If we have users, use the first one, otherwise we'll need to create one or use a known admin user
    IF user_count > 0 THEN
        SELECT id INTO system_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    ELSE
        -- If no users exist, we'll need to skip this migration for now
        -- You should create an admin user first
        RAISE NOTICE 'No users found in auth.users. Please create an admin user first, then re-run this migration.';
        RETURN;
    END IF;
    
    -- Insert comprehensive free prompt recipes
    INSERT INTO saved_prompts (
        user_id, title, prompt_text, persona, task, context, format, 
        complexity_level, variables, recipe_steps, use_cases, tags, 
        category, difficulty_level, ai_model_compatibility, 
        is_marketplace, is_public, price, description, instructions,
        example_inputs, example_outputs, created_at, updated_at
    ) VALUES 
    
    -- 1. WRITING & CREATIVITY
    (
        system_user_id,
        'The Ultimate Blog Post Writer',
        'You are an expert content writer with 10+ years of experience. Write a comprehensive, engaging blog post about {{topic}}. 

Target audience: {{audience}}
Tone: {{tone}}
Word count: {{word_count}}

Structure your post with:
1. Compelling headline
2. Hook opening
3. Clear sections with subheadings  
4. Actionable insights
5. Strong conclusion with call-to-action

Include relevant statistics, examples, and make it SEO-optimized.',
        'Expert content writer and SEO specialist',
        'Create engaging, well-structured blog posts',
        'Professional content marketing and blogging',
        'Structured blog post with headlines, sections, and SEO optimization',
        'recipe',
        '[{"name": "topic", "description": "Main topic for the blog post", "type": "text", "required": true}, {"name": "audience", "description": "Target audience", "type": "text", "required": true}, {"name": "tone", "description": "Writing tone (professional, casual, humorous, etc.)", "type": "text", "required": false}, {"name": "word_count", "description": "Desired word count", "type": "text", "required": false}]',
        '[{"step": 1, "description": "Define topic and audience", "action": "Fill in the topic and target audience variables"}, {"step": 2, "description": "Set tone and length", "action": "Specify the desired tone and word count"}, {"step": 3, "description": "Generate content", "action": "Run the prompt to create your blog post"}, {"step": 4, "description": "Review and edit", "action": "Review the output and make any necessary adjustments"}]',
        ARRAY['Content Marketing', 'SEO', 'Blogging', 'Business Writing'],
        ARRAY['writing', 'content', 'blog', 'seo', 'marketing'],
        'Writing & Content',
        'intermediate',
        ARRAY['ChatGPT', 'Claude', 'Gemini', 'GPT-4'],
        true, true, 0,
        'Create professional, engaging blog posts with proper structure, SEO optimization, and compelling content that drives results.',
        'Fill in your topic, target audience, and preferred tone. The AI will generate a complete blog post with headlines, structured content, and SEO considerations.',
        '{"topic": "AI in Healthcare", "audience": "Healthcare professionals", "tone": "Professional and informative", "word_count": "1500 words"}',
        ARRAY['Complete blog post with compelling headline, structured sections, actionable insights, and call-to-action'],
        NOW(), NOW()
    ),
    
    -- 2. CODING & DEVELOPMENT
    (
        system_user_id,
        'Code Review & Optimization Expert',
        'You are a senior software engineer with expertise in {{programming_language}}. Analyze the following code and provide a comprehensive review:

```{{programming_language}}
{{code_input}}
```

Please provide:

1. **Code Quality Assessment**
   - Readability and maintainability
   - Performance considerations
   - Security vulnerabilities

2. **Specific Improvements**
   - Refactored code with explanations
   - Best practices implementation
   - Performance optimizations

3. **Alternative Approaches**
   - Different algorithms or patterns
   - Modern language features to use

4. **Testing Recommendations**
   - Unit test suggestions
   - Edge cases to consider

Focus on {{focus_area}} if specified.',
        'Senior software engineer and code reviewer',
        'Analyze and improve code quality, performance, and security',
        'Professional software development and code review',
        'Detailed code analysis with specific improvements and recommendations',
        'smart',
        '[{"name": "programming_language", "description": "Programming language (Python, JavaScript, Java, etc.)", "type": "text", "required": true}, {"name": "code_input", "description": "Code to be reviewed", "type": "textarea", "required": true}, {"name": "focus_area", "description": "Specific area to focus on (performance, security, readability, etc.)", "type": "text", "required": false}]',
        '[{"step": 1, "description": "Specify language", "action": "Choose the programming language"}, {"step": 2, "description": "Input code", "action": "Paste the code you want reviewed"}, {"step": 3, "description": "Set focus area", "action": "Optionally specify what to focus on"}, {"step": 4, "description": "Get comprehensive review", "action": "Receive detailed analysis and improvements"}]',
        ARRAY['Software Development', 'Code Review', 'Best Practices', 'Performance Optimization'],
        ARRAY['coding', 'programming', 'review', 'optimization', 'development'],
        'Development & Technology',
        'advanced',
        ARRAY['ChatGPT', 'Claude', 'GPT-4'],
        true, true, 0,
        'Get expert code reviews with specific improvements, security analysis, and performance optimizations for any programming language.',
        'Paste your code, specify the programming language, and optionally mention what you want to focus on. Get comprehensive feedback and improvements.',
        '{"programming_language": "Python", "code_input": "def calculate_total(items):\\n    total = 0\\n    for item in items:\\n        total = total + item[\"price\"]\\n    return total", "focus_area": "Performance and readability"}',
        ARRAY['Detailed code quality assessment', 'Refactored code with explanations', 'Security and performance recommendations', 'Testing strategies'],
        NOW(), NOW()
    ),
    
    -- 3. BUSINESS & STRATEGY
    (
        system_user_id,
        'Email Marketing Campaign Creator',
        'You are a direct response marketing expert specializing in email campaigns. Create a high-converting email marketing campaign for {{campaign_purpose}}.

**Product/Service:** {{product_service}}
**Target Audience:** {{target_audience}}
**Campaign Goal:** {{campaign_goal}}
**Brand Tone:** {{brand_tone}}

Create a complete email sequence including:

1. **Subject Line Variations** (5 options)
   - A/B test ready
   - Different psychological triggers
   - Mobile-optimized

2. **Email Content Structure**
   - Compelling opening hook
   - Clear value proposition
   - Social proof elements
   - Strong call-to-action

3. **Personalization Elements**
   - Dynamic content suggestions
   - Segmentation opportunities
   - Behavioral triggers

4. **Performance Optimization**
   - Best practices implementation
   - Mobile responsiveness tips
   - Deliverability considerations

Include metrics to track and optimization suggestions.',
        'Direct response marketing expert and email specialist',
        'Create high-converting email marketing campaigns and sequences',
        'Digital marketing, email marketing, and direct response',
        'Complete email campaign with subject lines, content, and optimization strategies',
        'smart',
        '[{"name": "campaign_purpose", "description": "Purpose of the campaign (product launch, promotion, nurture, etc.)", "type": "text", "required": true}, {"name": "product_service", "description": "Product or service being promoted", "type": "text", "required": true}, {"name": "target_audience", "description": "Target audience description", "type": "text", "required": true}, {"name": "campaign_goal", "description": "Specific goal (sales, sign-ups, engagement, etc.)", "type": "text", "required": true}, {"name": "brand_tone", "description": "Brand voice and tone", "type": "text", "required": false}]',
        '[{"step": 1, "description": "Define campaign purpose", "action": "Specify the main purpose and goal of your email campaign"}, {"step": 2, "description": "Describe offering", "action": "Detail your product/service and target audience"}, {"step": 3, "description": "Set tone and style", "action": "Define your brand voice and communication style"}, {"step": 4, "description": "Generate campaign", "action": "Receive complete email campaign with variations and optimizations"}]',
        ARRAY['Email Marketing', 'Digital Marketing', 'Conversion Optimization', 'Sales'],
        ARRAY['email', 'marketing', 'campaign', 'sales', 'conversion'],
        'Marketing & Sales',
        'intermediate',
        ARRAY['ChatGPT', 'Claude', 'GPT-4'],
        true, true, 0,
        'Create professional email marketing campaigns with multiple subject line variations, optimized content, and follow-up sequences designed for high conversion rates.',
        'Define your campaign purpose, product/service, target audience, and goals. Get a complete email marketing campaign ready to deploy.',
        '{"campaign_purpose": "Product launch announcement", "product_service": "AI-powered project management tool for remote teams", "target_audience": "Remote team leaders and project managers at tech companies", "campaign_goal": "Drive sign-ups for free trial", "brand_tone": "Professional but approachable, tech-savvy"}',
        ARRAY['5 A/B test ready subject lines', 'Complete email content with CTAs', 'Personalization and segmentation strategies', 'Performance tracking recommendations'],
        NOW(), NOW()
    ),
    
    -- 4. PERSONAL PRODUCTIVITY
    (
        system_user_id,
        'Personal Productivity System Designer',
        'You are a productivity expert and systems designer who has helped thousands of professionals optimize their workflows. Design a personalized productivity system for {{user_role}} based on their specific challenges and goals.

**Current Situation:** {{current_challenges}}
**Main Goals:** {{productivity_goals}}
**Available Time:** {{time_available}}
**Preferred Tools:** {{preferred_tools}}
**Work Style:** {{work_style}}

Create a comprehensive productivity system including:

1. **Workflow Analysis**
   - Current state assessment
   - Bottlenecks and inefficiencies
   - Time audit recommendations

2. **Custom System Design**
   - Task management approach
   - Calendar and scheduling strategy
   - Priority framework (customized)

3. **Tool Recommendations**
   - Primary productivity tools
   - Integration strategies
   - Automation opportunities

4. **Daily/Weekly Routines**
   - Morning startup routine
   - End-of-day shutdown ritual
   - Weekly planning sessions

5. **Implementation Plan**
   - 30-day rollout strategy
   - Habit formation techniques
   - Progress tracking methods

Focus on practical, sustainable systems that fit the user''s specific context and constraints.',
        'Productivity expert and systems optimization specialist',
        'Design personalized productivity systems and workflows',
        'Personal productivity, time management, and workflow optimization',
        'Complete personalized productivity system with implementation plan',
        'recipe',
        '[{"name": "user_role", "description": "Your role/job title and key responsibilities", "type": "text", "required": true}, {"name": "current_challenges", "description": "Main productivity challenges you are facing", "type": "textarea", "required": true}, {"name": "productivity_goals", "description": "What you want to achieve with better productivity", "type": "textarea", "required": true}, {"name": "time_available", "description": "How much time you can dedicate to productivity improvements", "type": "text", "required": false}, {"name": "preferred_tools", "description": "Tools you already use or prefer", "type": "text", "required": false}, {"name": "work_style", "description": "Your work style preferences and constraints", "type": "text", "required": false}]',
        '[{"step": 1, "description": "Assess current situation", "action": "Describe your role, responsibilities, and main challenges"}, {"step": 2, "description": "Define goals", "action": "Clarify what you want to achieve with better productivity"}, {"step": 3, "description": "Set constraints", "action": "Specify available time, preferred tools, and work style"}, {"step": 4, "description": "Get custom system", "action": "Receive personalized productivity system with implementation plan"}]',
        ARRAY['Productivity', 'Time Management', 'Workflow Optimization', 'Personal Systems'],
        ARRAY['productivity', 'time-management', 'workflow', 'organization', 'efficiency'],
        'Personal Development',
        'intermediate',
        ARRAY['ChatGPT', 'Claude', 'Gemini'],
        true, true, 0,
        'Get a completely personalized productivity system designed for your specific role, challenges, and goals, with practical implementation strategies.',
        'Describe your role, current productivity challenges, and goals. Receive a custom productivity system with tools, routines, and implementation plan.',
        '{"user_role": "Marketing Manager at tech startup", "current_challenges": "Constantly switching between projects, too many meetings, struggle with email overload", "productivity_goals": "Better focus on high-impact work, reduce email stress, more time for strategic planning", "time_available": "1-2 hours per week for system setup", "preferred_tools": "Google Workspace, Slack", "work_style": "Structured approaches, work best in morning"}',
        ARRAY['Current workflow analysis', 'Custom task management framework', 'Tool recommendations with integration', 'Daily and weekly routine templates', '30-day implementation plan'],
        NOW(), NOW()
    );
    
    -- Log successful insertion
    RAISE NOTICE 'Successfully inserted % free prompt recipes', (SELECT COUNT(*) FROM saved_prompts WHERE price = 0 AND is_public = true AND is_marketplace = true);
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting prompt recipes: %', SQLERRM;
        RAISE;
END $$;