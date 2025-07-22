'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Star, 
  Download, 
  DollarSign, 
  User, 
  Brain,
  Play,
  Copy,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import StripePaymentModal from '@/components/StripePaymentModal';

interface SmartPromptDetail {
  id: number;
  title: string;
  description: string;
  prompt_text: string;
  complexity_level: 'simple' | 'smart' | 'recipe';
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  price: number;
  downloads_count: number;
  rating_average: number;
  rating_count: number;
  use_cases: string[];
  ai_model_compatibility: string[];
  variables: Variable[];
  recipe_steps: RecipeStep[];
  instructions: string;
  example_inputs: Record<string, string>;
  example_outputs: string[];
  created_at: string;
  user_id: string;
  profiles?: { full_name: string };
}

interface Variable {
  name: string;
  type: 'text' | 'select' | 'textarea' | 'number';
  description: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

interface RecipeStep {
  id: string;
  title: string;
  instruction: string;
  prompt_template: string;
  variables: string[];
}

const complexityColors = {
  simple: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  smart: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  recipe: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
};

const difficultyColors = {
  beginner: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200',
  intermediate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
};

export default function SmartPromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState<SmartPromptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [variableValues, setVariableValues] = useState<Record<string, string | number>>({});
  const [previewText, setPreviewText] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'variables' | 'examples' | 'reviews'>('preview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        // Use dedicated endpoint for individual prompt details
        const response = await fetch(`/api/smart-prompts/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          const foundPrompt = data.prompt;
          
          if (foundPrompt) {
            setPrompt(foundPrompt);
            
            // Initialize variable values with defaults or examples
            const initialValues: Record<string, string | number> = {};
            foundPrompt.variables?.forEach((variable: Variable) => {
              initialValues[variable.name] = foundPrompt.example_inputs?.[variable.name] || 
                                           variable.defaultValue || 
                                           '';
            });
            setVariableValues(initialValues);
            
            // Set access based on API response
            setHasAccess(foundPrompt.has_access);
          } else {
            toast.error('Smart prompt not found');
            router.push('/smart-prompts');
          }
        } else {
          toast.error('Smart prompt not found');
          router.push('/smart-prompts');
        }
      } catch (error) {
        console.error('Error fetching prompt:', error);
        toast.error('Error loading prompt');
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, [params.id, router]);

  useEffect(() => {
    if (prompt && hasAccess) {
      generatePreview();
    }
  }, [variableValues, prompt, hasAccess]);

  const generatePreview = () => {
    if (!prompt) return;
    
    let preview = prompt.prompt_text;
    
    // Replace variables with user values
    prompt.variables?.forEach(variable => {
      const placeholder = `{${variable.name}}`;
      const value = variableValues[variable.name] || `[${variable.name}]`;
      preview = preview.replace(new RegExp(placeholder, 'g'), value);
    });
    
    setPreviewText(preview);
  };

  const handleVariableChange = (variableName: string, value: string | number) => {
    setVariableValues(prev => ({
      ...prev,
      [variableName]: value
    }));
  };

  const handlePurchase = async () => {
    if (!prompt) return;
    
    // If it's a free prompt, handle it directly
    if (prompt.price === 0) {
      setIsPurchasing(true);
      try {
        const response = await fetch('/api/smart-prompts/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promptId: prompt.id })
        });

        const data = await response.json();
        
        if (response.ok && data.free) {
          toast.success('Free prompt added to your collection!');
          setHasAccess(true);
        } else {
          toast.error(data.error || 'Error processing purchase');
        }
      } catch (error) {
        console.error('Error purchasing prompt:', error);
        toast.error('Error processing purchase');
      } finally {
        setIsPurchasing(false);
      }
    } else {
      // For paid prompts, open payment modal
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    setHasAccess(true);
    // Refresh prompt data to get updated download count
    const fetchPrompt = async () => {
      try {
        const response = await fetch(`/api/smart-prompts/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          const foundPrompt = data.prompt;
          if (foundPrompt) {
            setPrompt(foundPrompt);
          }
        }
      } catch (error) {
        console.error('Error refreshing prompt:', error);
      }
    };
    fetchPrompt();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
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
            className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-neutral-600 dark:text-neutral-400 mb-4">
          Smart Prompt Not Found
        </h1>
        <Button onClick={() => router.push('/smart-prompts')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/smart-prompts')}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${complexityColors[prompt.complexity_level]}`}>
              {prompt.complexity_level}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[prompt.difficulty_level]}`}>
              {prompt.difficulty_level}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
              {prompt.category}
            </span>
          </div>
          <h1 className="text-3xl font-bold dark:text-white">{prompt.title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {prompt.price > 0 ? `$${prompt.price.toFixed(2)}` : 'Free'}
            </div>
            <div className="flex items-center text-sm text-neutral-500">
              {renderStars(prompt.rating_average)}
              <span className="ml-2">({prompt.rating_count})</span>
            </div>
          </div>
          
          {!hasAccess && (
            <Button 
              onClick={handlePurchase}
              disabled={isPurchasing}
              className="min-w-32"
            >
              {isPurchasing ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {prompt.price > 0 ? 'Purchasing...' : 'Getting...'}
                </div>
              ) : (
                <>
                  {prompt.price > 0 ? <DollarSign className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                  {prompt.price > 0 ? 'Purchase' : 'Get Free'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold mb-3 dark:text-white">Description</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {prompt.description}
            </p>
            
            {prompt.instructions && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Usage Instructions</h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">{prompt.instructions}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="border-b border-neutral-200 dark:border-neutral-700">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'preview', label: 'Preview', icon: Play },
                  { id: 'variables', label: 'Variables', icon: Brain },
                  { id: 'examples', label: 'Examples', icon: Star },
                  { id: 'reviews', label: 'Reviews', icon: User }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'preview' | 'variables' | 'examples' | 'reviews')}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="space-y-4">
                  {hasAccess ? (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold dark:text-white">Live Preview</h3>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(previewText)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Result
                        </Button>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-600">
                        <pre className="whitespace-pre-wrap text-sm font-mono dark:text-neutral-300">
                          {previewText || 'Fill in the variables to see the preview...'}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-amber-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        Purchase Required
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                        Get this smart prompt to unlock the interactive preview and customization features.
                      </p>
                      <Button onClick={handlePurchase} disabled={isPurchasing}>
                        {prompt.price > 0 ? `Purchase for $${prompt.price}` : 'Get for Free'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Variables Tab */}
              {activeTab === 'variables' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold dark:text-white">Customize Variables</h3>
                  {prompt.variables && prompt.variables.length > 0 ? (
                    <div className="space-y-4">
                      {prompt.variables.map((variable, index) => (
                        <div key={index} className="space-y-2">
                          <label className="block text-sm font-medium dark:text-white">
                            {variable.name}
                            {variable.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {variable.description && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {variable.description}
                            </p>
                          )}
                          {hasAccess ? (
                            renderVariableInput(variable)
                          ) : (
                            <div className="w-full p-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg border border-neutral-300 dark:border-neutral-600">
                              <span className="text-neutral-400 dark:text-neutral-500">
                                Purchase to customize this variable
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500 dark:text-neutral-400">
                      This prompt doesn't use variables.
                    </p>
                  )}
                </div>
              )}

              {/* Examples Tab */}
              {activeTab === 'examples' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold dark:text-white">Example Outputs</h3>
                  {prompt.example_outputs && prompt.example_outputs.length > 0 ? (
                    <div className="space-y-4">
                      {prompt.example_outputs.map((output, index) => (
                        <div key={index} className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-600">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm text-neutral-700 dark:text-neutral-300">
                              Example {index + 1}
                            </h4>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard(output)}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <p className="text-sm dark:text-neutral-300 whitespace-pre-wrap">
                            {output}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500 dark:text-neutral-400">
                      No example outputs provided.
                    </p>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold dark:text-white">Reviews & Ratings</h3>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-neutral-400" />
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400">
                      Reviews coming soon! Purchase this prompt to be the first to review.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Creator Info */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <h3 className="font-semibold mb-4 dark:text-white">Creator</h3>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {prompt.profiles?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="font-medium dark:text-white">
                  {prompt.profiles?.full_name || 'Anonymous'}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Certified Prompt Engineer
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <h3 className="font-semibold mb-4 dark:text-white">Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Downloads</span>
                <span className="font-medium dark:text-white">{prompt.downloads_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Rating</span>
                <div className="flex items-center">
                  <span className="font-medium mr-2 dark:text-white">{prompt.rating_average.toFixed(1)}</span>
                  {renderStars(prompt.rating_average)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Created</span>
                <span className="font-medium dark:text-white">
                  {new Date(prompt.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
              <h3 className="font-semibold mb-4 dark:text-white">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Use Cases */}
          {prompt.use_cases && prompt.use_cases.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
              <h3 className="font-semibold mb-4 dark:text-white">Use Cases</h3>
              <ul className="space-y-2">
                {prompt.use_cases.map((useCase, index) => (
                  <li key={index} className="text-sm text-neutral-600 dark:text-neutral-400 flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Model Compatibility */}
          {prompt.ai_model_compatibility && prompt.ai_model_compatibility.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
              <h3 className="font-semibold mb-4 dark:text-white">Compatible Models</h3>
              <div className="space-y-2">
                {prompt.ai_model_compatibility.map((model, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <Brain className="w-4 h-4 text-green-500 mr-2" />
                    <span className="dark:text-neutral-300">{model}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stripe Payment Modal */}
      {prompt && showPaymentModal && (
        <StripePaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          promptId={prompt.id}
          amount={prompt.price}
          promptTitle={prompt.title}
          sellerName={prompt.profiles?.full_name || 'Unknown Creator'}
        />
      )}
    </div>
  );
}