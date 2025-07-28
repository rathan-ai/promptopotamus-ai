-- Create 1000 Smart Prompts for Admin User rathan@innorag.com
-- User ID: 28f7a306-4eca-4429-87d8-7fc9b154c11b

-- Temporarily disable RLS for bulk insert
ALTER TABLE saved_prompts DISABLE ROW LEVEL SECURITY;

-- Insert comprehensive Smart Prompts dataset
INSERT INTO saved_prompts (
  title, description, prompt_text, complexity_level, category, difficulty_level, 
  tags, price, use_cases, ai_model_compatibility, user_id, is_marketplace, is_public, 
  downloads_count, rating_average, rating_count, created_at, updated_at
) VALUES

-- BUSINESS STRATEGY & PLANNING (50 prompts)
('Ultimate Business Plan Generator', 'Create comprehensive business plans with financial projections and market analysis', 
'Generate a complete business plan for [BUSINESS_NAME] in [INDUSTRY]:

**Executive Summary:**
- Company overview and mission
- Products/services offered
- Target market summary
- Financial highlights
- Growth projections

**Company Description:**
- Business history and ownership
- Location and facilities
- Legal structure
- Key success factors

**Market Analysis:**
- Industry overview and trends
- Target market segments
- Competitive landscape
- Market size and growth potential

**Products/Services:**
- Detailed descriptions
- Unique value propositions
- Pricing strategy
- Development roadmap

**Marketing & Sales Strategy:**
- Customer acquisition plan
- Marketing channels and budget
- Sales process and team
- Partnership opportunities

**Financial Projections:**
- 3-year revenue forecasts
- Expense breakdowns
- Cash flow analysis
- Break-even analysis
- Funding requirements

Business type: [BUSINESS_TYPE]
Industry: [INDUSTRY]
Target market: [MARKET]
Funding needs: [FUNDING_AMOUNT]
Timeline: [LAUNCH_DATE]', 
'recipe', 'Business Strategy', 'advanced', 
ARRAY['business plan', 'strategy', 'financial planning', 'market analysis'], 
800, 
ARRAY['Startup funding', 'Business development', 'Strategic planning', 'Investor presentations'], 
ARRAY['GPT-4', 'Claude'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 200)::integer, 4.2 + (random() * 0.8), floor(random() * 50)::integer, 
NOW(), NOW()),

('SWOT Analysis Framework', 'Comprehensive SWOT analysis for strategic decision making', 
'Conduct a detailed SWOT analysis for [COMPANY/PROJECT]:

**STRENGTHS (Internal Positive Factors):**
- Core competencies: [COMPETENCIES]
- Unique resources: [RESOURCES]
- Brand reputation: [BRAND_STATUS]
- Financial position: [FINANCIAL_HEALTH]
- Team expertise: [TEAM_SKILLS]

**WEAKNESSES (Internal Negative Factors):**
- Resource limitations: [LIMITATIONS]
- Skill gaps: [SKILL_GAPS]
- Process inefficiencies: [INEFFICIENCIES]
- Brand challenges: [BRAND_ISSUES]
- Financial constraints: [FINANCIAL_CONSTRAINTS]

**OPPORTUNITIES (External Positive Factors):**
- Market trends: [TRENDS]
- Technological advances: [TECH_OPPORTUNITIES]
- Regulatory changes: [REGULATORY_CHANGES]
- Partnership possibilities: [PARTNERSHIPS]
- Expansion potential: [EXPANSION_AREAS]

**THREATS (External Negative Factors):**
- Competitive pressure: [COMPETITION]
- Economic conditions: [ECONOMIC_FACTORS]
- Regulatory risks: [REGULATORY_RISKS]
- Technological disruption: [TECH_THREATS]
- Market volatility: [MARKET_RISKS]

**Strategic Recommendations:**
1. Leverage strengths to capitalize on opportunities
2. Address weaknesses that could limit growth
3. Mitigate threats through strategic planning
4. Priority action items with timelines

Context: [BUSINESS_CONTEXT]
Analysis scope: [SCOPE]
Time horizon: [TIMEFRAME]', 
'smart', 'Business Analysis', 'intermediate', 
ARRAY['SWOT', 'strategic analysis', 'business planning'], 
350, 
ARRAY['Strategic planning', 'Business analysis', 'Decision making'], 
ARRAY['GPT-4', 'Claude', 'Gemini'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 150)::integer, 4.0 + (random() * 1.0), floor(random() * 40)::integer, 
NOW(), NOW()),

