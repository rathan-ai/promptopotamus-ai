-- Add Interesting Free Prompt Recipes for All Users
-- This migration adds high-quality, free prompt recipes across various categories

-- First, let's create a temporary user for system-generated prompts (if needed)
-- We'll use a special system user ID for these free recipes
DO $$
DECLARE
    system_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Insert system user into auth.users if it doesn't exist (this might need to be done via Supabase admin)
    -- For now, we'll assume you have a real user ID to assign these prompts to
    -- You can update this with your actual admin user ID
    
    -- Insert comprehensive free prompt recipes
    INSERT INTO saved_prompts (
        user_id, title, prompt_text, persona, task, context, format, 
        complexity_level, variables, recipe_steps, use_cases, tags, 
        category, difficulty_level, ai_model_compatibility, 
        is_marketplace, is_public, price, description, instructions,
        example_inputs, example_outputs
    ) VALUES 
    
    -- 1. WRITING & CREATIVITY
    (
        (SELECT id FROM auth.users LIMIT 1), -- Will use first available user, update as needed
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
        ARRAY['Complete blog post with compelling headline, structured sections, actionable insights, and call-to-action']
    ),
    
    -- 2. CODING & DEVELOPMENT
    (
        (SELECT id FROM auth.users LIMIT 1),
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
        ARRAY['Detailed code quality assessment', 'Refactored code with explanations', 'Security and performance recommendations', 'Testing strategies']
    ),
    
    -- 3. BUSINESS & STRATEGY
    (
        (SELECT id FROM auth.users LIMIT 1),
        'Business Strategy Analyzer',
        'You are a senior business consultant with an MBA and 15+ years of experience in strategic planning. Analyze the following business scenario and provide strategic recommendations:

**Company/Situation:** {{company_description}}
**Industry:** {{industry}}
**Challenge/Goal:** {{challenge_or_goal}}
**Budget/Resources:** {{budget_constraints}}

Please provide:

1. **Situation Analysis**
   - Current market position
   - Key challenges and opportunities
   - Competitive landscape assessment

2. **Strategic Recommendations**
   - 3-5 actionable strategies
   - Implementation priorities
   - Resource requirements

3. **Risk Assessment**
   - Potential risks and mitigation strategies
   - Success metrics and KPIs

4. **Implementation Roadmap**
   - 30-60-90 day action plan
   - Key milestones and deliverables

Focus on practical, data-driven recommendations that can be implemented with the available resources.',
        'Senior business consultant and strategic advisor',
        'Provide comprehensive business strategy analysis and recommendations',
        'Business consulting and strategic planning',
        'Detailed strategic analysis with actionable recommendations and implementation roadmap',
        'recipe',
        '[{"name": "company_description", "description": "Brief description of the company and current situation", "type": "textarea", "required": true}, {"name": "industry", "description": "Industry or sector", "type": "text", "required": true}, {"name": "challenge_or_goal", "description": "Main challenge to solve or goal to achieve", "type": "textarea", "required": true}, {"name": "budget_constraints", "description": "Budget limitations or available resources", "type": "text", "required": false}]',
        '[{"step": 1, "description": "Company overview", "action": "Describe your company and current situation"}, {"step": 2, "description": "Define challenge", "action": "Clearly state the main challenge or goal"}, {"step": 3, "description": "Set constraints", "action": "Mention any budget or resource limitations"}, {"step": 4, "description": "Get strategy", "action": "Receive comprehensive strategic analysis and recommendations"}]',
        ARRAY['Business Strategy', 'Consulting', 'Strategic Planning', 'Market Analysis'],
        ARRAY['business', 'strategy', 'consulting', 'planning', 'analysis'],
        'Business & Strategy',
        'advanced',
        ARRAY['ChatGPT', 'Claude', 'GPT-4'],
        true, true, 0,
        'Get professional business strategy analysis with actionable recommendations, risk assessment, and implementation roadmaps.',
        'Describe your business situation, industry, and main challenge. Receive comprehensive strategic analysis and practical recommendations.',
        '{"company_description": "Mid-size SaaS company with 50 employees, $5M ARR, struggling with customer churn", "industry": "Software/SaaS", "challenge_or_goal": "Reduce customer churn from 15% to under 8% within 6 months", "budget_constraints": "$200K budget for retention initiatives"}',
        ARRAY['Comprehensive situation analysis', 'Strategic recommendations with priorities', 'Risk assessment and mitigation strategies', '30-60-90 day implementation roadmap']
    ),
    
    -- 4. EDUCATION & LEARNING
    (
        (SELECT id FROM auth.users LIMIT 1),
        'Interactive Lesson Creator',
        'You are an experienced educator and instructional designer. Create an engaging, interactive lesson on {{topic}} for {{audience_level}}.

**Learning Objectives:** {{learning_objectives}}
**Duration:** {{lesson_duration}}
**Format:** {{format_preference}}

Structure your lesson with:

1. **Hook & Introduction** (10% of time)
   - Attention-grabbing opener
   - Clear learning objectives
   - Real-world relevance

2. **Core Content** (60% of time)
   - Break into 3-4 digestible sections
   - Include examples and analogies
   - Interactive elements and questions

3. **Practice & Application** (20% of time)
   - Hands-on activities
   - Problem-solving exercises
   - Real-world scenarios

4. **Assessment & Wrap-up** (10% of time)
   - Quick knowledge check
   - Key takeaways summary
   - Next steps for learning

Include engagement strategies, visual elements suggestions, and assessment methods.',
        'Experienced educator and instructional designer',
        'Create engaging, interactive educational content and lessons',
        'Education, training, and instructional design',
        'Complete lesson plan with activities, assessments, and engagement strategies',
        'recipe',
        '[{"name": "topic", "description": "Subject or topic to teach", "type": "text", "required": true}, {"name": "audience_level", "description": "Audience level (beginner, intermediate, advanced, grade level, etc.)", "type": "text", "required": true}, {"name": "learning_objectives", "description": "What students should learn or be able to do", "type": "textarea", "required": true}, {"name": "lesson_duration", "description": "Available time for the lesson", "type": "text", "required": false}, {"name": "format_preference", "description": "Preferred format (online, in-person, hybrid, etc.)", "type": "text", "required": false}]',
        '[{"step": 1, "description": "Define topic and audience", "action": "Specify what you want to teach and to whom"}, {"step": 2, "description": "Set learning objectives", "action": "Define what students should achieve"}, {"step": 3, "description": "Choose format and duration", "action": "Specify lesson length and delivery method"}, {"step": 4, "description": "Generate lesson plan", "action": "Receive complete interactive lesson structure"}]',
        ARRAY['Education', 'Training', 'Curriculum Design', 'Teaching'],
        ARRAY['education', 'teaching', 'lesson', 'training', 'learning'],
        'Education & Training',
        'intermediate',
        ARRAY['ChatGPT', 'Claude', 'Gemini'],
        true, true, 0,
        'Create comprehensive, engaging lesson plans with interactive elements, activities, and assessments for any topic and audience level.',
        'Define your topic, audience level, and learning objectives. Get a complete lesson plan with engagement strategies and activities.',
        '{"topic": "Introduction to Data Analysis", "audience_level": "College students, no prior experience", "learning_objectives": "Students will understand basic data types, learn to interpret simple charts, and perform basic statistical calculations", "lesson_duration": "90 minutes", "format_preference": "In-person with computer lab"}',
        ARRAY['Complete lesson plan with timing', 'Interactive activities and exercises', 'Assessment methods and rubrics', 'Engagement strategies and visual aids suggestions']
    ),
    
    -- 5. MARKETING & SALES
    (
        (SELECT id FROM auth.users LIMIT 1),
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

5. **Follow-up Sequence** (if applicable)
   - 2-3 follow-up emails
   - Different angles and approaches
   - Urgency and scarcity elements

Include metrics to track and optimization suggestions.',
        'Direct response marketing expert and email specialist',
        'Create high-converting email marketing campaigns and sequences',
        'Digital marketing, email marketing, and direct response',
        'Complete email campaign with subject lines, content, and optimization strategies',
        'smart',
        '[{"name": "campaign_purpose", "description": "Purpose of the campaign (product launch, promotion, nurture, etc.)", "type": "text", "required": true}, {"name": "product_service", "description": "Product or service being promoted", "type": "text", "required": true}, {"name": "target_audience", "description": "Target audience description", "type": "text", "required": true}, {"name": "campaign_goal", "description": "Specific goal (sales, signups, engagement, etc.)", "type": "text", "required": true}, {"name": "brand_tone", "description": "Brand voice and tone", "type": "text", "required": false}]',
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
        ARRAY['5 A/B test ready subject lines', 'Complete email content with CTAs', 'Personalization and segmentation strategies', 'Follow-up sequence with different angles', 'Performance tracking recommendations']
    ),
    
    -- 6. RESEARCH & ANALYSIS
    (
        (SELECT id FROM auth.users LIMIT 1),
        'Research Report Generator',
        'You are a senior research analyst with expertise in {{research_field}}. Conduct comprehensive research and create a detailed report on {{research_topic}}.

**Research Scope:** {{research_scope}}
**Target Audience:** {{report_audience}}
**Key Questions:** {{key_questions}}
**Timeframe:** {{timeframe}}

Structure your research report with:

1. **Executive Summary**
   - Key findings and recommendations
   - Critical insights overview
   - Impact assessment

2. **Methodology**
   - Research approach and sources
   - Data collection methods
   - Limitations and assumptions

3. **Key Findings**
   - Organized by themes or questions
   - Supporting data and evidence
   - Trend analysis and patterns

4. **Analysis & Insights**
   - Implications of findings
   - Comparative analysis
   - Future projections

5. **Recommendations**
   - Actionable next steps
   - Implementation priorities
   - Success metrics

6. **Appendix**
   - Data sources and references
   - Additional charts/graphs suggestions
   - Further reading recommendations

Ensure all claims are evidence-based and cite credible sources.',
        'Senior research analyst and strategic researcher',
        'Conduct comprehensive research and generate detailed analytical reports',
        'Research, analysis, strategic intelligence, and reporting',
        'Professional research report with findings, analysis, and recommendations',
        'recipe',
        '[{"name": "research_topic", "description": "Main topic or subject to research", "type": "text", "required": true}, {"name": "research_field", "description": "Field or industry domain", "type": "text", "required": true}, {"name": "research_scope", "description": "Scope and boundaries of the research", "type": "textarea", "required": true}, {"name": "report_audience", "description": "Intended audience for the report", "type": "text", "required": true}, {"name": "key_questions", "description": "Specific questions to address", "type": "textarea", "required": false}, {"name": "timeframe", "description": "Time period or deadline considerations", "type": "text", "required": false}]',
        '[{"step": 1, "description": "Define research topic", "action": "Clearly specify what you want to research"}, {"step": 2, "description": "Set scope and questions", "action": "Define boundaries and key questions to address"}, {"step": 3, "description": "Identify audience", "action": "Specify who will read and use this report"}, {"step": 4, "description": "Generate comprehensive report", "action": "Receive detailed research report with analysis and recommendations"}]',
        ARRAY['Research', 'Analysis', 'Strategic Intelligence', 'Reporting'],
        ARRAY['research', 'analysis', 'report', 'intelligence', 'data'],
        'Research & Analysis',
        'advanced',
        ARRAY['ChatGPT', 'Claude', 'GPT-4'],
        true, true, 0,
        'Generate comprehensive research reports with methodology, findings, analysis, and actionable recommendations on any topic or industry.',
        'Define your research topic, scope, and key questions. Receive a professional research report with evidence-based insights and recommendations.',
        '{"research_topic": "Impact of AI on customer service industry", "research_field": "Technology and Business", "research_scope": "Focus on chatbots, automation, and human-AI collaboration in customer service departments of mid to large companies", "report_audience": "C-suite executives and customer service directors", "key_questions": "How is AI changing customer service roles? What are the cost implications? What are best practices for implementation?", "timeframe": "Last 2 years of developments"}',
        ARRAY['Executive summary with key insights', 'Methodology and research approach', 'Comprehensive findings with supporting data', 'Strategic analysis and implications', 'Actionable recommendations with implementation priorities']
    ),
    
    -- 7. CREATIVE & DESIGN
    (
        (SELECT id FROM auth.users LIMIT 1),
        'Creative Campaign Concepting',
        'You are a creative director at a top advertising agency with 15+ years of experience. Develop a creative campaign concept for {{campaign_objective}}.

**Brand/Client:** {{brand_name}}
**Product/Service:** {{product_service}}
**Target Audience:** {{target_demographic}}
**Budget Level:** {{budget_tier}}
**Campaign Duration:** {{campaign_length}}
**Key Message:** {{core_message}}

Develop a comprehensive creative campaign including:

1. **Big Idea & Concept**
   - Central creative concept
   - Campaign theme and narrative
   - Unique value proposition

2. **Creative Executions**
   - Visual style and direction
   - Tone of voice and messaging
   - Key visual elements

3. **Multi-Channel Approach**
   - Digital channels (social, display, video)
   - Traditional media (if applicable)
   - Experiential/activation ideas

4. **Content Strategy**
   - Hero content pieces
   - Supporting content themes
   - User-generated content opportunities

5. **Measurement & KPIs**
   - Success metrics
   - Testing recommendations
   - Optimization opportunities

Include rationale for creative decisions and implementation timeline.',
        'Senior creative director and campaign strategist',
        'Develop comprehensive creative advertising and marketing campaigns',
        'Creative advertising, brand marketing, and campaign development',
        'Complete creative campaign concept with multi-channel executions and strategy',
        'recipe',
        '[{"name": "campaign_objective", "description": "Main objective (brand awareness, product launch, sales, etc.)", "type": "text", "required": true}, {"name": "brand_name", "description": "Brand or company name", "type": "text", "required": true}, {"name": "product_service", "description": "Product or service being promoted", "type": "text", "required": true}, {"name": "target_demographic", "description": "Target audience demographics and psychographics", "type": "textarea", "required": true}, {"name": "budget_tier", "description": "Budget level (small, medium, large, enterprise)", "type": "text", "required": false}, {"name": "campaign_length", "description": "Campaign duration", "type": "text", "required": false}, {"name": "core_message", "description": "Key message or positioning", "type": "text", "required": false}]',
        '[{"step": 1, "description": "Define campaign objective", "action": "Specify the main goal and desired outcome"}, {"step": 2, "description": "Detail brand and offering", "action": "Describe your brand, product/service, and target audience"}, {"step": 3, "description": "Set parameters", "action": "Define budget, duration, and key messages"}, {"step": 4, "description": "Generate creative concept", "action": "Receive comprehensive campaign concept with executions"}]',
        ARRAY['Creative Strategy', 'Advertising', 'Brand Marketing', 'Campaign Development'],
        ARRAY['creative', 'advertising', 'campaign', 'branding', 'marketing'],
        'Creative & Design',
        'intermediate',
        ARRAY['ChatGPT', 'Claude', 'GPT-4'],
        true, true, 0,
        'Develop professional creative campaign concepts with big ideas, multi-channel executions, and strategic implementation plans.',
        'Define your campaign objective, brand, target audience, and key parameters. Get a complete creative campaign concept ready for execution.',
        '{"campaign_objective": "Launch new eco-friendly skincare line", "brand_name": "GreenGlow Naturals", "product_service": "Organic, zero-waste skincare products for environmentally conscious consumers", "target_demographic": "Women aged 25-40, college-educated, urban/suburban, environmentally conscious, active on social media, willing to pay premium for sustainable products", "budget_tier": "Medium", "campaign_length": "6 months", "core_message": "Beautiful skin, beautiful planet"}',
        ARRAY['Central creative concept and big idea', 'Multi-channel execution strategy', 'Visual direction and messaging framework', 'Content strategy with hero and supporting pieces', 'KPIs and measurement recommendations']
    ),
    
    -- 8. PERSONAL PRODUCTIVITY
    (
        (SELECT id FROM auth.users LIMIT 1),
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

6. **Troubleshooting Guide**
   - Common challenges and solutions
   - System maintenance tips
   - Adaptation strategies

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
        '{"user_role": "Marketing Manager at tech startup", "current_challenges": "Constantly switching between projects, too many meetings, struggle with email overload, difficulty finding time for strategic work", "productivity_goals": "Better focus on high-impact work, reduce email stress, more time for strategic planning, better work-life balance", "time_available": "1-2 hours per week for system setup", "preferred_tools": "Already use Slack, Google Workspace, prefer simple solutions", "work_style": "Prefer structured approaches, work best in morning, need flexibility for urgent requests"}',
        ARRAY['Current workflow analysis and bottleneck identification', 'Custom task management and priority framework', 'Tool recommendations with integration strategies', 'Daily and weekly routine templates', '30-day implementation plan with habit formation', 'Troubleshooting guide for common challenges']
    );
    
END $$;