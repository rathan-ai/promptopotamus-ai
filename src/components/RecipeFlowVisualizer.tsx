'use client';

import { useState } from 'react';
import { Plus, Trash2, ArrowDown, ArrowRight, Eye, Settings, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RecipeStep {
  id: string;
  title: string;
  instruction: string;
  prompt_template: string;
  variables: string[];
}

interface RecipeFlowVisualizerProps {
  steps: RecipeStep[];
  availableVariables: string[];
  onStepsChange: (steps: RecipeStep[]) => void;
  onAddStep: () => void;
  onRemoveStep: (stepId: string) => void;
}

export default function RecipeFlowVisualizer({
  steps,
  availableVariables,
  onStepsChange,
  onAddStep,
  onRemoveStep
}: RecipeFlowVisualizerProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [previewMode, setPreviewMode] = useState(false);

  const toggleStepExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const updateStep = (stepId: string, updates: Partial<RecipeStep>) => {
    const updatedSteps = steps.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    );
    onStepsChange(updatedSteps);
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const newSteps = [...steps];
    [newSteps[currentIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[currentIndex]];
    onStepsChange(newSteps);
  };

  const getStepOutputVariables = (stepIndex: number): string[] => {
    return [`step_${stepIndex + 1}_output`, `step_${stepIndex + 1}_result`];
  };

  const getAvailableVariablesForStep = (stepIndex: number): string[] => {
    // Include original variables plus outputs from previous steps
    const previousStepOutputs = [];
    for (let i = 0; i < stepIndex; i++) {
      previousStepOutputs.push(`step_${i + 1}_output`);
    }
    return [...availableVariables, ...previousStepOutputs];
  };

  if (previewMode) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold dark:text-white">Recipe Flow Preview</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewMode(false)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Mode
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                        {step.title}
                      </h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                        {step.instruction}
                      </p>
                      <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 border border-neutral-200 dark:border-neutral-600">
                        <code className="text-sm text-neutral-800 dark:text-neutral-200">
                          {step.prompt_template}
                        </code>
                      </div>
                      {step.variables.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">Uses variables:</div>
                          <div className="flex flex-wrap gap-2">
                            {step.variables.map(variable => (
                              <span
                                key={variable}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-xs"
                              >
                                {variable}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Output indicator */}
                  <div className="mt-4 pt-3 border-t border-purple-200 dark:border-purple-600">
                    <div className="text-xs text-purple-700 dark:text-purple-300 mb-1">Produces:</div>
                    <div className="flex gap-2">
                      {getStepOutputVariables(index).map(output => (
                        <span
                          key={output}
                          className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded text-xs"
                        >
                          {output}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Flow arrow */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-4">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-purple-400 to-blue-400"></div>
                    <ArrowDown className="w-6 h-6 text-purple-500 -mt-2" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {steps.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-neutral-400" />
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">No steps defined yet</p>
              <Button onClick={onAddStep}>Add First Step</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold dark:text-white">Recipe Steps Builder</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Create a multi-step workflow where each step builds on previous results
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewMode(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Flow
            </Button>
            <Button
              size="sm"
              onClick={onAddStep}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {steps.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-neutral-400" />
            </div>
            <h4 className="text-lg font-semibold dark:text-white mb-2">Create Your First Recipe Step</h4>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Break down your complex task into sequential steps that build on each other
            </p>
            <Button onClick={onAddStep}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Step
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isExpanded = expandedSteps.has(step.id);
              const availableVars = getAvailableVariablesForStep(index);

              return (
                <div key={step.id} className="relative">
                  <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg">
                    {/* Step Header */}
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => updateStep(step.id, { title: e.target.value })}
                              placeholder={`Step ${index + 1} Title`}
                              className="font-semibold text-neutral-900 dark:text-white bg-transparent border-none outline-none focus:bg-neutral-50 dark:focus:bg-neutral-700 rounded px-2 py-1"
                            />
                            <div className="text-xs text-neutral-500 mt-1">
                              Produces: {getStepOutputVariables(index).join(', ')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {index > 0 && (
                            <button
                              onClick={() => moveStep(step.id, 'up')}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                              title="Move up"
                            >
                              ↑
                            </button>
                          )}
                          {index < steps.length - 1 && (
                            <button
                              onClick={() => moveStep(step.id, 'down')}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                              title="Move down"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            onClick={() => onRemoveStep(step.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded text-red-500"
                            title="Remove step"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleStepExpanded(step.id)}
                            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step Content */}
                    {isExpanded && (
                      <div className="p-4 space-y-4">
                        {/* Instruction */}
                        <div>
                          <label className="block text-sm font-medium dark:text-white mb-2">
                            Step Instruction
                          </label>
                          <textarea
                            value={step.instruction}
                            onChange={(e) => updateStep(step.id, { instruction: e.target.value })}
                            placeholder="Describe what this step does and how it uses previous results..."
                            rows={2}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-neutral-700 dark:text-white text-sm resize-none"
                          />
                        </div>

                        {/* Prompt Template */}
                        <div>
                          <label className="block text-sm font-medium dark:text-white mb-2">
                            Prompt Template
                          </label>
                          <textarea
                            value={step.prompt_template}
                            onChange={(e) => updateStep(step.id, { prompt_template: e.target.value })}
                            placeholder="Enter the prompt template for this step. Use {variable_name} for variables..."
                            rows={3}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-neutral-700 dark:text-white text-sm font-mono resize-none"
                          />
                        </div>

                        {/* Available Variables */}
                        <div>
                          <label className="block text-sm font-medium dark:text-white mb-2">
                            Available Variables for This Step
                          </label>
                          <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-3">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {availableVars.map(variable => (
                                <button
                                  key={variable}
                                  onClick={() => {
                                    const textarea = document.querySelector(`textarea[value="${step.prompt_template}"]`) as HTMLTextAreaElement;
                                    if (textarea) {
                                      const cursorPos = textarea.selectionStart;
                                      const newValue = step.prompt_template.slice(0, cursorPos) + `{${variable}}` + step.prompt_template.slice(cursorPos);
                                      updateStep(step.id, { prompt_template: newValue });
                                    }
                                  }}
                                  className="text-left px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded text-xs hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                  <code>{variable}</code>
                                </button>
                              ))}
                            </div>
                            <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
                              Click any variable to insert it into the prompt template at your cursor position
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Flow arrow */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center my-4">
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-4 bg-gradient-to-b from-purple-400 to-blue-400"></div>
                        <ArrowDown className="w-5 h-5 text-purple-500" />
                        <div className="w-0.5 h-4 bg-gradient-to-b from-purple-400 to-blue-400"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Step Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={onAddStep}
                variant="outline"
                className="border-dashed border-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Step
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}