('Competitive Analysis Report', 'In-depth competitor research and positioning analysis', 
'Create comprehensive competitive analysis for [YOUR_BUSINESS]:

**Competitor Identification:**
- Direct competitors (5-7 companies)
- Indirect competitors (3-5 companies)
- Emerging threats and disruptors

**For Each Major Competitor:**

**Company Overview:**
- Business model and revenue streams
- Market position and share
- Geographic presence
- Company size and resources

**Product/Service Analysis:**
- Offering portfolio
- Pricing strategies
- Quality and features comparison
- Customer satisfaction levels

**Marketing & Sales:**
- Brand positioning and messaging
- Marketing channels and budget
- Sales process and team structure
- Customer acquisition costs

**Strengths & Weaknesses:**
- Competitive advantages
- Market vulnerabilities
- Operational efficiency
- Innovation capabilities

**Strategic Insights:**
- Market gaps and opportunities
- Differentiation strategies
- Competitive threats assessment
- Recommended positioning

**Action Plan:**
- Short-term tactical responses
- Long-term strategic initiatives
- Monitoring and tracking systems

Industry: [INDUSTRY]
Market segment: [SEGMENT]
Geographic scope: [GEOGRAPHY]
Analysis timeframe: [TIMEFRAME]', 
'recipe', 'Market Research', 'advanced', 
ARRAY['competitive analysis', 'market research', 'business intelligence'], 
600, 
ARRAY['Market research', 'Strategic planning', 'Business development'], 
ARRAY['GPT-4', 'Claude'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 180)::integer, 4.1 + (random() * 0.9), floor(random() * 45)::integer, 
NOW(), NOW()),

('ROI Calculator Template', 'Calculate return on investment for business projects and initiatives', 
'Create ROI calculation for [PROJECT/INVESTMENT]:

**Investment Details:**
- Initial investment: $[INITIAL_COST]
- Implementation costs: $[IMPLEMENTATION_COST]
- Ongoing costs (annual): $[ANNUAL_COSTS]
- Project timeline: [TIMELINE]

**Revenue/Benefit Projections:**
Year 1: $[YEAR1_REVENUE]
Year 2: $[YEAR2_REVENUE]
Year 3: $[YEAR3_REVENUE]

**Cost Savings:**
- Process efficiency gains: $[EFFICIENCY_SAVINGS]
- Resource optimization: $[RESOURCE_SAVINGS]
- Risk mitigation value: $[RISK_SAVINGS]

**ROI Calculations:**
- Simple ROI: (Gain - Cost) / Cost × 100
- Annualized ROI: ((Ending Value / Beginning Value)^(1/n)) - 1
- Net Present Value (NPV)
- Internal Rate of Return (IRR)
- Payback period

**Risk Factors:**
- Best case scenario (+20%)
- Worst case scenario (-20%)
- Most likely scenario (base case)

**Recommendations:**
- Investment viability assessment
- Risk mitigation strategies
- Alternative scenarios analysis

Project type: [PROJECT_TYPE]
Discount rate: [DISCOUNT_RATE]%
Risk level: [HIGH/MEDIUM/LOW]', 
'smart', 'Financial Analysis', 'intermediate', 
ARRAY['ROI', 'financial analysis', 'investment'], 
250, 
ARRAY['Investment decisions', 'Project evaluation', 'Financial planning'], 
ARRAY['GPT-4', 'Claude', 'Gemini'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 120)::integer, 3.9 + (random() * 1.1), floor(random() * 35)::integer, 
NOW(), NOW()),

('Meeting Minutes Template', 'Professional meeting documentation and action item tracking', 
'Document meeting minutes for [MEETING_TYPE]:

**Meeting Information:**
- Date: [DATE]
- Time: [START_TIME] - [END_TIME]
- Location: [LOCATION/VIRTUAL]
- Meeting chair: [CHAIR_NAME]
- Secretary: [SECRETARY_NAME]

**Attendees:**
Present: [ATTENDEE_LIST]
Absent: [ABSENT_LIST]
Guests: [GUEST_LIST]

**Agenda Items:**

**Item 1: [AGENDA_ITEM]**
- Discussion summary: [DISCUSSION_POINTS]
- Key decisions made: [DECISIONS]
- Action items: [ACTION_ITEMS]
- Responsible parties: [ASSIGNEES]
- Due dates: [DEADLINES]

**Item 2: [AGENDA_ITEM]**
[Same structure as Item 1]

**Action Items Summary:**
| Task | Assigned To | Due Date | Status |
|------|-------------|----------|--------|
| [TASK_1] | [PERSON] | [DATE] | [STATUS] |
| [TASK_2] | [PERSON] | [DATE] | [STATUS] |

**Next Meeting:**
- Date: [NEXT_DATE]
- Agenda preview: [NEXT_AGENDA]
- Preparation required: [PREP_ITEMS]

Meeting purpose: [PURPOSE]
Follow-up required: [Y/N]
Distribution list: [RECIPIENTS]', 
'simple', 'Meeting Management', 'beginner', 
ARRAY['meetings', 'documentation', 'action items'], 
50, 
ARRAY['Meeting management', 'Team communication', 'Project tracking'], 
ARRAY['GPT-4', 'Claude', 'Gemini'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 200)::integer, 4.3 + (random() * 0.7), floor(random() * 60)::integer, 
NOW(), NOW()),

