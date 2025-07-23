// AI Assistant for Smart Prompt Creation - Real-time optimization and guidance
export interface OptimizationSuggestion {
  id: string;
  type: 'improvement' | 'warning' | 'tip' | 'best-practice';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestion: string;
  example?: string;
  category: string;
}

export interface QualityScore {
  overall: number; // 1-10
  breakdown: {
    clarity: number;
    specificity: number;
    structure: number;
    completeness: number;
    effectiveness: number;
  };
  suggestions: OptimizationSuggestion[];
}

export interface IntentAnalysis {
  primaryIntent: string;
  confidence: number;
  suggestedTemplates: string[];
  recommendedApproach: string;
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
}

export class AIAssistant {
  // Analyze user intent and recommend templates
  static analyzeIntent(userInput: string): IntentAnalysis {
    const input = userInput.toLowerCase().trim();
    
    // Intent patterns (simplified - could be enhanced with ML)
    const intentPatterns = {
      marketing: [
        'marketing', 'campaign', 'promotion', 'advertising', 'launch', 'sales',
        'customer', 'brand', 'social media', 'email marketing', 'content marketing'
      ],
      analysis: [
        'analyze', 'research', 'data', 'insights', 'report', 'study', 'feedback',
        'survey', 'trend', 'competitive', 'market research', 'customer feedback'
      ],
      creative: [
        'story', 'creative', 'write', 'script', 'narrative', 'character',
        'plot', 'fiction', 'novel', 'screenplay', 'blog post'
      ],
      technical: [
        'code', 'programming', 'debug', 'documentation', 'technical', 'software',
        'api', 'database', 'architecture', 'algorithm'
      ],
      business: [
        'business', 'strategy', 'planning', 'analysis', 'swot', 'model',
        'presentation', 'proposal', 'meeting', 'decision'
      ],
      education: [
        'teach', 'learn', 'education', 'course', 'lesson', 'training',
        'curriculum', 'quiz', 'assessment', 'explain'
      ]
    };

    let bestMatch = { category: 'general', score: 0 };
    
    Object.entries(intentPatterns).forEach(([category, patterns]) => {
      const matches = patterns.filter(pattern => input.includes(pattern)).length;
      if (matches > bestMatch.score) {
        bestMatch = { category, score: matches };
      }
    });

    const confidence = Math.min(bestMatch.score * 0.3, 1);
    
    // Get template recommendations based on intent
    const suggestedTemplates = this.getTemplateRecommendations(bestMatch.category, input);
    
    return {
      primaryIntent: bestMatch.category,
      confidence,
      suggestedTemplates,
      recommendedApproach: this.getRecommendedApproach(bestMatch.category, input),
      estimatedComplexity: this.estimateComplexity(input)
    };
  }

