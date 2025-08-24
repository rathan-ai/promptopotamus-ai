'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Zap, Brain, BookOpen, Lightbulb, Target, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PromptType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  description: string;
  features: string[];
  useCase: string;
  example: {
    title: string;
    prompt: string;
    variables?: Array<{
      name: string;
      type: string;
      description: string;
      example: string;
    }>;
    steps?: Array<{
      title: string;
      prompt: string;
      output: string;
    }>;
    output: string;
  };
  benefits: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeToCreate: string;
}

const promptTypes: PromptType[] = [
  {
    id: 'simple',
    name: 'Simple Prompts',
    icon: Zap,
    color: 'text-emerald-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    description: 'Direct, single-purpose prompts that perform one specific task without customization.',
    features: ['One-time use', 'Fixed text', 'Immediate results', 'No variables'],
    useCase: 'Perfect for quick tasks or when you need the same output every time.',
    example: {
      title: 'Meeting Decline Email',
      prompt: 'Write a professional email declining a meeting request due to scheduling conflicts.',
      output: 'Subject: Unable to Attend Meeting\n\nDear [Name],\n\nThank you for the meeting invitation. Unfortunately, I have a scheduling conflict and won\'t be able to attend. I apologize for any inconvenience this may cause.\n\nPlease let me know if there\'s an alternative time that works for everyone, or if there\'s another way I can contribute to the discussion.\n\nBest regards,\n[Your Name]'
    },
    benefits: ['Quick to create', 'Easy to understand', 'Consistent results'],
    difficulty: 'Beginner',
    timeToCreate: '1-2 minutes'
  },
  {
    id: 'smart',
    name: 'Smart Prompts',
    icon: Brain,
    color: 'text-slate-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    description: 'Enhanced prompts with variables that adapt to different inputs, making them reusable and customizable.',
    features: ['Reusable template', 'Custom variables', 'Flexible inputs', 'Consistent structure'],
    useCase: 'Ideal when you need the same type of output but with different details each time.',
    example: {
      title: 'Customizable Meeting Email',
      prompt: 'Write a {tone} email {action} a {meeting_type} request because {reason}. Include {additional_info} if provided.',
      variables: [
        { name: 'tone', type: 'select', description: 'Email tone', example: 'professional, casual, apologetic' },
        { name: 'action', type: 'select', description: 'What action to take', example: 'declining, postponing, accepting' },
        { name: 'meeting_type', type: 'text', description: 'Type of meeting', example: 'team standup, client call, board meeting' },
        { name: 'reason', type: 'text', description: 'Reason for action', example: 'scheduling conflict, illness, travel' },
        { name: 'additional_info', type: 'textarea', description: 'Extra context', example: 'alternative times, deliverables' }
      ],
      output: 'Based on your inputs:\n• Tone: Professional\n• Action: Declining\n• Meeting: Client presentation\n• Reason: Travel commitment\n\nGenerated email:\n"Dear Team, I regret to inform you that I won\'t be able to attend the client presentation due to a prior travel commitment. I can provide my input via email beforehand and review materials afterward. Thank you for understanding."'
    },
    benefits: ['Highly reusable', 'Saves time', 'Maintains consistency', 'Easy customization'],
    difficulty: 'Intermediate',
    timeToCreate: '5-10 minutes'
  },
  {
    id: 'recipe',
    name: 'Prompt Recipes',
    icon: BookOpen,
    color: 'text-slate-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    description: 'Multi-step workflows that guide you through complex processes, with each step building on previous results.',
    features: ['Multi-step process', 'Sequential logic', 'Complex workflows', 'Step dependencies'],
    useCase: 'Perfect for complex projects that require multiple AI interactions and strategic thinking.',
    example: {
      title: 'Content Strategy Recipe',
      prompt: 'A complete content marketing strategy development process',
      steps: [
        {
          title: 'Step 1: Audience Analysis',
          prompt: 'Analyze the target audience for {industry} focusing on {demographics}. Identify pain points, preferences, and content consumption habits.',
          output: 'Target audience profile with pain points, content preferences, and behavioral insights'
        },
        {
          title: 'Step 2: Content Ideas Generation',
          prompt: 'Using the audience analysis from Step 1, generate 20 content ideas that address their pain points for {content_type} targeting {business_goal}.',
          output: 'List of 20 targeted content ideas with rationale for each'
        },
        {
          title: 'Step 3: Content Calendar Creation',
          prompt: 'Create a {time_period} content calendar using the ideas from Step 2, optimized for {posting_frequency} on {platforms}.',
          output: 'Detailed content calendar with posting schedule, content types, and engagement strategies'
        }
      ],
      variables: [
        { name: 'industry', type: 'text', description: 'Target industry', example: 'SaaS, e-commerce, healthcare' },
        { name: 'demographics', type: 'textarea', description: 'Audience details', example: 'Age 25-45, tech professionals, budget-conscious' },
        { name: 'content_type', type: 'select', description: 'Content format', example: 'blog posts, videos, social media' },
        { name: 'business_goal', type: 'text', description: 'Primary objective', example: 'lead generation, brand awareness, sales' }
      ],
      output: 'Complete content strategy with audience insights, 20 content ideas, and a detailed calendar ready for execution.'
    },
    benefits: ['Comprehensive solutions', 'Strategic approach', 'Professional workflows', 'Repeatable processes'],
    difficulty: 'Advanced',
    timeToCreate: '15-30 minutes'
  }
];