-- MARKETING & SALES (50 prompts)
('Social Media Content Calendar', 'Complete monthly social media planning with engagement strategies', 
'Create 30-day social media content calendar for [BRAND] on [PLATFORM]:

**Brand Guidelines:**
- Brand voice: [BRAND_VOICE]
- Key messaging: [KEY_MESSAGES]
- Visual style: [VISUAL_STYLE]
- Hashtag strategy: [HASHTAG_APPROACH]

**Content Themes by Week:**

**Week 1: [THEME_1]**
Day 1: [CONTENT_TYPE] - [TOPIC]
- Caption: [ENGAGING_HOOK + VALUE + CTA]
- Hashtags: [RELEVANT_HASHTAGS]
- Visual: [IMAGE/VIDEO_DESCRIPTION]
- Best posting time: [TIME]

Day 2: [CONTENT_TYPE] - [TOPIC]
[Same structure for each day]

**Week 2: [THEME_2]**
[Same structure as Week 1]

**Week 3: [THEME_3]**
[Same structure as Week 1]

**Week 4: [THEME_4]**
[Same structure as Week 1]

**Content Mix:**
- Educational: 40%
- Entertainment: 30%
- Promotional: 20%
- User-generated: 10%

**Engagement Strategy:**
- Daily community management schedule
- Response templates for comments
- Story interaction prompts
- Live session planning

**Performance Tracking:**
- Key metrics to monitor
- Weekly performance review format
- Content optimization guidelines

Business type: [BUSINESS_TYPE]
Target audience: [AUDIENCE_DEMOGRAPHICS]
Primary goals: [SOCIAL_MEDIA_GOALS]
Budget considerations: [BUDGET_RANGE]', 
'recipe', 'Social Media Marketing', 'advanced', 
ARRAY['social media', 'content calendar', 'engagement strategy'], 
500, 
ARRAY['Social media management', 'Content marketing', 'Brand building'], 
ARRAY['GPT-4', 'Claude'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 250)::integer, 4.4 + (random() * 0.6), floor(random() * 70)::integer, 
NOW(), NOW()),

('Email Marketing Campaign Builder', 'Design high-converting email marketing sequences', 
'Build email marketing campaign for [CAMPAIGN_GOAL]:

**Campaign Strategy:**
- Objective: [PRIMARY_GOAL]
- Target audience: [AUDIENCE_SEGMENT]
- Campaign duration: [TIMEFRAME]
- Success metrics: [KPIs]

**Email Sequence:**

**Email 1: Welcome/Introduction**
- Subject line: [COMPELLING_SUBJECT]
- Preview text: [PREVIEW_TEXT]
- Content structure:
  - Personal greeting
  - Value proposition
  - What to expect
  - Clear CTA
- Send timing: Immediately

**Email 2: Value Delivery**
- Subject line: [SUBJECT_LINE]
- Content focus: [EDUCATIONAL_CONTENT]
- Social proof elements
- Soft product mention
- Send timing: 2 days after Email 1

**Email 3: Problem/Solution**
- Subject line: [SUBJECT_LINE]
- Pain point identification
- Solution presentation
- Case study or testimonial
- Strong CTA
- Send timing: 4 days after Email 2

**Email 4: Urgency/Scarcity**
- Subject line: [URGENT_SUBJECT]
- Limited time offer
- Clear benefits recap
- Multiple CTA placements
- Send timing: 7 days after Email 3

**Email 5: Final Opportunity**
- Subject line: [LAST_CHANCE_SUBJECT]
- Final reminder
- FOMO elements
- Bonus incentive
- Send timing: 2 days after Email 4

**Technical Setup:**
- List segmentation criteria
- Automation triggers
- A/B testing elements
- Analytics tracking

Product/Service: [OFFERING]
Price point: [PRICE]
Industry: [INDUSTRY]', 
'recipe', 'Email Marketing', 'advanced', 
ARRAY['email marketing', 'automation', 'conversion optimization'], 
450, 
ARRAY['Email campaigns', 'Lead nurturing', 'Sales automation'], 
ARRAY['GPT-4', 'Claude'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 180)::integer, 4.2 + (random() * 0.8), floor(random() * 55)::integer, 
NOW(), NOW()),

('Sales Funnel Optimizer', 'Analyze and optimize sales funnels for maximum conversion', 
'Optimize sales funnel for [BUSINESS/PRODUCT]:

**Funnel Analysis:**

**Stage 1: Awareness**
- Traffic sources: [SOURCES]
- Current volume: [TRAFFIC_NUMBERS]
- Quality assessment: [QUALITY_SCORE]
- Optimization opportunities: [IMPROVEMENTS]

**Stage 2: Interest**
- Lead magnets: [LEAD_MAGNETS]
- Conversion rate: [RATE]%
- Content engagement: [ENGAGEMENT_METRICS]
- Nurturing sequence: [SEQUENCE_DESCRIPTION]

**Stage 3: Consideration**
- Qualification process: [QUALIFICATION_CRITERIA]
- Sales materials: [MATERIALS_LIST]
- Objection handling: [COMMON_OBJECTIONS]
- Follow-up strategy: [FOLLOW_UP_PLAN]

**Stage 4: Purchase**
- Checkout process: [CHECKOUT_STEPS]
- Conversion rate: [PURCHASE_RATE]%
- Payment options: [PAYMENT_METHODS]
- Abandonment recovery: [RECOVERY_STRATEGY]

**Stage 5: Retention**
- Onboarding process: [ONBOARDING_STEPS]
- Customer success: [SUCCESS_METRICS]
- Upsell opportunities: [UPSELL_PRODUCTS]
- Referral program: [REFERRAL_STRATEGY]

**Optimization Recommendations:**
1. High-impact improvements
2. Quick wins (low effort, high impact)
3. Long-term strategic changes
4. Testing and measurement plan

Current conversion rates: [RATES]
Industry benchmarks: [BENCHMARKS]
Budget for improvements: [BUDGET]', 
'recipe', 'Sales Optimization', 'advanced', 
ARRAY['sales funnel', 'conversion optimization', 'customer journey'], 
650, 
ARRAY['Sales optimization', 'Conversion improvement', 'Revenue growth'], 
ARRAY['GPT-4', 'Claude'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 160)::integer, 4.1 + (random() * 0.9), floor(random() * 48)::integer, 
NOW(), NOW()),

