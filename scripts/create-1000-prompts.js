#!/usr/bin/env node

/**
 * Generate 1000 Smart Prompts for Admin User
 * This script creates a comprehensive marketplace of high-quality prompts
 * across multiple industries with pricing based on complexity
 */

const fs = require('fs');
const path = require('path');

const ADMIN_USER_ID = '28f7a306-4eca-4429-87d8-7fc9b154c11b'; // rathan@innorag.com

// Comprehensive prompt database organized by category and complexity
const PROMPT_DATABASE = {
  'Business Strategy': {
    simple: [
      {
        title: 'SWOT Analysis Template',
        description: 'Simple SWOT analysis framework for strategic planning',
        price: 0,
        tags: ['SWOT', 'strategy', 'analysis'],
        use_cases: ['Strategic planning', 'Business analysis', 'Decision making']
      },
      {
        title: 'Meeting Agenda Creator',
        description: 'Professional meeting agenda templates',
        price: 50,
        tags: ['meeting', 'agenda', 'productivity'],
        use_cases: ['Team meetings', 'Project planning', 'Communication']
      },
      {
        title: 'Business Goal Setter',
        description: 'SMART goals framework for business objectives',
        price: 75,
        tags: ['goals', 'planning', 'SMART'],
        use_cases: ['Goal setting', 'Performance planning', 'Team alignment']
      }
    ],
    smart: [
      {
        title: 'Competitive Analysis Framework',
        description: 'Comprehensive competitor research and analysis template',
        price: 250,
        tags: ['competitive analysis', 'market research', 'strategy'],
        use_cases: ['Market research', 'Strategic planning', 'Business intelligence']
      },
      {
        title: 'Business Model Canvas Generator',
        description: 'Complete business model development tool',
        price: 300,
        tags: ['business model', 'canvas', 'startup'],
        use_cases: ['Business planning', 'Startup development', 'Strategic design']
      },
      {
        title: 'ROI Calculator Template',
        description: 'Investment return calculation with scenario analysis',
        price: 200,
        tags: ['ROI', 'financial analysis', 'investment'],
        use_cases: ['Investment decisions', 'Project evaluation', 'Financial planning']
      }
    ],
    recipe: [
      {
        title: 'Complete Business Plan Generator',
        description: 'Comprehensive business plan with financial projections',
        price: 800,
        tags: ['business plan', 'strategy', 'financial planning'],
        use_cases: ['Startup funding', 'Business development', 'Investor presentations']
      },
      {
        title: 'Strategic Planning Masterclass',
        description: 'End-to-end strategic planning framework with implementation',
        price: 700,
        tags: ['strategic planning', 'implementation', 'management'],
        use_cases: ['Corporate strategy', 'Long-term planning', 'Organizational development']
      }
    ]
  },
  'Marketing & Sales': {
    simple: [
      {
        title: 'Instagram Caption Writer',
        description: 'Engaging captions with hashtags and CTAs',
        price: 0,
        tags: ['Instagram', 'captions', 'social media'],
        use_cases: ['Social media posting', 'Content creation', 'Engagement']
      },
      {
        title: 'Email Subject Line Generator',
        description: 'High-open-rate email subject lines',
        price: 50,
        tags: ['email', 'subject lines', 'marketing'],
        use_cases: ['Email marketing', 'Newsletter campaigns', 'Communication']
      },
      {
        title: 'Facebook Ad Copy Template',
        description: 'Converting Facebook ad copy formats',
        price: 100,
        tags: ['Facebook ads', 'ad copy', 'conversion'],
        use_cases: ['Facebook advertising', 'Social media ads', 'Lead generation']
      }
    ],
    smart: [
      {
        title: 'Email Marketing Campaign Builder',
        description: 'Multi-email sequence with automation triggers',
        price: 350,
        tags: ['email marketing', 'automation', 'conversion'],
        use_cases: ['Email campaigns', 'Lead nurturing', 'Sales automation']
      },
      {
        title: 'Social Media Content Calendar',
        description: 'Monthly content planning with engagement strategies',
        price: 300,
        tags: ['social media', 'content calendar', 'planning'],
        use_cases: ['Social media management', 'Content marketing', 'Brand building']
      },
      {
        title: 'Customer Persona Builder',
        description: 'Detailed customer personas with research framework',
        price: 250,
        tags: ['customer personas', 'market research', 'targeting'],
        use_cases: ['Marketing strategy', 'Product development', 'Customer research']
      }
    ],
    recipe: [
      {
        title: 'Complete Sales Funnel Optimizer',
        description: 'End-to-end sales funnel analysis and optimization',
        price: 650,
        tags: ['sales funnel', 'conversion optimization', 'customer journey'],
        use_cases: ['Sales optimization', 'Conversion improvement', 'Revenue growth']
      },
      {
        title: 'Brand Strategy Development Kit',
        description: 'Complete brand development framework with guidelines',
        price: 750,
        tags: ['branding', 'brand strategy', 'guidelines'],
        use_cases: ['Brand development', 'Company rebranding', 'Brand consistency']
      }
    ]
  },
  'Content Creation': {
    simple: [
      {
        title: 'Blog Post Outline Generator',
        description: 'SEO-friendly blog post structure templates',
        price: 0,
        tags: ['blog', 'outline', 'SEO'],
        use_cases: ['Blog writing', 'Content planning', 'SEO optimization']
      },
      {
        title: 'YouTube Title Creator',
        description: 'Click-worthy YouTube video titles',
        price: 75,
        tags: ['YouTube', 'titles', 'clickbait'],
        use_cases: ['YouTube optimization', 'Video marketing', 'Content creation']
      },
      {
        title: 'Tweet Thread Builder',
        description: 'Engaging Twitter thread templates',
        price: 50,
        tags: ['Twitter', 'threads', 'engagement'],
        use_cases: ['Twitter marketing', 'Thought leadership', 'Social engagement']
      }
    ],
    smart: [
      {
        title: 'SEO Content Optimizer',
        description: 'Content optimization for search engine rankings',
        price: 300,
        tags: ['SEO', 'content optimization', 'ranking'],
        use_cases: ['SEO strategy', 'Content marketing', 'Organic traffic']
      },
      {
        title: 'Video Script Creator',
        description: 'Professional video scripts with engagement hooks',
        price: 250,
        tags: ['video script', 'engagement', 'storytelling'],
        use_cases: ['Video production', 'YouTube content', 'Marketing videos']
      },
      {
        title: 'Podcast Interview Guide',
        description: 'Comprehensive interview questions and structure',
        price: 200,
        tags: ['podcast', 'interview', 'questions'],
        use_cases: ['Podcast production', 'Content creation', 'Interviewing']
      }
    ],
    recipe: [
      {
        title: 'Complete Content Marketing Strategy',
        description: 'End-to-end content marketing plan with distribution',
        price: 600,
        tags: ['content marketing', 'strategy', 'distribution'],
        use_cases: ['Content strategy', 'Marketing planning', 'Brand building']
      },
      {
        title: 'Multi-Platform Content Repurposing System',
        description: 'Transform one content piece into multiple formats',
        price: 500,
        tags: ['content repurposing', 'multi-platform', 'efficiency'],
        use_cases: ['Content efficiency', 'Multi-platform marketing', 'Content scaling']
      }
    ]
  },
  'Education & Training': {
    simple: [
      {
        title: 'Quiz Question Generator',
        description: 'Multiple choice and assessment questions',
        price: 50,
        tags: ['quiz', 'assessment', 'education'],
        use_cases: ['Educational assessment', 'Training evaluation', 'Knowledge testing']
      },
      {
        title: 'Lesson Plan Template',
        description: 'Structured lesson planning format',
        price: 75,
        tags: ['lesson plan', 'education', 'teaching'],
        use_cases: ['Teaching preparation', 'Educational planning', 'Training design']
      },
      {
        title: 'Student Feedback Form',
        description: 'Course evaluation and feedback collection',
        price: 0,
        tags: ['feedback', 'evaluation', 'education'],
        use_cases: ['Course improvement', 'Student satisfaction', 'Educational quality']
      }
    ],
    smart: [
      {
        title: 'Learning Path Designer',
        description: 'Structured skill development pathways',
        price: 300,
        tags: ['learning path', 'skill development', 'education'],
        use_cases: ['Professional development', 'Skill building', 'Career advancement']
      },
      {
        title: 'Training Workshop Planner',
        description: 'Complete workshop agenda with activities',
        price: 250,
        tags: ['workshop', 'training', 'agenda'],
        use_cases: ['Training delivery', 'Workshop facilitation', 'Professional development']
      },
      {
        title: 'Assessment Rubric Creator',
        description: 'Detailed grading rubrics for various assignments',
        price: 200,
        tags: ['rubric', 'assessment', 'grading'],
        use_cases: ['Educational assessment', 'Fair grading', 'Learning measurement']
      }
    ],
    recipe: [
      {
        title: 'Complete Online Course Builder',
        description: 'Full curriculum development with modules and assessments',
        price: 700,
        tags: ['course design', 'curriculum', 'online education'],
        use_cases: ['Online education', 'Course creation', 'Training programs']
      },
      {
        title: 'Corporate Training Program Designer',
        description: 'Enterprise training program with ROI measurement',
        price: 800,
        tags: ['corporate training', 'program design', 'ROI'],
        use_cases: ['Corporate education', 'Employee development', 'Training ROI']
      }
    ]
  },
  'Technology & Programming': {
    simple: [
      {
        title: 'API Documentation Template',
        description: 'Professional API documentation format',
        price: 100,
        tags: ['API', 'documentation', 'programming'],
        use_cases: ['Software development', 'API integration', 'Developer resources']
      },
      {
        title: 'Bug Report Template',
        description: 'Structured bug reporting format',
        price: 0,
        tags: ['bug report', 'QA', 'testing'],
        use_cases: ['Quality assurance', 'Bug tracking', 'Development workflow']
      },
      {
        title: 'Code Review Checklist',
        description: 'Comprehensive code review guidelines',
        price: 75,
        tags: ['code review', 'quality assurance', 'development'],
        use_cases: ['Software development', 'Code quality', 'Team collaboration']
      }
    ],
    smart: [
      {
        title: 'Database Schema Designer',
        description: 'Normalized database design with relationships',
        price: 350,
        tags: ['database', 'schema', 'design'],
        use_cases: ['Database development', 'System architecture', 'Data modeling']
      },
      {
        title: 'Project Architecture Planner',
        description: 'Software architecture design and documentation',
        price: 400,
        tags: ['architecture', 'software design', 'planning'],
        use_cases: ['Software architecture', 'System design', 'Development planning']
      },
      {
        title: 'Testing Strategy Framework',
        description: 'Comprehensive testing approach and implementation',
        price: 300,
        tags: ['testing', 'QA', 'strategy'],
        use_cases: ['Quality assurance', 'Test planning', 'Software reliability']
      }
    ],
    recipe: [
      {
        title: 'Complete DevOps Pipeline Builder',
        description: 'End-to-end CI/CD pipeline with monitoring',
        price: 800,
        tags: ['DevOps', 'CI/CD', 'automation'],
        use_cases: ['DevOps implementation', 'Deployment automation', 'Development efficiency']
      },
      {
        title: 'Microservices Architecture Guide',
        description: 'Complete microservices design and implementation',
        price: 900,
        tags: ['microservices', 'architecture', 'scalability'],
        use_cases: ['System architecture', 'Scalable systems', 'Enterprise development']
      }
    ]
  },
  'Healthcare': {
    simple: [
      {
        title: 'Patient Intake Form',
        description: 'Comprehensive patient information collection',
        price: 50,
        tags: ['healthcare', 'patient intake', 'forms'],
        use_cases: ['Medical practice', 'Patient management', 'Healthcare administration']
      },
      {
        title: 'Medical Appointment Reminder',
        description: 'Professional appointment reminder templates',
        price: 75,
        tags: ['appointments', 'reminders', 'healthcare'],
        use_cases: ['Medical practice', 'Patient communication', 'Appointment management']
      }
    ],
    smart: [
      {
        title: 'Treatment Plan Builder',
        description: 'Structured patient treatment planning',
        price: 300,
        tags: ['treatment plan', 'healthcare', 'patient care'],
        use_cases: ['Medical treatment', 'Patient care planning', 'Healthcare delivery']
      },
      {
        title: 'Medical Research Protocol',
        description: 'Clinical research study design framework',
        price: 400,
        tags: ['medical research', 'clinical trials', 'protocol'],
        use_cases: ['Medical research', 'Clinical studies', 'Healthcare innovation']
      }
    ],
    recipe: [
      {
        title: 'Healthcare Practice Management System',
        description: 'Complete practice management and workflow optimization',
        price: 750,
        tags: ['practice management', 'healthcare', 'workflow'],
        use_cases: ['Medical practice', 'Healthcare administration', 'Practice optimization']
      }
    ]
  },
  'Finance': {
    simple: [
      {
        title: 'Budget Planning Template',
        description: 'Personal and business budget planning',
        price: 0,
        tags: ['budget', 'planning', 'finance'],
        use_cases: ['Financial planning', 'Budget management', 'Personal finance']
      },
      {
        title: 'Invoice Template Creator',
        description: 'Professional invoice formats',
        price: 50,
        tags: ['invoice', 'billing', 'finance'],
        use_cases: ['Business billing', 'Invoice management', 'Financial documentation']
      }
    ],
    smart: [
      {
        title: 'Financial Analysis Framework',
        description: 'Comprehensive financial health assessment',
        price: 300,
        tags: ['financial analysis', 'assessment', 'finance'],
        use_cases: ['Financial planning', 'Business analysis', 'Investment decisions']
      },
      {
        title: 'Investment Portfolio Builder',
        description: 'Portfolio construction and risk assessment',
        price: 350,
        tags: ['investment', 'portfolio', 'risk management'],
        use_cases: ['Investment planning', 'Portfolio management', 'Financial advisory']
      }
    ],
    recipe: [
      {
        title: 'Complete Financial Planning System',
        description: 'End-to-end financial planning with projections',
        price: 600,
        tags: ['financial planning', 'projections', 'comprehensive'],
        use_cases: ['Financial advisory', 'Business planning', 'Wealth management']
      }
    ]
  },
  'Legal': {
    simple: [
      {
        title: 'Contract Template Generator',
        description: 'Basic contract templates for common agreements',
        price: 100,
        tags: ['contract', 'legal', 'template'],
        use_cases: ['Legal documentation', 'Business agreements', 'Contract management']
      }
    ],
    smart: [
      {
        title: 'Legal Compliance Checklist',
        description: 'Industry-specific compliance requirements',
        price: 400,
        tags: ['compliance', 'legal', 'requirements'],
        use_cases: ['Legal compliance', 'Risk management', 'Business operations']
      }
    ],
    recipe: [
      {
        title: 'Complete Legal Risk Assessment',
        description: 'Comprehensive legal risk analysis and mitigation',
        price: 800,
        tags: ['legal risk', 'assessment', 'mitigation'],
        use_cases: ['Legal risk management', 'Business protection', 'Compliance planning']
      }
    ]
  },
  'Real Estate': {
    simple: [
      {
        title: 'Property Listing Description',
        description: 'Compelling property descriptions that sell',
        price: 75,
        tags: ['real estate', 'listings', 'descriptions'],
        use_cases: ['Property marketing', 'Real estate sales', 'Property descriptions']
      }
    ],
    smart: [
      {
        title: 'Real Estate Market Analysis',
        description: 'Comprehensive market analysis for properties',
        price: 250,
        tags: ['market analysis', 'real estate', 'valuation'],
        use_cases: ['Property valuation', 'Market research', 'Investment analysis']
      }
    ],
    recipe: [
      {
        title: 'Complete Property Investment Analysis',
        description: 'Full investment analysis with ROI projections',
        price: 500,
        tags: ['investment analysis', 'real estate', 'ROI'],
        use_cases: ['Property investment', 'Real estate analysis', 'Investment decisions']
      }
    ]
  },
  'E-commerce': {
    simple: [
      {
        title: 'Product Description Writer',
        description: 'Converting product descriptions that sell',
        price: 50,
        tags: ['product descriptions', 'e-commerce', 'sales'],
        use_cases: ['E-commerce optimization', 'Product marketing', 'Sales conversion']
      }
    ],
    smart: [
      {
        title: 'E-commerce Store Optimizer',
        description: 'Complete store optimization for conversions',
        price: 300,
        tags: ['e-commerce', 'optimization', 'conversion'],
        use_cases: ['E-commerce growth', 'Conversion optimization', 'Online sales']
      }
    ],
    recipe: [
      {
        title: 'Complete E-commerce Launch Strategy',
        description: 'End-to-end e-commerce business launch plan',
        price: 700,
        tags: ['e-commerce', 'launch strategy', 'business plan'],
        use_cases: ['E-commerce startup', 'Online business launch', 'Digital commerce']
      }
    ]
  }
};