  // Analyze prompt quality and provide optimization suggestions
  static analyzePromptQuality(prompt: string, context?: any): QualityScore {
    const suggestions: OptimizationSuggestion[] = [];
    let scores = {
      clarity: 7,
      specificity: 7,
      structure: 7,
      completeness: 7,
      effectiveness: 7
    };

    // Check prompt length
    if (prompt.length < 50) {
      suggestions.push({
        id: 'too-short',
        type: 'warning',
        severity: 'medium',
        title: 'Prompt may be too brief',
        description: 'Very short prompts often lack necessary context and detail',
        suggestion: 'Add more context about what you want to achieve and any specific requirements',
        example: 'Instead of "Write a blog post", try "Write a 1000-word blog post about sustainable gardening for beginners, focusing on easy-to-grow vegetables"',
        category: 'completeness'
      });
      scores.completeness -= 2;
      scores.specificity -= 1;
    }

    // Check for vague language
    const vaguePhrases = ['something', 'anything', 'some', 'good', 'nice', 'better', 'stuff', 'things'];
    const vagueCount = vaguePhrases.filter(phrase => 
      prompt.toLowerCase().includes(phrase)
    ).length;

    if (vagueCount > 2) {
      suggestions.push({
        id: 'vague-language',
        type: 'improvement',
        severity: 'medium',
        title: 'Reduce vague language',
        description: 'Vague terms like "good", "nice", or "something" make prompts less effective',
        suggestion: 'Replace vague terms with specific requirements and criteria',
        example: 'Instead of "make it good", specify "make it engaging for professionals aged 25-45"',
        category: 'specificity'
      });
      scores.specificity -= vagueCount;
      scores.clarity -= 1;
    }

    // Check for specific details
    const specificIndicators = ['specific', 'exactly', 'precisely', 'detailed', 'comprehensive'];
    const hasSpecifics = specificIndicators.some(indicator => 
      prompt.toLowerCase().includes(indicator)
    );

    if (!hasSpecifics) {
      suggestions.push({
        id: 'add-specifics',
        type: 'tip',
        severity: 'low',
        title: 'Add specific requirements',
        description: 'More specific prompts typically produce better results',
        suggestion: 'Include specific details about format, length, style, or target audience',
        example: 'Add details like "in 500 words", "for social media", or "professional tone"',
        category: 'specificity'
      });
      scores.specificity -= 0.5;
    }

    // Check for context
    const contextWords = ['because', 'for', 'to help', 'in order to', 'purpose', 'goal', 'objective'];
    const hasContext = contextWords.some(word => 
      prompt.toLowerCase().includes(word)
    );

    if (!hasContext) {
      suggestions.push({
        id: 'add-context',
        type: 'improvement',
        severity: 'medium',
        title: 'Add context and purpose',
        description: 'Explaining why you need something helps AI provide more relevant responses',
        suggestion: 'Include the purpose, goal, or context for your request',
        example: 'Add context like "for a presentation to investors" or "to help onboard new employees"',
        category: 'effectiveness'
      });
      scores.effectiveness -= 1;
      scores.clarity -= 0.5;
    }

    // Check for role/persona specification
    const roleWords = ['as a', 'you are', 'act as', 'pretend', 'role'];
    const hasRole = roleWords.some(word => 
      prompt.toLowerCase().includes(word)
    );

    if (!hasRole && prompt.length > 100) {
      suggestions.push({
        id: 'specify-role',
        type: 'tip',
        severity: 'low',
        title: 'Consider specifying a role or perspective',
        description: 'Asking AI to take a specific role often improves response quality',
        suggestion: 'Add a role specification like "As a marketing expert..." or "Act as a..."',
        example: '"As a senior marketing manager, help me create..." or "Act as a data analyst and..."',
        category: 'effectiveness'
      });
      scores.effectiveness += 0.5; // Bonus for longer prompts that could benefit from role
    }

    // Check structure
    const hasStructure = prompt.includes('1.') || prompt.includes('-') || prompt.includes('•');
    if (prompt.length > 200 && !hasStructure) {
      suggestions.push({
        id: 'improve-structure',
        type: 'improvement',
        severity: 'low',
        title: 'Consider structuring your prompt',
        description: 'Long prompts benefit from clear structure with numbered points or bullets',
        suggestion: 'Break your prompt into numbered sections or use bullet points for clarity',
        example: '1. Context: ... 2. Requirements: ... 3. Format: ...',
        category: 'structure'
      });
      scores.structure -= 1;
    }

    // Check for examples
    if (prompt.length > 150 && !prompt.toLowerCase().includes('example')) {
      suggestions.push({
        id: 'add-examples',
        type: 'tip',
        severity: 'low',
        title: 'Consider adding examples',
        description: 'Examples help AI understand exactly what you want',
        suggestion: 'Include examples of the style, format, or type of content you want',
        example: 'Add "For example..." or "Similar to..." to clarify your expectations',
        category: 'clarity'
      });
      scores.clarity += 0.5; // Potential improvement
    }

    // Calculate overall score
    const overall = Math.round(
      (scores.clarity + scores.specificity + scores.structure + 
       scores.completeness + scores.effectiveness) / 5
    );

    // Ensure scores are within bounds
    Object.keys(scores).forEach(key => {
      scores[key as keyof typeof scores] = Math.max(1, Math.min(10, scores[key as keyof typeof scores]));
    });

    return {
      overall: Math.max(1, Math.min(10, overall)),
      breakdown: scores,
      suggestions: suggestions.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
    };
  }

