// Smart Template Library - Intelligent templates with AI assistance
export interface Variable {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
  defaultValue?: string | number;
  description?: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  description: string;
  template: string;
  variables: Variable[];
  tips: string[];
}

export interface QualityCheck {
  id: string;
  criteria: string;
  description: string;
  weight: number; // 1-10 importance
}

export interface SmartTemplate {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  useCase: string;
  description: string;
  tags: string[];
  
  // Template structure
  sections: TemplateSection[];
  estimatedTime: string; // "5-10 minutes"
  
  // AI assistance
  aiPromptingGuide: string[];
  optimizationTips: string[];
  commonMistakes: string[];
  exampleOutputs: string[];
  relatedTemplates: string[];
  
  // Quality metrics
  qualityChecks: QualityCheck[];
  successMetrics: string[];
}

// Template Categories
export const TEMPLATE_CATEGORIES = {
  'marketing': {
    name: 'Marketing & Sales',
    icon: '📈',
    description: 'Content creation, campaigns, and customer engagement',
    subcategories: ['copywriting', 'email_marketing', 'social_media', 'advertising', 'product_descriptions']
  },
  'analysis': {
    name: 'Analysis & Research',
    icon: '🔍',
    description: 'Data analysis, research, and insights generation',
    subcategories: ['data_analysis', 'competitive_research', 'trend_analysis', 'report_generation', 'summarization']
  },
  'creative': {
    name: 'Creative Writing',
    icon: '✍️',
    description: 'Stories, scripts, creative content, and ideation',
    subcategories: ['storytelling', 'scriptwriting', 'brainstorming', 'character_development', 'world_building']
  },
  'technical': {
    name: 'Technical & Code',
    icon: '💻',
    description: 'Programming, documentation, and technical writing',
    subcategories: ['code_generation', 'debugging', 'documentation', 'architecture', 'code_review']
  },
  'business': {
    name: 'Business Strategy',
    icon: '💼',
    description: 'Planning, strategy, and business analysis',
    subcategories: ['strategy_planning', 'swot_analysis', 'business_models', 'financial_analysis', 'presentations']
  },
  'education': {
    name: 'Education & Training',
    icon: '🎓',
    description: 'Learning materials, courses, and educational content',
    subcategories: ['lesson_planning', 'quiz_creation', 'curriculum_design', 'explanations', 'assessment']
  }
};

