export interface Certificate {
  slug: string;
  level: 'Beginner' | 'Intermediate' | 'Master';
  badgeName: string;
  description: string;
  criteria: string[];
  skills: string[];
}

export type QuizLevel = 'beginner' | 'intermediate' | 'master';

export const certificates: Record<string, Certificate> = {
  promptling: {
    slug: 'promptling',
    level: 'Beginner',
    badgeName: 'Promptling – AI Prompting Beginner',
    description: 'Awarded for foundational understanding of AI prompt engineering.',
    criteria: [
      'Completed the Level 1 Exam.',
      'Understanding prompt syntax, user intent, and goal-oriented design.',
    ],
    skills: ['Prompt engineering (beginner)', 'NLP fundamentals', 'Structured prompt writing'],
  },
  promptosaur: {
    slug: 'promptosaur',
    level: 'Intermediate',
    badgeName: 'Promptosaur – Intermediate Prompt Practitioner',
    description: 'Certifies intermediate-level proficiency in prompt engineering.',
    criteria: [
      'Earned by completing the Intermediate Exam.',
      'Creating reusable prompt templates and fine-tuning prompts.',
    ],
    skills: ['Intermediate prompt design', 'Prompt chaining', 'Context-aware interactions'],
  },
  promptopotamus: {
    slug: 'promptopotamus',
    level: 'Master',
    badgeName: 'Promptopotamus – Certified Prompt Master',
    description: 'The highest level of certification, awarded for mastery in prompt engineering.',
    criteria: [
      'Granted after completing the Mastery Exam.',
      'Designing end-to-end prompt workflows.',
    ],
    skills: ['Prompt architecture', 'Multi-agent prompt systems', 'AI prompt governance'],
  },
};

export const levelSlugs: Record<QuizLevel, string> = {
    beginner: 'promptling',
    intermediate: 'promptosaur',
    master: 'promptopotamus',
};

// NEW: Add the AI Template data
export interface AITemplate {
  id: number;
  category: string;
  title: string;
  prompt: string;
  tier: 'free' | 'pro' | 'premium';
  tags?: string[];
  usageCount?: number;
  rating?: number;
}