  // Get real-time suggestions as user types
  static getRealTimeSuggestions(
    currentPrompt: string, 
    cursorPosition: number,
    templateContext?: any
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const prompt = currentPrompt.toLowerCase();

    // Quick length check
    if (currentPrompt.length > 20 && currentPrompt.length < 100) {
      suggestions.push({
        id: 'expand-prompt',
        type: 'tip',
        severity: 'low',
        title: 'Consider expanding your prompt',
        description: 'More detailed prompts often produce better results',
        suggestion: 'Add more context about your specific needs',
        category: 'completeness'
      });
    }

    // Check for question words without specifics
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who'];
    const hasQuestion = questionWords.some(word => prompt.includes(word));
    
    if (hasQuestion && !prompt.includes('specific')) {
      suggestions.push({
        id: 'be-specific',
        type: 'tip',
        severity: 'low',
        title: 'Be more specific',
        description: 'Questions benefit from specific parameters',
        suggestion: 'Add details about format, length, or target audience',
        category: 'specificity'
      });
    }

    return suggestions.slice(0, 3); // Limit to top 3 for real-time
  }

  // Generate optimization suggestions for completed prompts
  static generateOptimizationSuggestions(
    prompt: string, 
    templateType?: string,
    userGoal?: string
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Template-specific suggestions
    if (templateType === 'marketing') {
      if (!prompt.toLowerCase().includes('target audience')) {
        suggestions.push({
          id: 'add-target-audience',
          type: 'improvement',
          severity: 'high',
          title: 'Specify target audience',
          description: 'Marketing content is more effective with a clear target audience',
          suggestion: 'Add details about who you want to reach',
          example: 'Target audience: Small business owners aged 30-50',
          category: 'effectiveness'
        });
      }

      if (!prompt.toLowerCase().includes('call to action') && !prompt.toLowerCase().includes('cta')) {
        suggestions.push({
          id: 'add-cta',
          type: 'improvement',
          severity: 'medium',
          title: 'Include call-to-action guidance',
          description: 'Marketing content should guide readers toward a specific action',
          suggestion: 'Specify what action you want readers to take',
          example: 'Include a clear call-to-action like "Sign up for our newsletter"',
          category: 'effectiveness'
        });
      }
    }

    if (templateType === 'analysis') {
      if (!prompt.toLowerCase().includes('metric') && !prompt.toLowerCase().includes('measure')) {
        suggestions.push({
          id: 'define-metrics',
          type: 'improvement',
          severity: 'medium',
          title: 'Define success metrics',
          description: 'Analysis is more valuable with clear measurement criteria',
          suggestion: 'Specify what metrics or outcomes you want to measure',
          example: 'Measure success by conversion rate, engagement, or customer satisfaction',
          category: 'effectiveness'
        });
      }
    }

    return suggestions;
  }

  private static getTemplateRecommendations(category: string, input: string): string[] {
    const recommendations: { [key: string]: string[] } = {
      marketing: ['marketing-product-launch', 'social-media-campaign', 'email-sequence'],
      analysis: ['analysis-customer-feedback', 'competitive-analysis', 'data-insights'],
      creative: ['creative-story-outline', 'character-development', 'content-creation'],
      technical: ['technical-documentation', 'code-review', 'architecture-design'],
      business: ['business-strategy', 'swot-analysis', 'presentation-outline'],
      education: ['lesson-plan', 'curriculum-design', 'assessment-creation']
    };

    return recommendations[category] || ['general-template'];
  }

  private static getRecommendedApproach(category: string, input: string): string {
    const approaches: { [key: string]: string } = {
      marketing: 'Start with your target audience and desired outcome, then build your message around their needs and motivations.',
      analysis: 'Begin by clearly defining what you want to analyze and what decisions the analysis will inform.',
      creative: 'Focus on your core concept and main character first, then build the structure around their journey.',
      technical: 'Start with the problem you\'re solving and the audience who will use your solution.',
      business: 'Begin with your business objectives and the specific decisions this work will support.',
      education: 'Start with learning objectives and what students should be able to do after the lesson.'
    };

    return approaches[category] || 'Break down your goal into specific, actionable components and provide clear context.';
  }