interface PromptTypesGuideProps {
  onTypeSelect?: (type: string) => void;
  selectedType?: string;
}

export default function PromptTypesGuide({ onTypeSelect, selectedType }: PromptTypesGuideProps) {
  const [expandedType, setExpandedType] = useState<string | null>('simple');

  const toggleExpanded = (typeId: string) => {
    setExpandedType(expandedType === typeId ? null : typeId);
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-3 mb-3">
          <Lightbulb className="w-6 h-6 text-slate-500" />
          <h3 className="text-xl font-bold dark:text-white">Understanding Prompt Types</h3>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">
          Choose the right type based on your needs. Start simple and progress to more advanced types as you gain experience.
        </p>
      </div>

      <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
        {promptTypes.map((type) => {
          const Icon = type.icon;
          const isExpanded = expandedType === type.id;
          const isSelected = selectedType === type.id;

          return (
            <div key={type.id} className={`transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
              <button
                onClick={() => toggleExpanded(type.id)}
                className="w-full p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${type.bgColor}`}>
                      <Icon className={`w-6 h-6 ${type.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-semibold dark:text-white">{type.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          type.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' :
                          type.difficulty === 'Intermediate' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                        }`}>
                          {type.difficulty}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {type.timeToCreate}
                        </span>
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                        {type.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onTypeSelect && (
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTypeSelect(type.id);
                        }}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-neutral-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6">
                  <div className="ml-16 space-y-6">
                    {/* Features */}
                    <div>
                      <h5 className="font-semibold text-neutral-900 dark:text-white mb-3">Key Features</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {type.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Use Case */}
                    <div>
                      <h5 className="font-semibold text-neutral-900 dark:text-white mb-2">When to Use</h5>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{type.useCase}</p>
                    </div>

                    {/* Example */}
                    <div>
                      <h5 className="font-semibold text-neutral-900 dark:text-white mb-3">Example: {type.example.title}</h5>
                      
                      <div className="space-y-4">
                        <div>
                          <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Prompt Template:</h6>
                          <div className="bg-neutral-900 text-white p-4 rounded-lg text-sm font-mono">
                            {type.example.prompt}
                          </div>
                        </div>

                        {type.example.variables && (
                          <div>
                            <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Variables:</h6>
                            <div className="grid gap-2">
                              {type.example.variables.map((variable, index) => (
                                <div key={index} className="bg-neutral-50 dark:bg-neutral-700 p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <code className="text-sm font-mono bg-neutral-200 dark:bg-neutral-600 px-2 py-1 rounded">
                                      {variable.name}
                                    </code>
                                    <span className="text-xs text-neutral-500">{variable.type}</span>
                                  </div>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{variable.description}</p>
                                  <p className="text-xs text-neutral-500">Example: {variable.example}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {type.example.steps && (
                          <div>
                            <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Recipe Steps:</h6>
                            <div className="space-y-3">
                              {type.example.steps.map((step, index) => (
                                <div key={index} className="border-l-2 border-purple-200 dark:border-purple-700 pl-4">
                                  <h7 className="text-sm font-medium text-purple-700 dark:text-purple-300">{step.title}</h7>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{step.prompt}</p>
                                  <div className="mt-2 text-xs text-neutral-500">
                                    <ArrowRight className="w-3 h-3 inline mr-1" />
                                    Output: {step.output}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Expected Output:</h6>
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-emerald-500">
                            <p className="text-sm text-neutral-700 dark:text-neutral-300">{type.example.output}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div>
                      <h5 className="font-semibold text-neutral-900 dark:text-white mb-3">Benefits</h5>
                      <div className="flex flex-wrap gap-2">
                        {type.benefits.map((benefit, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-slate-700 dark:text-blue-300 text-sm rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-neutral-50 dark:bg-neutral-700/50 rounded-b-lg">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-5 h-5 text-slate-500" />
          <h4 className="font-semibold text-neutral-900 dark:text-white">Recommended Learning Path</h4>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
            Start with Simple
          </span>
          <ArrowRight className="w-4 h-4" />
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
            Progress to Smart
          </span>
          <ArrowRight className="w-4 h-4" />
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
            Master Recipes
          </span>
        </div>
      </div>
    </div>
  );
}