// Smart Template Library
export const SMART_TEMPLATES: SmartTemplate[] = [
  {
    id: 'marketing-product-launch',
    name: 'Product Launch Campaign',
    category: 'marketing',
    subcategory: 'campaigns',
    difficulty: 'intermediate',
    useCase: 'Create a comprehensive product launch campaign across multiple channels',
    description: 'Generate marketing copy, social media posts, email sequences, and press releases for a new product launch.',
    tags: ['product-launch', 'marketing', 'multi-channel', 'campaign'],
    
    sections: [
      {
        id: 'product-overview',
        title: 'Product Overview',
        description: 'Define your product and target audience',
        template: `Product: {product_name}
Target Audience: {target_audience}
Key Benefits: {key_benefits}
Unique Selling Proposition: {usp}
Price Point: {price_point}
Launch Date: {launch_date}`,
        variables: [
          {
            name: 'product_name',
            type: 'text',
            label: 'Product Name',
            placeholder: 'e.g., Smart Fitness Tracker Pro',
            required: true,
            description: 'The official name of your product'
          },
          {
            name: 'target_audience',
            type: 'textarea',
            label: 'Target Audience',
            placeholder: 'e.g., Health-conscious professionals aged 25-45 who want to track fitness goals',
            required: true,
            description: 'Detailed description of your ideal customers'
          },
          {
            name: 'key_benefits',
            type: 'textarea',
            label: 'Key Benefits',
            placeholder: 'e.g., 24/7 heart rate monitoring, sleep tracking, 10-day battery life',
            required: true,
            description: 'Top 3-5 benefits your product provides'
          },
          {
            name: 'usp',
            type: 'text',
            label: 'Unique Selling Proposition',
            placeholder: 'e.g., The only fitness tracker with AI-powered health predictions',
            required: true,
            description: 'What makes your product unique'
          },
          {
            name: 'price_point',
            type: 'text',
            label: 'Price Point',
            placeholder: 'e.g., $199 (Early Bird: $149)',
            required: true,
            description: 'Pricing strategy and any special offers'
          },
          {
            name: 'launch_date',
            type: 'text',
            label: 'Launch Date',
            placeholder: 'e.g., March 15, 2024',
            required: true,
            description: 'Official launch date'
          }
        ],
        tips: [
          'Be specific about your target audience demographics',
          'Focus on benefits, not just features',
          'Make your USP clear and memorable'
        ]
      },
      {
        id: 'campaign-strategy',
        title: 'Campaign Strategy',
        description: 'Create your multi-channel marketing strategy',
        template: `Create a comprehensive product launch campaign for {product_name}.

Campaign Objectives:
- Primary Goal: {primary_goal}
- Secondary Goals: {secondary_goals}
- Success Metrics: {success_metrics}

Target Audience Analysis:
{target_audience}

Channel Strategy:
{channels}

Timeline: {campaign_timeline}

Budget Allocation: {budget_allocation}

Generate specific content for each channel:
1. Email marketing sequence (3-part series)
2. Social media content (LinkedIn, Instagram, Twitter)
3. Press release
4. Influencer outreach template
5. Product hunt launch copy

Make sure all content emphasizes: {key_benefits}
Unique angle: {usp}
Call-to-action: {cta}`,
        variables: [
          {
            name: 'primary_goal',
            type: 'select',
            label: 'Primary Campaign Goal',
            placeholder: 'Select your primary goal',
            required: true,
            options: [
              'Generate pre-orders/sales',
              'Build awareness',
              'Collect leads/signups',
              'Drive app downloads',
              'Establish market presence'
            ],
            description: 'Main objective of your launch campaign'
          },
          {
            name: 'secondary_goals',
            type: 'textarea',
            label: 'Secondary Goals',
            placeholder: 'e.g., Build email list, gain social media followers, establish partnerships',
            required: false,
            description: 'Additional objectives for the campaign'
          },
          {
            name: 'success_metrics',
            type: 'textarea',
            label: 'Success Metrics',
            placeholder: 'e.g., 1000 pre-orders, 50,000 website visits, 500 email signups',
            required: true,
            description: 'How you will measure campaign success'
          },
          {
            name: 'channels',
            type: 'textarea',
            label: 'Marketing Channels',
            placeholder: 'e.g., Email, Social Media, PR, Influencer marketing, Content marketing',
            required: true,
            description: 'Which channels you plan to use'
          },
          {
            name: 'campaign_timeline',
            type: 'text',
            label: 'Campaign Timeline',
            placeholder: 'e.g., 6 weeks (4 weeks pre-launch, 2 weeks post-launch)',
            required: true,
            description: 'Duration and phases of your campaign'
          },
          {
            name: 'budget_allocation',
            type: 'textarea',
            label: 'Budget Allocation',
            placeholder: 'e.g., 40% Paid ads, 30% Influencer partnerships, 20% PR, 10% Content creation',
            required: false,
            description: 'How you plan to allocate your marketing budget'
          },
          {
            name: 'cta',
            type: 'text',
            label: 'Primary Call-to-Action',
            placeholder: 'e.g., Pre-order now and save 25%',
            required: true,
            description: 'Main action you want people to take'
          }
        ],
        tips: [
          'Set specific, measurable goals',
          'Choose channels where your audience is most active',
          'Create a timeline with specific milestones'
        ]
      }
    ],
    
    estimatedTime: '20-30 minutes',
    
    aiPromptingGuide: [
      'Be specific about your product features and benefits',
      'Provide detailed target audience information',
      'Include competitive advantages in your USP',
      'Set measurable goals with specific numbers',
      'Consider the customer journey from awareness to purchase'
    ],
    
    optimizationTips: [
      'Use emotional triggers in your messaging',
      'Create urgency with limited-time offers',
      'Include social proof and testimonials',
      'Test different headlines and CTAs',
      'Segment your audience for personalized messaging'
    ],
    
    commonMistakes: [
      'Focusing on features instead of benefits',
      'Using generic, non-specific language',
      'Not defining clear success metrics',
      'Ignoring post-launch follow-up strategy',
      'Underestimating timeline requirements'
    ],
    
    exampleOutputs: [
      'Email sequence with subject lines achieving 35%+ open rates',
      'Social media posts generating 500+ engagements each',
      'Press release picked up by 10+ industry publications',
      'Influencer partnerships reaching 100K+ qualified prospects'
    ],
    
    relatedTemplates: [
      'social-media-campaign',
      'email-marketing-sequence',
      'press-release-generator',
      'influencer-outreach'
    ],
    
    qualityChecks: [
      {
        id: 'audience-specificity',
        criteria: 'Target audience is specific and detailed',
        description: 'Audience description includes demographics, psychographics, and pain points',
        weight: 9
      },
      {
        id: 'benefit-focus',
        criteria: 'Emphasizes benefits over features',
        description: 'Content focuses on what customers gain, not just product specifications',
        weight: 8
      },
      {
        id: 'clear-usp',
        criteria: 'Unique selling proposition is compelling',
        description: 'USP clearly differentiates from competitors',
        weight: 8
      },
      {
        id: 'measurable-goals',
        criteria: 'Goals are specific and measurable',
        description: 'Success metrics include specific numbers and timeframes',
        weight: 7
      },
      {
        id: 'multi-channel',
        criteria: 'Covers multiple marketing channels',
        description: 'Strategy includes at least 3 different marketing channels',
        weight: 6
      }
    ],
    
    successMetrics: [
      'Campaign generates 50%+ more pre-orders than previous launches',
      'Social media engagement rates exceed 5%',
      'Email open rates above 25%',
      'Press coverage in 5+ relevant publications'
    ]
  },

  {
    id: 'analysis-customer-feedback',
    name: 'Customer Feedback Analysis',
    category: 'analysis',
    subcategory: 'data_analysis',
    difficulty: 'beginner',
    useCase: 'Analyze customer feedback to identify trends, issues, and improvement opportunities',
    description: 'Transform raw customer feedback into actionable insights with sentiment analysis, theme identification, and priority recommendations.',
    tags: ['customer-feedback', 'sentiment-analysis', 'business-intelligence', 'improvement'],
    
    sections: [
      {
        id: 'feedback-collection',
        title: 'Feedback Data Setup',
        description: 'Organize your customer feedback data',
        template: `Customer Feedback Data:
Source: {feedback_source}
Time Period: {time_period}
Number of Responses: {response_count}
Customer Segment: {customer_segment}

Raw Feedback Data:
{feedback_data}`,
        variables: [
          {
            name: 'feedback_source',
            type: 'select',
            label: 'Feedback Source',
            placeholder: 'Select feedback source',
            required: true,
            options: [
              'Customer surveys',
              'Product reviews',
              'Support tickets',
              'Social media mentions',
              'App store reviews',
              'NPS surveys',
              'Exit interviews',
              'Focus groups'
            ],
            description: 'Where this feedback was collected from'
          },
          {
            name: 'time_period',
            type: 'text',
            label: 'Time Period',
            placeholder: 'e.g., Last 3 months, Q4 2024',
            required: true,
            description: 'Time range of the feedback data'
          },
          {
            name: 'response_count',
            type: 'number',
            label: 'Number of Responses',
            placeholder: 'e.g., 250',
            required: true,
            description: 'Total number of feedback responses'
          },
          {
            name: 'customer_segment',
            type: 'text',
            label: 'Customer Segment',
            placeholder: 'e.g., Premium users, New customers, Enterprise clients',
            required: false,
            description: 'Specific customer group (if applicable)'
          },
          {
            name: 'feedback_data',
            type: 'textarea',
            label: 'Raw Feedback Data',
            placeholder: 'Paste your customer feedback here...',
            required: true,
            description: 'The actual customer feedback text to analyze'
          }
        ],
        tips: [
          'Include both positive and negative feedback for balanced analysis',
          'Ensure feedback is recent enough to be actionable',
          'Remove personal information before analysis'
        ]
      },
      {
        id: 'analysis-framework',
        title: 'Analysis Framework',
        description: 'Define your analysis parameters',
        template: `Analyze the following customer feedback data:

{feedback_data}

Analysis Framework:
1. Sentiment Analysis:
   - Classify feedback as Positive, Negative, or Neutral
   - Calculate sentiment distribution percentages
   - Identify sentiment trends over time (if applicable)

2. Theme Identification:
   - Extract key topics and themes mentioned
   - Group similar feedback points together
   - Rank themes by frequency of mention

3. Priority Analysis:
   - {analysis_focus}
   - Impact Assessment: {impact_criteria}
   - Effort Estimation: {effort_criteria}

4. Actionable Insights:
   - Top 3 areas for improvement
   - Quick wins (low effort, high impact)
   - Long-term strategic opportunities

5. Recommendations:
   - Immediate actions (next 30 days)
   - Medium-term initiatives (next 3 months)
   - Long-term strategic changes (next year)

Please provide:
- Executive summary with key findings
- Detailed breakdown by theme
- Priority matrix for identified issues
- Specific action plan with timelines
- Metrics to track improvement`,
        variables: [
          {
            name: 'analysis_focus',
            type: 'select',
            label: 'Analysis Focus',
            placeholder: 'Select analysis focus',
            required: true,
            options: [
              'Product improvement opportunities',
              'Service quality issues',
              'User experience problems',
              'Feature requests and suggestions',
              'Customer satisfaction drivers',
              'Competitive advantages/disadvantages',
              'Onboarding and adoption challenges'
            ],
            description: 'Main area you want to focus the analysis on'
          },
          {
            name: 'impact_criteria',
            type: 'textarea',
            label: 'Impact Assessment Criteria',
            placeholder: 'e.g., Revenue impact, Customer retention, User satisfaction, Brand reputation',
            required: true,
            description: 'How you want to measure the impact of identified issues'
          },
          {
            name: 'effort_criteria',
            type: 'textarea',
            label: 'Effort Estimation Criteria',
            placeholder: 'e.g., Development time, Resources required, Technical complexity, Cost',
            required: true,
            description: 'How you want to assess the effort required to address issues'
          }
        ],
        tips: [
          'Focus on actionable insights over interesting observations',
          'Prioritize issues that affect the most customers',
          'Consider both quick wins and long-term improvements'
        ]
      }
    ],
    
    estimatedTime: '10-15 minutes',
    
    aiPromptingGuide: [
      'Provide representative samples of your feedback data',
      'Be specific about your business context and goals',
      'Include information about your product/service type',
      'Specify what actions you can realistically take',
      'Mention any constraints (budget, timeline, resources)'
    ],
    
    optimizationTips: [
      'Include quantitative data alongside qualitative feedback',
      'Segment feedback by customer type or product area',
      'Look for patterns across different feedback sources',
      'Connect feedback themes to business metrics',
      'Set up ongoing feedback monitoring systems'
    ],
    
    commonMistakes: [
      'Analyzing feedback in isolation without business context',
      'Focusing only on negative feedback',
      'Not prioritizing actionable items',
      'Ignoring the effort required to implement changes',
      'Missing patterns by not categorizing feedback properly'
    ],
    
    exampleOutputs: [
      'Clear sentiment breakdown: 65% positive, 25% neutral, 10% negative',
      'Top 5 themes: UI confusion (mentioned 45 times), slow loading (38 times), great support (52 times)',
      'Priority matrix with 12 actionable items ranked by impact/effort',
      'Monthly action plan with assigned owners and success metrics'
    ],
    
    relatedTemplates: [
      'survey-analysis',
      'competitive-analysis',
      'user-research-synthesis',
      'improvement-roadmap'
    ],
    
    qualityChecks: [
      {
        id: 'data-completeness',
        criteria: 'Feedback data is comprehensive and representative',
        description: 'Includes sufficient volume and variety of feedback',
        weight: 8
      },
      {
        id: 'actionable-insights',
        criteria: 'Analysis produces actionable insights',
        description: 'Recommendations are specific and implementable',
        weight: 9
      },
      {
        id: 'priority-framework',
        criteria: 'Clear prioritization methodology',
        description: 'Issues are ranked by impact and effort considerations',
        weight: 7
      },
      {
        id: 'timeline-specificity',
        criteria: 'Recommendations include specific timelines',
        description: 'Action items have clear deadlines and milestones',
        weight: 6
      }
    ],
    
    successMetrics: [
      'Analysis identifies 3+ high-impact improvement opportunities',
      'Recommendations lead to measurable improvements in customer satisfaction',
      'Action plan is 80%+ implemented within specified timeframes',
      'Follow-up feedback shows improvement in identified problem areas'
    ]
  },

  {
    id: 'creative-story-outline',
    name: 'Story Structure & Outline',
    category: 'creative',
    subcategory: 'storytelling',
    difficulty: 'intermediate',
    useCase: 'Create compelling story outlines for novels, short stories, screenplays, or marketing narratives',
    description: 'Develop well-structured stories with engaging characters, compelling plots, and satisfying arcs using proven storytelling frameworks.',
    tags: ['storytelling', 'creative-writing', 'narrative', 'character-development', 'plot'],
    
    sections: [
      {
        id: 'story-concept',
        title: 'Story Concept & Foundation',
        description: 'Define your story\'s core elements',
        template: `Story Foundation:
Title: {story_title}
Genre: {genre}
Target Audience: {target_audience}
Length: {story_length}
Setting: {setting}

Core Concept:
{story_concept}

Central Theme: {central_theme}
Tone/Mood: {tone_mood}`,
        variables: [
          {
            name: 'story_title',
            type: 'text',
            label: 'Story Title (Working)',
            placeholder: 'e.g., The Last Library, Digital Shadows',
            required: false,
            description: 'Working title for your story'
          },
          {
            name: 'genre',
            type: 'select',
            label: 'Primary Genre',
            placeholder: 'Select primary genre',
            required: true,
            options: [
              'Science Fiction',
              'Fantasy',
              'Mystery/Thriller',
              'Romance',
              'Horror',
              'Literary Fiction',
              'Historical Fiction',
              'Young Adult',
              'Children\'s',
              'Biography/Memoir',
              'Business/Marketing Story'
            ],
            description: 'Main genre of your story'
          },
          {
            name: 'target_audience',
            type: 'text',
            label: 'Target Audience',
            placeholder: 'e.g., Adults 25-45, Young professionals, Fantasy readers',
            required: true,
            description: 'Who is your intended audience'
          },
          {
            name: 'story_length',
            type: 'select',
            label: 'Story Length',
            placeholder: 'Select story length',
            required: true,
            options: [
              'Short story (1,000-7,500 words)',
              'Novella (7,500-40,000 words)',
              'Novel (40,000-100,000 words)',
              'Epic novel (100,000+ words)',
              'Screenplay (90-120 pages)',
              'Marketing narrative (500-2,000 words)'
            ],
            description: 'Intended length of your story'
          },
          {
            name: 'setting',
            type: 'textarea',
            label: 'Setting',
            placeholder: 'e.g., Near-future Tokyo where AI has replaced most human jobs, 2089',
            required: true,
            description: 'When and where your story takes place'
          },
          {
            name: 'story_concept',
            type: 'textarea',
            label: 'Core Story Concept',
            placeholder: 'e.g., A librarian discovers that books are disappearing from reality itself, and she may be the only one who remembers they existed.',
            required: true,
            description: 'One or two sentences describing your story\'s central idea'
          },
          {
            name: 'central_theme',
            type: 'text',
            label: 'Central Theme',
            placeholder: 'e.g., The power of memory, Technology vs humanity, Love conquers all',
            required: true,
            description: 'The main message or theme you want to explore'
          },
          {
            name: 'tone_mood',
            type: 'text',
            label: 'Tone/Mood',
            placeholder: 'e.g., Mysterious and contemplative with moments of hope',
            required: true,
            description: 'The emotional atmosphere of your story'
          }
        ],
        tips: [
          'Keep your concept simple enough to explain in one sentence',
          'Choose a setting that serves your story\'s theme',
          'Make sure your genre matches your target audience'
        ]
      },
      {
        id: 'structure-outline',
        title: 'Story Structure & Detailed Outline',
        description: 'Create your complete story structure',
        template: `Create a detailed story outline for: {story_concept}

Story Details:
- Genre: {genre}
- Length: {story_length}
- Setting: {setting}
- Theme: {central_theme}
- Tone: {tone_mood}

Structure Framework: {structure_type}

Character Development Focus: {character_focus}
Conflict Type: {conflict_type}
Plot Complexity: {plot_complexity}

Please create:

1. CHARACTER PROFILES:
   - Protagonist: Detailed background, motivations, character arc
   - Antagonist: Goals, methods, why they oppose the protagonist
   - Supporting characters: Roles and relationships

2. PLOT STRUCTURE:
   - Opening Hook: How the story begins
   - Inciting Incident: What sets the story in motion
   - Rising Action: Key plot points and escalating conflicts
   - Climax: The turning point/confrontation
   - Falling Action: Consequences and resolution
   - Resolution: How everything concludes

3. CHAPTER/SCENE BREAKDOWN:
   - Detailed outline of each major scene
   - Character goals and conflicts in each scene
   - How each scene advances the plot
   - Pacing and tension management

4. DIALOGUE SAMPLES:
   - Key conversations between main characters
   - Character voice examples
   - Emotional turning points in dialogue

5. THEMES & SYMBOLISM:
   - How the central theme is woven throughout
   - Symbolic elements and their meanings
   - Character growth tied to theme

Make sure the outline includes specific details, compelling conflicts, and a satisfying character arc that resonates with {target_audience}.`,
        variables: [
          {
            name: 'structure_type',
            type: 'select',
            label: 'Story Structure Type',
            placeholder: 'Select structure type',
            required: true,
            options: [
              'Three-Act Structure (Classic)',
              'Hero\'s Journey (Campbell)',
              'Save the Cat (Snyder)',
              'Seven-Point Story Structure',
              'Fichtean Curve',
              'In Media Res',
              'Non-linear/Flashback Structure'
            ],
            description: 'Which narrative structure you want to follow'
          },
          {
            name: 'character_focus',
            type: 'select',
            label: 'Character Development Focus',
            placeholder: 'Select character focus',
            required: true,
            options: [
              'Character-driven (internal conflicts)',
              'Plot-driven (external conflicts)',
              'Balanced (both internal and external)',
              'Ensemble cast (multiple protagonists)',
              'Anti-hero journey',
              'Coming of age',
              'Redemption arc'
            ],
            description: 'What type of character development you want to emphasize'
          },
          {
            name: 'conflict_type',
            type: 'select',
            label: 'Primary Conflict Type',
            placeholder: 'Select conflict type',
            required: true,
            options: [
              'Person vs. Person',
              'Person vs. Self',
              'Person vs. Society',
              'Person vs. Nature',
              'Person vs. Technology',
              'Person vs. Fate/Destiny',
              'Person vs. Supernatural'
            ],
            description: 'The main type of conflict driving your story'
          },
          {
            name: 'plot_complexity',
            type: 'select',
            label: 'Plot Complexity',
            placeholder: 'Select complexity level',
            required: true,
            options: [
              'Simple linear plot',
              'Multiple subplots',
              'Parallel storylines',
              'Mystery/reveals',
              'Time jumps/non-linear',
              'Multiple POV characters',
              'Unreliable narrator'
            ],
            description: 'How complex you want your plot structure to be'
          }
        ],
        tips: [
          'Start with character motivations, then build plot around them',
          'Every scene should either advance plot or develop character',
          'Build tension through escalating stakes and obstacles'
        ]
      }
    ],
    
    estimatedTime: '30-45 minutes',
    
    aiPromptingGuide: [
      'Be specific about your story\'s unique elements',
      'Provide clear character motivations and goals',
      'Explain what makes your story different from others in the genre',
      'Include any specific themes or messages you want to convey',
      'Mention your target audience\'s preferences and expectations'
    ],
    
    optimizationTips: [
      'Create characters with clear, conflicting goals',
      'Build multiple layers of conflict (internal, interpersonal, societal)',
      'Use your setting as an active element in the story',
      'Plan your pacing with tension peaks and breathing room',
      'Connect all subplots to your central theme'
    ],
    
    commonMistakes: [
      'Starting with plot instead of character motivations',
      'Making the protagonist too passive or reactive',
      'Not having clear stakes or consequences',
      'Forgetting to show character growth and change',
      'Having too many subplots that don\'t serve the main story'
    ],
    
    exampleOutputs: [
      'Complete character profiles with clear arcs and motivations',
      'Scene-by-scene breakdown with specific conflicts and resolutions',
      'Sample dialogue that captures each character\'s unique voice',
      'Detailed climax sequence with emotional payoff tied to character growth'
    ],
    
    relatedTemplates: [
      'character-development',
      'dialogue-generator',
      'world-building',
      'plot-twist-generator'
    ],
    
    qualityChecks: [
      {
        id: 'character-motivation',
        criteria: 'Characters have clear, compelling motivations',
        description: 'Each major character wants something specific and believable',
        weight: 9
      },
      {
        id: 'plot-structure',
        criteria: 'Story follows a clear, engaging structure',
        description: 'Events build logically with proper pacing and tension',
        weight: 8
      },
      {
        id: 'conflict-escalation',
        criteria: 'Conflicts escalate throughout the story',
        description: 'Stakes increase and obstacles become more challenging',
        weight: 8
      },
      {
        id: 'theme-integration',
        criteria: 'Theme is woven naturally throughout',
        description: 'Central theme emerges through character actions and plot events',
        weight: 7
      },
      {
        id: 'satisfying-resolution',
        criteria: 'Resolution addresses all major plot threads',
        description: 'Ending feels earned and satisfying for the target audience',
        weight: 8
      }
    ],
    
    successMetrics: [
      'Outline provides clear roadmap for writing the complete story',
      'Character arcs show meaningful growth and change',
      'Plot structure creates engaging pacing with proper tension',
      'Theme resonates clearly without being preachy'
    ]
  }
];

