'use client';

import { HelpCircle, Info, Lightbulb, Brain, FileText, Wand2 } from 'lucide-react';

export default function PromptCrafterHelp() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                    p-6 rounded-lg border border-blue-200 dark:border-blue-700">
      <div className="flex items-start gap-3">
        <HelpCircle className="w-6 h-6 text-slate-600 flex-shrink-0 mt-1" />
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              What is Prompt Crafter?
            </h3>
            <p className="text-slate-700 dark:text-blue-300 text-sm">
              Prompt Crafter is an advanced wizard that guides you through creating professional-grade prompts 
              using proven frameworks and AI best practices. It analyzes your needs and recommends the optimal 
              approach for your specific use case.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">
              The 4-Stage Process:
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-slate-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-200">Idea Collection</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Share your goal and preferences (style, temperature, etc.)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-slate-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-200">Framework Analysis</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    AI recommends the best framework (Zero-Shot, Chain-of-Thought, etc.) and model
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-200">Output Format</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Choose how you want the response structured (Analysis, Tutorial, etc.)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-slate-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-200">Final Generation</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Get your professionally crafted prompt with all optimizations applied
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg">
            <h4 className="font-medium text-neutral-800 dark:text-neutral-200 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-slate-500" />
              Tips for Best Results
            </h4>
            <ul className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
              <li>• Be specific about your goal in Stage 1</li>
              <li>• Trust the AI recommendations but feel free to customize</li>
              <li>• Consider your target AI model's strengths</li>
              <li>• Choose output formats that match your end use</li>
            </ul>
          </div>
          
          <div className="text-xs text-slate-600 dark:text-slate-400 italic">
            💡 Pro tip: The more context you provide, the better the recommendations!
          </div>
        </div>
      </div>
    </div>
  );
}