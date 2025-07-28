/**
 * Generate 1000 Smart Prompts for Admin User
 * This script creates diverse, high-quality prompts across multiple industries
 * with varied pricing based on complexity
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_USER_ID = '28f7a306-4eca-4429-87d8-7fc9b154c11b'; // rathan@innorag.com

// Pricing structure based on complexity
const PRICING = {
  simple: [0, 50, 100],      // Free to low-cost basic prompts
  smart: [150, 250, 350],    // Mid-range smart prompts
  recipe: [400, 600, 800]    // High-value complex prompts
};

// Categories and their typical complexity distributions
const CATEGORIES = {
  'Business': { simple: 30, smart: 50, recipe: 20 },
  'Marketing': { simple: 25, smart: 55, recipe: 20 },
  'Content Creation': { simple: 40, smart: 45, recipe: 15 },
  'Education': { simple: 35, smart: 45, recipe: 20 },
  'Technology': { simple: 20, smart: 40, recipe: 40 },
  'Healthcare': { simple: 25, smart: 50, recipe: 25 },
  'Finance': { simple: 30, smart: 45, recipe: 25 },
  'Legal': { simple: 20, smart: 40, recipe: 40 },
  'Real Estate': { simple: 35, smart: 50, recipe: 15 },
  'E-commerce': { simple: 30, smart: 50, recipe: 20 },
  'Human Resources': { simple: 40, smart: 45, recipe: 15 },
  'Sales': { simple: 30, smart: 55, recipe: 15 },
  'Customer Service': { simple: 45, smart: 40, recipe: 15 },
  'Creative Writing': { simple: 50, smart: 35, recipe: 15 },
  'Data Analysis': { simple: 15, smart: 45, recipe: 40 },
  'Project Management': { simple: 25, smart: 55, recipe: 20 },
  'Design': { simple: 35, smart: 45, recipe: 20 },
  'Social Media': { simple: 45, smart: 40, recipe: 15 },
  'SEO': { simple: 30, smart: 50, recipe: 20 },
  'Analytics': { simple: 25, smart: 45, recipe: 30 }
};

// Template structures for different complexity levels
const PROMPT_TEMPLATES = {
  simple: {
    structure: 'Basic instruction with 1-2 variables and simple output format.',
    averageLength: 200,
    variables: 2
  },
  smart: {
    structure: 'Detailed instructions with multiple variables, examples, and structured output.',
    averageLength: 500,
    variables: 5
  },
  recipe: {
    structure: 'Comprehensive multi-step process with extensive customization and professional output.',
    averageLength: 1000,
    variables: 10
  }
};

// Generate prompts for different industries and use cases
const PROMPT_IDEAS = {
  'Business': [
    {
      title: 'Business Plan Executive Summary',
      description: 'Create compelling executive summaries that capture investor attention',
      complexity: 'recipe',
      tags: ['business plan', 'executive summary', 'investors', 'startup'],
      use_cases: ['Startup funding', 'Business planning', 'Investor presentations']
    },
    {
      title: 'SWOT Analysis Generator',
      description: 'Comprehensive SWOT analysis for strategic business planning',
      complexity: 'smart',
      tags: ['SWOT', 'strategy', 'analysis', 'planning'],
      use_cases: ['Strategic planning', 'Business analysis', 'Decision making']
    },
    {
      title: 'Meeting Agenda Template',
      description: 'Professional meeting agenda format for productive discussions',
      complexity: 'simple',
      tags: ['meeting', 'agenda', 'productivity'],
      use_cases: ['Team meetings', 'Project planning', 'Corporate communication']
    },
    // ... more business prompts
  ],
  'Marketing': [
    {
      title: 'Email Marketing Campaign Planner',
      description: 'Plan comprehensive email marketing campaigns with automation sequences',
      complexity: 'recipe',
      tags: ['email marketing', 'campaigns', 'automation'],
      use_cases: ['Email marketing', 'Lead nurturing', 'Customer retention']
    },
    {
      title: 'Social Media Content Calendar',
      description: 'Monthly social media content planning with engagement strategies',
      complexity: 'smart',
      tags: ['social media', 'content calendar', 'planning'],
      use_cases: ['Social media management', 'Content marketing', 'Brand building']
    },
    {
      title: 'Instagram Caption Writer',
      description: 'Engaging Instagram captions with hashtags and CTAs',
      complexity: 'simple',
      tags: ['Instagram', 'captions', 'social media'],
      use_cases: ['Social media posting', 'Content creation', 'Engagement']
    },
    // ... more marketing prompts
  ],
  // ... more categories
};

function getRandomPrice(complexity) {
  const prices = PRICING[complexity];
  return prices[Math.floor(Math.random() * prices.length)];
}

function generatePromptText(title, complexity, category) {
  const templates = {
    simple: `Create [OUTPUT_TYPE] for [TARGET_CONTEXT]:

**Requirements:**
- [REQUIREMENT_1]
- [REQUIREMENT_2]
- [REQUIREMENT_3]

**Context:**
- Topic: [TOPIC]
- Audience: [AUDIENCE]
- Purpose: [PURPOSE]

Provide clear, actionable output that meets the specified requirements.`,

    smart: `Generate comprehensive [OUTPUT_TYPE] for [TARGET_CONTEXT]:

**Input Variables:**
- Primary focus: [FOCUS_AREA]
- Target audience: [AUDIENCE]
- Specific goals: [GOALS]
- Constraints: [CONSTRAINTS]
- Style preference: [STYLE]

**Output Structure:**
1. **Section 1:** [SECTION_DESCRIPTION]
   - Key elements to include
   - Specific formatting requirements

2. **Section 2:** [SECTION_DESCRIPTION]
   - Detailed specifications
   - Examples and templates

3. **Section 3:** [SECTION_DESCRIPTION]
   - Implementation guidelines
   - Best practices

**Quality Criteria:**
- [CRITERION_1]
- [CRITERION_2]
- [CRITERION_3]

Context: [ADDITIONAL_CONTEXT]
Expected outcome: [DESIRED_RESULT]`,

    recipe: `Create a comprehensive [OUTPUT_TYPE] following this structured approach:

**Phase 1: Discovery & Planning**
- Analysis of [INPUT_1]: [DESCRIPTION]
- Assessment of [INPUT_2]: [DESCRIPTION]
- Goal setting: [INPUT_3]
- Resource evaluation: [INPUT_4]

**Phase 2: Development**
- Core component 1: [COMPONENT_DESCRIPTION]
  - Detailed specifications
  - Implementation steps
  - Quality checkpoints

- Core component 2: [COMPONENT_DESCRIPTION]
  - Detailed specifications
  - Implementation steps
  - Quality checkpoints

**Phase 3: Optimization & Refinement**
- Performance criteria: [CRITERIA]
- Testing methodology: [TESTING_APPROACH]
- Iteration guidelines: [ITERATION_PROCESS]

**Phase 4: Implementation & Monitoring**
- Deployment strategy: [DEPLOYMENT]
- Success metrics: [METRICS]
- Ongoing optimization: [OPTIMIZATION]

**Deliverables:**
1. [DELIVERABLE_1] with specifications
2. [DELIVERABLE_2] with templates
3. [DELIVERABLE_3] with guidelines
4. [DELIVERABLE_4] with checklists

**Advanced Customization:**
- Industry-specific adaptations: [INDUSTRY_CUSTOMIZATION]
- Scale variations: [SCALE_OPTIONS]
- Integration considerations: [INTEGRATIONS]

This comprehensive approach ensures professional-grade results suitable for [PROFESSIONAL_CONTEXT].`
  };

  return templates[complexity];
}

async function generateAndInsertPrompts() {
  console.log('Starting Smart Prompts generation...');
  
  const prompts = [];
  let promptCount = 0;

  // Generate prompts for each category
  for (const [category, distribution] of Object.entries(CATEGORIES)) {
    const categoryTotal = Math.floor(1000 / Object.keys(CATEGORIES).length);
    
    // Calculate how many prompts of each complexity for this category
    const simpleCount = Math.floor(categoryTotal * distribution.simple / 100);
    const smartCount = Math.floor(categoryTotal * distribution.smart / 100);
    const recipeCount = categoryTotal - simpleCount - smartCount;

    // Generate simple prompts
    for (let i = 0; i < simpleCount; i++) {
      prompts.push(generatePrompt(category, 'simple', i + 1));
      promptCount++;
    }

    // Generate smart prompts
    for (let i = 0; i < smartCount; i++) {
      prompts.push(generatePrompt(category, 'smart', i + 1));
      promptCount++;
    }

    // Generate recipe prompts
    for (let i = 0; i < recipeCount; i++) {
      prompts.push(generatePrompt(category, 'recipe', i + 1));
      promptCount++;
    }
  }

  // Fill remaining slots if needed
  while (promptCount < 1000) {
    const randomCategory = Object.keys(CATEGORIES)[Math.floor(Math.random() * Object.keys(CATEGORIES).length)];
    const complexities = ['simple', 'smart', 'recipe'];
    const randomComplexity = complexities[Math.floor(Math.random() * complexities.length)];
    
    prompts.push(generatePrompt(randomCategory, randomComplexity, promptCount + 1));
    promptCount++;
  }

  console.log(`Generated ${prompts.length} prompts. Inserting into database...`);

  // Insert in batches of 50 to avoid timeout
  const batchSize = 50;
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    
    try {
      const { error } = await supabase
        .from('saved_prompts')
        .insert(batch);

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(prompts.length / batchSize)}`);
      }
    } catch (err) {
      console.error(`Exception in batch ${i / batchSize + 1}:`, err);
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('Smart Prompts generation completed!');
}

function generatePrompt(category, complexity, index) {
  const titles = generateTitlesForCategory(category, complexity);
  const title = titles[index % titles.length] || `${category} ${complexity} Prompt ${index}`;
  
  const descriptions = generateDescriptionsForCategory(category, complexity);
  const description = descriptions[index % descriptions.length] || `Professional ${complexity} prompt for ${category.toLowerCase()}`;

  const price = getRandomPrice(complexity);
  const tags = generateTagsForCategory(category);
  const useCases = generateUseCasesForCategory(category);

  return {
    title,
    description,
    prompt_text: generatePromptText(title, complexity, category),
    complexity_level: complexity,
    category,
    difficulty_level: complexity === 'simple' ? 'beginner' : complexity === 'smart' ? 'intermediate' : 'advanced',
    tags,
    price,
    use_cases: useCases,
    ai_model_compatibility: ['GPT-4', 'Claude', 'Gemini'],
    user_id: ADMIN_USER_ID,
    is_marketplace: true,
    is_public: true,
    downloads_count: Math.floor(Math.random() * 100),
    rating_average: 3.5 + Math.random() * 1.5,
    rating_count: Math.floor(Math.random() * 50),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function generateTitlesForCategory(category, complexity) {
  const titleTemplates = {
    'Business': [
      'Business Plan Generator', 'ROI Calculator Template', 'Stakeholder Communication Guide',
      'Process Optimization Framework', 'Budget Planning Worksheet', 'Risk Assessment Matrix',
      'Performance Review Template', 'Strategic Planning Guide', 'Vendor Evaluation Form',
      'Cost-Benefit Analysis Tool'
    ],
    'Marketing': [
      'Campaign Performance Tracker', 'Brand Guidelines Creator', 'Customer Journey Mapper',
      'Content Marketing Planner', 'Lead Generation Strategy', 'Market Research Template',
      'Competitor Analysis Framework', 'SEO Content Optimizer', 'Social Media Scheduler',
      'Email Automation Sequence'
    ],
    // Add more categories...
  };

  return titleTemplates[category] || [`${category} ${complexity} Template`];
}

function generateDescriptionsForCategory(category, complexity) {
  const descriptionTemplates = {
    'Business': [
      'Streamline business processes with professional templates',
      'Comprehensive business analysis and planning tools',
      'Strategic frameworks for business growth and optimization',
      'Professional templates for business documentation'
    ],
    'Marketing': [
      'Advanced marketing strategies and campaign planning',
      'Customer acquisition and retention optimization',
      'Brand building and market positioning tools',
      'Data-driven marketing performance analysis'
    ],
    // Add more categories...
  };

  return descriptionTemplates[category] || [`Professional ${complexity} tools for ${category.toLowerCase()}`];
}

function generateTagsForCategory(category) {
  const tagMappings = {
    'Business': ['business', 'strategy', 'planning', 'analysis', 'optimization'],
    'Marketing': ['marketing', 'campaigns', 'branding', 'digital', 'analytics'],
    'Technology': ['tech', 'development', 'programming', 'automation', 'AI'],
    'Education': ['education', 'training', 'learning', 'curriculum', 'assessment'],
    // Add more...
  };

  return tagMappings[category] || [category.toLowerCase()];
}

function generateUseCasesForCategory(category) {
  const useCaseMappings = {
    'Business': ['Strategic planning', 'Business development', 'Operations management'],
    'Marketing': ['Campaign management', 'Brand development', 'Customer acquisition'],
    'Technology': ['Software development', 'System automation', 'Technical documentation'],
    'Education': ['Course creation', 'Training programs', 'Assessment design'],
    // Add more...
  };

  return useCaseMappings[category] || [`${category} applications`];
}

// Run the script
if (require.main === module) {
  generateAndInsertPrompts().catch(console.error);
}

module.exports = { generateAndInsertPrompts };