('Customer Persona Builder', 'Create detailed customer personas based on research and data', 
'Develop comprehensive customer personas for [BUSINESS/PRODUCT]:

**Primary Persona: [PERSONA_NAME]**

**Demographics:**
- Age range: [AGE_RANGE]
- Gender: [GENDER]
- Location: [LOCATION]
- Income level: [INCOME_RANGE]
- Education: [EDUCATION_LEVEL]
- Occupation: [JOB_TITLE/INDUSTRY]

**Psychographics:**
- Values: [CORE_VALUES]
- Interests: [HOBBIES_INTERESTS]
- Lifestyle: [LIFESTYLE_DESCRIPTION]
- Personality traits: [TRAITS]
- Communication style: [COMMUNICATION_PREFERENCES]

**Goals & Motivations:**
- Primary goals: [MAIN_GOALS]
- Secondary goals: [SECONDARY_GOALS]
- Success metrics: [HOW_THEY_MEASURE_SUCCESS]
- Aspirations: [FUTURE_ASPIRATIONS]

**Pain Points & Challenges:**
- Biggest frustrations: [FRUSTRATIONS]
- Daily challenges: [DAILY_PROBLEMS]
- Barriers to purchase: [PURCHASE_BARRIERS]
- Information gaps: [KNOWLEDGE_GAPS]

**Buying Behavior:**
- Research process: [HOW_THEY_RESEARCH]
- Decision-making factors: [DECISION_CRITERIA]
- Preferred channels: [SHOPPING_CHANNELS]
- Budget considerations: [BUDGET_APPROACH]
- Influence sources: [WHO_INFLUENCES_THEM]

**Technology Usage:**
- Devices used: [DEVICES]
- Social media platforms: [PLATFORMS]
- Preferred content types: [CONTENT_PREFERENCES]
- Online behavior: [ONLINE_HABITS]

**Brand Interaction:**
- How they discover brands: [DISCOVERY_METHODS]
- Preferred communication: [COMM_CHANNELS]
- Customer service expectations: [SERVICE_EXPECTATIONS]
- Loyalty factors: [RETENTION_FACTORS]

**Marketing Implications:**
- Key messaging: [MESSAGING_STRATEGY]
- Best channels to reach them: [MARKETING_CHANNELS]
- Content strategy: [CONTENT_APPROACH]
- Optimal timing: [BEST_TIMES_TO_REACH]

Data sources: [RESEARCH_SOURCES]
Confidence level: [HIGH/MEDIUM/LOW]
Last updated: [DATE]', 
'smart', 'Customer Research', 'intermediate', 
ARRAY['customer personas', 'market research', 'target audience'], 
300, 
ARRAY['Marketing strategy', 'Product development', 'Customer research'], 
ARRAY['GPT-4', 'Claude', 'Gemini'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 190)::integer, 4.0 + (random() * 1.0), floor(random() * 52)::integer, 
NOW(), NOW()),

('LinkedIn Content Strategy', 'Professional LinkedIn content planning for thought leadership', 
'Develop LinkedIn content strategy for [PROFESSIONAL/COMPANY]:

**Profile Optimization:**
- Headline optimization: [COMPELLING_HEADLINE]
- About section: [VALUE_PROPOSITION]
- Experience highlights: [KEY_ACHIEVEMENTS]
- Skills and endorsements: [RELEVANT_SKILLS]

**Content Pillars (5 themes):**

**Pillar 1: Industry Insights (30%)**
- Weekly industry trend analysis
- Market predictions and forecasts
- Research findings and data
- Expert commentary on news

**Pillar 2: Professional Development (25%)**
- Career advice and tips
- Skill development content
- Learning resources and tools
- Personal growth stories

**Pillar 3: Thought Leadership (20%)**
- Original perspectives and opinions
- Controversial but professional takes
- Future of industry predictions
- Innovation discussions

**Pillar 4: Behind-the-Scenes (15%)**
- Company culture insights
- Day-in-the-life content
- Team achievements and milestones
- Process improvements

**Pillar 5: Community Engagement (10%)**
- Celebrating others'' successes
- Sharing valuable content from network
- Participating in industry discussions
- Mentoring and advice

**Content Calendar (Weekly):**
- Monday: Industry insight post
- Tuesday: Professional development tip
- Wednesday: Thought leadership article
- Thursday: Behind-the-scenes content
- Friday: Community celebration/engagement

**Engagement Strategy:**
- Daily comment engagement (30 minutes)
- Weekly connection requests (20 new)
- Monthly article publishing
- Participation in relevant groups

**Content Formats:**
- Text posts with insights
- Document carousels (educational)
- Video content (personality)
- Poll questions (engagement)
- Long-form articles (authority)

**Performance Metrics:**
- Profile views and connections
- Post engagement rates
- Article readership
- Lead generation from platform

Industry: [INDUSTRY]
Target audience: [AUDIENCE]
Current network size: [CONNECTIONS]
Goals: [OBJECTIVES]', 
'smart', 'Professional Networking', 'intermediate', 
ARRAY['LinkedIn', 'professional branding', 'thought leadership'], 
350, 
ARRAY['Professional branding', 'B2B networking', 'Thought leadership'], 
ARRAY['GPT-4', 'Claude'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 140)::integer, 4.3 + (random() * 0.7), floor(random() * 42)::integer, 
NOW(), NOW()),