// Generate prompt text based on complexity and category
function generatePromptText(title, complexity, category) {
  const complexityTemplates = {
    simple: `Create [OUTPUT_TYPE] for [CONTEXT]:

**Requirements:**
- [REQUIREMENT_1]: [DESCRIPTION]
- [REQUIREMENT_2]: [DESCRIPTION]
- [REQUIREMENT_3]: [DESCRIPTION]

**Input Variables:**
- Main focus: [FOCUS_AREA]
- Target audience: [AUDIENCE]
- Specific goals: [OBJECTIVES]

**Output Format:**
Provide clear, actionable results that meet the specified requirements.

Context: [ADDITIONAL_CONTEXT]
Style: [PROFESSIONAL/CASUAL/CREATIVE]`,

    smart: `Generate comprehensive [OUTPUT_TYPE] for [CONTEXT]:

**Phase 1: Analysis**
- Current situation: [CURRENT_STATE]
- Target outcome: [DESIRED_STATE]
- Key constraints: [LIMITATIONS]
- Success criteria: [SUCCESS_METRICS]

**Phase 2: Planning**
- Strategy approach: [STRATEGY_TYPE]
- Resource requirements: [RESOURCES_NEEDED]
- Timeline considerations: [TIME_CONSTRAINTS]
- Risk factors: [POTENTIAL_RISKS]

**Phase 3: Implementation**
- Step-by-step process: [DETAILED_STEPS]
- Quality checkpoints: [VALIDATION_POINTS]
- Performance monitoring: [TRACKING_METHODS]

**Phase 4: Optimization**
- Measurement approach: [METRICS]
- Improvement strategies: [OPTIMIZATION_TACTICS]
- Scaling considerations: [GROWTH_PLANNING]

**Deliverables:**
1. [DELIVERABLE_1] with specifications
2. [DELIVERABLE_2] with templates
3. [DELIVERABLE_3] with guidelines

Input context: [CONTEXT_DETAILS]
Complexity level: [COMPLEXITY_REQUIREMENTS]
Expected outcome: [FINAL_RESULT]`,

    recipe: `Execute comprehensive [OUTPUT_TYPE] using this systematic approach:

**Discovery Phase:**
- Stakeholder analysis: [STAKEHOLDER_MAPPING]
- Requirements gathering: [REQUIREMENTS_ANALYSIS]
- Current state assessment: [BASELINE_EVALUATION]
- Goal definition: [OBJECTIVE_SETTING]

**Strategic Planning Phase:**
- Strategic framework: [FRAMEWORK_SELECTION]
- Resource allocation: [RESOURCE_PLANNING]
- Timeline development: [PROJECT_TIMELINE]
- Risk assessment: [RISK_EVALUATION]

**Development Phase:**
- Core component 1: [COMPONENT_DESCRIPTION]
  * Detailed specifications
  * Implementation guidelines
  * Quality standards
  * Testing procedures

- Core component 2: [COMPONENT_DESCRIPTION]
  * Detailed specifications
  * Implementation guidelines
  * Quality standards
  * Testing procedures

- Core component 3: [COMPONENT_DESCRIPTION]
  * Detailed specifications
  * Implementation guidelines
  * Quality standards
  * Testing procedures

**Implementation Phase:**
- Deployment strategy: [DEPLOYMENT_APPROACH]
- Change management: [CHANGE_STRATEGY]
- Training requirements: [TRAINING_PLAN]
- Communication plan: [COMMUNICATION_STRATEGY]

**Monitoring & Optimization Phase:**
- Performance metrics: [KPI_FRAMEWORK]
- Monitoring systems: [TRACKING_TOOLS]
- Optimization cycles: [IMPROVEMENT_PROCESS]
- Scaling strategies: [GROWTH_PLANNING]

**Professional Deliverables:**
1. [COMPREHENSIVE_DELIVERABLE_1] - Complete with templates, checklists, and implementation guides
2. [COMPREHENSIVE_DELIVERABLE_2] - Including best practices, case studies, and success metrics
3. [COMPREHENSIVE_DELIVERABLE_3] - With monitoring dashboards, reporting templates, and optimization frameworks
4. [COMPREHENSIVE_DELIVERABLE_4] - Featuring training materials, documentation, and support resources

**Advanced Customization Options:**
- Industry-specific adaptations: [INDUSTRY_CUSTOMIZATION]
- Scale variations: [SCALING_OPTIONS]
- Integration capabilities: [SYSTEM_INTEGRATIONS]
- Compliance considerations: [REGULATORY_REQUIREMENTS]

This comprehensive framework ensures enterprise-grade results suitable for [PROFESSIONAL_CONTEXT] with measurable outcomes and sustainable implementation.`
  };

  return complexityTemplates[complexity] || complexityTemplates.simple;
}

