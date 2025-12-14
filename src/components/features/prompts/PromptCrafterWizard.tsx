'use client';

import { useState, useEffect } from 'react';
import { 
  Wand2, 
  MessageSquare, 
  Brain, 
  FileText, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Settings,
  Lightbulb,
  Target,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Copy,
  Crown,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { track } from '@vercel/analytics';
import dynamic from 'next/dynamic';

// Lazy load the help component
const PromptCrafterHelp = dynamic(() => import('./PromptCrafterHelp'), {
  ssr: false
});

// Framework types based on Prompt Crafter methodology
type Framework = 
  | 'zero-shot' 
  | 'one-shot' 
  | 'few-shot' 
  | 'step-back' 
  | 'chain-of-thought' 
  | 'self-consistency' 
  | 'tree-of-thought' 
  | 'react' 
  | 'role-based' 
  | 'rag' 
  | 'constitutional-ai' 
  | 'prompt-chaining';

// Model types
type Model = {
  id: string;
  name: string;
  version: string;
  contextLength: number;
  strengths: string[];
  bestFor: string[];
};

// Output format types
type OutputFormat = 
  | 'analysis' 
  | 'strategic-plan' 
  | 'narrative' 
  | 'diagnostic-guide' 
  | 'walkthrough' 
  | 'checklist' 
  | 'synthesis' 
  | 'design-spec' 
  | 'roadmap' 
  | 'timeline' 
  | 'tutorial' 
  | 'json' 
  | 'xml' 
  | 'csv' 
  | 'custom';

interface PromptCrafterWizardProps {
  onComplete?: (prompt: string, metadata: any) => void;
  onCancel?: () => void;
}

interface WizardState {
  stage: 0 | 1 | 2 | 3;
  idea: string;
  preferences: {
    style?: string;
    temperature?: number;
    topP?: number;
    maxTokens?: number;
  };
  framework?: Framework;
  model?: Model;
  outputFormat?: OutputFormat;
  customFormat?: string;
  finalPrompt?: string;
}

const FRAMEWORKS: Record<Framework, {
  name: string;
  description: string;
  whenToUse: string;
  example: string;
}> = {
  'zero-shot': {
    name: 'Zero-Shot',
    description: 'Direct task request without examples',
    whenToUse: 'Simple, straightforward tasks with clear instructions',
    example: 'Classify this review as positive or negative.'
  },
  'one-shot': {
    name: 'One-Shot',
    description: 'Single example to demonstrate format',
    whenToUse: 'Tasks requiring specific format or style',
    example: 'Example: Input -> Output\nYour Input -> ?'
  },
  'few-shot': {
    name: 'Few-Shot',
    description: 'Multiple examples (2-5) to establish pattern',
    whenToUse: 'Complex patterns or specific formatting requirements',
    example: 'Example 1, Example 2, Example 3\nYour Input -> ?'
  },
  'chain-of-thought': {
    name: 'Chain-of-Thought',
    description: 'Step-by-step reasoning process',
    whenToUse: 'Complex reasoning, math, or logical problems',
    example: 'Let\'s think step by step...'
  },
  'tree-of-thought': {
    name: 'Tree-of-Thought',
    description: 'Explore multiple reasoning paths',
    whenToUse: 'Problems with multiple valid approaches',
    example: 'Consider multiple approaches and evaluate each...'
  },
  'step-back': {
    name: 'Step-Back',
    description: 'Abstract the problem before solving',
    whenToUse: 'Complex problems needing broader context',
    example: 'First, let\'s understand the broader concept...'
  },
  'self-consistency': {
    name: 'Self-Consistency',
    description: 'Generate multiple solutions and select best',
    whenToUse: 'Critical decisions needing validation',
    example: 'Generate 3 different approaches and select the best...'
  },
  'react': {
    name: 'ReAct',
    description: 'Reason + Act in iterations',
    whenToUse: 'Tasks requiring tool use or external actions',
    example: 'Thought: ... Action: ... Observation: ...'
  },
  'role-based': {
    name: 'Role-Based',
    description: 'Adopt specific expert persona',
    whenToUse: 'Domain-specific expertise needed',
    example: 'As a senior data scientist with 10 years experience...'
  },
  'rag': {
    name: 'RAG',
    description: 'Retrieval-Augmented Generation',
    whenToUse: 'Tasks requiring external knowledge',
    example: 'Based on the following context: [context]...'
  },
  'constitutional-ai': {
    name: 'Constitutional AI',
    description: 'Built-in critique and revision',
    whenToUse: 'Sensitive topics needing careful handling',
    example: 'Generate response, then critique and revise...'
  },
  'prompt-chaining': {
    name: 'Prompt Chaining',
    description: 'Break complex tasks into steps',
    whenToUse: 'Multi-stage complex workflows',
    example: 'Step 1: ... Output -> Step 2: ...'
  }
};

const MODELS: Model[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    version: 'Latest',
    contextLength: 128000,
    strengths: ['General reasoning', 'Creative writing', 'Code generation'],
    bestFor: ['Complex analysis', 'Creative tasks', 'Programming']
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    version: '20240229',
    contextLength: 200000,
    strengths: ['Long context', 'Nuanced reasoning', 'Safety'],
    bestFor: ['Document analysis', 'Research', 'Ethical considerations']
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    version: '1.5',
    contextLength: 1000000,
    strengths: ['Multimodal', 'Very long context', 'Fast'],
    bestFor: ['Video/Image analysis', 'Large documents', 'Real-time tasks']
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    version: 'Latest',
    contextLength: 16000,
    strengths: ['Fast', 'Cost-effective', 'Good general performance'],
    bestFor: ['Simple tasks', 'Quick responses', 'High volume']
  }
];