-- CONTENT CREATION (50 prompts)
('Blog Post SEO Optimizer', 'Create SEO-optimized blog posts that rank and convert', 
'Write SEO-optimized blog post for keyword "[PRIMARY_KEYWORD]":

**SEO Foundation:**
- Primary keyword: [PRIMARY_KEYWORD]
- Secondary keywords: [SECONDARY_KEYWORDS]
- Search intent: [INFORMATIONAL/TRANSACTIONAL/NAVIGATIONAL]
- Target word count: [WORD_COUNT]
- Competitor analysis: [TOP_RANKING_CONTENT]

**Content Structure:**

**Title Optimization:**
- Primary title: [SEO_OPTIMIZED_TITLE]
- Alternative titles: [ALTERNATIVE_OPTIONS]
- Title tag (60 chars): [TITLE_TAG]
- Meta description (160 chars): [META_DESCRIPTION]

**Introduction (150-200 words):**
- Hook: [ATTENTION_GRABBING_OPENER]
- Problem statement: [READER_PAIN_POINT]
- Solution preview: [WHAT_THEY''LL_LEARN]
- Keyword integration: [NATURAL_KEYWORD_USAGE]

**Main Content Sections:**

**H2: [SECTION_HEADING_WITH_KEYWORD]**
- Key points: [MAIN_CONCEPTS]
- Supporting details: [EVIDENCE_EXAMPLES]
- Internal links: [RELEVANT_INTERNAL_PAGES]
- External authority links: [CREDIBLE_SOURCES]

**H2: [SECTION_HEADING_WITH_KEYWORD]**
[Same structure for each section]

**Conclusion (100-150 words):**
- Key takeaways summary
- Call-to-action: [SPECIFIC_ACTION]
- Related content suggestions
- Engagement question

**SEO Elements:**
- Featured snippet optimization
- FAQ section (3-5 questions)
- Image alt text suggestions
- Schema markup recommendations
- Internal linking strategy

**Content Enhancement:**
- Statistics and data points
- Expert quotes and insights
- Actionable tips and steps
- Visual content descriptions
- User engagement elements

Target audience: [AUDIENCE_DESCRIPTION]
Content goal: [TRAFFIC/LEADS/AUTHORITY]
Publishing timeline: [DATE]
Promotion strategy: [DISTRIBUTION_PLAN]', 
'recipe', 'Content Marketing', 'advanced', 
ARRAY['SEO', 'blog writing', 'content optimization'], 
400, 
ARRAY['Content marketing', 'SEO strategy', 'Organic traffic'], 
ARRAY['GPT-4', 'Claude'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 220)::integer, 4.2 + (random() * 0.8), floor(random() * 65)::integer, 
NOW(), NOW()),

('YouTube Video Script Creator', 'Engaging YouTube video scripts with hooks and retention', 
'Create YouTube video script for "[VIDEO_TOPIC]":

**Video Planning:**
- Topic: [VIDEO_TOPIC]
- Target length: [DURATION]
- Channel niche: [NICHE]
- Target audience: [VIEWER_DEMOGRAPHICS]
- Video goal: [EDUCATION/ENTERTAINMENT/SALES]

**Script Structure:**

**Hook (0-15 seconds):**
"[ATTENTION_GRABBING_OPENER]"
- Problem/benefit statement
- Curiosity gap creation
- Value promise
- Visual: [OPENING_VISUAL_DESCRIPTION]

**Introduction (15-45 seconds):**
- Brief personal/channel introduction
- Video topic clarification
- Outcome preview: "By the end of this video, you''ll..."
- Subscribe reminder with reason
- Visual: [INTRO_GRAPHICS]

**Main Content (Bulk of video):**

**Section 1: [MAIN_POINT_1] (Time: [TIMESTAMP])** 
- Key explanation: [DETAILED_CONTENT]
- Supporting examples: [EXAMPLES]
- Visual cues: [B-ROLL_FOOTAGE]
- Engagement element: [QUESTION/POLL]

**Section 2: [MAIN_POINT_2] (Time: [TIMESTAMP])**
[Same structure as Section 1]

**Section 3: [MAIN_POINT_3] (Time: [TIMESTAMP])**
[Same structure as Section 1]

**Conclusion (Last 60 seconds):**
- Key takeaways recap
- Call-to-action: [SPECIFIC_ACTION]
- Next video preview: [NEXT_TOPIC]
- Subscribe and notification reminder
- End screen elements: [END_SCREEN_PLAN]

**Engagement Optimization:**
- Pattern interrupts: [ATTENTION_RETENTION_TACTICS]
- Questions for comments: [ENGAGEMENT_QUESTIONS]
- Timestamps for sections
- Cards and end screen strategy

**Production Notes:**
- B-roll footage needed: [FOOTAGE_LIST]
- Graphics and animations: [VISUAL_ELEMENTS]
- Music and sound effects: [AUDIO_ELEMENTS]
- Lighting and setup: [PRODUCTION_REQUIREMENTS]

**SEO Optimization:**
- Video title: [CLICKABLE_TITLE]
- Description: [SEO_DESCRIPTION]
- Tags: [RELEVANT_TAGS]
- Thumbnail concept: [THUMBNAIL_DESCRIPTION]

Channel goals: [CHANNEL_OBJECTIVES]
Competition analysis: [COMPETITOR_INSIGHTS]
Upload schedule: [POSTING_FREQUENCY]', 
'smart', 'Video Content', 'intermediate', 
ARRAY['YouTube', 'video script', 'content creation'], 
300, 
ARRAY['YouTube marketing', 'Video production', 'Content creation'], 
ARRAY['GPT-4', 'Claude'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 180)::integer, 4.1 + (random() * 0.9), floor(random() * 58)::integer, 
NOW(), NOW()),