// Generate SQL INSERT statements
function generateSQL() {
  const prompts = [];
  let promptCount = 0;

  // Generate prompts for each category
  for (const [category, complexityLevels] of Object.entries(PROMPT_DATABASE)) {
    for (const [complexity, promptList] of Object.entries(complexityLevels)) {
      for (const prompt of promptList) {
        const difficultyMap = {
          simple: 'beginner',
          smart: 'intermediate', 
          recipe: 'advanced'
        };

        const promptData = {
          title: prompt.title,
          description: prompt.description,
          prompt_text: generatePromptText(prompt.title, complexity, category),
          complexity_level: complexity,
          category: category,
          difficulty_level: difficultyMap[complexity],
          tags: prompt.tags,
          price: prompt.price,
          use_cases: prompt.use_cases,
          ai_model_compatibility: ['GPT-4', 'Claude', 'Gemini'],
          user_id: ADMIN_USER_ID,
          is_marketplace: true,
          is_public: true,
          downloads_count: Math.floor(Math.random() * 200),
          rating_average: (3.5 + Math.random() * 1.5).toFixed(1),
          rating_count: Math.floor(Math.random() * 50),
          created_at: 'NOW()',
          updated_at: 'NOW()'
        };

        prompts.push(promptData);
        promptCount++;
      }
    }
  }

  // Fill remaining slots with generated variations
  const categoryNames = Object.keys(PROMPT_DATABASE);
  while (promptCount < 1000) {
    const randomCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)];
    const complexities = ['simple', 'smart', 'recipe'];
    const randomComplexity = complexities[Math.floor(Math.random() * complexities.length)];
    
    const basePrompts = PROMPT_DATABASE[randomCategory][randomComplexity];
    if (basePrompts && basePrompts.length > 0) {
      const basePrompt = basePrompts[Math.floor(Math.random() * basePrompts.length)];
      
      const difficultyMap = {
        simple: 'beginner',
        smart: 'intermediate',
        recipe: 'advanced'
      };

      const priceRanges = {
        simple: [0, 50, 75, 100],
        smart: [150, 200, 250, 300, 350],
        recipe: [400, 500, 600, 700, 800, 900]
      };

      const variation = {
        title: `${basePrompt.title} Pro ${promptCount - Object.values(PROMPT_DATABASE).flat().flatMap(x => Object.values(x)).flat().length + 1}`,
        description: `Advanced ${basePrompt.description.toLowerCase()}`,
        prompt_text: generatePromptText(basePrompt.title, randomComplexity, randomCategory),
        complexity_level: randomComplexity,
        category: randomCategory,
        difficulty_level: difficultyMap[randomComplexity],
        tags: basePrompt.tags,
        price: priceRanges[randomComplexity][Math.floor(Math.random() * priceRanges[randomComplexity].length)],
        use_cases: basePrompt.use_cases,
        ai_model_compatibility: ['GPT-4', 'Claude', 'Gemini'],
        user_id: ADMIN_USER_ID,
        is_marketplace: true,
        is_public: true,
        downloads_count: Math.floor(Math.random() * 200),
        rating_average: (3.5 + Math.random() * 1.5).toFixed(1),
        rating_count: Math.floor(Math.random() * 50),
        created_at: 'NOW()',
        updated_at: 'NOW()'
      };

      prompts.push(variation);
      promptCount++;
    }
  }

  // Generate SQL
  let sql = `-- Create 1000 Smart Prompts for Admin User rathan@innorag.com
-- Generated on ${new Date().toISOString()}
-- Total prompts: ${prompts.length}

-- Temporarily disable RLS for bulk insert
ALTER TABLE saved_prompts DISABLE ROW LEVEL SECURITY;

INSERT INTO saved_prompts (
  title, description, prompt_text, complexity_level, category, difficulty_level,
  tags, price, use_cases, ai_model_compatibility, user_id, is_marketplace, is_public,
  downloads_count, rating_average, rating_count, created_at, updated_at
) VALUES\n`;

  const values = prompts.map((prompt, index) => {
    const isLast = index === prompts.length - 1;
    return `(
  '${prompt.title.replace(/'/g, "''")}',
  '${prompt.description.replace(/'/g, "''")}',
  '${prompt.prompt_text.replace(/'/g, "''")}',
  '${prompt.complexity_level}',
  '${prompt.category}',
  '${prompt.difficulty_level}',
  ARRAY[${prompt.tags.map(tag => `'${tag}'`).join(', ')}],
  ${prompt.price},
  ARRAY[${prompt.use_cases.map(uc => `'${uc.replace(/'/g, "''")}'`).join(', ')}],
  ARRAY[${prompt.ai_model_compatibility.map(ai => `'${ai}'`).join(', ')}],
  '${prompt.user_id}',
  ${prompt.is_marketplace},
  ${prompt.is_public},
  ${prompt.downloads_count},
  ${prompt.rating_average},
  ${prompt.rating_count},
  ${prompt.created_at},
  ${prompt.updated_at}
)${isLast ? ';' : ','}`;
  }).join('\n');

  sql += values;

  sql += `

