'use client';

import { useState, useEffect } from 'react';
import { Settings, Play, RefreshCw, Code, Type, List, Hash, FileText, Eye, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VariableType {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  example: string;
  placeholder: string;
  whenToUse: string;
}

const variableTypes: VariableType[] = [
  {
    name: 'text',
    icon: Type,
    color: 'text-blue-600',
    description: 'Single-line text input for names, titles, or short phrases',
    example: 'Product name, person\'s name, email subject',
    placeholder: 'Enter product name...',
    whenToUse: 'For short inputs like names, titles, keywords, or single words'
  },
  {
    name: 'textarea',
    icon: FileText,
    color: 'text-green-600',
    description: 'Multi-line text input for longer content and descriptions',
    example: 'Product description, background context, detailed requirements',
    placeholder: 'Enter detailed description...',
    whenToUse: 'For longer text like descriptions, requirements, or multi-sentence content'
  },
  {
    name: 'select',
    icon: List,
    color: 'text-purple-600',
    description: 'Dropdown menu with predefined options to choose from',
    example: 'Tone (formal/casual), Industry (tech/healthcare), Size (small/medium/large)',
    placeholder: 'Choose an option...',
    whenToUse: 'When you want to limit choices to specific predefined options'
  },
  {
    name: 'number',
    icon: Hash,
    color: 'text-orange-600',
    description: 'Numeric input for quantities, percentages, or measurements',
    example: 'Budget amount, team size, percentage, years of experience',
    placeholder: 'Enter number...',
    whenToUse: 'For any numeric values like quantities, ages, prices, or percentages'
  }
];

const demoPrompt = {
  title: 'Marketing Email Generator',
  template: 'Write a {tone} marketing email for {product_name} targeting {audience}. The email should highlight {key_benefit} and include a {cta_type} call-to-action. Keep it under {word_limit} words.',
  variables: [
    { name: 'tone', type: 'select', options: ['professional', 'casual', 'enthusiastic', 'urgent'], value: 'professional' },
    { name: 'product_name', type: 'text', value: 'Smart Fitness Tracker Pro' },
    { name: 'audience', type: 'textarea', value: 'Health-conscious professionals aged 25-40 who work from home' },
    { name: 'key_benefit', type: 'text', value: '24/7 heart rate monitoring with AI insights' },
    { name: 'cta_type', type: 'select', options: ['soft sell', 'direct purchase', 'learn more', 'free trial'], value: 'free trial' },
    { name: 'word_limit', type: 'number', value: 150 }
  ]
};

function VariablesExplainerComponent() {
  const [selectedType, setSelectedType] = useState<string>('text');
  const [showDemo, setShowDemo] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [demoValues, setDemoValues] = useState(() => {
    try {
      if (!demoPrompt?.variables || !Array.isArray(demoPrompt.variables)) {
        console.warn('Demo prompt variables not available, using defaults');
        return {
          tone: 'professional',
          product_name: 'Smart Fitness Tracker Pro',
          audience: 'Health-conscious professionals aged 25-40 who work from home',
          key_benefit: '24/7 heart rate monitoring with AI insights',
          cta_type: 'free trial',
          word_limit: 150
        };
      }
      
      return demoPrompt.variables.reduce((acc, variable) => {
        if (variable?.name && variable?.value !== undefined) {
          acc[variable.name] = variable.value;
        }
        return acc;
      }, {} as Record<string, any>);
    } catch (error) {
      console.error('Error initializing demo values:', error);
      return {
        tone: 'professional',
        product_name: 'Smart Fitness Tracker Pro',
        audience: 'Health-conscious professionals',
        key_benefit: '24/7 monitoring',
        cta_type: 'free trial',
        word_limit: 150
      };
    }
  });

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render complex interactions until client-side
  if (!isClient) {
    return (
      <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-bold dark:text-white">Understanding Variables</h3>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">
          Variables are placeholders in prompts that get replaced with actual values, making prompts reusable and customizable.
        </p>
      </div>
    );
  }

  const generateFinalPrompt = () => {
    try {
      const template = demoPrompt?.template || 'Write a {tone} marketing email for {product_name} targeting {audience}. The email should highlight {key_benefit} and include a {cta_type} call-to-action. Keep it under {word_limit} words.';
      let finalPrompt = template;
      
      if (demoValues && typeof demoValues === 'object') {
        Object.entries(demoValues).forEach(([key, value]) => {
          if (key && value !== undefined && value !== null) {
            try {
              finalPrompt = finalPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
            } catch (replaceError) {
              console.warn('Error replacing variable:', key, replaceError);
            }
          }
        });
      }
      
      return finalPrompt;
    } catch (error) {
      console.error('Error generating final prompt:', error);
      return 'Write a professional marketing email for Smart Fitness Tracker Pro targeting health-conscious professionals. The email should highlight 24/7 heart rate monitoring with AI insights and include a free trial call-to-action. Keep it under 150 words.';
    }
  };

  const renderVariableInput = (variable: any) => {
    try {
      if (!variable || !variable.name || !variable.type) {
        return null;
      }

      const type = variableTypes.find(t => t.name === variable.type);
      const Icon = type?.icon || Type;

      return (
        <div key={variable.name} className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${type?.color || 'text-neutral-500'}`} />
          <label className="text-sm font-medium dark:text-white capitalize">
            {variable.name.replace(/_/g, ' ')}
          </label>
          <span className="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded">
            {variable.type}
          </span>
        </div>
        
        {variable.type === 'text' && (
          <input
            type="text"
            value={demoValues[variable.name] || ''}
            onChange={(e) => setDemoValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white text-sm"
          />
        )}
        
        {variable.type === 'textarea' && (
          <textarea
            value={demoValues[variable.name] || ''}
            onChange={(e) => setDemoValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white text-sm resize-none"
          />
        )}
        
        {variable.type === 'select' && (
          <select
            value={demoValues[variable.name] || ''}
            onChange={(e) => setDemoValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white text-sm"
          >
            {variable.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )}
        
        {variable.type === 'number' && (
          <input
            type="number"
            value={demoValues[variable.name] || ''}
            onChange={(e) => setDemoValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white text-sm"
          />
        )}
      </div>
    );
    } catch (error) {
      console.error('Error rendering variable input:', error);
      return (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
          Error loading variable: {variable?.name || 'unknown'}
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-bold dark:text-white">Understanding Variables</h3>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Variables are placeholders in your prompts that get replaced with actual values. They make your prompts reusable and customizable.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">How Variables Work</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                Instead of writing "Write an email about Product X", you write "Write an email about {product_name}". 
                Then you can reuse this prompt for any product by changing the variable value.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Variable Types */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h4 className="text-lg font-semibold dark:text-white mb-2">Variable Types</h4>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Choose the right input type based on what kind of information you need from users.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Type Selection */}
          <div className="space-y-3">
            {variableTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.name;
              
              return (
                <button
                  key={type.name}
                  onClick={() => setSelectedType(type.name)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${type.color}`} />
                    <span className="font-medium dark:text-white capitalize">{type.name}</span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{type.description}</p>
                </button>
              );
            })}
          </div>

          {/* Selected Type Details */}
          <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-4">
            {variableTypes.filter(type => type.name === selectedType).map(type => {
              const Icon = type.icon;
              return (
                <div key={type.name}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-5 h-5 ${type.color}`} />
                    <h5 className="font-semibold dark:text-white capitalize">{type.name} Variable</h5>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description</h6>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{type.description}</p>
                    </div>
                    
                    <div>
                      <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Examples</h6>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{type.example}</p>
                    </div>
                    
                    <div>
                      <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">When to Use</h6>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{type.whenToUse}</p>
                    </div>

                    <div>
                      <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Preview</h6>
                      {type.name === 'text' && (
                        <input 
                          type="text" 
                          placeholder={type.placeholder} 
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded text-sm"
                          disabled
                        />
                      )}
                      {type.name === 'textarea' && (
                        <textarea 
                          placeholder={type.placeholder} 
                          rows={2}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded text-sm resize-none"
                          disabled
                        />
                      )}
                      {type.name === 'select' && (
                        <select className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded text-sm" disabled>
                          <option>Choose an option...</option>
                          <option>Option 1</option>
                          <option>Option 2</option>
                        </select>
                      )}
                      {type.name === 'number' && (
                        <input 
                          type="number" 
                          placeholder={type.placeholder} 
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded text-sm"
                          disabled
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold dark:text-white mb-2">Interactive Demo</h4>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Try modifying the variables below to see how they change the final prompt.
              </p>
            </div>
            <Button
              onClick={() => setShowDemo(!showDemo)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {showDemo ? 'Hide Demo' : 'Try Demo'}
            </Button>
          </div>
        </div>

        {showDemo && (
          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Variables Panel */}
              <div>
                <h5 className="font-medium dark:text-white mb-4">Customize Variables</h5>
                <div className="space-y-4">
                  {(demoPrompt?.variables || []).map((variable, index) => {
                    try {
                      return renderVariableInput(variable);
                    } catch (error) {
                      console.error('Error rendering variable at index', index, error);
                      return null;
                    }
                  }).filter(Boolean)}
                </div>
              </div>

              {/* Output Panel */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium dark:text-white">Generated Prompt</h5>
                  <Button
                    size="sm"
                    onClick={() => {
                      try {
                        if (!demoPrompt?.variables) {
                          setDemoValues({
                            tone: 'professional',
                            product_name: 'Smart Fitness Tracker Pro',
                            audience: 'Health-conscious professionals aged 25-40 who work from home',
                            key_benefit: '24/7 heart rate monitoring with AI insights',
                            cta_type: 'free trial',
                            word_limit: 150
                          });
                          return;
                        }
                        
                        setDemoValues(
                          demoPrompt.variables.reduce((acc, variable) => {
                            if (variable?.name && variable?.value !== undefined) {
                              acc[variable.name] = variable.value;
                            }
                            return acc;
                          }, {} as Record<string, any>)
                        );
                      } catch (error) {
                        console.error('Error resetting demo values:', error);
                        setDemoValues({
                          tone: 'professional',
                          product_name: 'Smart Fitness Tracker Pro',
                          audience: 'Health-conscious professionals',
                          key_benefit: '24/7 monitoring',
                          cta_type: 'free trial',
                          word_limit: 150
                        });
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Original Template */}
                  <div>
                    <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Template:</h6>
                    <div className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded-lg text-sm font-mono">
                      {demoPrompt.template}
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-neutral-400 mx-auto" />

                  {/* Final Prompt */}
                  <div>
                    <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Final Prompt:</h6>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-400">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {generateFinalPrompt()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-1">What Happened?</h6>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Each variable in curly braces <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{'{variable_name}'}</code> was replaced with the value you entered. 
                    This same template can now be reused with different values to generate personalized prompts for any product or audience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Error boundary wrapper with more detailed error handling
export default function VariablesExplainer() {
  // Safe fallback component
  const FallbackComponent = () => (
    <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Settings className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-bold dark:text-white">Understanding Variables</h3>
      </div>
      <p className="text-neutral-600 dark:text-neutral-400 mb-4">
        Variables are placeholders in prompts that get replaced with actual values, making prompts reusable and customizable.
      </p>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="p-3 bg-white dark:bg-neutral-700 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Text Variables</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Single-line inputs for names, titles, or short phrases
            </p>
          </div>
          
          <div className="p-3 bg-white dark:bg-neutral-700 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-green-600" />
              <span className="font-medium text-sm">Textarea Variables</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Multi-line inputs for longer content and descriptions
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-white dark:bg-neutral-700 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <List className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-sm">Select Variables</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Dropdown menus with predefined options to choose from
            </p>
          </div>
          
          <div className="p-3 bg-white dark:bg-neutral-700 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-sm">Number Variables</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Numeric inputs for quantities, percentages, or measurements
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">How Variables Work</h4>
            <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
              Instead of writing "Write an email about Product X", you write "Write an email about {product_name}". 
              Then you can reuse this prompt for any product by changing the variable value.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  try {
    return <VariablesExplainerComponent />;
  } catch (error) {
    console.error('VariablesExplainer component error:', error);
    return <FallbackComponent />;
  }
}