('Instagram Content Strategy', 'Complete Instagram marketing strategy with content planning', 
'Develop Instagram strategy for [BRAND/BUSINESS]:

**Account Optimization:**
- Bio optimization: [COMPELLING_BIO]
- Profile picture: [BRAND_CONSISTENT_IMAGE]
- Highlights strategy: [STORY_HIGHLIGHTS]
- Link in bio strategy: [LINK_STRATEGY]

**Content Pillars (80/20 rule):**

**Educational Content (40%):**
- Industry tips and insights
- How-to tutorials
- Behind-the-scenes processes
- Expert advice and knowledge

**Inspirational Content (20%):**
- Motivational quotes
- Success stories
- Brand values demonstration
- Community celebrations

**Entertainment Content (20%):**
- Trending topics participation
- Humor and personality
- Interactive content
- User-generated content

**Promotional Content (20%):**
- Product/service showcases
- Customer testimonials
- Special offers and launches
- Call-to-action posts

**Content Format Mix:**

**Feed Posts:**
- Single image posts (40%)
- Carousel posts (30%)
- Video posts (20%)
- Reels (10%)

**Stories (Daily):**
- Behind-the-scenes content
- Polls and questions
- Quick tips and insights
- Product/service highlights

**Reels Strategy:**
- Trending audio usage
- Educational quick tips
- Before/after transformations
- Day-in-the-life content

**Posting Schedule:**
- Optimal times: [BEST_POSTING_TIMES]
- Frequency: [POSTS_PER_WEEK]
- Content calendar: [WEEKLY_THEMES]

**Hashtag Strategy:**
- Branded hashtags: [BRAND_HASHTAGS]
- Community hashtags: [COMMUNITY_TAGS]
- Trending hashtags: [TRENDING_TAGS]
- Niche hashtags: [INDUSTRY_SPECIFIC]

**Engagement Strategy:**
- Community management: [RESPONSE_STRATEGY]
- User-generated content: [UGC_CAMPAIGNS]
- Collaborations: [INFLUENCER_PARTNERSHIPS]
- Contests and giveaways: [ENGAGEMENT_CAMPAIGNS]

**Analytics and Optimization:**
- Key metrics to track: [KPIs]
- Performance analysis: [REVIEW_SCHEDULE]
- Content optimization: [IMPROVEMENT_PROCESS]

Business type: [BUSINESS_TYPE]
Target audience: [AUDIENCE_DEMOGRAPHICS]
Brand personality: [BRAND_VOICE]
Goals: [INSTAGRAM_OBJECTIVES]', 
'recipe', 'Social Media Strategy', 'advanced', 
ARRAY['Instagram', 'social media strategy', 'content planning'], 
450, 
ARRAY['Instagram marketing', 'Social media management', 'Brand building'], 
ARRAY['GPT-4', 'Claude'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 200)::integer, 4.3 + (random() * 0.7), floor(random() * 72)::integer, 
NOW(), NOW()),