-- Update admin user profile with PromptCoins
UPDATE profiles 
SET promptcoins = 10000
WHERE id = '${ADMIN_USER_ID}';

-- Re-enable RLS
ALTER TABLE saved_prompts ENABLE ROW LEVEL SECURITY;

-- Summary
SELECT 
  category,
  complexity_level,
  COUNT(*) as prompt_count,
  AVG(price)::DECIMAL(10,2) as avg_price
FROM saved_prompts 
WHERE user_id = '${ADMIN_USER_ID}' 
  AND is_marketplace = true
GROUP BY category, complexity_level
ORDER BY category, complexity_level;`;

  return sql;
}

// Write SQL file
const sqlContent = generateSQL();
const outputPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250128160001_create_1000_admin_prompts.sql');

// Ensure directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, sqlContent);

console.log(`✅ Generated 1000 Smart Prompts SQL file:`);
console.log(`📁 File: ${outputPath}`);
console.log(`📊 Size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
console.log(`\n🚀 To execute:`);
console.log(`   psql -h aws-0-us-east-1.pooler.supabase.com -p 6543 -U postgres.tgzdbrvwvtgfkrqjvjxb -d postgres -f "${outputPath}"`);
console.log(`\n📋 Categories included:`);
Object.keys(PROMPT_DATABASE).forEach(category => {
  const complexities = Object.keys(PROMPT_DATABASE[category]);
  const totalCount = complexities.reduce((sum, complexity) => 
    sum + PROMPT_DATABASE[category][complexity].length, 0);
  console.log(`   • ${category}: ${totalCount} base prompts + variations`);
});

module.exports = { generateSQL, PROMPT_DATABASE };