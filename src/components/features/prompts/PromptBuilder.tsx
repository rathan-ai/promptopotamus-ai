'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Wand2, Copy, RefreshCw, Lightbulb, Code2, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const promptSuggestions = [
  "Write a professional email to",
  "Create a social media post about",
  "Generate a product description for",
  "Draft a blog outline for",
  "Write code comments for",
  "Create a marketing headline for",
  "Generate interview questions for",
  "Write a summary of",
];

const pomlTemplates = [
  {
    title: "Content Creation",
    template: `<poml>
  <role expertise="content-marketing" tone="professional">
    You are a content marketing specialist
  </role>
  
  <task>
    Create [INSERT CONTENT TYPE] about [INSERT TOPIC]
  </task>
  
  <instructions>
    1. Research the topic thoroughly
    2. Craft engaging headlines
    3. Structure content clearly
    4. Include compelling CTAs
  </instructions>
  
  <output-format style="structured" length="comprehensive">
    - Attention-grabbing headline
    - Well-organized sections
    - Clear call-to-action
  </output-format>
</poml>`
  },
  {
    title: "Data Analysis", 
    template: `<poml>
  <role expertise="data-science" experience="senior">
    You are a senior data scientist
  </role>
  
  <task>
    Analyze [INSERT DATASET] and provide insights
  </task>
  
  <data>
    <table src="[INSERT DATA SOURCE]" />
  </data>
  
  <output-format format="structured">
    ## Key Findings
    - Main insights
    
    ## Recommendations
    - Actionable next steps
  </output-format>
</poml>`
  },
  {
    title: "Educational Content",
    template: `<poml>
  <role persona="expert-educator" teaching-style="engaging">
    You are an experienced educator
  </role>
  
  <task>
    Explain [INSERT TOPIC] for [INSERT AUDIENCE LEVEL]
  </task>
  
  <example type="demonstration">
    <input>Complex concept</input>
    <output>Simple, clear explanation</output>
  </example>
  
  <constraints>
    - Age-appropriate language
    - Include practical examples
    - Maximum cognitive load per section
  </constraints>
</poml>`
  }
];

export default function PromptBuilder() {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPomlMode, setIsPomlMode] = useState(false);
  const [showPomlTemplates, setShowPomlTemplates] = useState(false);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to enhance');
      return;
    }

    setIsEnhancing(true);
    
    // Simple enhancement logic (in a real app, this would call an AI service)
    setTimeout(() => {
      let enhanced;
      
      if (isPomlMode) {
        // Convert traditional prompt to POML structure
        enhanced = `<poml>
  <role expertise="assistant" tone="helpful">
    You are an expert assistant specialized in the requested domain
  </role>
  
  <task>
    ${prompt}
  </task>
  
  <instructions>
    1. Provide clear, accurate information
    2. Use examples where helpful
    3. Structure your response logically
    4. Be comprehensive yet concise
  </instructions>
  
  <output-format style="structured" length="appropriate">
    - Start with key points
    - Provide detailed explanations
    - Include practical examples
    - End with actionable next steps
  </output-format>
</poml>`;
      } else {
        // Traditional enhancement
        enhanced = `Enhanced: ${prompt}\n\nPlease provide a detailed, well-structured response that includes:\n- Clear explanations\n- Relevant examples\n- Step-by-step guidance where applicable\n- Professional tone and format`;
      }
      
      setEnhancedPrompt(enhanced);
      setIsEnhancing(false);
      toast.success(`Prompt enhanced ${isPomlMode ? 'with POML structure' : 'successfully'}!`);
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const clearPrompts = () => {
    setPrompt('');
    setEnhancedPrompt('');
  };

  const addSuggestion = (suggestion: string) => {
    setPrompt(prev => prev + (prev ? ' ' : '') + suggestion);
    setShowSuggestions(false);
  };

  const addPomlTemplate = (template: string) => {
    setPrompt(template);
    setShowPomlTemplates(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="card-title flex items-center">
              {isPomlMode ? <Code2 className="w-5 h-5 mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
              {isPomlMode ? 'POML Prompt Builder' : 'Prompt Builder'}
            </h2>
            <p className="card-description">
              {isPomlMode 
                ? 'Create structured prompts using Microsoft\'s POML framework' 
                : 'Build and enhance your AI prompts for better results'
              }
            </p>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Traditional</span>
            </div>
            <button
              onClick={() => setIsPomlMode(!isPomlMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
                isPomlMode ? 'bg-slate-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPomlMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">POML</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-content space-y-6">
        {/* Input Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="form-label">
              {isPomlMode ? 'POML Prompt Structure' : 'Your Prompt'}
            </label>
            <div className="flex gap-2">
              {isPomlMode && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPomlTemplates(!showPomlTemplates)}
                >
                  <Code2 className="w-4 h-4 mr-1" />
                  Templates
                </Button>
              )}
              {!isPomlMode && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                >
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Ideas
                </Button>
              )}
            </div>
          </div>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isPomlMode 
              ? "Enter POML structured prompt or select a template..." 
              : "Enter your prompt here..."
            }
            className={`form-input min-h-[100px] resize-y ${isPomlMode ? 'font-mono text-sm' : ''}`}
            rows={isPomlMode ? 12 : 4}
          />
          
          {/* Traditional Suggestions */}
          {showSuggestions && !isPomlMode && (
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-200 dark:border-slate-600">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-100 mb-2">
                Prompt Starters:
              </p>
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => addSuggestion(suggestion)}
                    className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* POML Templates */}
          {showPomlTemplates && isPomlMode && (
            <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-200 dark:border-slate-600">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-100 mb-3">
                POML Templates:
              </p>
              <div className="space-y-3">
                {pomlTemplates.map((template, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {template.title}
                      </h4>
                      <button
                        onClick={() => addPomlTemplate(template.template)}
                        className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                      >
                        Use Template
                      </button>
                    </div>
                    <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      {template.template.split('\n').slice(0, 4).join('\n')}...
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={handleEnhancePrompt}
            disabled={isEnhancing || !prompt.trim()}
            className="flex-1"
          >
            {isEnhancing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Enhance Prompt
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={clearPrompts}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Enhanced Prompt Output */}
        {enhancedPrompt && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label">
                {isPomlMode ? 'POML Structured Output' : 'Enhanced Prompt'}
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(enhancedPrompt)}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
            
            <div className={`p-4 border rounded-lg ${
              isPomlMode 
                ? 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-600' 
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
            }`}>
              <pre className={`whitespace-pre-wrap text-sm ${
                isPomlMode 
                  ? 'text-slate-700 dark:text-slate-100 font-mono'
                  : 'text-green-900 dark:text-green-100'
              }`}>
                {enhancedPrompt}
              </pre>
            </div>
            
            {isPomlMode && (
              <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/20 rounded border border-slate-200 dark:border-slate-600">
                <p className="text-xs text-slate-600 dark:text-slate-200">
                  💡 <strong>POML Benefits:</strong> Structured format improves AI understanding, 
                  enables better version control, and makes prompts more maintainable and reusable.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}