'use client';

import { Zap, Brain, BookOpen, Lightbulb, CheckCircle, ArrowRight, Info } from 'lucide-react';

interface ComplexityGuidanceProps {
  complexityLevel: 'simple' | 'smart' | 'recipe';
}

const complexityGuides = {
  simple: {
    icon: Zap,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-700',
    title: 'Simple Prompt Guide',
    description: 'Create a direct, single-purpose prompt that performs one specific task.',
    tips: [
      'Write clear, specific instructions',
      'Include context about your desired output',
      'Use concrete examples when helpful',
      'Keep it focused on one main task'
    ],
    example: {
      prompt: 'Write a professional email apologizing for a delayed project delivery. Include a brief explanation and propose next steps.',
      explanation: 'This prompt is direct and specific about what it wants: a professional apology email with specific elements.'
    },
    nextSteps: [
      'Test your prompt with different scenarios',
      'Refine the wording for clarity',
      'Consider if you need variables for reusability'
    ]
  },
  smart: {
    icon: Brain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700',
    title: 'Smart Prompt Guide',
    description: 'Create a reusable template with variables that adapts to different inputs.',
    tips: [
      'Identify parts that change between uses',
      'Replace changing parts with {variable_names}',
      'Provide clear variable descriptions',
      'Test with different variable combinations'
    ],
    example: {
      prompt: 'Write a {tone} email {action} a {meeting_type} because {reason}. Include {additional_details} if relevant.',
      explanation: 'Variables in curly braces make this template reusable for different email types, tones, and situations.'
    },
    nextSteps: [
      'Add helpful variable descriptions',
      'Create example inputs for each variable',
      'Test with edge cases and unusual inputs',
      'Consider adding validation for variable types'
    ]
  },
  recipe: {
    icon: BookOpen,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-700',
    title: 'Prompt Recipe Guide',
    description: 'Create a multi-step workflow where each step builds on previous results.',
    tips: [
      'Break complex tasks into sequential steps',
      'Each step should produce output for the next',
      'Use variables that flow between steps',
      'Provide clear instructions for each step'
    ],
    example: {
      prompt: 'Step 1: Analyze {target_audience} → Step 2: Generate content ideas using Step 1 → Step 3: Create calendar using Step 2',
      explanation: 'Each step uses results from previous steps, creating a comprehensive workflow for complex tasks.'
    },
    nextSteps: [
      'Map out the logical flow between steps',
      'Define which variables are needed at each step',
      'Create clear step instructions',
      'Test the entire workflow end-to-end'
    ]
  }
};

export default function ComplexityGuidance({ complexityLevel }: ComplexityGuidanceProps) {
  const guide = complexityGuides[complexityLevel];
  const Icon = guide.icon;

  return (
    <div className={`${guide.bgColor} border ${guide.borderColor} rounded-lg p-6`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg bg-white dark:bg-neutral-800 border ${guide.borderColor}`}>
          <Icon className={`w-5 h-5 ${guide.color}`} />
        </div>
        
        <div className="flex-1">
          <h4 className={`font-semibold ${guide.color} mb-2`}>{guide.title}</h4>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-4">
            {guide.description}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Tips */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <h5 className="font-medium text-neutral-900 dark:text-white text-sm">Best Practices</h5>
              </div>
              <ul className="space-y-2">
                {guide.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Example */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-blue-500" />
                <h5 className="font-medium text-neutral-900 dark:text-white text-sm">Example</h5>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 border border-neutral-200 dark:border-neutral-600">
                <div className="font-mono text-xs text-neutral-800 dark:text-neutral-200 mb-2">
                  {guide.example.prompt}
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {guide.example.explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-600">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="w-4 h-4 text-indigo-500" />
              <h5 className="font-medium text-neutral-900 dark:text-white text-sm">Next Steps</h5>
            </div>
            <div className="flex flex-wrap gap-2">
              {guide.nextSteps.map((step, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-full text-xs text-neutral-600 dark:text-neutral-400"
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}