  private static estimateComplexity(input: string): 'simple' | 'moderate' | 'complex' {
    const complexityIndicators = {
      simple: ['quick', 'simple', 'basic', 'easy', 'brief'],
      complex: ['comprehensive', 'detailed', 'advanced', 'complex', 'multi-step', 'strategic']
    };

    const inputLower = input.toLowerCase();
    
    if (complexityIndicators.complex.some(word => inputLower.includes(word))) {
      return 'complex';
    }
    
    if (complexityIndicators.simple.some(word => inputLower.includes(word)) || input.length < 50) {
      return 'simple';
    }
    
    return 'moderate';
  }
}

// Recipe workflow system
export interface RecipeStep {
  id: string;
  title: string;
  description: string;
  template: string;
  variables: any[];
  estimatedTime: string;
  tips: string[];
  dependencies?: string[]; // Other steps that must be completed first
  optional?: boolean;
}

export interface DecisionPoint {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    description: string;
    nextSteps: string[];
  }[];
}

export interface IntelligentRecipe {
  id: string;
  name: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  objective: string;
  estimatedTotalTime: string;
  
  steps: RecipeStep[];
  decisionPoints: DecisionPoint[];
  qualityChecklist: string[];
  
  aiAssistance: {
    stepGuidance: { [stepId: string]: string[] };
    qualityScoring: string[];
    optimizationTips: string[];
  };
}

// Sample intelligent recipe
export const INTELLIGENT_RECIPES: IntelligentRecipe[] = [
  {
    id: 'complete-marketing-campaign',
    name: 'Complete Marketing Campaign Creation',
    category: 'marketing',
    difficulty: 'advanced',
    description: 'Create a comprehensive marketing campaign from strategy to execution',
    objective: 'Develop a full marketing campaign with messaging, content, and distribution strategy',
    estimatedTotalTime: '2-3 hours',
    
    steps: [
      {
        id: 'audience-research',
        title: 'Audience Research & Personas',
        description: 'Define and research your target audience',
        template: 'Create detailed customer personas for {product_service}...',
        variables: [
          { name: 'product_service', type: 'text', label: 'Product/Service', required: true }
        ],
        estimatedTime: '20 minutes',
        tips: [
          'Use real data when possible',
          'Include pain points and motivations',
          'Create 2-3 detailed personas rather than many shallow ones'
        ]
      },
      {
        id: 'message-strategy',
        title: 'Core Message Strategy',
        description: 'Develop your core messaging framework',
        template: 'Based on the audience personas, create core messaging...',
        variables: [],
        estimatedTime: '30 minutes',
        tips: [
          'Focus on benefits, not features',
          'Address specific customer pain points',
          'Test messages with different personas'
        ],
        dependencies: ['audience-research']
      },
      {
        id: 'content-creation',
        title: 'Content Creation',
        description: 'Create campaign content across channels',
        template: 'Generate campaign content including...',
        variables: [],
        estimatedTime: '45 minutes',
        tips: [
          'Adapt content for each channel',
          'Maintain consistent messaging',
          'Include clear calls-to-action'
        ],
        dependencies: ['message-strategy']
      }
    ],
    
    decisionPoints: [
      {
        id: 'campaign-type',
        question: 'What type of campaign are you creating?',
        options: [
          {
            value: 'product-launch',
            label: 'Product Launch',
            description: 'Introducing a new product or service',
            nextSteps: ['audience-research', 'competitive-analysis']
          },
          {
            value: 'brand-awareness',
            label: 'Brand Awareness',
            description: 'Building recognition and awareness',
            nextSteps: ['audience-research', 'brand-positioning']
          }
        ]
      }
    ],
    
    qualityChecklist: [
      'Target audience is clearly defined',
      'Messaging addresses customer pain points',
      'Content is adapted for each channel',
      'Success metrics are defined',
      'Timeline and budget are realistic'
    ],
    
    aiAssistance: {
      stepGuidance: {
        'audience-research': [
          'Include demographic AND psychographic data',
          'Research where your audience spends time online',
          'Identify their preferred communication style'
        ]
      },
      qualityScoring: [
        'Audience specificity',
        'Message clarity',
        'Content quality',
        'Channel optimization'
      ],
      optimizationTips: [
        'Test different message variations',
        'Use A/B testing for subject lines',
        'Track engagement metrics by audience segment'
      ]
    }
  }
];