const OUTPUT_FORMATS: Record<OutputFormat, {
  name: string;
  description: string;
  structure: string;
}> = {
  'analysis': {
    name: 'Analysis',
    description: 'Detailed examination of a topic',
    structure: 'Executive Summary, Key Findings, Deep Dive, Recommendations'
  },
  'strategic-plan': {
    name: 'Strategic Plan',
    description: 'Action-oriented planning document',
    structure: 'Goals, Strategies, Tactics, Timeline, Metrics'
  },
  'narrative': {
    name: 'Narrative',
    description: 'Story-based presentation',
    structure: 'Introduction, Development, Climax, Resolution'
  },
  'diagnostic-guide': {
    name: 'Diagnostic Guide',
    description: 'Problem identification and solutions',
    structure: 'Symptoms, Root Causes, Solutions, Prevention'
  },
  'walkthrough': {
    name: 'Annotated Walkthrough',
    description: 'Step-by-step guide with explanations',
    structure: 'Overview, Prerequisites, Steps (with annotations), Summary'
  },
  'checklist': {
    name: 'Checklist',
    description: 'Actionable items list',
    structure: '□ Task items with sub-tasks and validation criteria'
  },
  'synthesis': {
    name: 'Synthesis',
    description: 'Combining multiple sources/ideas',
    structure: 'Sources Overview, Common Themes, Contradictions, Unified View'
  },
  'design-spec': {
    name: 'Design Specification',
    description: 'Technical design document',
    structure: 'Requirements, Architecture, Implementation, Testing'
  },
  'roadmap': {
    name: 'Roadmap',
    description: 'Phased implementation plan',
    structure: 'Phase 1 (Now), Phase 2 (Next), Phase 3 (Later), Future'
  },
  'timeline': {
    name: 'Timeline',
    description: 'Chronological sequence',
    structure: 'Date/Time -> Event -> Impact -> Next Steps'
  },
  'tutorial': {
    name: 'Tutorial',
    description: 'Educational guide',
    structure: 'Learning Objectives, Concepts, Examples, Exercises, Summary'
  },
  'json': {
    name: 'JSON Report',
    description: 'Structured data format',
    structure: '{ "key": "value", "nested": { ... } }'
  },
  'xml': {
    name: 'XML Feed',
    description: 'Hierarchical data format',
    structure: '<root><element>value</element></root>'
  },
  'csv': {
    name: 'CSV Table',
    description: 'Tabular data format',
    structure: 'header1,header2,header3\\nvalue1,value2,value3'
  },
  'custom': {
    name: 'Custom Format',
    description: 'Define your own structure',
    structure: 'User-defined format'
  }
};

