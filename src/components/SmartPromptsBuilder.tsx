'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  AlertTriangle, 
  Settings, 
  DollarSign,
  Tag,
  FileText,
  Zap,
  Brain,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getSettings, type SmartPromptSettings } from '@/lib/admin-settings';

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
  variables: string[]; // Variable names used in this step
}

interface SmartPromptData {
  title: string;
  description: string;
  prompt_text: string;
  complexity_level: 'simple' | 'smart' | 'recipe';
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  use_cases: string[];
  ai_model_compatibility: string[];
  variables: Variable[];
  recipe_steps: RecipeStep[];
  instructions: string;
  example_inputs: Record<string, any>;
  example_outputs: string[];
  is_marketplace: boolean;
  is_public: boolean;
  price: number;
}

interface SmartPromptsBuilderProps {
  onSave?: (prompt: SmartPromptData) => void;
  initialData?: Partial<SmartPromptData>;
  canCreateMarketplace: boolean;
}

const categories = [
  'Marketing & Sales', 'Content Writing', 'Code & Development', 'Data Analysis',
  'Creative Writing', 'Business Strategy', 'Education & Training', 'Research',
  'Customer Service', 'Social Media', 'Email Marketing', 'Other'
];

const aiModels = [
  'GPT-4', 'GPT-3.5', 'Claude 3', 'Claude 2', 'Gemini Pro', 'PaLM 2', 'Any Model'
];

