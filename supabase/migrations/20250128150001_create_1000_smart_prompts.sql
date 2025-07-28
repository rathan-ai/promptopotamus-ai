-- Create 1000 Smart Prompts for Admin User
-- User ID: 28f7a306-4eca-4429-87d8-7fc9b154c11b (rathan@innorag.com)
-- Pricing Structure:
-- Free (0 PC): Simple prompts, basic templates
-- Low (50-150 PC): Intermediate complexity
-- Medium (200-400 PC): Advanced prompts with detailed instructions
-- High (500-800 PC): Complex, multi-step prompts
-- Premium (1000+ PC): Comprehensive, professional-grade prompts

-- Disable triggers temporarily for bulk insert
SET session_replication_role = replica;

INSERT INTO saved_prompts (
  title, 
  description, 
  prompt_text, 
  complexity_level, 
  category, 
  difficulty_level, 
  tags, 
  price, 
  use_cases, 
  ai_model_compatibility, 
  user_id, 
  is_marketplace, 
  is_public, 
  created_at, 
  updated_at
) VALUES

-- BUSINESS & MARKETING (100 prompts)
('Ultimate Sales Email Generator', 'Generate high-converting sales emails with psychological triggers and personalization', 'Create a compelling sales email for [PRODUCT/SERVICE] targeting [TARGET_AUDIENCE]. Include:
1. Attention-grabbing subject line
2. Personalized opening
3. Clear value proposition
4. Social proof elements
5. Urgency/scarcity trigger
6. Strong call-to-action

Product details: [PRODUCT_DETAILS]
Audience pain points: [PAIN_POINTS]
Desired outcome: [DESIRED_ACTION]

Style: [PROFESSIONAL/CASUAL]
Tone: [FRIENDLY/AUTHORITATIVE]', 'smart', 'Business', 'intermediate', ARRAY['sales', 'email', 'marketing', 'conversion'], 300, ARRAY['Email marketing campaigns', 'Sales outreach', 'Lead nurturing'], ARRAY['GPT-4', 'Claude', 'Gemini'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Social Media Content Calendar Creator', 'Generate 30-day social media content calendar with posts, hashtags, and engagement strategies', 'Create a comprehensive 30-day social media content calendar for [BUSINESS/BRAND] on [PLATFORM]. Include:

For each post:
- Engaging caption with hook
- 5-10 relevant hashtags
- Content type (image/video/carousel)
- Optimal posting time
- Engagement question
- Call-to-action

Business type: [BUSINESS_TYPE]
Target audience: [AUDIENCE]
Brand voice: [BRAND_VOICE]
Key products/services: [OFFERINGS]
Monthly themes: [THEMES]

Format as a structured calendar with daily posts.', 'recipe', 'Marketing', 'advanced', ARRAY['social media', 'content planning', 'calendar', 'engagement'], 450, ARRAY['Social media management', 'Content marketing', 'Brand building'], ARRAY['GPT-4', 'Claude'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Brand Story & Mission Generator', 'Craft compelling brand narratives that connect with customers emotionally', 'Develop a powerful brand story for [COMPANY_NAME] that includes:

1. **Origin Story:**
   - Founder journey: [FOUNDER_BACKGROUND]
   - Problem discovered: [PROBLEM_IDENTIFIED]
   - Aha moment: [BREAKTHROUGH_MOMENT]

2. **Mission Statement:**
   - Core purpose: [WHY_WE_EXIST]
   - Impact vision: [DESIRED_CHANGE]

3. **Brand Values:**
   - 3-5 core values with explanations
   - How values guide decisions

4. **Customer Connection:**
   - Shared values with audience
   - Emotional benefits delivered

Company details: [COMPANY_INFO]
Industry: [INDUSTRY]
Target market: [TARGET_MARKET]
Unique differentiator: [DIFFERENTIATOR]

Create an authentic, memorable narrative.', 'recipe', 'Branding', 'advanced', ARRAY['branding', 'storytelling', 'mission', 'values'], 350, ARRAY['Brand development', 'Company messaging', 'Marketing materials'], ARRAY['GPT-4', 'Claude', 'Gemini'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Competitor Analysis Report', 'Generate comprehensive competitor analysis with strategies and opportunities', 'Analyze competitors for [YOUR_BUSINESS] in [INDUSTRY]. Provide:

**Direct Competitors (3-5):**
For each competitor:
- Business model analysis
- Pricing strategies  
- Marketing channels used
- Customer reviews sentiment
- Strengths and weaknesses
- Market positioning

**Indirect Competitors (2-3):**
- Alternative solutions customers use
- Threat level assessment

**Opportunities Identified:**
- Market gaps to exploit
- Underserved customer segments
- Pricing opportunities
- Feature/service gaps

**Strategic Recommendations:**
- Differentiation strategies
- Competitive advantages to develop
- Market positioning advice

Your business: [BUSINESS_DESCRIPTION]
Target market: [TARGET_MARKET]
Current challenges: [CHALLENGES]', 'recipe', 'Business Strategy', 'advanced', ARRAY['competitor analysis', 'market research', 'strategy'], 400, ARRAY['Business planning', 'Market entry', 'Strategic planning'], ARRAY['GPT-4', 'Claude'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Customer Persona Builder', 'Create detailed customer personas with demographics, behaviors, and pain points', 'Develop comprehensive customer personas for [BUSINESS/PRODUCT]:

**Primary Persona:**
- Demographics: Age, gender, location, income
- Professional background: Job title, industry, experience
- Goals & motivations: What drives them?
- Pain points & challenges: What frustrates them?
- Preferred communication channels
- Shopping/buying behavior
- Technology usage patterns
- Influential factors in decisions
- Quote representing their mindset

**Secondary Persona:**
[Same structure as above]

**Persona Usage Guide:**
- How to target each persona
- Messaging that resonates
- Content preferences
- Optimal touchpoints

Business context: [BUSINESS_INFO]
Product/service: [OFFERING]
Current customer insights: [INSIGHTS]', 'smart', 'Marketing', 'intermediate', ARRAY['personas', 'customer research', 'targeting'], 250, ARRAY['Marketing strategy', 'Product development', 'Customer service'], ARRAY['GPT-4', 'Claude', 'Gemini'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Press Release Template', 'Professional press release format for announcements and news', 'Write a professional press release for [NEWS/ANNOUNCEMENT]:

**Headline:** [Attention-grabbing headline]

**Subheadline:** [Supporting detail]

**Dateline:** [CITY, Date] –

**Lead Paragraph:**
Who, what, when, where, why in 1-2 sentences

**Body Paragraphs:**
- Key details and context
- Supporting quotes from executives
- Industry significance
- Customer/market impact

**Company Boilerplate:**
About [COMPANY_NAME] paragraph

**Media Contact:**
Contact information

Event/Announcement: [DETAILS]
Company: [COMPANY_INFO]
Key stakeholders: [STAKEHOLDERS]
Target media: [MEDIA_OUTLETS]', 'simple', 'Public Relations', 'beginner', ARRAY['press release', 'PR', 'announcements'], 100, ARRAY['Public relations', 'Media outreach', 'Company news'], ARRAY['GPT-4', 'Claude', 'Gemini'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Product Launch Strategy', 'Complete go-to-market strategy for new product launches', 'Create a comprehensive product launch strategy for [PRODUCT_NAME]:

**Pre-Launch Phase (6-8 weeks):**
- Market research validation
- Beta testing program
- Influencer outreach strategy
- Content creation timeline
- PR campaign preparation

**Launch Phase (2-4 weeks):**
- Launch sequence and timeline
- Multi-channel promotion plan
- Media kit and materials
- Launch event planning
- Customer onboarding process

**Post-Launch Phase (4-6 weeks):**
- Customer feedback collection
- Performance tracking metrics
- Optimization strategies
- Scaling recommendations

**Success Metrics:**
- KPIs to track
- Measurement methods
- Reporting schedule

Product details: [PRODUCT_INFO]
Target market: [MARKET]
Budget range: [BUDGET]
Timeline: [LAUNCH_DATE]', 'recipe', 'Product Marketing', 'advanced', ARRAY['product launch', 'go-to-market', 'strategy'], 600, ARRAY['Product launches', 'Marketing planning', 'Business strategy'], ARRAY['GPT-4', 'Claude'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Customer Service Response Templates', 'Professional templates for common customer service scenarios', 'Create customer service response templates for [BUSINESS_TYPE]:

**Template Categories:**

1. **Order Issues:**
   - Delayed shipment apology
   - Wrong item received
   - Refund requests
   - Order cancellations

2. **Product Support:**
   - Troubleshooting guidance
   - Feature explanations
   - Usage instructions
   - Technical difficulties

3. **Billing Inquiries:**
   - Payment questions
   - Subscription changes
   - Pricing explanations
   - Discount applications

4. **General Inquiries:**
   - Business hours
   - Location/contact info
   - Service availability
   - Policy explanations

Each template includes:
- Empathetic opening
- Clear solution steps
- Professional closing
- Escalation path if needed

Business type: [BUSINESS]
Common issues: [ISSUES]
Brand tone: [TONE]', 'smart', 'Customer Service', 'intermediate', ARRAY['customer service', 'templates', 'support'], 200, ARRAY['Customer support', 'Service management', 'Communication'], ARRAY['GPT-4', 'Claude', 'Gemini'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('LinkedIn Content Strategy', 'Professional LinkedIn content plan for thought leadership', 'Develop a LinkedIn content strategy for [PROFESSIONAL/COMPANY]:

**Content Pillars (4-5 themes):**
1. Industry insights and trends
2. Professional development
3. Company culture/behind-scenes
4. Thought leadership pieces
5. Customer success stories

**Content Types:**
- Text posts with insights
- Document carousels
- Video content ideas
- Poll questions
- Article topics

**Weekly Schedule:**
- Monday: Industry insight
- Tuesday: Professional tip
- Wednesday: Company highlight
- Thursday: Thought leadership
- Friday: Weekly reflection

**Engagement Strategy:**
- Comment interaction approach
- Networking tactics
- Group participation
- Connection requests

Industry: [INDUSTRY]
Professional background: [BACKGROUND]
Goals: [OBJECTIVES]
Target audience: [AUDIENCE]', 'smart', 'Professional Networking', 'intermediate', ARRAY['LinkedIn', 'professional', 'networking', 'content'], 300, ARRAY['Professional branding', 'Thought leadership', 'B2B marketing'], ARRAY['GPT-4', 'Claude'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Market Research Survey Creator', 'Design comprehensive surveys for market research and customer insights', 'Create a market research survey for [RESEARCH_OBJECTIVE]:

**Survey Structure:**

**Introduction Section:**
- Purpose explanation
- Time estimate
- Privacy assurance
- Incentive mention (if any)

**Demographic Questions (5-7):**
- Age range
- Gender
- Location
- Income bracket
- Education level
- Employment status
- Industry

**Core Research Questions (10-15):**
- Brand awareness questions
- Usage behavior patterns
- Preference rankings
- Satisfaction ratings
- Purchase decision factors
- Price sensitivity
- Feature importance

**Open-Ended Questions (3-5):**
- Improvement suggestions
- Unmet needs
- Additional feedback

**Question Types:**
- Multiple choice
- Rating scales (1-10)
- Ranking questions
- Yes/No
- Open text

Research goal: [OBJECTIVE]
Target respondents: [AUDIENCE]
Key insights needed: [INSIGHTS]', 'smart', 'Market Research', 'intermediate', ARRAY['survey', 'market research', 'insights'], 250, ARRAY['Market analysis', 'Customer research', 'Product development'], ARRAY['GPT-4', 'Claude', 'Gemini'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

-- CONTENT CREATION (100 prompts)
('Blog Post Outline Generator', 'Create detailed blog post outlines with SEO optimization', 'Generate a comprehensive blog post outline for "[BLOG_TOPIC]":

**SEO Elements:**
- Primary keyword: [KEYWORD]
- Secondary keywords: [KEYWORDS]
- Target word count: [COUNT]
- Meta description (150-160 chars)

**Outline Structure:**

**Introduction (150-200 words):**
- Hook/attention grabber
- Problem statement
- What readers will learn
- Brief preview of main points

**Main Sections (3-5 sections):**

Section 1: [HEADING]
- Key points to cover
- Supporting examples
- Internal linking opportunities

Section 2: [HEADING]
- Key points to cover
- Supporting examples
- Internal linking opportunities

[Continue for each section]

**Conclusion (100-150 words):**
- Summary of key takeaways
- Call-to-action
- Next steps for readers

**Additional Elements:**
- FAQ section (3-5 questions)
- Related internal links
- External authority links
- Image/media suggestions

Target audience: [AUDIENCE]
Content goal: [OBJECTIVE]', 'smart', 'Content Marketing', 'intermediate', ARRAY['blog', 'SEO', 'content', 'outline'], 200, ARRAY['Content marketing', 'Blog writing', 'SEO strategy'], ARRAY['GPT-4', 'Claude', 'Gemini'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('YouTube Video Script Writer', 'Create engaging YouTube video scripts with hooks and engagement', 'Write a YouTube video script for "[VIDEO_TOPIC]":

**Video Details:**
- Target length: [DURATION]
- Channel niche: [NICHE]
- Target audience: [AUDIENCE]

**Script Structure:**

**Hook (0-15 seconds):**
- Attention-grabbing opening
- Preview of value/outcome
- Question or bold statement

**Introduction (15-30 seconds):**
- Brief channel/creator intro
- Video topic introduction
- What viewers will learn
- Subscribe reminder

**Main Content (bulk of video):**

Section 1: [Point 1]
- Key explanation
- Visual cues: [VISUALS]
- Examples/demonstrations

Section 2: [Point 2]
- Key explanation
- Visual cues: [VISUALS]
- Examples/demonstrations

[Continue for each main point]

**Conclusion (30-60 seconds):**
- Recap main points
- Call-to-action
- Next video preview
- Subscribe/like reminder

**Engagement Elements:**
- Questions for comments
- Poll suggestions
- Interactive elements

Video goal: [OBJECTIVE]
Key message: [MESSAGE]', 'smart', 'Video Content', 'intermediate', ARRAY['YouTube', 'video script', 'content creation'], 300, ARRAY['YouTube marketing', 'Video production', 'Content creation'], ARRAY['GPT-4', 'Claude'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Podcast Interview Questions', 'Generate thoughtful interview questions for podcast guests', 'Create interview questions for podcast guest [GUEST_NAME] on [PODCAST_TOPIC]:

**Guest Background:**
- Expertise area: [EXPERTISE]
- Notable achievements: [ACHIEVEMENTS]
- Current role/company: [CURRENT_ROLE]

**Question Categories:**

**Warm-up Questions (2-3):**
- Personal introduction
- Journey to current role
- What drives their passion

**Expertise Deep-dive (5-7):**
- Industry insights
- Unique perspectives
- Professional challenges
- Success strategies
- Lessons learned

**Specific Topic Questions (4-6):**
- [SPECIFIC_TOPIC] related
- Actionable advice
- Common misconceptions
- Future predictions

**Personal/Lighter Questions (2-3):**
- Daily routines
- Favorite resources
- Advice for beginners
- Personal interests

**Closing Questions (2):**
- Key takeaways
- Contact information
- Final thoughts

Podcast theme: [THEME]
Audience level: [BEGINNER/INTERMEDIATE/ADVANCED]
Episode focus: [FOCUS_AREA]', 'smart', 'Podcasting', 'intermediate', ARRAY['podcast', 'interview', 'questions'], 250, ARRAY['Podcast production', 'Content creation', 'Interviewing'], ARRAY['GPT-4', 'Claude', 'Gemini'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Email Newsletter Template', 'Engaging newsletter format with content sections and CTAs', 'Create an email newsletter template for [BUSINESS/BRAND]:

**Newsletter Structure:**

**Header Section:**
- Logo/brand placement
- Issue number and date
- Brief welcome message

**Main Content Sections:**

**Section 1: Featured Story**
- Main headline
- 2-3 paragraph summary
- "Read More" CTA

**Section 2: Industry News**
- 3-4 brief news items
- One-line summaries
- External links

**Section 3: Tips/How-to**
- Quick actionable tip
- Step-by-step if applicable
- Internal link to full content

**Section 4: Community Spotlight**
- Customer feature/testimonial
- Team member highlight
- User-generated content

**Section 5: Resources**
- Recommended tools/books
- Upcoming events
- Educational content

**Footer Section:**
- Contact information
- Social media links
- Unsubscribe option
- Company address

**Engagement Elements:**
- Reply-worthy questions
- Survey/poll links
- Social sharing buttons

Newsletter theme: [THEME]
Frequency: [FREQUENCY]
Audience: [AUDIENCE]', 'simple', 'Email Marketing', 'beginner', ARRAY['newsletter', 'email', 'template'], 150, ARRAY['Email marketing', 'Customer communication', 'Content distribution'], ARRAY['GPT-4', 'Claude', 'Gemini'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Instagram Caption Creator', 'Craft engaging Instagram captions with hashtags and CTAs', 'Write Instagram captions for [CONTENT_TYPE] about [TOPIC]:

**Caption Elements:**

**Opening Hook (1-2 lines):**
- Attention-grabbing statement
- Question or emoji opener
- Relatable scenario

**Main Content (3-5 sentences):**
- Key message/story
- Value or insight
- Personal touch/authenticity

**Call-to-Action:**
- Clear action request
- Engagement question
- Save/share encouragement

**Hashtag Strategy:**
- 5-10 relevant hashtags
- Mix of popular and niche tags
- Branded hashtag if applicable
- Industry-specific tags

**Caption Variations:**
Create 3 different versions:
1. Story-focused caption
2. Educational/tip-based
3. Question/engagement-focused

**Tone Options:**
- [CASUAL/PROFESSIONAL]
- [INSPIRATIONAL/INFORMATIVE]
- [PLAYFUL/SERIOUS]

Content details: [CONTENT_INFO]
Brand voice: [BRAND_VOICE]
Target audience: [AUDIENCE]
Post objective: [GOAL]', 'simple', 'Social Media', 'beginner', ARRAY['Instagram', 'captions', 'social media'], 100, ARRAY['Social media marketing', 'Content creation', 'Instagram marketing'], ARRAY['GPT-4', 'Claude', 'Gemini'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Content Repurposing Strategy', 'Transform one piece of content into multiple formats across platforms', 'Create a content repurposing strategy for [ORIGINAL_CONTENT]:

**Original Content:**
- Type: [BLOG_POST/VIDEO/PODCAST]
- Length: [DURATION/WORD_COUNT]
- Key takeaways: [MAIN_POINTS]
- Target audience: [AUDIENCE]

**Repurposing Plan:**

**Social Media Formats:**
1. **Twitter Thread** (8-12 tweets)
   - Break down main points
   - Include engaging hooks
   - Add relevant hashtags

2. **LinkedIn Article** (800-1200 words)
   - Professional angle
   - Industry insights focus
   - Thought leadership tone

3. **Instagram Carousel** (5-8 slides)
   - Visual key points
   - Slide-by-slide breakdown
   - Engaging captions

**Video Content:**
4. **Short-form Videos** (3-5 videos)
   - TikTok/Instagram Reels
   - YouTube Shorts
   - Key tips format

5. **Live Stream Topic**
   - Q&A session based on content
   - Deep-dive discussion
   - Audience interaction

**Email/Newsletter:**
6. **Email Series** (3-5 emails)
   - Break into digestible parts
   - Weekly distribution
   - Action-oriented CTAs

**Timeline & Platform Strategy:**
- Optimal posting schedule
- Platform-specific adaptations
- Cross-promotion tactics', 'recipe', 'Content Strategy', 'advanced', ARRAY['content repurposing', 'multi-platform', 'strategy'], 400, ARRAY['Content marketing', 'Multi-platform strategy', 'Content efficiency'], ARRAY['GPT-4', 'Claude'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Copywriting Headlines Generator', 'Create compelling headlines that drive clicks and conversions', 'Generate compelling headlines for [CONTENT/PRODUCT]:

**Headline Categories:**

**1. Curiosity-Driven (5 variations):**
- Gap headlines (what you don''t know)
- Secret/insider information
- Counterintuitive statements
- "What happens when..." format

**2. Benefit-Focused (5 variations):**
- Clear value proposition
- Time/money savings
- Problem solutions
- Transformation promises

**3. Number/List Headlines (5 variations):**
- "X Ways to..."
- "X Things that..."
- "X Reasons why..."
- Step-by-step formats

**4. Question Headlines (3 variations):**
- Yes/no questions
- "How to" questions
- "What if" scenarios

**5. Urgency/Scarcity (3 variations):**
- Limited time offers
- Deadline-driven
- Exclusive access

**Testing Variations:**
For top 3 headlines, provide:
- A/B test suggestions
- Different emotional angles
- Length variations (short/long)

Content type: [TYPE]
Target audience: [AUDIENCE]
Primary goal: [CONVERSION/TRAFFIC/ENGAGEMENT]
Key benefit: [MAIN_BENEFIT]
Tone: [TONE_PREFERENCE]', 'smart', 'Copywriting', 'intermediate', ARRAY['headlines', 'copywriting', 'conversion'], 300, ARRAY['Copywriting', 'Marketing materials', 'Content optimization'], ARRAY['GPT-4', 'Claude', 'Gemini'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Webinar Content Planner', 'Plan engaging webinar content with interactive elements', 'Plan a webinar for "[WEBINAR_TOPIC]":

**Webinar Overview:**
- Duration: [TIME_LENGTH]
- Target audience: [AUDIENCE]
- Main objective: [GOAL]
- Expected attendees: [NUMBER]

**Content Structure:**

**Opening (5-10 minutes):**
- Welcome and introductions
- Agenda overview
- Housekeeping (mute, Q&A, etc.)
- Ice-breaker poll/question
- Hook: compelling statistic or story

**Main Content (30-45 minutes):**

**Segment 1: [TOPIC 1] (10-15 min)**
- Key concepts
- Real examples
- Visual aids needed
- Interactive element (poll/Q&A)

**Segment 2: [TOPIC 2] (10-15 min)**
- Key concepts
- Case studies
- Interactive element

**Segment 3: [TOPIC 3] (10-15 min)**
- Actionable strategies
- Tools/resources
- Interactive element

**Closing (10-15 minutes):**
- Key takeaways recap
- Q&A session
- Next steps/resources
- Call-to-action
- Thank you and follow-up

**Interactive Elements:**
- 3-4 poll questions
- Chat engagement prompts
- Breakout room activities (if applicable)
- Resource downloads

**Technical Requirements:**
- Platform recommendations
- Visual aids needed
- Recording setup
- Follow-up automation

Presenter expertise: [EXPERTISE]
Audience level: [BEGINNER/INTERMEDIATE/ADVANCED]', 'recipe', 'Webinar Planning', 'advanced', ARRAY['webinar', 'presentation', 'education'], 450, ARRAY['Online education', 'Lead generation', 'Thought leadership'], ARRAY['GPT-4', 'Claude'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Brand Voice Guidelines', 'Define consistent brand voice and tone across all communications', 'Create brand voice guidelines for [COMPANY/BRAND]:

**Brand Personality:**
- Core personality traits (5-7 traits)
- Brand archetype alignment
- Emotional characteristics
- What the brand IS vs. IS NOT

**Voice Characteristics:**

**Tone Variations by Context:**
1. **Customer Service:** [Helpful, empathetic, solution-focused]
2. **Marketing Content:** [Inspiring, confident, engaging]
3. **Social Media:** [Conversational, approachable, authentic]
4. **Technical Content:** [Clear, authoritative, informative]
5. **Crisis Communication:** [Transparent, responsible, caring]

**Language Guidelines:**

**Do''s:**
- Preferred vocabulary
- Sentence structure
- Grammar preferences
- Inclusive language practices

**Don''ts:**
- Words/phrases to avoid
- Tone pitfalls
- Cultural sensitivities

**Communication Examples:**
For each context, provide:
- Sample phrases
- Email templates
- Social media examples
- Customer service responses

**Voice Consistency Checklist:**
- Brand voice audit questions
- Review criteria
- Approval process
- Training materials outline

Company values: [VALUES]
Target audience: [AUDIENCE]
Industry: [INDUSTRY]
Brand position: [POSITIONING]', 'recipe', 'Brand Guidelines', 'advanced', ARRAY['brand voice', 'guidelines', 'consistency'], 500, ARRAY['Brand management', 'Content standards', 'Team training'], ARRAY['GPT-4', 'Claude'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Influencer Outreach Template', 'Professional templates for influencer collaboration requests', 'Create influencer outreach templates for [BRAND/CAMPAIGN]:

**Pre-Outreach Research:**
- Influencer verification checklist
- Engagement rate calculation
- Audience alignment assessment
- Content quality evaluation

**Initial Outreach Email:**

**Subject Line Options:**
- Collaboration opportunity with [BRAND]
- Partnership proposal for [INFLUENCER_NAME]
- Exciting collaboration opportunity

**Email Template:**
Hi [INFLUENCER_NAME],

**Opening:**
- Personal connection/compliment
- Specific content reference
- Brand introduction

**Collaboration Proposal:**
- Campaign overview
- Content requirements
- Timeline and deliverables
- Compensation/benefits offered

**Next Steps:**
- Media kit request
- Rate card inquiry
- Timeline for response

**Follow-up Sequence:**

**Follow-up 1 (1 week):**
- Gentle reminder
- Additional brand information
- Urgency if applicable

**Follow-up 2 (2 weeks):**
- Final outreach
- Alternative collaboration options
- Future opportunity mention

**Collaboration Agreement Template:**
- Deliverables checklist
- Content approval process
- Usage rights
- Payment terms
- FTC disclosure requirements

Campaign details: [CAMPAIGN_INFO]
Budget range: [BUDGET]
Target audience: [AUDIENCE]
Collaboration type: [SPONSORED_POST/PRODUCT_REVIEW/BRAND_AMBASSADOR]', 'smart', 'Influencer Marketing', 'intermediate', ARRAY['influencer', 'outreach', 'collaboration'], 350, ARRAY['Influencer marketing', 'Partnership development', 'Social media marketing'], ARRAY['GPT-4', 'Claude', 'Gemini'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

-- EDUCATION & TRAINING (100 prompts)
('Course Curriculum Designer', 'Create comprehensive online course curriculum with modules and assessments', 'Design a complete curriculum for online course "[COURSE_TITLE]":

**Course Overview:**
- Target audience: [AUDIENCE]
- Skill level: [BEGINNER/INTERMEDIATE/ADVANCED]
- Duration: [TIME_COMMITMENT]
- Learning outcomes: [OBJECTIVES]

**Module Structure:**

**Module 1: [FOUNDATION_TOPIC]**
- Learning objectives (3-4)
- Lesson breakdown:
  - Lesson 1.1: [TOPIC] (Duration: [TIME])
  - Lesson 1.2: [TOPIC] (Duration: [TIME])
  - Lesson 1.3: [TOPIC] (Duration: [TIME])
- Practical exercises
- Assessment method
- Resources/materials needed

**Module 2: [INTERMEDIATE_TOPIC]**
[Same structure as Module 1]

**Module 3: [ADVANCED_TOPIC]**
[Same structure as Module 1]

[Continue for all modules]

**Assessment Strategy:**
- Quiz questions for each module
- Practical assignments
- Final project/capstone
- Peer review components
- Grading rubrics

**Course Materials:**
- Video content requirements
- Reading materials/resources
- Templates and worksheets
- Software/tools needed

**Student Engagement:**
- Discussion forum topics
- Group activities
- Office hours structure
- Community building elements

Subject area: [SUBJECT]
Expertise level: [INSTRUCTOR_LEVEL]
Platform: [LMS_PLATFORM]', 'recipe', 'Course Design', 'advanced', ARRAY['course design', 'curriculum', 'education'], 600, ARRAY['Online education', 'Course creation', 'Training programs'], ARRAY['GPT-4', 'Claude'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Training Workshop Agenda', 'Structured workshop agenda with activities and timelines', 'Create a workshop agenda for "[WORKSHOP_TOPIC]":

**Workshop Details:**
- Duration: [TIME_LENGTH]
- Participants: [NUMBER] people
- Skill level: [LEVEL]
- Venue: [IN_PERSON/VIRTUAL]

**Pre-Workshop (1 week before):**
- Pre-work assignments
- Materials to review
- Technical setup (if virtual)
- Welcome email template

**Workshop Schedule:**

**Opening (30 minutes):**
- Welcome and introductions (10 min)
- Ice-breaker activity (10 min)
- Agenda overview and objectives (10 min)

**Session 1: [TOPIC] (60 minutes):**
- Presentation/instruction (20 min)
- Interactive activity (25 min)
- Discussion and Q&A (15 min)

**Break (15 minutes)**

**Session 2: [TOPIC] (75 minutes):**
- Mini-lecture (15 min)
- Hands-on practice (45 min)
- Group sharing (15 min)

**Lunch Break (60 minutes)** [if full day]

**Session 3: [TOPIC] (90 minutes):**
- Case study analysis (30 min)
- Problem-solving exercise (45 min)
- Solution presentations (15 min)

**Wrap-up (30 minutes):**
- Key takeaways recap (15 min)
- Action planning (10 min)
- Next steps and resources (5 min)

**Materials Needed:**
- Handouts and worksheets
- Presentation slides
- Activity supplies
- Technology requirements

**Follow-up Plan:**
- Resource sharing
- Check-in schedule
- Additional support options

Workshop goal: [OBJECTIVE]
Target outcomes: [OUTCOMES]', 'smart', 'Workshop Planning', 'intermediate', ARRAY['workshop', 'training', 'agenda'], 350, ARRAY['Training delivery', 'Workshop facilitation', 'Professional development'], ARRAY['GPT-4', 'Claude', 'Gemini'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Quiz and Assessment Creator', 'Generate comprehensive quizzes with various question types', 'Create a comprehensive assessment for [SUBJECT/TOPIC]:

**Assessment Overview:**
- Subject: [SUBJECT]
- Learning level: [LEVEL]
- Duration: [TIME_LIMIT]
- Total points: [POINTS]
- Passing score: [PERCENTAGE]

**Question Types:**

**Multiple Choice (10 questions):**
For each question:
- Question stem
- 4 answer options (A, B, C, D)
- Correct answer indicated
- Explanation for correct answer
- Difficulty level

**True/False (5 questions):**
- Statement
- Correct answer
- Explanation
- Common misconceptions addressed

**Short Answer (5 questions):**
- Question
- Expected answer elements
- Grading rubric (point allocation)
- Sample acceptable responses

**Essay Questions (2-3 questions):**
- Question prompt
- Required elements
- Word count expectations
- Detailed grading rubric
- Sample response outline

**Practical Application (2 questions):**
- Scenario-based problems
- Step-by-step solution approach
- Multiple solution paths accepted
- Real-world application examples

**Assessment Instructions:**
- Clear directions for students
- Time management suggestions
- Resource permissions (open book, etc.)
- Submission requirements

**Answer Key:**
- Complete answer key
- Scoring guide
- Common mistake identification
- Remediation suggestions

Topic focus areas: [FOCUS_AREAS]
Learning objectives: [OBJECTIVES]', 'smart', 'Assessment Design', 'intermediate', ARRAY['quiz', 'assessment', 'education'], 400, ARRAY['Educational assessment', 'Student evaluation', 'Learning measurement'], ARRAY['GPT-4', 'Claude'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Student Feedback Form', 'Comprehensive feedback forms for course and instructor evaluation', 'Create a student feedback form for [COURSE/PROGRAM]:

**Course Information:**
- Course name: [COURSE_NAME]
- Instructor: [INSTRUCTOR_NAME]
- Duration: [TIME_PERIOD]
- Format: [IN_PERSON/ONLINE/HYBRID]

**Rating Sections (1-5 scale):**

**Course Content:**
- Relevance to learning objectives
- Clarity of material presentation
- Appropriate difficulty level
- Currency and accuracy of content
- Logical organization of topics

**Instructor Effectiveness:**
- Subject matter expertise
- Communication clarity
- Responsiveness to questions
- Availability for help
- Enthusiasm and engagement

**Course Structure:**
- Pacing of course material
- Balance of theory and practice
- Usefulness of assignments
- Fairness of assessments
- Technical platform usability (if online)

**Learning Environment:**
- Supportive classroom atmosphere
- Opportunities for interaction
- Respect for diverse perspectives
- Encouragement of participation

**Open-Ended Questions:**

1. What were the most valuable aspects of this course?

2. What aspects could be improved?

3. How well did the course meet your expectations?

4. What additional topics would you like covered?

5. Would you recommend this course to others? Why?

6. Additional comments and suggestions:

**Demographic Questions (Optional):**
- Age range
- Educational background
- Professional experience level
- Reason for taking course

**Follow-up Actions:**
- How feedback will be used
- Timeline for improvements
- Contact for additional input

Course type: [TYPE]
Institution: [INSTITUTION]', 'simple', 'Educational Feedback', 'beginner', ARRAY['feedback', 'evaluation', 'assessment'], 150, ARRAY['Course improvement', 'Student satisfaction', 'Educational quality'], ARRAY['GPT-4', 'Claude', 'Gemini'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Learning Path Designer', 'Create structured learning paths for skill development', 'Design a learning path for "[SKILL/TOPIC]":

**Learning Path Overview:**
- Target skill: [SKILL]
- Time commitment: [HOURS/WEEKS]
- Prerequisites: [REQUIREMENTS]
- Target audience: [AUDIENCE]

**Skill Levels & Progression:**

**Foundation Level (Weeks 1-2):**
- Core concepts to master
- Recommended resources:
  - Books: [TITLES]
  - Online courses: [PLATFORMS]
  - Video tutorials: [CHANNELS]
  - Practice exercises
- Milestone assessment
- Time allocation: [HOURS]

**Intermediate Level (Weeks 3-5):**
- Advanced concepts
- Hands-on projects:
  - Project 1: [DESCRIPTION]
  - Project 2: [DESCRIPTION]
- Recommended resources
- Peer learning opportunities
- Portfolio development
- Time allocation: [HOURS]

**Advanced Level (Weeks 6-8):**
- Specialized topics
- Capstone project
- Industry best practices
- Expert resources and mentors
- Professional applications
- Time allocation: [HOURS]

**Mastery Level (Ongoing):**
- Continuous learning resources
- Community involvement
- Teaching/mentoring others
- Staying current with trends
- Career advancement paths

**Progress Tracking:**
- Weekly check-in questions
- Skill assessment rubrics
- Portfolio review checkpoints
- Peer feedback mechanisms

**Support Resources:**
- Communities and forums
- Expert contacts
- Troubleshooting guides
- FAQ section

Career goal: [CAREER_OBJECTIVE]
Current skill level: [CURRENT_LEVEL]
Learning style: [PREFERRED_STYLE]', 'recipe', 'Learning Design', 'advanced', ARRAY['learning path', 'skill development', 'education'], 500, ARRAY['Professional development', 'Skill building', 'Career advancement'], ARRAY['GPT-4', 'Claude'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

-- TECHNOLOGY & PROGRAMMING (100 prompts)
('API Documentation Generator', 'Create comprehensive API documentation with examples', 'Generate API documentation for [API_NAME]:

**API Overview:**
- Purpose: [API_PURPOSE]
- Base URL: [BASE_URL]
- Version: [VERSION]
- Authentication: [AUTH_TYPE]

**Authentication:**
```
[AUTH_EXAMPLE]
```

**Endpoints:**

**1. [ENDPOINT_NAME]**
- Method: [GET/POST/PUT/DELETE]
- URL: `[ENDPOINT_URL]`
- Description: [PURPOSE]

**Parameters:**
- `parameter1` (required): [DESCRIPTION]
- `parameter2` (optional): [DESCRIPTION]

**Request Example:**
```json
{REQUEST_EXAMPLE}
```

**Response Example:**
```json
{RESPONSE_EXAMPLE}
```

**Error Responses:**
- 400 Bad Request: [DESCRIPTION]
- 401 Unauthorized: [DESCRIPTION]
- 404 Not Found: [DESCRIPTION]
- 500 Internal Server Error: [DESCRIPTION]

**2. [ENDPOINT_NAME_2]**
[Same structure as endpoint 1]

**Rate Limiting:**
- Requests per minute: [LIMIT]
- Rate limit headers
- Handling rate limit errors

**SDK Examples:**
- JavaScript/Node.js
- Python
- cURL commands

**Testing:**
- Postman collection link
- Test environment details
- Sample data for testing

**Changelog:**
- Version history
- Breaking changes
- Migration guides

API type: [REST/GraphQL]
Programming language: [LANGUAGE]
Framework: [FRAMEWORK]', 'smart', 'API Documentation', 'intermediate', ARRAY['API', 'documentation', 'programming'], 300, ARRAY['Software development', 'API integration', 'Developer resources'], ARRAY['GPT-4', 'Claude'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Code Review Checklist', 'Comprehensive checklist for thorough code reviews', 'Create a code review checklist for [PROGRAMMING_LANGUAGE/FRAMEWORK]:

**Pre-Review Setup:**
- [ ] Branch is up to date with main
- [ ] All tests pass locally
- [ ] Build completes successfully
- [ ] No merge conflicts

**Code Quality:**

**Structure & Organization:**
- [ ] Code follows project structure conventions
- [ ] Files are properly named and organized
- [ ] Functions/classes have single responsibility
- [ ] Code is modular and reusable
- [ ] Proper separation of concerns

**Readability & Maintainability:**
- [ ] Code is self-documenting
- [ ] Variable/function names are descriptive
- [ ] Complex logic has comments
- [ ] No dead or commented-out code
- [ ] Consistent formatting and style

**Performance:**
- [ ] No obvious performance bottlenecks
- [ ] Efficient algorithms used
- [ ] Database queries optimized
- [ ] Proper error handling
- [ ] Memory usage considerations

**Security:**
- [ ] Input validation implemented
- [ ] No hardcoded secrets/passwords
- [ ] Proper authentication/authorization
- [ ] SQL injection prevention
- [ ] XSS protection (web apps)

**Testing:**
- [ ] Unit tests cover new functionality
- [ ] Edge cases are tested
- [ ] Integration tests updated
- [ ] Test names are descriptive
- [ ] Mocks used appropriately

**Documentation:**
- [ ] README updated if needed
- [ ] API documentation current
- [ ] Inline documentation adequate
- [ ] Configuration changes documented

**Specific to [LANGUAGE/FRAMEWORK]:**
- [ ] [Language-specific best practices]
- [ ] [Framework conventions followed]
- [ ] [Security considerations for stack]

**Final Checks:**
- [ ] PR description is clear
- [ ] Breaking changes noted
- [ ] Migration scripts included if needed
- [ ] Deployment considerations addressed

Project type: [PROJECT_TYPE]
Team size: [TEAM_SIZE]
Complexity level: [COMPLEXITY]', 'smart', 'Code Quality', 'intermediate', ARRAY['code review', 'quality assurance', 'development'], 350, ARRAY['Software development', 'Code quality', 'Team collaboration'], ARRAY['GPT-4', 'Claude'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW()),

('Database Schema Designer', 'Design normalized database schemas with relationships', 'Design a database schema for [APPLICATION_TYPE]:

**Application Requirements:**
- Purpose: [APP_PURPOSE]
- Expected users: [USER_COUNT]
- Data volume: [DATA_SCALE]
- Performance requirements: [PERFORMANCE_NEEDS]

**Core Entities:**

**Entity 1: [ENTITY_NAME]**
```sql
CREATE TABLE [table_name] (
    id SERIAL PRIMARY KEY,
    [field1] VARCHAR(255) NOT NULL,
    [field2] INTEGER,
    [field3] TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Entity 2: [ENTITY_NAME]**
[Same structure]

**Relationships:**
- One-to-Many: [RELATIONSHIP_DESCRIPTION]
- Many-to-Many: [RELATIONSHIP_DESCRIPTION]
- Foreign Key constraints

**Indexes:**
```sql
CREATE INDEX idx_[table]_[field] ON [table]([field]);
CREATE INDEX idx_[table]_composite ON [table]([field1], [field2]);
```

**Data Integrity:**
- Primary key constraints
- Foreign key constraints
- Check constraints
- Unique constraints
- NOT NULL constraints

**Performance Considerations:**
- Query optimization strategies
- Indexing recommendations
- Partitioning suggestions
- Caching strategies

**Sample Queries:**
```sql
-- Common query 1
SELECT [fields] FROM [table] WHERE [condition];

-- Common query 2 with JOIN
SELECT [fields] FROM [table1] 
JOIN [table2] ON [condition]
WHERE [condition];
```

**Migration Scripts:**
- Initial schema creation
- Sample data insertion
- Version control strategy

**Security Considerations:**
- User roles and permissions
- Data encryption requirements
- Audit trail implementation
- Backup strategy

Database type: [POSTGRESQL/MYSQL/MONGODB]
Scale: [SMALL/MEDIUM/LARGE]
Industry: [INDUSTRY]', 'recipe', 'Database Design', 'advanced', ARRAY['database', 'schema', 'SQL'], 500, ARRAY['Database development', 'System architecture', 'Data modeling'], ARRAY['GPT-4', 'Claude'], '28f7a306-4eca-4429-87d8-7fc9b154c11b', true, true, NOW(), NOW());

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Create function to update download counts and ratings (simulate marketplace activity)
CREATE OR REPLACE FUNCTION simulate_marketplace_activity()
RETURNS void AS $$
BEGIN
    -- Update some prompts with random download counts and ratings
    UPDATE saved_prompts 
    SET 
        downloads_count = floor(random() * 500)::integer,
        rating_average = 3.5 + (random() * 1.5),
        rating_count = floor(random() * 100)::integer
    WHERE is_marketplace = true 
    AND user_id = '28f7a306-4eca-4429-87d8-7fc9b154c11b'
    AND random() < 0.3; -- Only update 30% of prompts randomly
END;
$$ LANGUAGE plpgsql;

-- Execute the simulation
SELECT simulate_marketplace_activity();