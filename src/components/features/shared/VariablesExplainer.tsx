'use client';

import React from 'react';
import { Settings, Type, List, Hash, FileText, Lightbulb } from 'lucide-react';

export default function VariablesExplainer() {
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
                Instead of writing "Write an email about Product X", you write "Write an email about {'{product_name}'}". 
                Then you can reuse this prompt for any product by changing the variable value.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Variable Types */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <h4 className="text-lg font-semibold dark:text-white mb-4">Variable Types</h4>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6">
          Choose the right input type based on what kind of information you need from users.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Text Variables */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-5 h-5 text-blue-600" />
              <h5 className="font-semibold dark:text-white">Text Variables</h5>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Single-line text input for names, titles, or short phrases
            </p>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              <strong>Examples:</strong> Product name, person's name, email subject
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <strong>Use for:</strong> Short inputs like names, titles, keywords, or single words
            </div>
          </div>

          {/* Textarea Variables */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-green-600" />
              <h5 className="font-semibold dark:text-white">Textarea Variables</h5>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Multi-line text input for longer content and descriptions
            </p>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              <strong>Examples:</strong> Product description, background context, detailed requirements
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <strong>Use for:</strong> Longer text like descriptions, requirements, or multi-sentence content
            </div>
          </div>

          {/* Select Variables */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <List className="w-5 h-5 text-purple-600" />
              <h5 className="font-semibold dark:text-white">Select Variables</h5>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Dropdown menu with predefined options to choose from
            </p>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              <strong>Examples:</strong> Tone (formal/casual), Industry (tech/healthcare), Size (small/medium/large)
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <strong>Use for:</strong> When you want to limit choices to specific predefined options
            </div>
          </div>

          {/* Number Variables */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-5 h-5 text-orange-600" />
              <h5 className="font-semibold dark:text-white">Number Variables</h5>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Numeric input for quantities, percentages, or measurements
            </p>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              <strong>Examples:</strong> Budget amount, team size, percentage, years of experience
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <strong>Use for:</strong> Any numeric values like quantities, ages, prices, or percentages
            </div>
          </div>
        </div>
      </div>

      {/* Example Usage */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <h4 className="text-lg font-semibold dark:text-white mb-4">Example Usage</h4>
        
        <div className="space-y-4">
          <div>
            <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Template with Variables:</h6>
            <div className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded-lg text-sm font-mono">
              Write a {'{tone}'} marketing email for {'{product_name}'} targeting {'{audience}'}. 
              The email should highlight {'{key_benefit}'} and include a {'{cta_type}'} call-to-action. 
              Keep it under {'{word_limit}'} words.
            </div>
          </div>

          <div>
            <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Final Result:</h6>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-400">
              <p className="text-sm text-green-800 dark:text-green-200">
                Write a <strong>professional</strong> marketing email for <strong>Smart Fitness Tracker Pro</strong> targeting <strong>health-conscious professionals aged 25-40</strong>. 
                The email should highlight <strong>24/7 heart rate monitoring with AI insights</strong> and include a <strong>free trial</strong> call-to-action. 
                Keep it under <strong>150</strong> words.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Pro Tip</h6>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Variables make your prompts reusable. The same template can generate personalized content 
                for any product, audience, or use case just by changing the variable values.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}