export default function PromptCrafterWizard({
  onComplete,
  onCancel
}: PromptCrafterWizardProps) {
  const [wizardState, setWizardState] = useState<WizardState>({
    stage: 0,
    idea: '',
    preferences: {}
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleStage0Submit = () => {
    if (!wizardState.idea.trim()) {
      toast.error('Please enter your idea or question');
      return;
    }
    
    track('prompt_crafter_stage0_complete', {
      idea_length: wizardState.idea.length,
      has_preferences: Object.keys(wizardState.preferences).length > 0
    });
    
    // Move to Stage 1
    setWizardState(prev => ({ ...prev, stage: 1 }));
    analyzeAndRecommend();
  };

  const analyzeAndRecommend = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis - in production, this would call an API
    setTimeout(() => {
      const recommendedFramework = recommendFramework(wizardState.idea);
      const recommendedModel = recommendModel(wizardState.idea, recommendedFramework);
      
      setWizardState(prev => ({
        ...prev,
        framework: recommendedFramework,
        model: recommendedModel
      }));
      
      setIsAnalyzing(false);
      
      track('prompt_crafter_stage1_analysis', {
        framework: recommendedFramework || 'none',
        model: recommendedModel?.id || 'none'
      });
    }, 2000);
  };

  const recommendFramework = (idea: string): Framework => {
    const lowerIdea = idea.toLowerCase();
    
    // Simple heuristic for framework selection
    if (lowerIdea.includes('analyze') || lowerIdea.includes('research')) {
      return 'chain-of-thought';
    } else if (lowerIdea.includes('create') || lowerIdea.includes('write')) {
      return 'role-based';
    } else if (lowerIdea.includes('multiple') || lowerIdea.includes('options')) {
      return 'tree-of-thought';
    } else if (lowerIdea.includes('example') || lowerIdea.includes('format')) {
      return 'few-shot';
    } else if (lowerIdea.includes('step') || lowerIdea.includes('process')) {
      return 'step-back';
    }
    
    return 'one-shot'; // Default
  };

  const recommendModel = (idea: string, framework: Framework): Model => {
    // Simple heuristic for model selection
    if (framework === 'chain-of-thought' || framework === 'tree-of-thought') {
      return MODELS[0]; // GPT-4o for complex reasoning
    } else if (idea.length > 500) {
      return MODELS[1]; // Claude for long context
    } else if (idea.includes('image') || idea.includes('video')) {
      return MODELS[2]; // Gemini for multimodal
    }
    
    return MODELS[0]; // Default to GPT-4o
  };

  const recommendOutputFormat = (): OutputFormat => {
    const idea = wizardState.idea.toLowerCase();
    
    if (idea.includes('analyze')) return 'analysis';
    if (idea.includes('plan')) return 'strategic-plan';
    if (idea.includes('story')) return 'narrative';
    if (idea.includes('guide')) return 'walkthrough';
    if (idea.includes('check')) return 'checklist';
    if (idea.includes('timeline')) return 'timeline';
    if (idea.includes('tutorial')) return 'tutorial';
    
    return 'analysis'; // Default
  };

  const generateFinalPrompt = () => {
    const { idea, preferences, framework, model, outputFormat, customFormat } = wizardState;
    
    // Build the final prompt following Prompt Crafter requirements
    let prompt = `# Target-Model: ${model?.name} ${model?.version}\n\n`;
    
    // A - Contextual Setup
    prompt += `## Context\n${idea}\n\n`;
    
    // B - Expert Persona
    const persona = getExpertPersona(idea, framework!);
    prompt += `## Role\n${persona}\n\n`;
    
    // C - Deep Reasoning & Accuracy
    prompt += `## Instructions\n`;
    prompt += `1. Approach this task with deep, systematic reasoning\n`;
    prompt += `2. Consider multiple angles and perspectives\n`;
    prompt += `3. Verify facts and flag any uncertainties\n`;
    prompt += `4. Use ${FRAMEWORKS[framework!].name} methodology\n\n`;
    
    // D - Structured Output
    const format = outputFormat === 'custom' ? customFormat : OUTPUT_FORMATS[outputFormat!].structure;
    prompt += `## Output Format\n${format}\n\n`;
    
    // E - Style & Tone
    if (preferences.style) {
      prompt += `## Style\n${preferences.style}\n\n`;
    }
    
    // F - Self-Audit
    prompt += `## Quality Check\nBefore finalizing your response:\n`;
    prompt += `- Review for completeness and accuracy\n`;
    prompt += `- Ensure all requirements are met\n`;
    prompt += `- Refine for clarity and coherence\n`;
    prompt += `- Present your FINAL ANSWER after thorough review\n\n`;
    
    // H - Sampling Controls
    if (preferences.temperature || preferences.topP || preferences.maxTokens) {
      prompt += `## Parameters\n`;
      if (preferences.temperature) prompt += `- Temperature: ${preferences.temperature}\n`;
      if (preferences.topP) prompt += `- Top-P: ${preferences.topP}\n`;
      if (preferences.maxTokens) prompt += `- Max Tokens: ${preferences.maxTokens}\n`;
      prompt += '\n';
    }
    
    // I - Demonstrations (for few-shot)
    if (framework === 'few-shot') {
      prompt += `## Examples\n[Include 2-3 relevant examples here]\n\n`;
    }
    
    prompt += `## Task\n${idea}`;
    
    setWizardState(prev => ({ ...prev, finalPrompt: prompt, stage: 3 }));
    
    track('prompt_crafter_complete', {
      framework: framework || 'none',
      model: model?.id || 'none',
      output_format: outputFormat || 'none',
      prompt_length: prompt.length
    });
  };

  const getExpertPersona = (idea: string, framework: Framework): string => {
    const lowerIdea = idea.toLowerCase();
    
    if (lowerIdea.includes('market') || lowerIdea.includes('business')) {
      return 'You are a senior business strategist with 15+ years of experience in market analysis and strategic planning.';
    } else if (lowerIdea.includes('code') || lowerIdea.includes('program')) {
      return 'You are an expert software architect with deep knowledge across multiple programming paradigms and languages.';
    } else if (lowerIdea.includes('write') || lowerIdea.includes('content')) {
      return 'You are a professional writer and content strategist with expertise in engaging diverse audiences.';
    } else if (lowerIdea.includes('data') || lowerIdea.includes('analys')) {
      return 'You are a senior data scientist with expertise in statistical analysis and data-driven insights.';
    }
    
    return 'You are a subject matter expert with comprehensive knowledge in this domain.';
  };

  const renderStage0 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold dark:text-white mb-2">What would you like to create?</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Share your idea or question, and I'll help craft the perfect prompt
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-2">
          Your idea or question
        </label>
        <textarea
          value={wizardState.idea}
          onChange={(e) => setWizardState(prev => ({ ...prev, idea: e.target.value }))}
          className="w-full h-32 px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg 
                   bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="E.g., 'Create a comprehensive marketing strategy for a new eco-friendly product launch' or 'Analyze customer feedback data to identify improvement areas'"
        />
      </div>
      
      <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
        <h4 className="font-medium dark:text-white mb-3 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Preferences (Optional)
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Writing style or tone
            </label>
            <input
              type="text"
              value={wizardState.preferences.style || ''}
              onChange={(e) => setWizardState(prev => ({
                ...prev,
                preferences: { ...prev.preferences, style: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded 
                       bg-white dark:bg-neutral-700 text-sm"
              placeholder="E.g., Professional, conversational, academic"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Temperature
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={wizardState.preferences.temperature || ''}
                onChange={(e) => setWizardState(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, temperature: parseFloat(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded 
                         bg-white dark:bg-neutral-700 text-sm"
                placeholder="0.7"
              />
            </div>
            
            <div>
              <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Top-P
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={wizardState.preferences.topP || ''}
                onChange={(e) => setWizardState(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, topP: parseFloat(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded 
                         bg-white dark:bg-neutral-700 text-sm"
                placeholder="0.9"
              />
            </div>
            
            <div>
              <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Max tokens
              </label>
              <input
                type="number"
                min="1"
                max="128000"
                value={wizardState.preferences.maxTokens || ''}
                onChange={(e) => setWizardState(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, maxTokens: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded 
                         bg-white dark:bg-neutral-700 text-sm"
                placeholder="4096"
              />
            </div>
          </div>
          
          <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
            Leave blank to use AI-recommended settings based on your task
          </p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleStage0Submit}
          className="bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-purple-700"
        >
          Continue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStage1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold dark:text-white mb-2">Framework & Model Analysis</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Analyzing your request to recommend the best approach
        </p>
      </div>
      
      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-slate-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Analyzing your request...</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {/* Framework Recommendation */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
                          p-6 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 text-lg">
                    Recommended Framework
                  </h4>
                  <p className="text-purple-700 dark:text-purple-300 text-sm">
                    Based on your task complexity and requirements
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-500">
                    AI Selected
                  </span>
                </div>
              </div>
              
              {wizardState.framework && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="w-5 h-5 text-slate-600" />
                    <h5 className="font-medium text-purple-900 dark:text-purple-100">
                      {FRAMEWORKS[wizardState.framework].name}
                    </h5>
                  </div>
                  <p className="text-purple-700 dark:text-purple-300 text-sm">
                    {FRAMEWORKS[wizardState.framework].description}
                  </p>
                  <div className="bg-white dark:bg-neutral-800 p-3 rounded border border-purple-200 dark:border-slate-600">
                    <p className="text-xs font-medium text-slate-600 dark:text-purple-400 mb-1">
                      When to use:
                    </p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      {FRAMEWORKS[wizardState.framework].whenToUse}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Framework Options */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-slate-600 dark:text-purple-400 hover:underline">
                  Choose a different framework
                </summary>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Object.entries(FRAMEWORKS).map(([key, framework]) => (
                    <button
                      key={key}
                      onClick={() => setWizardState(prev => ({ ...prev, framework: key as Framework }))}
                      className={`p-2 text-left rounded border text-sm transition-colors
                        ${wizardState.framework === key 
                          ? 'border-slate-500 bg-purple-50 dark:bg-purple-900/30' 
                          : 'border-neutral-300 dark:border-neutral-600 hover:border-purple-300'
                        }`}
                    >
                      <div className="font-medium">{framework.name}</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                        {framework.description}
                      </div>
                    </button>
                  ))}
                </div>
              </details>
            </div>
            
            {/* Model Recommendation */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 
                          p-6 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-lg">
                    Recommended Model
                  </h4>
                  <p className="text-slate-700 dark:text-blue-300 text-sm">
                    Optimized for your specific use case
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Best Match
                  </span>
                </div>
              </div>
              
              {wizardState.model && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-slate-600" />
                    <h5 className="font-medium text-blue-900 dark:text-blue-100">
                      {wizardState.model.name} ({wizardState.model.version})
                    </h5>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {wizardState.model.strengths.map((strength, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-800/30 
                                               text-slate-700 dark:text-blue-300 text-xs rounded">
                        {strength}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-slate-700 dark:text-blue-300">
                    Context: {wizardState.model.contextLength.toLocaleString()} tokens
                  </div>
                </div>
              )}
              
              {/* Model Options */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-slate-600 dark:text-slate-400 hover:underline">
                  Choose a different model
                </summary>
                <div className="mt-3 space-y-2">
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setWizardState(prev => ({ ...prev, model }))}
                      className={`w-full p-3 text-left rounded border transition-colors
                        ${wizardState.model?.id === model.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                          : 'border-neutral-300 dark:border-neutral-600 hover:border-blue-300'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            {model.contextLength.toLocaleString()} tokens • Best for: {model.bestFor.join(', ')}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </details>
            </div>
            
            {/* Parameter Summary */}
            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
              <h4 className="font-medium dark:text-white mb-2 text-sm">Parameter Summary</h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Style:</span>
                  <div className="font-medium">
                    {wizardState.preferences.style || 'AI Default'}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Temperature:</span>
                  <div className="font-medium">
                    {wizardState.preferences.temperature || '0.7 (default)'}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Max Tokens:</span>
                  <div className="font-medium">
                    {wizardState.preferences.maxTokens || '4096 (default)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setWizardState(prev => ({ ...prev, stage: 0 }))}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={() => setWizardState(prev => ({ ...prev, stage: 2 }))}
              className="bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-purple-700"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderStage2 = () => {
    const suggestedFormat = recommendOutputFormat();
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold dark:text-white mb-2">Choose Output Format</h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Select how you want the AI to structure its response
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                      p-4 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-green-800 dark:text-green-200">
              Suggested Format
            </span>
          </div>
          <button
            onClick={() => setWizardState(prev => ({ ...prev, outputFormat: suggestedFormat }))}
            className="w-full p-3 text-left bg-white dark:bg-neutral-800 rounded border-2 border-emerald-500 
                     hover:border-emerald-600 transition-colors"
          >
            <div className="font-medium text-green-800 dark:text-green-200 mb-1">
              {OUTPUT_FORMATS[suggestedFormat].name}
            </div>
            <div className="text-sm text-emerald-700 dark:text-green-300">
              {OUTPUT_FORMATS[suggestedFormat].description}
            </div>
          </button>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-medium dark:text-white">All Available Formats</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(OUTPUT_FORMATS).map(([key, format]) => (
              <button
                key={key}
                onClick={() => {
                  setWizardState(prev => ({ 
                    ...prev, 
                    outputFormat: key as OutputFormat,
                    customFormat: key === 'custom' ? prev.customFormat : undefined
                  }));
                }}
                className={`p-3 text-left rounded-lg border transition-colors
                  ${wizardState.outputFormat === key 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                    : 'border-neutral-300 dark:border-neutral-600 hover:border-blue-300'
                  }`}
              >
                <div className="font-medium text-sm">{format.name}</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  {format.description}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {wizardState.outputFormat && (
          <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
            <h4 className="font-medium dark:text-white mb-2">Format Structure</h4>
            {wizardState.outputFormat === 'custom' ? (
              <textarea
                value={wizardState.customFormat || ''}
                onChange={(e) => setWizardState(prev => ({ ...prev, customFormat: e.target.value }))}
                className="w-full h-24 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded 
                         bg-white dark:bg-neutral-700 text-sm resize-none"
                placeholder="Describe your custom format structure..."
              />
            ) : (
              <pre className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap font-mono">
                {OUTPUT_FORMATS[wizardState.outputFormat].structure}
              </pre>
            )}
          </div>
        )}
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setWizardState(prev => ({ ...prev, stage: 1 }))}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={generateFinalPrompt}
            disabled={!wizardState.outputFormat || (wizardState.outputFormat === 'custom' && !wizardState.customFormat)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Prompt
          </Button>
        </div>
      </div>
    );
  };

  const renderStage3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold dark:text-white mb-2">Your Crafted Prompt</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Copy and use with your preferred AI model
        </p>
      </div>
      
      {wizardState.finalPrompt && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 
                      p-6 rounded-lg border border-indigo-200 dark:border-indigo-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">
              Final Prompt
            </h4>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(wizardState.finalPrompt!);
                toast.success('Prompt copied to clipboard!');
                track('prompt_crafter_copy', {
                  framework: wizardState.framework || 'none',
                  model: wizardState.model?.id || 'none'
                });
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
          
          <pre className="font-mono text-sm text-indigo-800 dark:text-indigo-200 whitespace-pre-wrap 
                        bg-white dark:bg-neutral-800 p-4 rounded overflow-x-auto">
            {wizardState.finalPrompt}
          </pre>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Framework Used
          </h4>
          <p className="text-slate-700 dark:text-blue-300 text-sm">
            {wizardState.framework && FRAMEWORKS[wizardState.framework].name}
          </p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
            Target Model
          </h4>
          <p className="text-purple-700 dark:text-purple-300 text-sm">
            {wizardState.model?.name} ({wizardState.model?.version})
          </p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setWizardState({ stage: 0, idea: '', preferences: {} })}
        >
          Start Over
        </Button>
        <Button 
          onClick={() => {
            if (onComplete) {
              onComplete(wizardState.finalPrompt!, {
                framework: wizardState.framework,
                model: wizardState.model,
                outputFormat: wizardState.outputFormat,
                preferences: wizardState.preferences
              });
            }
          }}
          className="bg-gradient-to-r from-indigo-600 to-slate-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete
        </Button>
      </div>
    </div>
  );

  const renderCurrentStage = () => {
    switch (wizardState.stage) {
      case 0:
        return renderStage0();
      case 1:
        return renderStage1();
      case 2:
        return renderStage2();
      case 3:
        return renderStage3();
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800/50 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-slate-500" />
            Prompt Crafter Wizard
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-neutral-600 dark:text-neutral-400 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Step {wizardState.stage + 1} of 4
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-colors ${
                step <= wizardState.stage 
                  ? 'bg-gradient-to-r from-blue-500 to-slate-500' 
                  : 'bg-neutral-200 dark:bg-neutral-700'
              }`}
            />
          ))}
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span>Idea</span>
          <span>Analysis</span>
          <span>Format</span>
          <span>Complete</span>
        </div>
      </div>
      
      {/* Help Section */}
      {showHelp && (
        <div className="mb-6">
          <PromptCrafterHelp />
        </div>
      )}
      
      {/* Stage Content */}
      {renderCurrentStage()}
    </div>
  );
}