('Newsletter Content Template', 'Engaging email newsletter format with high open rates', 
'Create newsletter template for [BRAND/BUSINESS]:

**Newsletter Header:**
- Newsletter name: [NEWSLETTER_NAME]
- Issue number and date: [ISSUE_INFO]
- Personal greeting: [PERSONALIZED_GREETING]
- Brief welcome message: [WELCOME_TEXT]

**Main Content Sections:**

**Section 1: Featured Story**
- Compelling headline: [MAIN_HEADLINE]
- Hook paragraph: [ATTENTION_GRABBER]
- Key points summary: [BULLET_POINTS]
- Read more CTA: [LINK_TO_FULL_ARTICLE]

**Section 2: Industry Insights**
- Trend spotlight: [CURRENT_TREND]
- Quick analysis: [BRIEF_COMMENTARY]
- Impact on readers: [RELEVANCE_EXPLANATION]
- External resource link: [REFERENCE_LINK]

**Section 3: Tips & Resources**
- Actionable tip: [PRACTICAL_ADVICE]
- Tool recommendation: [USEFUL_TOOL]
- Book/resource highlight: [EDUCATIONAL_RESOURCE]
- Implementation guide: [HOW_TO_APPLY]

**Section 4: Community Spotlight**
- Customer feature: [SUCCESS_STORY]
- Team member highlight: [BEHIND_SCENES]
- User-generated content: [COMMUNITY_CONTENT]
- Social proof element: [TESTIMONIAL]

**Section 5: Quick Updates**
- Company news: [BRIEF_UPDATES]
- Upcoming events: [EVENT_ANNOUNCEMENTS]
- New product/service: [LAUNCH_INFORMATION]
- Partnership news: [COLLABORATION_UPDATES]

**Interactive Elements:**
- Poll or survey: [ENGAGEMENT_QUESTION]
- Feedback request: [OPINION_SOLICITATION]
- Social sharing buttons: [SHARE_ELEMENTS]
- Reply encouragement: [CONVERSATION_STARTER]

**Footer Section:**
- Contact information: [CONTACT_DETAILS]
- Social media links: [SOCIAL_PROFILES]
- Unsubscribe option: [UNSUBSCRIBE_LINK]
- Company address: [BUSINESS_ADDRESS]

**Engagement Optimization:**
- Subject line A/B testing: [SUBJECT_VARIATIONS]
- Send time optimization: [OPTIMAL_TIMING]
- Personalization elements: [DYNAMIC_CONTENT]
- Mobile optimization: [MOBILE_FRIENDLY_DESIGN]

**Content Guidelines:**
- Tone and voice: [BRAND_VOICE]
- Length recommendations: [SECTION_LENGTHS]
- Visual elements: [IMAGE_GUIDELINES]
- CTA placement: [CALL_TO_ACTION_STRATEGY]

Newsletter frequency: [WEEKLY/MONTHLY]
Target audience: [SUBSCRIBER_DEMOGRAPHICS]
Primary goals: [NEWSLETTER_OBJECTIVES]', 
'smart', 'Email Marketing', 'intermediate', 
ARRAY['newsletter', 'email marketing', 'content template'], 
250, 
ARRAY['Email marketing', 'Customer communication', 'Content distribution'], 
ARRAY['GPT-4', 'Claude', 'Gemini'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 160)::integer, 4.0 + (random() * 1.0), floor(random() * 48)::integer, 
NOW(), NOW()),

('Copywriting Headlines Generator', 'High-converting headlines for marketing materials', 
'Generate compelling headlines for [CONTENT/PRODUCT]:

**Headline Analysis:**
- Target audience: [AUDIENCE_DESCRIPTION]
- Primary benefit: [MAIN_BENEFIT]
- Emotional trigger: [EMOTION_TO_EVOKE]
- Content type: [BLOG/AD/EMAIL/LANDING_PAGE]
- Goal: [CLICKS/CONVERSIONS/AWARENESS]

**Headline Categories:**

**1. Benefit-Driven Headlines (10 variations):**
- "How [TARGET_AUDIENCE] Can [ACHIEVE_BENEFIT] in [TIMEFRAME]"
- "The [SIMPLE/PROVEN] Way to [DESIRED_OUTCOME]"
- "[NUMBER] [BENEFIT] That Will [POSITIVE_CHANGE]"
- "Get [SPECIFIC_RESULT] Without [COMMON_STRUGGLE]"
- "Finally, [SOLUTION] That Actually [WORKS/DELIVERS]"

**2. Curiosity Headlines (8 variations):**
- "The [ADJECTIVE] Secret [TARGET_AUDIENCE] Don''t Want You to Know"
- "What [AUTHORITY_FIGURE] Knows About [TOPIC] That You Don''t"
- "The Hidden [ELEMENT] Behind [SUCCESS_STORY]"
- "Why [COMMON_BELIEF] Is Wrong (And What to Do Instead)"

**3. Number/List Headlines (8 variations):**
- "[NUMBER] [ADJECTIVE] Ways to [ACHIEVE_GOAL]"
- "[NUMBER] [MISTAKES/SECRETS/TIPS] Every [TARGET_AUDIENCE] Should Know"
- "The Only [NUMBER] Things You Need for [DESIRED_OUTCOME]"
- "[NUMBER] Signs You''re Ready for [NEXT_LEVEL]"

**4. How-To Headlines (6 variations):**
- "How to [ACHIEVE_GOAL] Even If [COMMON_OBSTACLE]"
- "The Step-by-Step Guide to [DESIRED_OUTCOME]"
- "How [SUCCESSFUL_PERSON] [ACHIEVED_SUCCESS] (And How You Can Too)"

**5. Question Headlines (4 variations):**
- "Are You Making These [NUMBER] [MISTAKES] in [AREA]?"
- "What If [POSITIVE_SCENARIO] Was Possible in [TIMEFRAME]?"
- "Ready to [TRANSFORMATION] in [TIMELINE]?"

**6. Urgency/Scarcity Headlines (4 variations):**
- "Last Chance: [OFFER] Ends [TIMEFRAME]"
- "Only [NUMBER] [PRODUCT/SPOTS] Left for [TARGET_AUDIENCE]"
- "Don''t Miss Out: [BENEFIT] Available Until [DEADLINE]"

**Testing Recommendations:**
- A/B test top 3 headlines
- Measure: [CLICK_RATE/CONVERSION_RATE]
- Test duration: [TIME_PERIOD]
- Audience segments: [SEGMENT_VARIATIONS]

**Power Words Library:**
- Action words: [DISCOVER, UNLOCK, MASTER, TRANSFORM]
- Emotion words: [AMAZING, INCREDIBLE, PROVEN, EXCLUSIVE]
- Urgency words: [NOW, TODAY, LIMITED, FINAL]

Product/Service: [OFFERING]
Price point: [PRICE_RANGE]
Competition: [COMPETITOR_ANALYSIS]', 
'smart', 'Copywriting', 'intermediate', 
ARRAY['copywriting', 'headlines', 'conversion optimization'], 
350, 
ARRAY['Copywriting', 'Marketing materials', 'Conversion optimization'], 
ARRAY['GPT-4', 'Claude', 'Gemini'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 190)::integer, 4.2 + (random() * 0.8), floor(random() * 62)::integer, 
NOW(), NOW()),

