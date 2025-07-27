'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Save, Wand2, Lightbulb, Copy, RefreshCw, ExternalLink, Sparkles, Crown, Calendar, Bell, BookOpen, Zap } from 'lucide-react';
import { track } from '@vercel/analytics';
import BuyCreditsModal from '../payments/BuyCreditsModal';
import { getSettings, type LimitSettings } from '@/lib/admin-settings';
import dynamic from 'next/dynamic';

// Lazy load the PromptCrafterWizard
const PromptCrafterWizard = dynamic(() => import('./PromptCrafterWizard'), {
  loading: () => <div className="flex justify-center p-8"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>,
  ssr: false
});

const promptSuggestions = [
    { persona: "Marketing Expert", task: "Create a compelling email campaign", context: "For a new product launch targeting millennials", format: "Subject line and 3-paragraph email" },
    { persona: "Data Scientist", task: "Analyze customer behavior patterns", context: "From e-commerce website data", format: "Executive summary with key insights" },
    { persona: "Creative Writer", task: "Write a short story", context: "Set in a dystopian future where AI runs everything", format: "500-word narrative" },
    { persona: "Business Consultant", task: "Develop a growth strategy", context: "For a small tech startup with limited funding", format: "5-point action plan" }
];

const aiPlatforms = [
    { name: "ChatGPT", url: "https://chat.openai.com?ref=promptopotamus", free: true },
    { name: "Claude", url: "https://claude.ai?ref=promptopotamus", free: true },
    { name: "Gemini", url: "https://gemini.google.com?ref=promptopotamus", free: true },
    { name: "Perplexity", url: "https://perplexity.ai?ref=promptopotamus", free: true }
];

