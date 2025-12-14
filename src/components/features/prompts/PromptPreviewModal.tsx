'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Play, Copy, RefreshCw, Eye, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Variable {
  name: string;
  type: 'text' | 'select' | 'textarea' | 'number';
  description: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

interface PromptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: {
    id: number;
    title: string;
    description: string;
    prompt_text: string;
    variables: Variable[];
    example_inputs: Record<string, string>;
    complexity_level: 'simple' | 'smart' | 'recipe';
    price: number;
  };
  onPurchase?: () => void;
  showPurchaseButton?: boolean;
}

export default function PromptPreviewModal({
  isOpen,
  onClose,
  prompt,
  onPurchase,
  showPurchaseButton = true
}: PromptPreviewModalProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string | number>>({});
  const [previewText, setPreviewText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isOpen && prompt) {
      // Initialize with example inputs or defaults
      const initialValues: Record<string, string | number> = {};
      prompt.variables?.forEach(variable => {
        initialValues[variable.name] = prompt.example_inputs?.[variable.name] || 
                                     variable.defaultValue || 
                                     '';
      });
      setVariableValues(initialValues);
      setShowPreview(false);
      setPreviewText('');
    }
  }, [isOpen, prompt]);

  const handleVariableChange = (variableName: string, value: string | number) => {
    setVariableValues(prev => ({
      ...prev,
      [variableName]: value
    }));
    // Clear preview when variables change
    if (showPreview) {
      setShowPreview(false);
      setPreviewText('');
    }
  };

  const generatePreview = async () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    
    try {
      // Simulate API call delay for realistic feel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let preview = prompt.prompt_text;
      
      // Replace variables with user values
      prompt.variables?.forEach(variable => {
        const placeholder = `{${variable.name}}`;
        const value = variableValues[variable.name] || `[${variable.name}]`;
        preview = preview.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
      });
      
      setPreviewText(preview);
      setShowPreview(true);
      toast.success('Preview generated!');
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Error generating preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const loadExampleValues = () => {
    if (!prompt.example_inputs) return;
    
    const exampleValues: Record<string, string | number> = {};
    prompt.variables?.forEach(variable => {
      if (prompt.example_inputs[variable.name]) {
        exampleValues[variable.name] = prompt.example_inputs[variable.name];
      }
    });
    setVariableValues(prev => ({ ...prev, ...exampleValues }));
    setShowPreview(false);
    setPreviewText('');
    toast.success('Example values loaded!');
  };

  const renderVariableInput = (variable: Variable) => {
    const value = variableValues[variable.name] || '';
    
    switch (variable.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={`Enter ${variable.name}`}
            rows={3}
            className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white resize-y"
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
          >
            <option value="">Select {variable.name}</option>
            {variable.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, parseFloat(e.target.value) || '')}
            placeholder={`Enter ${variable.name}`}
            className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={`Enter ${variable.name}`}
            className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
          />
        );
    }
  };

  if (!isOpen || !prompt) return null;

  const complexityColors = {
    simple: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    smart: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    recipe: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Eye className="w-6 h-6 text-slate-500 mr-2" />
                <h2 className="text-2xl font-bold dark:text-white">Preview Smart Prompt</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${complexityColors[prompt.complexity_level]}`}>
                {prompt.complexity_level}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Prompt Info */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold dark:text-white mb-2">{prompt.title}</h3>
            <p className="text-neutral-600 dark:text-neutral-400">{prompt.description}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Variables Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold dark:text-white">Customize Variables</h4>
                {prompt.example_inputs && Object.keys(prompt.example_inputs).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadExampleValues}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Load Examples
                  </Button>
                )}
              </div>

              {prompt.variables && prompt.variables.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {prompt.variables.map((variable, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium dark:text-white">
                        {variable.name}
                        {variable.required && <span className="text-slate-500 ml-1">*</span>}
                      </label>
                      {variable.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {variable.description}
                        </p>
                      )}
                      {renderVariableInput(variable)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 dark:text-neutral-400">
                  This prompt doesn&apos;t use variables.
                </p>
              )}

              {/* Generate Preview Button */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <Button
                  onClick={generatePreview}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate Preview
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold dark:text-white">Live Preview</h4>
                {showPreview && previewText && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(previewText)}
                    className="text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                )}
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-600 min-h-[300px] max-h-96 overflow-y-auto">
                {showPreview ? (
                  <pre className="whitespace-pre-wrap text-sm font-mono dark:text-neutral-300">
                    {previewText}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-4">
                      <Wand2 className="w-8 h-8 text-neutral-400" />
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-2">
                      Ready to test your prompt?
                    </p>
                    <p className="text-sm text-neutral-400 dark:text-neutral-500">
                      Customize the variables and click &quot;Generate Preview&quot; to see the result.
                    </p>
                  </div>
                )}
              </div>

              {/* Pricing and Purchase */}
              {showPurchaseButton && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Like what you see?
                      </p>
                      <p className="font-semibold dark:text-white">
                        Get full access to this Smart Prompt
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                        {prompt.price > 0 ? (
                          <span>{prompt.price} PC</span>
                        ) : (
                          'Free'
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={onPurchase}
                    className="w-full"
                  >
                    {prompt.price > 0 ? 'Purchase Now' : 'Get for Free'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}