export default function SmartPromptsBuilder({ 
  onSave, 
  initialData, 
  canCreateMarketplace = false 
}: SmartPromptsBuilderProps) {
  const [formData, setFormData] = useState<SmartPromptData>({
    title: '',
    description: '',
    prompt_text: '',
    complexity_level: 'simple',
    category: '',
    difficulty_level: 'beginner',
    tags: [],
    use_cases: [],
    ai_model_compatibility: [],
    variables: [],
    recipe_steps: [],
    instructions: '',
    example_inputs: {},
    example_outputs: [],
    is_marketplace: false,
    is_public: false,
    price: 0,
    ...initialData
  });
  
  const [pricingSettings, setPricingSettings] = useState<SmartPromptSettings>({
    max_free_prompts_personal: 10,
    default_commission_rate: 0.20,
    pro_commission_rate: 0.15,
    premium_commission_rate: 0.10,
    allow_user_pricing: true,
    min_price: 1.00,
    max_price: 99.99,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Load pricing settings from admin configuration
  useEffect(() => {
    const loadPricingSettings = async () => {
      try {
        const settings = await getSettings('smart_prompts') as SmartPromptSettings;
        setPricingSettings(settings);
      } catch (error) {
        console.error('Failed to load pricing settings:', error);
        // Keep default values if loading fails
      }
    };
    
    loadPricingSettings();
  }, []);
  const [newTag, setNewTag] = useState('');
  const [newUseCase, setNewUseCase] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    variables: false,
    recipes: false,
    marketplace: false
  });

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: FileText },
    { id: 'content', title: 'Prompt Content', icon: Brain },
    { id: 'advanced', title: 'Advanced Features', icon: Zap },
    { id: 'marketplace', title: 'Marketplace Settings', icon: DollarSign }
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addVariable = () => {
    const newVariable: Variable = {
      name: `variable${formData.variables.length + 1}`,
      type: 'text',
      description: '',
      required: false
    };
    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, newVariable]
    }));
  };

  const updateVariable = (index: number, updates: Partial<Variable>) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.map((variable, i) => 
        i === index ? { ...variable, ...updates } : variable
      )
    }));
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const addRecipeStep = () => {
    const newStep: RecipeStep = {
      id: `step_${Date.now()}`,
      title: `Step ${formData.recipe_steps.length + 1}`,
      instruction: '',
      prompt_template: '',
      variables: []
    };
    setFormData(prev => ({
      ...prev,
      recipe_steps: [...prev.recipe_steps, newStep]
    }));
  };

  const updateRecipeStep = (index: number, updates: Partial<RecipeStep>) => {
    setFormData(prev => ({
      ...prev,
      recipe_steps: prev.recipe_steps.map((step, i) => 
        i === index ? { ...step, ...updates } : step
      )
    }));
  };

  const removeRecipeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipe_steps: prev.recipe_steps.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addUseCase = () => {
    if (newUseCase.trim() && !formData.use_cases.includes(newUseCase.trim())) {
      setFormData(prev => ({
        ...prev,
        use_cases: [...prev.use_cases, newUseCase.trim()]
      }));
      setNewUseCase('');
    }
  };

  const removeUseCase = (useCase: string) => {
    setFormData(prev => ({
      ...prev,
      use_cases: prev.use_cases.filter(uc => uc !== useCase)
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title for your smart prompt');
      return;
    }

    if (!formData.prompt_text.trim()) {
      toast.error('Please enter the prompt content');
      return;
    }

    if (formData.is_marketplace && !canCreateMarketplace) {
      toast.error('You need a valid certification to create marketplace prompts');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/smart-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message);
        if (onSave) onSave(formData);
        
        // Reset form for new prompt
        setFormData({
          title: '',
          description: '',
          prompt_text: '',
          complexity_level: 'simple',
          category: '',
          difficulty_level: 'beginner',
          tags: [],
          use_cases: [],
          ai_model_compatibility: [],
          variables: [],
          recipe_steps: [],
          instructions: '',
          example_inputs: {},
          example_outputs: [],
          is_marketplace: false,
          is_public: false,
          price: 0,
        });
      } else {
        if (result.requiresCertification) {
          toast.error(result.error + ' Complete a certification exam first.');
        } else {
          toast.error(result.error || 'Failed to save smart prompt');
        }
      }
    } catch (error) {
      console.error('Error saving smart prompt:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const generatePreview = () => {
    let preview = formData.prompt_text;
    
    // Replace variables with example values
    formData.variables.forEach(variable => {
      const placeholder = `{${variable.name}}`;
      const exampleValue = formData.example_inputs[variable.name] || 
                          variable.defaultValue || 
                          `[${variable.name}]`;
      preview = preview.replace(new RegExp(placeholder, 'g'), exampleValue);
    });
    
    return preview;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">Smart Prompts Builder</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Create intelligent prompt templates and recipes for the marketplace
          {!canCreateMarketplace && (
            <span className="block mt-2 text-amber-600 dark:text-amber-400 text-sm flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Complete a certification to unlock marketplace features
            </span>
          )}
        </p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 border-b dark:border-neutral-700 pb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted ? 'bg-green-500 border-green-500 text-white' :
                  isActive ? 'border-blue-500 text-blue-500' : 
                  'border-neutral-300 text-neutral-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 
                  'text-neutral-600 dark:text-neutral-400'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-4 text-neutral-300" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="space-y-8">
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold dark:text-white">Basic Information</h2>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Cold Email Outreach Generator"
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what your smart prompt does and who it's for"
                  rows={3}
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                />
              </div>

              {/* Category and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Difficulty Level</label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value as any }))}
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Complexity Level */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Complexity Level</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'simple', label: 'Simple Template', desc: 'Basic variable substitution' },
                    { value: 'smart', label: 'Smart Template', desc: 'Conditional logic & context-aware' },
                    { value: 'recipe', label: 'Recipe', desc: 'Multi-step processes with AI optimization' }
                  ].map(option => (
                    <div
                      key={option.value}
                      onClick={() => setFormData(prev => ({ ...prev, complexity_level: option.value as any }))}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.complexity_level === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      <h3 className="font-medium dark:text-white">{option.label}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{option.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Prompt Content */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold dark:text-white">Prompt Content</h2>

              {/* Main Prompt Text */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Prompt Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.prompt_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt_text: e.target.value }))}
                  placeholder="Write your prompt here. Use {variable_name} for variables."
                  rows={6}
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white font-mono"
                />
                <p className="text-sm text-neutral-500 mt-2">
                  Use curly braces for variables: {'{variable_name}'} 
                </p>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Usage Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Explain how to use this prompt effectively..."
                  rows={4}
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                />
              </div>

              {/* AI Model Compatibility */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Compatible AI Models</label>
                <div className="flex flex-wrap gap-2">
                  {aiModels.map(model => (
                    <label key={model} className="flex items-center space-x-2 bg-neutral-50 dark:bg-neutral-700 px-3 py-2 rounded-lg">
                      <input
                        type="checkbox"
                        checked={formData.ai_model_compatibility.includes(model)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              ai_model_compatibility: [...prev.ai_model_compatibility, model]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              ai_model_compatibility: prev.ai_model_compatibility.filter(m => m !== model)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm dark:text-white">{model}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Advanced Features */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold dark:text-white">Advanced Features</h2>

              {/* Variables Section */}
              <div className="border dark:border-neutral-600 rounded-lg">
                <button
                  onClick={() => toggleSection('variables')}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700"
                >
                  <h3 className="font-medium dark:text-white">Variables</h3>
                  {expandedSections.variables ? 
                    <ChevronDown className="w-5 h-5" /> : 
                    <ChevronRight className="w-5 h-5" />
                  }
                </button>
                
                {expandedSections.variables && (
                  <div className="p-4 border-t dark:border-neutral-600 space-y-4">
                    {formData.variables.map((variable, index) => (
                      <div key={index} className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <input
                            type="text"
                            placeholder="Variable name"
                            value={variable.name}
                            onChange={(e) => updateVariable(index, { name: e.target.value })}
                            className="p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-600 dark:text-white"
                          />
                          <select
                            value={variable.type}
                            onChange={(e) => updateVariable(index, { type: e.target.value as any })}
                            className="p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-600 dark:text-white"
                          >
                            <option value="text">Text</option>
                            <option value="textarea">Long Text</option>
                            <option value="select">Dropdown</option>
                            <option value="number">Number</option>
                          </select>
                          <button
                            onClick={() => removeVariable(index)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Description"
                          value={variable.description}
                          onChange={(e) => updateVariable(index, { description: e.target.value })}
                          className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-600 dark:text-white mb-2"
                        />
                        {variable.type === 'select' && (
                          <input
                            type="text"
                            placeholder="Options (comma-separated)"
                            value={variable.options?.join(', ') || ''}
                            onChange={(e) => updateVariable(index, { 
                              options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) 
                            })}
                            className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-600 dark:text-white"
                          />
                        )}
                        <label className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            checked={variable.required}
                            onChange={(e) => updateVariable(index, { required: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm dark:text-white">Required</span>
                        </label>
                      </div>
                    ))}
                    <Button onClick={addVariable} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Variable
                    </Button>
                  </div>
                )}
              </div>

              {/* Recipe Steps (only for recipe complexity) */}
              {formData.complexity_level === 'recipe' && (
                <div className="border dark:border-neutral-600 rounded-lg">
                  <button
                    onClick={() => toggleSection('recipes')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  >
                    <h3 className="font-medium dark:text-white">Recipe Steps</h3>
                    {expandedSections.recipes ? 
                      <ChevronDown className="w-5 h-5" /> : 
                      <ChevronRight className="w-5 h-5" />
                    }
                  </button>
                  
                  {expandedSections.recipes && (
                    <div className="p-4 border-t dark:border-neutral-600 space-y-4">
                      {formData.recipe_steps.map((step, index) => (
                        <div key={step.id} className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <input
                              type="text"
                              placeholder="Step title"
                              value={step.title}
                              onChange={(e) => updateRecipeStep(index, { title: e.target.value })}
                              className="flex-1 p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-600 dark:text-white mr-3"
                            />
                            <button
                              onClick={() => removeRecipeStep(index)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea
                            placeholder="Step instructions"
                            value={step.instruction}
                            onChange={(e) => updateRecipeStep(index, { instruction: e.target.value })}
                            rows={3}
                            className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-600 dark:text-white mb-3"
                          />
                          <textarea
                            placeholder="Prompt template for this step"
                            value={step.prompt_template}
                            onChange={(e) => updateRecipeStep(index, { prompt_template: e.target.value })}
                            rows={4}
                            className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-600 dark:text-white font-mono"
                          />
                        </div>
                      ))}
                      <Button onClick={addRecipeStep} variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Recipe Step
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map(tag => (
                    <span key={tag} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-2 text-blue-600 hover:text-blue-800">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add a tag"
                    className="flex-1 p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-700 dark:text-white"
                  />
                  <Button onClick={addTag} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Use Cases */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Use Cases</label>
                <div className="space-y-2 mb-3">
                  {formData.use_cases.map(useCase => (
                    <div key={useCase} className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-700 p-2 rounded">
                      <span className="dark:text-white">{useCase}</span>
                      <button onClick={() => removeUseCase(useCase)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUseCase}
                    onChange={(e) => setNewUseCase(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addUseCase()}
                    placeholder="Add a use case"
                    className="flex-1 p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-700 dark:text-white"
                  />
                  <Button onClick={addUseCase} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Marketplace Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold dark:text-white">Marketplace Settings</h2>

              {canCreateMarketplace ? (
                <>
                  {/* Marketplace Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div>
                      <h3 className="font-medium dark:text-white">Enable Marketplace Listing</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Make this prompt available for others to purchase</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_marketplace}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          is_marketplace: e.target.checked,
                          is_public: e.target.checked 
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {formData.is_marketplace && (
                    <>
                      {/* Pricing */}
                      <div>
                        <label className="block text-sm font-medium mb-2 dark:text-white">Price (USD)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                          <input
                            type="number"
                            min="0"
                            max={pricingSettings.max_price}
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => {
                              const price = parseFloat(e.target.value) || 0;
                              const clampedPrice = Math.min(Math.max(price, 0), pricingSettings.max_price);
                              setFormData(prev => ({ ...prev, price: clampedPrice }));
                            }}
                            placeholder="0.00"
                            className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-neutral-500 mt-1">
                            Set to $0.00 for free prompts. You&apos;ll earn {Math.round((1 - pricingSettings.default_commission_rate) * 100)}% of paid sales.
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            Max: ${pricingSettings.max_price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Example Inputs/Outputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 dark:text-white">Example Inputs</label>
                          <textarea
                            value={JSON.stringify(formData.example_inputs, null, 2)}
                            onChange={(e) => {
                              try {
                                setFormData(prev => ({ ...prev, example_inputs: JSON.parse(e.target.value) }));
                              } catch {}
                            }}
                            placeholder='{"variable1": "example value", "variable2": "another example"}'
                            rows={4}
                            className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-700 dark:text-white font-mono text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 dark:text-white">Example Outputs</label>
                          <textarea
                            value={formData.example_outputs.join('\n\n---\n\n')}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              example_outputs: e.target.value.split('\n\n---\n\n').filter(Boolean) 
                            }))}
                            placeholder="Example output 1&#10;&#10;---&#10;&#10;Example output 2"
                            rows={4}
                            className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-700 dark:text-white"
                          />
                          <p className="text-sm text-neutral-500 mt-1">Separate multiple examples with &quot;---&quot;</p>
                        </div>
                      </div>

                      {/* Preview */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium dark:text-white">Marketplace Preview</h3>
                          <Button onClick={() => setShowPreview(!showPreview)} variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            {showPreview ? 'Hide' : 'Show'} Preview
                          </Button>
                        </div>
                        
                        {showPreview && (
                          <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-semibold dark:text-white">{formData.title || 'Untitled Prompt'}</h4>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">{formData.category}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-bold text-green-600">${formData.price.toFixed(2)}</span>
                                <div className="flex gap-1 mt-1">
                                  {formData.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-neutral-700 dark:text-neutral-300 mb-4">{formData.description}</p>
                            <div className="bg-white dark:bg-neutral-700 rounded p-3">
                              <h5 className="font-medium mb-2 dark:text-white">Preview with Examples:</h5>
                              <p className="font-mono text-sm dark:text-neutral-300">{generatePreview()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    Certification Required
                  </h3>
                  <p className="text-amber-700 dark:text-amber-300 mb-4">
                    You need to complete at least one certification level to create marketplace prompts. 
                    This ensures quality and builds trust with buyers.
                  </p>
                  <Link href="/certificates">
                    <Button variant="outline">Take Certification Exam</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation and Save */}
        <div className="flex justify-between items-center pt-8 border-t dark:border-neutral-700">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button onClick={() => setCurrentStep(prev => prev - 1)} variant="outline">
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            {currentStep < steps.length - 1 ? (
              <Button onClick={() => setCurrentStep(prev => prev + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={isSaving} className="min-w-32">
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Smart Prompt
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}