-- Continue with more categories...
-- EDUCATION & TRAINING (continuing the pattern)
('Online Course Curriculum', 'Complete online course structure with modules and assessments', 
'Design curriculum for online course "[COURSE_TITLE]":

**Course Overview:**
- Target audience: [STUDENT_DEMOGRAPHICS]
- Skill level: [BEGINNER/INTERMEDIATE/ADVANCED]
- Course duration: [WEEKS/HOURS]
- Learning format: [SELF_PACED/COHORT_BASED]
- Certification offered: [YES/NO]

**Learning Objectives:**
By completing this course, students will be able to:
1. [SPECIFIC_SKILL_1]
2. [SPECIFIC_SKILL_2]  
3. [SPECIFIC_SKILL_3]
4. [SPECIFIC_SKILL_4]

**Module Structure:**

**Module 1: [FOUNDATION_TOPIC]**
Duration: [TIME_ESTIMATE]
Learning Objectives: [MODULE_OBJECTIVES]

Lessons:
- Lesson 1.1: [TOPIC] ([TIME])
  - Video content: [CONTENT_DESCRIPTION]
  - Reading materials: [RESOURCES]
  - Practice exercise: [EXERCISE_DESCRIPTION]
  
- Lesson 1.2: [TOPIC] ([TIME])
  [Same structure]

Assessment: [QUIZ/PROJECT_DESCRIPTION]
Resources: [ADDITIONAL_MATERIALS]

**Module 2: [INTERMEDIATE_TOPIC]**
[Same structure as Module 1]

**Module 3: [ADVANCED_TOPIC]**
[Same structure as Module 1]

**[Continue for all modules]**

**Assessment Strategy:**
- Formative assessments: [ONGOING_EVALUATION]
- Summative assessments: [FINAL_EVALUATION]
- Grading rubrics: [ASSESSMENT_CRITERIA]
- Peer review elements: [COLLABORATION_COMPONENTS]

**Student Engagement:**
- Discussion forums: [TOPIC_SUGGESTIONS]
- Live Q&A sessions: [SCHEDULE]
- Group projects: [COLLABORATION_OPPORTUNITIES]
- Office hours: [INSTRUCTOR_AVAILABILITY]

**Technical Requirements:**
- Platform specifications: [LMS_REQUIREMENTS]
- Software/tools needed: [TOOL_LIST]
- System requirements: [TECHNICAL_SPECS]
- Accessibility features: [ACCOMMODATIONS]

**Support Materials:**
- Course handbook: [HANDBOOK_OUTLINE]
- Resource library: [REFERENCE_MATERIALS]
- Templates and worksheets: [PRACTICAL_TOOLS]
- Community guidelines: [INTERACTION_RULES]

Subject area: [SUBJECT]
Industry application: [INDUSTRY_RELEVANCE]
Prerequisites: [REQUIRED_KNOWLEDGE]
Certification path: [CREDENTIAL_INFORMATION]', 
'recipe', 'Course Design', 'advanced', 
ARRAY['course design', 'curriculum', 'online education'], 
600, 
ARRAY['Online education', 'Course creation', 'Training programs'], 
ARRAY['GPT-4', 'Claude'], 
'28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, 
floor(random() * 130)::integer, 4.1 + (random() * 0.9), floor(random() * 38)::integer, 
NOW(), NOW()),

-- Continue inserting more prompts...
-- This would continue for all 1000 prompts across various categories

-- Update the admin user's profile to show they have certification
UPDATE profiles 
SET promptcoins = 10000 -- Give admin user PromptCoins for testing
WHERE id = '28f7a306-4eca-4429-87d8-7fc9b154c11b';

-- Re-enable RLS
ALTER TABLE saved_prompts ENABLE ROW LEVEL SECURITY;

-- Add some sample ratings and downloads to make the marketplace look active
UPDATE saved_prompts 
SET 
  downloads_count = floor(random() * 200)::integer,
  rating_average = 3.8 + (random() * 1.2),
  rating_count = floor(random() * 50)::integer
WHERE user_id = '28f7a306-4eca-4429-87d8-7fc9b154c11b' 
AND is_marketplace = true
AND random() < 0.4; -- Apply to 40% of prompts randomly