'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2, CheckCircle, AlertTriangle, Info, ExternalLink, Crown, Lightbulb, BookOpen, TrendingUp, Users, Calendar } from 'lucide-react';
import { track } from '@vercel/analytics';
import BuyCreditsModal from './BuyCreditsModal';
import { getSettings, type LimitSettings } from '@/lib/admin-settings';

interface AnalysisResult {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    category: 'excellent' | 'good' | 'needs-improvement' | 'poor';
}

const samplePrompts = [
    "Write a blog post about AI",
    "Act as a marketing expert and create a detailed email campaign strategy for launching a new eco-friendly product line targeting environmentally conscious millennials. Include subject lines, content structure, and call-to-action suggestions.",
    "Explain quantum computing",
    "You are a senior data scientist at a Fortune 500 company. Analyze the attached customer behavior dataset and provide actionable insights for improving our e-commerce conversion rate. Focus on identifying patterns, seasonal trends, and customer segments. Present your findings in an executive summary format with specific recommendations."
];

export default function PromptAnalyzer() {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [promptCoins, setPromptCoins] = useState(50); // Will be updated from settings (50 PC = 5 analyses)
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
    const [limitSettings, setLimitSettings] = useState<LimitSettings>({
        prompt_builder_free_daily: 3,
        prompt_analyzer_free_daily: 5,
        prompt_builder_pro_daily: 25,
        prompt_analyzer_pro_daily: 50,
        prompt_builder_premium_daily: -1,
        prompt_analyzer_premium_daily: -1,
    });

    // Load limit settings from admin configuration
    useEffect(() => {
        const loadLimitSettings = async () => {
            try {
                const settings = await getSettings('limits') as LimitSettings;
                setLimitSettings(settings);
                // Update initial PromptCoins based on settings (assuming free tier for now)
                setPromptCoins(settings.prompt_analyzer_free_daily * 10); // 10 PC per analysis
            } catch (error) {
                console.error('Failed to load limit settings:', error);
                // Keep default values if loading fails
            }
        };
        
        loadLimitSettings();
    }, []);

    const analyzePrompt = (prompt: string): AnalysisResult => {
        let score = 0;
        const strengths: string[] = [];
        const weaknesses: string[] = [];
        const suggestions: string[] = [];

        // Analyze different aspects
        const hasPersona = /act as|you are|assume the role|as a/i.test(prompt);
        const hasSpecificTask = prompt.length > 20 && /create|write|analyze|develop|explain|generate/i.test(prompt);
        const hasContext = /for|targeting|in the context|considering|given/i.test(prompt);
        const hasFormat = /format|structure|in bullet|as a list|paragraph|summary/i.test(prompt);
        const hasConstraints = prompt.length > 100;
        
        // Scoring
        if (hasPersona) { score += 20; strengths.push("Clear persona/role specification"); }
        else { weaknesses.push("Missing persona or role definition"); suggestions.push("Add a persona like 'Act as a [expert type]'"); }
        
        if (hasSpecificTask) { score += 25; strengths.push("Specific task clearly defined"); }
        else { weaknesses.push("Task is too vague"); suggestions.push("Be more specific about what you want"); }
        
        if (hasContext) { score += 20; strengths.push("Good contextual information"); }
        else { weaknesses.push("Lacks sufficient context"); suggestions.push("Provide background or target audience info"); }
        
        if (hasFormat) { score += 15; strengths.push("Output format specified"); }
        else { suggestions.push("Specify desired output format (bullets, paragraphs, etc.)"); }
        
        if (hasConstraints) { score += 20; strengths.push("Detailed and comprehensive"); }
        else { weaknesses.push("Could be more detailed"); suggestions.push("Add more specific requirements or constraints"); }
        
        // Categorize
        let category: AnalysisResult['category'];
        if (score >= 80) category = 'excellent';
        else if (score >= 60) category = 'good';
        else if (score >= 40) category = 'needs-improvement';
        else category = 'poor';

        return { score, strengths, weaknesses, suggestions, category };
    };

    const handleAnalyze = async () => {
        const userPrompt = (document.getElementById('analyzer-input') as HTMLTextAreaElement).value;
        if (!userPrompt.trim()) {
            alert('Please enter a prompt to analyze');
            return;
        }
        
        if (promptCoins < 10) { // Need 10 PC for analysis
            track('prompt_analysis_limit_reached', {
                source: 'prompt_analyzer'
            });
            setShowBuyCreditsModal(true);
            return;
        }
        
        setCurrentPrompt(userPrompt);
        setIsLoading(true);
        setPromptCoins(prev => prev - 10); // Deduct 10 PC for analysis

        // Track analysis start
        track('prompt_analysis_started', {
            prompt_length: userPrompt.length,
            remaining_promptcoins: promptCoins - 10
        });

        // Simulate API delay
        setTimeout(() => {
            const result = analyzePrompt(userPrompt);
            
            // Track analysis completion with results
            track('prompt_analysis_completed', {
                score: result.score,
                category: result.category,
                strengths_count: result.strengths.length,
                suggestions_count: result.suggestions.length,
                prompt_length: userPrompt.length
            });
            
            setAnalysis(result);
            setIsLoading(false);
        }, 1500);
    };

    const tryWithAI = (platform: string, prompt: string) => {
        // Track affiliate click from analyzer
        track('affiliate_click_analyzer', {
            platform: platform,
            source: 'prompt_analyzer',
            prompt_length: prompt.length,
            analysis_score: analysis?.score || 0
        });
        
        const urls = {
            'ChatGPT': `https://chat.openai.com?ref=promptopotamus`,
            'Claude': `https://claude.ai?ref=promptopotamus`,
            'Gemini': `https://gemini.google.com?ref=promptopotamus`
        };
        navigator.clipboard.writeText(prompt);
        window.open(urls[platform as keyof typeof urls], '_blank');
    };

    const loadSamplePrompt = (prompt: string) => {
        // Track sample prompt usage
        track('sample_prompt_loaded', {
            prompt_type: prompt.length < 50 ? 'basic' : 'advanced',
            source: 'analyzer'
        });
        
        (document.getElementById('analyzer-input') as HTMLTextAreaElement).value = prompt;
        setCurrentPrompt(prompt);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-blue-600 dark:text-blue-400';
        if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'excellent': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'good': return <Info className="w-5 h-5 text-blue-500" />;
            case 'needs-improvement': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            default: return <AlertTriangle className="w-5 h-5 text-red-500" />;
        }
    };

    return (
        <section id="analyzer" className="bg-white dark:bg-neutral-800/50 p-6 md:p-8 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Prompt Analyzer</h2>
                    <p className="text-neutral-600 dark:text-neutral-300">Get AI-powered feedback on your prompts</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        PromptCoins: {promptCoins} ({Math.floor(promptCoins / 10)} analyses left)
                    </div>
                    {promptCoins < 20 && ( // Show warning when less than 2 analyses left
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

            {/* Sample Prompts */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Try these examples:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {samplePrompts.slice(0, 2).map((prompt, index) => (
                        <button
                            key={index}
                            onClick={() => loadSamplePrompt(prompt)}
                            className="text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                            {index === 0 ? "Basic example" : "Advanced example"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input */}
            <div className="space-y-4 mb-6">
                <div>
                    <label htmlFor="analyzer-input" className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-2">
                        Your Prompt to Analyze
                    </label>
                    <textarea 
                        id="analyzer-input" 
                        rows={5} 
                        className="mt-1 block w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2" 
                        placeholder="Paste your prompt here... e.g., 'Act as a marketing expert and create a comprehensive social media strategy...'"
                    />
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-xs text-neutral-500">
                        💡 Tip: Better prompts include persona, task, context, and format
                    </div>
                    <Button 
                        onClick={promptCoins < 10 ? () => setShowBuyCreditsModal(true) : handleAnalyze} 
                        disabled={isLoading}
                        className="px-6"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                Analyzing...
                            </>
                        ) : promptCoins < 10 ? (
                            <>
                                <Crown className="mr-2 h-4 w-4" />
                                Buy PromptCoins to Analyze
                            </>
                        ) : (
                            <>
                                🔬 Analyze Prompt
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Analysis Results */}
            {analysis && (
                <div className="space-y-6">
                    {/* Score */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {getCategoryIcon(analysis.category)}
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
                                        Analysis Complete
                                    </h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">
                                        {analysis.category.replace('-', ' ')} prompt quality
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                                    {analysis.score}/100
                                </div>
                                <div className="text-sm text-neutral-500">Score</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 mb-4">
                            <div 
                                className={`h-3 rounded-full transition-all duration-1000 ${
                                    analysis.score >= 80 ? 'bg-green-500' :
                                    analysis.score >= 60 ? 'bg-blue-500' :
                                    analysis.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${analysis.score}%` }}
                            />
                        </div>
                    </div>

                    {/* Detailed Feedback */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        {analysis.strengths.length > 0 && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                <h4 className="flex items-center gap-2 font-semibold text-green-800 dark:text-green-200 mb-3">
                                    <CheckCircle className="w-4 h-4" />
                                    Strengths
                                </h4>
                                <ul className="space-y-2">
                                    {analysis.strengths.map((strength, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                            {strength}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Areas for Improvement */}
                        {(analysis.weaknesses.length > 0 || analysis.suggestions.length > 0) && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                                <h4 className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-200 mb-3">
                                    <AlertTriangle className="w-4 h-4" />
                                    Improvements
                                </h4>
                                <ul className="space-y-2">
                                    {analysis.suggestions.map((suggestion, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Test with AI Platforms */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                            🚀 Test Your Prompt
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                            Ready to try your prompt? We&apos;ll copy it and open your chosen AI platform:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['ChatGPT', 'Claude', 'Gemini'].map((platform) => (
                                <button
                                    key={platform}
                                    onClick={() => tryWithAI(platform, currentPrompt)}
                                    className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-neutral-800 border border-blue-200 dark:border-blue-700 rounded-lg text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    Try with {platform}
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            💡 All platforms have free tiers - perfect for testing!
                        </p>
                    </div>

                    {/* Engagement CTAs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {/* Learn More Strategy */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">
                                    Learn Advanced Techniques
                                </h4>
                            </div>
                            <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-3">
                                Discover expert prompting strategies to consistently score 90+ on all your prompts.
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                                onClick={() => {
                                    track('learn_more_from_analyzer');
                                    document.getElementById('advanced-techniques')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Explore Advanced Guides
                            </Button>
                        </div>

                        {/* Community Strategy */}
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">
                                    Join Our Community
                                </h4>
                            </div>
                            <p className="text-emerald-700 dark:text-emerald-300 text-sm mb-3">
                                Share your prompts, get feedback, and learn from other prompt engineers.
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                                onClick={() => {
                                    track('community_interest_analyzer');
                                    toast.success('Community features coming soon! We\'ll notify you when ready.');
                                }}
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Connect with Others
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Usage Limit Reached - Engagement Strategy */}
            {promptCoins < 10 && !analysis && (
                <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Crown className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-rose-800 dark:text-rose-200 mb-2">
                                You've reached your daily analysis limit!
                            </h3>
                            <p className="text-rose-700 dark:text-rose-300 text-sm mb-4">
                                Keep improving your prompts with these options:
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Button
                                    size="sm"
                                    onClick={() => setShowBuyCreditsModal(true)}
                                    className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
                                >
                                    <Crown className="w-4 h-4 mr-2" />
                                    Get Unlimited
                                </Button>
                                
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        track('manual_analysis_from_analyzer');
                                        document.getElementById('basic-techniques')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="border-rose-300 text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    Learn Manual Analysis
                                </Button>
                                
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        track('tomorrow_reminder_analyzer');
                                        toast.success(`Come back tomorrow for ${limitSettings.prompt_analyzer_free_daily * 10} more free PromptCoins!`);
                                    }}
                                    className="border-rose-300 text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Reminder Set
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <BuyCreditsModal
                isOpen={showBuyCreditsModal}
                onClose={() => setShowBuyCreditsModal(false)}
                type="analysis"
                source="prompt_analyzer"
            />
        </section>
    );
}