export default function PromptBuilder() {
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [enhancedPrompt, setEnhancedPrompt] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [promptCoins, setPromptCoins] = useState(45); // Free tier limit (45 PC = 3 enhancements, will be updated from settings)
    const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
    const [showWizardMode, setShowWizardMode] = useState(false);
    const [limitSettings, setLimitSettings] = useState<LimitSettings>({
        prompt_builder_free_daily: 3,
        prompt_analyzer_free_daily: 5,
        prompt_builder_pro_daily: 25,
        prompt_analyzer_pro_daily: 50,
        prompt_builder_premium_daily: -1,
        prompt_analyzer_premium_daily: -1,
    });

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();

        // Load limit settings from admin configuration
        const loadLimitSettings = async () => {
            try {
                const settings = await getSettings('limits') as LimitSettings;
                setLimitSettings(settings);
                // Update initial PromptCoins based on settings (assuming free tier for now)
                setPromptCoins(settings.prompt_builder_free_daily * 15); // 15 PC per enhancement
            } catch (error) {
                console.error('Failed to load limit settings:', error);
                // Keep default values if loading fails
            }
        };
        
        loadLimitSettings();
    }, []);

    const buildPromptText = () => {
        const persona = (document.getElementById('generic-persona') as HTMLInputElement)?.value;
        const task = (document.getElementById('generic-task') as HTMLInputElement)?.value;
        const context = (document.getElementById('generic-context') as HTMLTextAreaElement)?.value;
        const format = (document.getElementById('generic-format') as HTMLInputElement)?.value;

        let p = '';
        if (persona) p += `Act as ${persona}.\\n`;
        if (task) p += `Your task is to: ${task}.\\n`;
        if (context) p += `Context: ${context}.\\n`;
        if (format) p += `Format your response as: ${format}.`;
        return p.trim();
    };

    const handleGenerate = () => {
        const finalPrompt = buildPromptText();
        
        if (finalPrompt) {
            // Track successful prompt generation
            track('prompt_generated', {
                prompt_length: finalPrompt.length,
                has_persona: finalPrompt.includes('Act as'),
                has_context: finalPrompt.includes('Context:'),
                has_format: finalPrompt.includes('Format:')
            });
            
            setGeneratedPrompt(finalPrompt);
            navigator.clipboard.writeText(finalPrompt);
            toast.success('Prompt copied to clipboard!');
        } else {
            track('prompt_generation_failed', {
                reason: 'empty_fields'
            });
            toast.error('Please fill out at least one field to generate a prompt.');
        }
    };

    const handleEnhancePrompt = async () => {
        if (promptCoins < 15) { // Need 15 PC for enhancement
            track('prompt_enhancement_limit_reached', {
                source: 'prompt_builder'
            });
            setShowBuyCreditsModal(true);
            return;
        }

        const basePrompt = buildPromptText();
        if (!basePrompt) {
            track('prompt_enhancement_failed', {
                reason: 'no_base_prompt'
            });
            toast.error('Please create a basic prompt first.');
            return;
        }

        // Track enhancement start
        track('prompt_enhancement_started', {
            base_prompt_length: basePrompt.length,
            remaining_promptcoins: promptCoins - 15
        });

        setIsEnhancing(true);
        setPromptCoins(prev => prev - 15); // Deduct 15 PC for enhancement

        // Simulate AI enhancement - in real app, would call actual AI API
        setTimeout(() => {
            const enhanced = enhancePromptWithAI(basePrompt);
            
            // Track successful enhancement
            track('prompt_enhanced', {
                original_length: basePrompt.length,
                enhanced_length: enhanced.length,
                enhancement_ratio: enhanced.length / basePrompt.length
            });
            
            setEnhancedPrompt(enhanced);
            setIsEnhancing(false);
            toast.success('Prompt enhanced with AI suggestions!');
        }, 2000);
    };

    const enhancePromptWithAI = (prompt: string) => {
        // This simulates AI enhancement - replace with actual AI API calls
        const enhancements = [
            "Be specific about the output format and length.",
            "Include examples or templates for better guidance.",
            "Add constraints or requirements to focus the response.",
            "Specify the target audience or expertise level.",
            "Include a call-to-action or next steps."
        ];
        
        return `${prompt}\n\n--- AI Enhanced Version ---\n${prompt}\n\nAdditional Instructions:\n${enhancements.slice(0, 2).map(e => `• ${e}`).join('\n')}\n\nPlease ensure the response is actionable and tailored to the specific context provided.`;
    };

    const applySuggestion = (suggestion: typeof promptSuggestions[0]) => {
        // Track suggestion usage
        track('prompt_suggestion_applied', {
            persona: suggestion.persona,
            task_type: suggestion.task.split(' ')[0].toLowerCase()
        });
        
        (document.getElementById('generic-persona') as HTMLInputElement).value = suggestion.persona;
        (document.getElementById('generic-task') as HTMLInputElement).value = suggestion.task;
        (document.getElementById('generic-context') as HTMLTextAreaElement).value = suggestion.context;
        (document.getElementById('generic-format') as HTMLInputElement).value = suggestion.format;
        setShowSuggestions(false);
        toast.success('Suggestion applied! Click Generate to create your prompt.');
    };

    const handleWizardComplete = (craftedPrompt: string, metadata: any) => {
        setGeneratedPrompt(craftedPrompt);
        setEnhancedPrompt(craftedPrompt); // Treat wizard output as enhanced
        setShowWizardMode(false);
        
        // Track wizard completion
        track('prompt_crafter_used', {
            framework: metadata.framework,
            model: metadata.model?.id,
            output_format: metadata.outputFormat,
            prompt_length: craftedPrompt.length
        });
        
        // Copy to clipboard
        navigator.clipboard.writeText(craftedPrompt);
        toast.success('Crafted prompt copied to clipboard!');
    };

    const handleSave = async () => {
        const title = (document.getElementById('prompt-title') as HTMLInputElement)?.value;
        const task = (document.getElementById('generic-task') as HTMLInputElement)?.value;
        const finalPrompt = enhancedPrompt || buildPromptText();

        if (!task || !finalPrompt) {
            toast.error('A "Task" is required to save a prompt.');
            return;
        }

        const res = await fetch('/api/prompts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title || 'Untitled Prompt',
                persona: (document.getElementById('generic-persona') as HTMLInputElement)?.value,
                task: task,
                context: (document.getElementById('generic-context') as HTMLTextAreaElement)?.value,
                format: (document.getElementById('generic-format') as HTMLInputElement)?.value,
                prompt_text: finalPrompt
            }),
        });

        const data = await res.json();
        if (res.ok) {
            // Track successful prompt save
            track('prompt_saved', {
                title: title || 'Untitled Prompt',
                prompt_length: finalPrompt.length,
                has_enhancement: !!enhancedPrompt
            });
            toast.success(data.message);
        } else {
            track('prompt_save_failed', {
                error: data.error
            });
            toast.error(data.error);
        }
    };

    return (
        <>
            {showWizardMode ? (
                <PromptCrafterWizard
                    onComplete={handleWizardComplete}
                    onCancel={() => setShowWizardMode(false)}
                    promptCoins={promptCoins}
                    onUseCoins={(amount) => setPromptCoins(prev => prev - amount)}
                />
            ) : (
                <section id="generator" className="bg-white dark:bg-neutral-800/50 p-6 md:p-8 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Interactive Prompt Builder</h2>
                            <p className="text-neutral-600 dark:text-neutral-300">Construct detailed prompts with AI assistance.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                PromptCoins: {promptCoins} ({Math.floor(promptCoins / 15)} enhancements left)
                            </div>
                            {promptCoins < 30 && ( // Show warning when less than 2 enhancements left
                                <button 
                                    onClick={() => setShowBuyCreditsModal(true)}
                                    className="text-xs text-amber-600 dark:text-amber-400 mt-1 hover:underline cursor-pointer"
                                >
                                    <Crown className="w-3 h-3 inline mr-1" />
                                    Buy More PromptCoins
                                </button>
                            )}
                        </div>
                    </div>

            {/* Mode Toggle and Suggestions */}
            <div className="mb-6 flex gap-3">
                <Button
                    onClick={() => setShowWizardMode(true)}
                    variant="secondary"
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                    <Zap className="w-4 h-4 mr-2" />
                    Guided Crafting
                </Button>
                <Button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    variant="outline"
                    size="sm"
                >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {showSuggestions ? 'Hide' : 'Show'} Suggestions
                </Button>
            </div>

            {/* Quick Suggestions */}
            {showSuggestions && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">✨ Quick Start Ideas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {promptSuggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                onClick={() => applySuggestion(suggestion)}
                                className="p-3 bg-white dark:bg-neutral-800 rounded border border-blue-200 dark:border-blue-700 cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="font-medium text-blue-700 dark:text-blue-300">{suggestion.persona}</div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{suggestion.task}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                    <label htmlFor="prompt-title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">Title (Optional)</label>
                    <input id="prompt-title" type="text" className="mt-1 block w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2" placeholder="e.g., My Marketing Campaign Prompt" />
                </div>
                <div>
                    <label htmlFor="generic-persona" className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">Persona</label>
                    <input id="generic-persona" type="text" className="mt-1 block w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2" placeholder="e.g., Marketing Expert" />
                </div>
                <div>
                    <label htmlFor="generic-task" className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">Task</label>
                    <input id="generic-task" type="text" className="mt-1 block w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2" placeholder="e.g., Create compelling email content" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="generic-context" className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">Context</label>
                    <textarea id="generic-context" rows={3} className="mt-1 block w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2" placeholder="e.g., For a product launch targeting young professionals"></textarea>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="generic-format" className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">Format</label>
                    <input id="generic-format" type="text" className="mt-1 block w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2" placeholder="e.g., Subject line + 3-paragraph email body" />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
                <Button onClick={handleGenerate} className="flex-1 min-w-fit">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Prompt
                </Button>
                <Button
                    onClick={promptCoins < 15 ? () => setShowBuyCreditsModal(true) : handleEnhancePrompt}
                    variant="secondary"
                    disabled={isEnhancing}
                    className="flex-1 min-w-fit"
                >
                    {isEnhancing ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : promptCoins < 15 ? (
                        <Crown className="mr-2 h-4 w-4" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    {promptCoins < 15 ? 'Buy PromptCoins for AI' : 'Enhance with AI'}
                </Button>
                {user && (
                    <Button onClick={handleSave} variant="outline">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                    </Button>
                )}
            </div>

            {/* Generated Prompt Display */}
            {(generatedPrompt || enhancedPrompt) && (
                <div className="space-y-4">
                    {generatedPrompt && (
                        <div className="bg-neutral-100 dark:bg-neutral-900/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200">Generated Prompt:</h3>
                                <Button
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedPrompt);
                                        toast.success('Copied to clipboard!');
                                    }}
                                    size="sm"
                                    variant="outline"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <pre className="font-mono whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-300">{generatedPrompt}</pre>
                        </div>
                    )}

                    {enhancedPrompt && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg text-purple-800 dark:text-purple-200 flex items-center">
                                    <Wand2 className="w-5 h-5 mr-2" />
                                    AI Enhanced Prompt:
                                </h3>
                                <Button
                                    onClick={() => {
                                        navigator.clipboard.writeText(enhancedPrompt);
                                        toast.success('Enhanced prompt copied!');
                                    }}
                                    size="sm"
                                    variant="outline"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <pre className="font-mono whitespace-pre-wrap text-sm text-purple-700 dark:text-purple-300">{enhancedPrompt}</pre>
                        </div>
                    )}

                    {/* Try with AI Platforms */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">🚀 Try your prompt with these AI platforms:</h3>
                        <div className="flex flex-wrap gap-2">
                            {aiPlatforms.map((platform) => (
                                <a
                                    key={platform.name}
                                    href={platform.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                        // Track affiliate click from prompt builder
                                        track('affiliate_click_builder', {
                                            platform: platform.name,
                                            source: 'prompt_builder',
                                            has_generated_prompt: !!generatedPrompt,
                                            has_enhanced_prompt: !!enhancedPrompt
                                        });
                                    }}
                                    className="inline-flex items-center px-3 py-1 bg-white dark:bg-neutral-800 border border-green-200 dark:border-green-700 rounded-full text-sm text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                                >
                                    {platform.name}
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            ))}
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            💡 All platforms have free tiers perfect for testing your prompts!
                        </p>
                    </div>

                    {/* Engagement CTAs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {/* Save & Return Strategy */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                                    Save Your Work
                                </h4>
                            </div>
                            <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                                Save this prompt to your library and create variations for different use cases.
                            </p>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={!user}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {user ? 'Save to My Prompts' : 'Login to Save'}
                            </Button>
                        </div>

                        {/* Daily Return Hook */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                                    Daily Prompt Challenge
                                </h4>
                            </div>
                            <p className="text-purple-700 dark:text-purple-300 text-sm mb-3">
                                Join our daily challenge! Get a new prompt idea delivered to your inbox every morning.
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full border-purple-300 text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                                onClick={() => {
                                    // Track newsletter signup interest
                                    track('newsletter_signup_intent', { source: 'prompt_builder' });
                                    toast.success('Feature coming soon! We\'ll notify you when it\'s ready.');
                                }}
                            >
                                <Bell className="w-4 h-4 mr-2" />
                                Subscribe to Daily Tips
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Usage Limit Reached - Engagement Strategy */}
            {promptCoins < 15 && (
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                You've used all your free AI enhancements today!
                            </h3>
                            <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
                                Don't let your creativity stop here. Choose your next step:
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Button
                                    size="sm"
                                    onClick={() => setShowBuyCreditsModal(true)}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                >
                                    <Crown className="w-4 h-4 mr-2" />
                                    Buy More PromptCoins
                                </Button>
                                
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        track('browse_templates_from_builder');
                                        window.location.href = '/templates';
                                    }}
                                    className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Browse Templates
                                </Button>
                                
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        track('tomorrow_reminder_set');
                                        toast.success(`Come back tomorrow for ${limitSettings.prompt_builder_free_daily * 15} more free PromptCoins!`);
                                    }}
                                    className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Remind Tomorrow
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
                    <BuyCreditsModal
                        isOpen={showBuyCreditsModal}
                        onClose={() => setShowBuyCreditsModal(false)}
                        type="enhancement"
                        source="prompt_builder"
                    />
                </section>
            )}
        </>
    );
}