// Helper functions for template management
export function getTemplatesByCategory(category: string): SmartTemplate[] {
  return SMART_TEMPLATES.filter(template => template.category === category);
}

export function getTemplateById(id: string): SmartTemplate | undefined {
  return SMART_TEMPLATES.find(template => template.id === id);
}

export function searchTemplates(query: string): SmartTemplate[] {
  const searchTerms = query.toLowerCase().split(' ');
  return SMART_TEMPLATES.filter(template => {
    const searchableText = `
      ${template.name} 
      ${template.description} 
      ${template.useCase}
      ${template.tags.join(' ')}
    `.toLowerCase();
    
    return searchTerms.some(term => searchableText.includes(term));
  });
}

export function getTemplateRecommendations(
  userIntent: string, 
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): SmartTemplate[] {
  const intent = userIntent.toLowerCase();
  
  // Simple intent matching (can be enhanced with AI later)
  let relevantTemplates = SMART_TEMPLATES.filter(template => {
    const matchText = `${template.name} ${template.description} ${template.useCase}`.toLowerCase();
    return intent.split(' ').some(word => matchText.includes(word));
  });
  
  // Filter by difficulty if specified
  if (experienceLevel !== 'advanced') {
    relevantTemplates = relevantTemplates.filter(template => 
      template.difficulty === experienceLevel || template.difficulty === 'beginner'
    );
  }
  
  // Return top 3 matches
  return relevantTemplates.slice(0, 3);
}