export const aiTemplates: AITemplate[] = [
  {
    id: 1,
    category: 'AI Business Templates',
    title: 'Results-Driven Resume',
    prompt: "Generate a results-driven, ATS-optimized resume for a [INSERT JOB TITLE] with 5+ years of experience in [INSERT INDUSTRY OR SPECIALTY], highlighting achievements in campaign ROI, cross-platform strategy, and team leadership. Include a compelling summary statement and bullet points emphasizing quantifiable outcomes.",
    tier: 'free',
    tags: ['resume', 'career', 'job-search'],
    usageCount: 2847,
    rating: 4.8
  },
  {
    id: 2,
    category: 'AI Business Templates',
    title: 'Cold Email Outreach',
    prompt: "Write a persuasive cold email introducing a digital brand consultancy service to [INSERT TARGET CLIENT TYPE]. Focus on solving pain points like poor conversion rates and brand consistency. Keep the tone confident, helpful, and include a call to action for a 15-minute free consult.",
    tier: 'free',
    tags: ['email', 'outreach', 'sales'],
    usageCount: 1923,
    rating: 4.6
  },
  {
    id: 3,
    category: 'AI Business Templates',
    title: 'One-Page Business Plan',
    prompt: "Develop a concise one-page business plan for a subscription-based [INSERT PRODUCT OR SERVICE TYPE] targeting [INSERT TARGET USER]. Include key elements: value proposition, market problem, solution, customer segments, pricing strategy, and primary marketing channels.",
    tier: 'pro',
    tags: ['business', 'strategy', 'planning'],
    usageCount: 3421,
    rating: 4.9
  },
  {
    id: 4,
    category: 'Notion Productivity Systems',
    title: 'Multi-Level Goal Tracker',
    prompt: "Design a Notion template for goal-setting and tracking that includes daily action items, weekly reflections, monthly milestones, and annual review columns. Use color-coded tags for priority levels and progress bars to visually track completion percentage.",
    tier: 'free',
    tags: ['notion', 'productivity', 'goals', 'tracking'],
    usageCount: 2156,
    rating: 4.7
  },
  {
    id: 5,
    category: 'Notion Productivity Systems',
    title: 'Freelancer CRM System',
    prompt: "Create a Notion workspace for freelance graphic designers to manage leads, active clients, project stages, deadlines, payment status, and communication logs in a centralized dashboard with Kanban and table views.",
    tier: 'pro',
    tags: ['notion', 'crm', 'freelance', 'clients'],
    usageCount: 1834,
    rating: 4.8
  },
  {
    id: 6,
    category: 'Notion Productivity Systems',
    title: 'Social Media Content Planner',
    prompt: "Construct a Notion layout for social media managers to organize post ideas by platform (Instagram, LinkedIn, TikTok), schedule publish dates, attach media files, and monitor engagement metrics post-launch.",
    tier: 'free',
    tags: ['notion', 'social-media', 'content', 'planning'],
    usageCount: 3241,
    rating: 4.6
  },
  {
    id: 7,
    category: 'ChatGPT Prompt Packs',
    title: 'Product Description Writer',
    prompt: "Craft an engaging product description for a [INSERT PRODUCT DESCRIPTION] designed for [INSERT TARGET AUDIENCE]. Emphasize design, function, and psychological benefits such as mental clarity and increased execution speed.",
    tier: 'free',
    tags: ['copywriting', 'product', 'marketing', 'e-commerce'],
    usageCount: 2967,
    rating: 4.5
  },
  {
    id: 8,
    category: 'ChatGPT Prompt Packs',
    title: 'Blog Strategy Generator',
    prompt: "Generate an SEO-optimized blog post outline for the topic: '5 Ways Solopreneurs Can Leverage AI Tools to 10x Their Output.' Structure should include intro, 5 actionable subheads, and a strong CTA for downloading a free AI toolkit.",
    tier: 'pro',
    tags: ['blogging', 'seo', 'content-strategy', 'solopreneurs'],
    usageCount: 1756,
    rating: 4.7
  },
  {
    id: 9,
    category: 'ChatGPT Prompt Packs',
    title: 'AI Business Idea Generator',
    prompt: "List 10 innovative product ideas that integrate ChatGPT or other LLMs into productivity tools specifically for remote team leaders, focusing on workflow automation, meeting summaries, and personalized onboarding assistants.",
    tier: 'premium',
    tags: ['business-ideas', 'ai-integration', 'remote-work', 'innovation'],
    usageCount: 1432,
    rating: 4.9
  },
  {
    id: 10,
    category: 'Digital Planners',
    title: 'Executive Daily Planner',
    prompt: "Design a printable executive daily planner layout that includes 15-minute time blocking from 6 AM-10 PM, a 'Top 3 Priorities' section, notes, water intake tracker, and a space for daily wins and gratitude.",
    tier: 'pro',
    tags: ['planning', 'executive', 'time-management', 'productivity'],
    usageCount: 2543,
    rating: 4.8
  },
  {
    id: 11,
    category: 'Digital Planners',
    title: 'Monthly Budget Tracker',
    prompt: "Create a modern, spreadsheet-style financial planner that includes fields for income sources, categorized expenses (housing, utilities, food, transportation), debt repayments, and goal-based savings allocations.",
    tier: 'free',
    tags: ['budgeting', 'finance', 'planning', 'money-management'],
    usageCount: 4127,
    rating: 4.4
  },
  {
    id: 12,
    category: 'Digital Planners',
    title: 'Mental Wellness Tracker',
    prompt: "Develop a comprehensive digital planner for mental health that tracks mood (using emojis), energy levels, stress triggers, daily journaling prompts, self-care actions, and progress notes over a 30-day cycle.",
    tier: 'pro',
    tags: ['mental-health', 'wellness', 'tracking', 'self-care'],
    usageCount: 2891,
    rating: 4.6
  },
  // Advanced Prompt Engineering Templates (Premium)
  {
    id: 13,
    category: 'Advanced Prompt Engineering',
    title: 'Chain-of-Thought Problem Solver',
    prompt: "Act as an expert problem solver using advanced chain-of-thought reasoning. For [INSERT COMPLEX PROBLEM], break down the solution into: 1) Problem decomposition with key variables, 2) Step-by-step logical reasoning with explicit assumptions, 3) Consideration of alternative approaches, 4) Validation of conclusions, 5) Final synthesis with confidence levels. Show your complete reasoning process.",
    tier: 'premium',
    tags: ['reasoning', 'problem-solving', 'chain-of-thought', 'analysis'],
    usageCount: 1247,
    rating: 4.9
  },
  {
    id: 14,
    category: 'Advanced Prompt Engineering',
    title: 'Multi-Perspective Analyst',
    prompt: "Analyze [INSERT TOPIC OR DECISION] from multiple expert perspectives. Include: 1) Technical expert viewpoint with pros/cons, 2) Business strategist perspective with market implications, 3) Risk analyst assessment with mitigation strategies, 4) End-user advocate concerns and benefits, 5) Synthesis with weighted recommendations and implementation timeline.",
    tier: 'premium',
    tags: ['analysis', 'multi-perspective', 'decision-making', 'strategy'],
    usageCount: 987,
    rating: 4.8
  },
  {
    id: 15,
    category: 'Advanced Prompt Engineering',
    title: 'Structured Research Framework',
    prompt: "Conduct comprehensive research on [INSERT RESEARCH TOPIC] using this framework: 1) Define research questions and scope, 2) Identify key information sources and their reliability, 3) Categorize findings by themes and credibility, 4) Highlight contradictory evidence, 5) Synthesize insights with actionable recommendations and knowledge gaps requiring further investigation.",
    tier: 'premium',
    tags: ['research', 'framework', 'analysis', 'methodology'],
    usageCount: 834,
    rating: 4.7
  },
  // Marketing Automation Prompts (Pro)
  {
    id: 16,
    category: 'Marketing Automation',
    title: 'Customer Journey Email Sequence',
    prompt: "Create a 7-email automated sequence for [INSERT PRODUCT/SERVICE] targeting [INSERT AUDIENCE]. Include: Welcome email with expectations, Value-driven content (2 emails), Social proof and testimonials, Educational content addressing objections, Soft pitch with benefits, Final conversion email with urgency. Each email should have compelling subject lines and clear CTAs.",
    tier: 'pro',
    tags: ['email-marketing', 'automation', 'customer-journey', 'conversion'],
    usageCount: 2156,
    rating: 4.8
  },
  {
    id: 17,
    category: 'Marketing Automation',
    title: 'Lead Nurturing Campaign Builder',
    prompt: "Design a multi-channel lead nurturing campaign for B2B [INSERT INDUSTRY] prospects. Include: Lead scoring criteria, Segmentation strategy by buyer stage, Content mapping for awareness/consideration/decision phases, Email cadence with personalization tokens, Social media touchpoints, and conversion tracking metrics. Specify triggers for sales handoff.",
    tier: 'pro',
    tags: ['lead-nurturing', 'b2b-marketing', 'automation', 'conversion'],
    usageCount: 1689,
    rating: 4.7
  },
  {
    id: 18,
    category: 'Marketing Automation',
    title: 'Retargeting Campaign Strategy',
    prompt: "Develop a comprehensive retargeting strategy for [INSERT BUSINESS TYPE] with audience segments: Website visitors who didn't convert, Cart abandoners, Past customers for upselling, and lookalike audiences. Include ad copy variations, budget allocation, bidding strategies, and conversion tracking setup across Facebook, Google, and LinkedIn platforms.",
    tier: 'pro',
    tags: ['retargeting', 'paid-advertising', 'conversion', 'multi-platform'],
    usageCount: 1543,
    rating: 4.6
  },
  // AI Coding Assistant Prompts (Premium)
  {
    id: 19,
    category: 'AI Coding Assistant',
    title: 'Advanced Code Architecture Review',
    prompt: "As a senior software architect, review this [INSERT PROGRAMMING LANGUAGE] codebase for [INSERT PROJECT TYPE]. Analyze: 1) Design patterns and architectural decisions, 2) Code organization and modularity, 3) Performance bottlenecks and optimization opportunities, 4) Security vulnerabilities and best practices, 5) Scalability concerns and solutions, 6) Testing coverage gaps, 7) Refactoring recommendations with implementation priority.",
    tier: 'premium',
    tags: ['code-review', 'architecture', 'optimization', 'best-practices'],
    usageCount: 756,
    rating: 4.9
  },
  {
    id: 20,
    category: 'AI Coding Assistant',
    title: 'Test-Driven Development Guide',
    prompt: "Create a comprehensive TDD implementation for [INSERT FEATURE DESCRIPTION] in [INSERT FRAMEWORK/LANGUAGE]. Include: 1) User story breakdown with acceptance criteria, 2) Test cases covering happy path, edge cases, and error scenarios, 3) Mock/stub strategies for dependencies, 4) Step-by-step implementation with red-green-refactor cycles, 5) Integration test considerations, 6) Performance test requirements.",
    tier: 'premium',
    tags: ['testing', 'tdd', 'development', 'best-practices'],
    usageCount: 643,
    rating: 4.8
  },
  {
    id: 21,
    category: 'AI Coding Assistant',
    title: 'API Design & Documentation',
    prompt: "Design a RESTful API for [INSERT APPLICATION TYPE] with these requirements: [INSERT REQUIREMENTS]. Provide: 1) Complete OpenAPI/Swagger specification, 2) Endpoint design with HTTP methods and status codes, 3) Request/response schemas with validation rules, 4) Authentication and authorization strategy, 5) Error handling patterns, 6) Rate limiting and caching strategies, 7) SDK generation considerations.",
    tier: 'premium',
    tags: ['api-design', 'documentation', 'rest', 'backend'],
    usageCount: 891,
    rating: 4.7
  },
  // Creative Writing Templates (Pro/Premium Mix)
  {
    id: 22,
    category: 'Creative Writing',
    title: 'Character Development Workshop',
    prompt: "Create a complex, multi-dimensional character for [INSERT GENRE] fiction. Develop: 1) Physical appearance and mannerisms, 2) Psychological profile with motivations and fears, 3) Backstory with formative experiences, 4) Internal and external conflicts, 5) Character arc progression, 6) Dialogue voice and speech patterns, 7) Relationships with other characters, 8) Growth trajectory throughout the story.",
    tier: 'pro',
    tags: ['creative-writing', 'character-development', 'fiction', 'storytelling'],
    usageCount: 1876,
    rating: 4.8
  },
  {
    id: 23,
    category: 'Creative Writing',
    title: 'World-Building Framework',
    prompt: "Design an immersive fictional world for [INSERT GENRE] story. Cover: 1) Geography and climate with cultural implications, 2) Political systems and power structures, 3) Economic systems and resource distribution, 4) Social hierarchies and cultural norms, 5) Technology/magic systems with limitations, 6) Historical events shaping current state, 7) Conflicts and tensions driving plot, 8) Unique elements distinguishing from similar works.",
    tier: 'premium',
    tags: ['world-building', 'fiction', 'fantasy', 'sci-fi'],
    usageCount: 1234,
    rating: 4.9
  },
  {
    id: 24,
    category: 'Creative Writing',
    title: 'Screenplay Structure Template',
    prompt: "Develop a three-act screenplay structure for [INSERT STORY CONCEPT]. Include: 1) Logline and elevator pitch, 2) Act I setup with inciting incident (pages 1-25), 3) Plot point 1 and character commitment, 4) Act II confrontation with midpoint reversal (pages 25-85), 5) Plot point 2 and dark moment, 6) Act III resolution and character transformation (pages 85-110), 7) Scene-by-scene breakdown with page counts.",
    tier: 'pro',
    tags: ['screenplay', 'structure', 'film', 'storytelling'],
    usageCount: 1542,
    rating: 4.6
  },
  {
    id: 25,
    category: 'Creative Writing',
    title: 'Poetry Analysis & Creation',
    prompt: "Analyze the structure and techniques in [INSERT POEM/POET], then create an original poem inspired by their style. Include: 1) Formal analysis of meter, rhyme scheme, and literary devices, 2) Thematic exploration and symbolic meaning, 3) Historical and cultural context, 4) Your original poem using similar techniques, 5) Line-by-line commentary on your creative choices, 6) Comparison of effectiveness between original and your version.",
    tier: 'premium',
    tags: ['poetry', 'analysis', 'creation', 'literary-devices'],
    usageCount: 687,
    rating: 4.7
  },
  // Data Analysis Prompts (Premium)
  {
    id: 26,
    category: 'Data Analysis',
    title: 'Advanced Statistical Analysis',
    prompt: "Perform comprehensive statistical analysis on [INSERT DATASET DESCRIPTION]. Execute: 1) Exploratory data analysis with distribution analysis and outlier detection, 2) Correlation analysis between variables with significance testing, 3) Appropriate statistical tests based on data type and research questions, 4) Effect size calculations and practical significance, 5) Confidence intervals and margin of error, 6) Data visualization recommendations, 7) Actionable insights with business implications.",
    tier: 'premium',
    tags: ['statistics', 'data-analysis', 'research', 'insights'],
    usageCount: 923,
    rating: 4.8
  },
  {
    id: 27,
    category: 'Data Analysis',
    title: 'Predictive Modeling Framework',
    prompt: "Build a predictive model for [INSERT PREDICTION TARGET] using [INSERT DATA DESCRIPTION]. Include: 1) Feature engineering and selection strategies, 2) Model comparison (regression, tree-based, ensemble methods), 3) Cross-validation and hyperparameter tuning, 4) Model evaluation metrics appropriate for problem type, 5) Feature importance analysis, 6) Model interpretation and business insights, 7) Deployment considerations and monitoring strategy.",
    tier: 'premium',
    tags: ['machine-learning', 'predictive-modeling', 'data-science', 'algorithms'],
    usageCount: 654,
    rating: 4.9
  },
  {
    id: 28,
    category: 'Data Analysis',
    title: 'Business Intelligence Dashboard Design',
    prompt: "Design a comprehensive BI dashboard for [INSERT BUSINESS TYPE] stakeholders. Specify: 1) Key performance indicators (KPIs) by user role, 2) Data sources and integration requirements, 3) Visualization types optimal for each metric, 4) Interactive filters and drill-down capabilities, 5) Alert thresholds and notification systems, 6) Mobile responsiveness considerations, 7) Update frequency and data freshness requirements, 8) User access controls and permissions.",
    tier: 'premium',
    tags: ['business-intelligence', 'dashboard', 'kpi', 'visualization'],
    usageCount: 1456,
    rating: 4.7
  },
  
  // POML Structured Prompts Category
  {
    id: 29,
    category: 'POML Structured Prompts',
    title: 'Content Creation Assistant',
    prompt: `<poml>
  <role expertise="content-marketing" tone="professional">
    You are a senior content marketing specialist with expertise in creating engaging, SEO-optimized content.
  </role>
  
  <task>
    Create compelling [INSERT CONTENT TYPE] about [INSERT TOPIC] for [INSERT TARGET AUDIENCE]
  </task>
  
  <context>
    Brand voice: [INSERT BRAND VOICE]
    Key messages: [INSERT KEY MESSAGES]
    Content goals: [INSERT GOALS - awareness/engagement/conversion]
  </context>
  
  <instructions>
    1. Research trending keywords related to the topic
    2. Craft attention-grabbing headlines
    3. Structure content with clear sections
    4. Include relevant examples and data points
    5. Add compelling calls-to-action
  </instructions>
  
  <example type="demonstration">
    <input>Blog post about sustainable business practices for small businesses</input>
    <output style="structured">
      Headline: "5 Simple Sustainable Practices That Cut Costs and Boost Your Small Business Reputation"
      Introduction: Hook with surprising statistic about consumer preferences
      Main sections with actionable tips and ROI data
      Conclusion with clear next steps
    </output>
  </example>
  
  <output-format style="structured" length="comprehensive">
    - Compelling headline with emotional hook
    - Introduction that captures attention
    - Well-organized main content with subheadings
    - Include relevant statistics and examples
    - Strong conclusion with clear call-to-action
    - SEO-optimized with natural keyword integration
  </output-format>
</poml>`,
    tier: 'free',
    tags: ['poml', 'content-creation', 'marketing', 'structured'],
    usageCount: 892,
    rating: 4.9
  },
  
  {
    id: 30,
    category: 'POML Structured Prompts',
    title: 'Data Analysis Framework',
    prompt: `<poml>
  <role expertise="data-science" experience="senior">
    You are a senior data scientist with 10+ years of experience in statistical analysis and business intelligence.
  </role>
  
  <task>
    Analyze the provided dataset and generate actionable business insights
  </task>
  
  <context>
    Business objective: [INSERT OBJECTIVE]
    Industry: [INSERT INDUSTRY]
    Key stakeholders: [INSERT STAKEHOLDERS]
  </context>
  
  <instructions>
    1. Perform exploratory data analysis
    2. Identify patterns, trends, and anomalies
    3. Conduct statistical significance tests where appropriate
    4. Generate visualizations for key findings
    5. Provide business recommendations with confidence intervals
  </instructions>
  
  <data>
    <table src="[INSERT DATA SOURCE]" format="csv" />
    <metadata>
      Columns: [INSERT COLUMN DESCRIPTIONS]
      Date range: [INSERT DATE RANGE]
      Sample size: [INSERT SIZE]
    </metadata>
  </data>
  
  <output-format format="structured">
    ## Executive Summary
    - Key findings (3-5 bullet points)
    - Primary recommendations
    
    ## Data Overview
    - Dataset characteristics
    - Data quality assessment
    
    ## Key Insights
    - Trend analysis with statistical significance
    - Anomaly detection results
    - Pattern recognition findings
    
    ## Visualizations
    - Recommended chart types for each insight
    - Dashboard layout suggestions
    
    ## Business Recommendations
    - Actionable next steps
    - Expected impact and timeline
    - Risk assessment
  </output-format>
</poml>`,
    tier: 'pro',
    tags: ['poml', 'data-analysis', 'business-intelligence', 'structured'],
    usageCount: 654,
    rating: 4.8
  },
  
  {
    id: 31,
    category: 'POML Structured Prompts',
    title: 'Educational Content Designer',
    prompt: `<poml>
  <role persona="expert-educator" teaching-style="engaging">
    You are an experienced educational content designer who specializes in creating engaging, accessible learning materials for diverse audiences.
  </role>
  
  <task>
    Design a comprehensive learning module about [INSERT TOPIC] for [INSERT LEARNER LEVEL]
  </task>
  
  <context>
    Learning objectives: [INSERT OBJECTIVES]
    Time allocation: [INSERT DURATION]
    Delivery method: [INSERT METHOD - online/in-person/hybrid]
    Assessment requirements: [INSERT ASSESSMENT TYPE]
  </context>
  
  <instructions style="systematic">
    1. Define clear learning outcomes using Bloom's taxonomy
    2. Structure content using progressive disclosure
    3. Include multiple learning modalities (visual, auditory, kinesthetic)
    4. Design interactive elements and knowledge checks
    5. Create assessment rubrics aligned with objectives
  </instructions>
  
  <example type="few-shot">
    <input>Topic: Photosynthesis for 5th grade students</input>
    <output>
      Learning Outcome: Students will explain the photosynthesis process
      Hook: "Plants are like tiny solar panels!"
      Interactive: Virtual experiment simulation
      Assessment: Draw and label photosynthesis diagram
    </output>
  </example>
  
  <constraints>
    - Age-appropriate language and examples
    - Accessible design (WCAG 2.1 compliance)
    - Cultural sensitivity and inclusivity
    - Maximum cognitive load per section
  </constraints>
  
  <output-format style="comprehensive">
    ## Module Overview
    - Title and description
    - Learning objectives (SMART format)
    - Prerequisites and target audience
    
    ## Content Structure
    - Lesson sequence with timing
    - Key concepts and terminology
    - Learning activities and interactions
    
    ## Assessment Design
    - Formative assessment checkpoints
    - Summative assessment options
    - Rubrics and success criteria
    
    ## Resources & Materials
    - Required materials and technology
    - Supplementary resources
    - Accessibility accommodations
  </output-format>
</poml>`,
    tier: 'pro',
    tags: ['poml', 'education', 'instructional-design', 'learning'],
    usageCount: 423,
    rating: 4.9
  },
  
  {
    id: 32,
    category: 'POML Structured Prompts',
    title: 'Strategic Planning Consultant',
    prompt: `<poml>
  <variable name="planning_horizon" value="[INSERT: 1-year/3-year/5-year]" />
  <variable name="organization_size" value="[INSERT: startup/SME/enterprise]" />
  <variable name="industry" value="[INSERT INDUSTRY]" />
  
  <role expertise="strategic-consulting" experience="executive">
    You are a senior strategy consultant with 15+ years helping {organization_size} companies in {industry} develop and execute strategic plans.
  </role>
  
  <task>
    Develop a comprehensive {planning_horizon} strategic plan for [INSERT COMPANY NAME] focusing on [INSERT STRATEGIC PRIORITIES]
  </task>
  
  <context>
    Current situation: [INSERT CURRENT STATE]
    Market conditions: [INSERT MARKET ANALYSIS]
    Competitive landscape: [INSERT COMPETITIVE CONTEXT]
    Resource constraints: [INSERT CONSTRAINTS]
  </context>
  
  <instructions methodology="structured">
    1. Conduct situational analysis (SWOT + market forces)
    2. Define strategic vision and objectives
    3. Identify strategic initiatives and priorities
    4. Develop implementation roadmap with milestones
    5. Create resource allocation framework
    6. Establish KPIs and monitoring system
  </instructions>
  
  <if condition="organization_size == 'startup'">
    <focus-areas>Product-market fit, funding strategy, team scaling</focus-areas>
  </if>
  <if condition="organization_size == 'enterprise'">
    <focus-areas>Digital transformation, operational efficiency, market expansion</focus-areas>
  </if>
  
  <output-format style="executive-presentation">
    ## Executive Summary
    - Strategic vision (30-word statement)
    - Key objectives and success metrics
    - Resource requirements and timeline
    
    ## Situational Analysis
    - Internal capabilities assessment
    - Market opportunity analysis
    - Competitive positioning
    - Risk assessment matrix
    
    ## Strategic Framework
    - Strategic pillars and initiatives
    - Priority matrix (impact vs effort)
    - Resource allocation model
    
    ## Implementation Roadmap
    - {planning_horizon} timeline with major milestones
    - Quarterly objectives and key results
    - Success metrics and KPI dashboard
    - Risk mitigation strategies
    
    ## Governance Structure
    - Decision-making framework
    - Progress monitoring system
    - Stakeholder communication plan
  </output-format>
</poml>`,
    tier: 'premium',
    tags: ['poml', 'strategic-planning', 'consulting', 'business-strategy'],
    usageCount: 287,
    rating: 5.0
  },
  
  {
    id: 33,
    category: 'POML Structured Prompts',
    title: 'Customer Research Analyst',
    prompt: `<poml>
  <role expertise="user-research" methodology="mixed-methods">
    You are a senior UX researcher specializing in customer insights and behavioral analysis.
  </role>
  
  <task>
    Design and execute a comprehensive customer research study for [INSERT RESEARCH OBJECTIVE]
  </task>
  
  <research-parameters>
    <target-audience>[INSERT TARGET SEGMENTS]</target-audience>
    <research-questions>[INSERT RESEARCH QUESTIONS]</research-questions>
    <timeline>[INSERT STUDY TIMELINE]</timeline>
    <budget-constraints>[INSERT BUDGET RANGE]</budget-constraints>
  </research-parameters>
  
  <instructions>
    1. Select appropriate research methodologies (qual + quant)
    2. Design data collection instruments
    3. Create participant recruitment strategy
    4. Plan data analysis approach
    5. Develop insights framework and reporting structure
  </instructions>
  
  <example type="case-study">
    <scenario>E-commerce checkout abandonment research</scenario>
    <methodology>User interviews + analytics + heatmaps + survey</methodology>
    <outcome>Identified 3 key friction points, 23% conversion improvement</outcome>
  </example>
  
  <data-collection>
    <qualitative>User interviews, focus groups, ethnographic studies</qualitative>
    <quantitative>Surveys, analytics, A/B tests, behavioral data</quantitative>
    <tools>Recommended research tools and platforms</tools>
  </data-collection>
  
  <output-format style="research-report">
    ## Research Design
    - Methodology selection and rationale
    - Participant criteria and recruitment plan
    - Data collection timeline and protocols
    
    ## Study Execution Plan
    - Detailed research protocols
    - Quality assurance measures
    - Risk mitigation strategies
    
    ## Analysis Framework
    - Data analysis methods
    - Statistical approaches (if applicable)
    - Insight synthesis process
    
    ## Deliverables Timeline
    - Research milestones and checkpoints
    - Reporting schedule and formats
    - Stakeholder presentation plan
  </output-format>
</poml>`,
    tier: 'pro',
    tags: ['poml', 'user-research', 'customer-insights', 'methodology'],
    usageCount: 356,
    rating: 4.7
  },
  
  {
    id: 34,
    category: 'POML Structured Prompts', 
    title: 'Technical Documentation Writer',
    prompt: `<poml>
  <role expertise="technical-writing" audience-focus="developer">
    You are a senior technical writer with expertise in creating clear, comprehensive documentation for software products and APIs.
  </role>
  
  <task>
    Create complete technical documentation for [INSERT SOFTWARE/API/SYSTEM]
  </task>
  
  <context>
    Target audience: [INSERT AUDIENCE LEVEL - beginner/intermediate/advanced]
    Documentation type: [INSERT TYPE - API docs/user guide/integration guide]
    Technical stack: [INSERT TECHNOLOGIES]
    Use cases: [INSERT PRIMARY USE CASES]
  </context>
  
  <requirements>
    <completeness>Cover all features and edge cases</completeness>
    <clarity>Use clear, jargon-free language with examples</clarity>
    <structure>Logical information hierarchy</structure>
    <maintenance>Easy to update and version control</maintenance>
  </requirements>
  
  <instructions>
    1. Analyze user journeys and information needs
    2. Create logical documentation structure
    3. Write clear explanations with code examples
    4. Include troubleshooting and FAQ sections
    5. Add visual diagrams where helpful
  </instructions>
  
  <style-guide>
    <tone>Professional, helpful, concise</tone>
    <formatting>Consistent headings, code blocks, callouts</formatting>
    <examples>Real-world scenarios with working code</examples>
  </style-guide>
  
  <output-format style="technical-doc">
    ## Documentation Structure
    - Table of contents with clear hierarchy
    - Getting started guide with quick wins
    - Detailed feature documentation
    - API reference (if applicable)
    
    ## Content Guidelines
    - Introduction and overview sections
    - Step-by-step tutorials with screenshots
    - Code examples with explanations
    - Troubleshooting guide with common issues
    
    ## Quality Assurance
    - Technical accuracy checklist
    - Usability testing recommendations
    - Documentation maintenance plan
  </output-format>
</poml>`,
    tier: 'free',
    tags: ['poml', 'technical-writing', 'documentation', 'developer-tools'],
    usageCount: 567,
    rating: 4.8
  }
];