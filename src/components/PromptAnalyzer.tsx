'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

export default function PromptAnalyzer() {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        const userPrompt = (document.getElementById('analyzer-input') as HTMLTextAreaElement).value;
        if (!userPrompt) return;
        
        setIsLoading(true);
        setAnalysis('');

        // This simulates an API call to an AI for analysis.
        setTimeout(() => {
            const feedback = "### Analysis Complete:\\n- **Clarity**: The prompt is a bit vague. Consider specifying the target audience.\\n- **Specificity**: Good use of a direct question, but could define the desired format (e.g., 'in bullet points').\\n- **Suggestion**: Try adding a persona, like 'Act as a career coach...' to get a more tailored response.";
            setAnalysis(feedback);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <section id="analyzer" className="bg-white dark:bg-neutral-800/50 p-6 md:p-8 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Prompt Analyzer</h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">Get feedback on your prompt to improve its effectiveness. (This is a simulation).</p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="analyzer-input" className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">Your Prompt</label>
                    <textarea id="analyzer-input" rows={4} className="mt-1 block w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2" placeholder="e.g., How can I improve my resume?"></textarea>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleAnalyze} disabled={isLoading} className="w-48">
                        {isLoading ? <Loader2 className="animate-spin" /> : '🔬 Analyze Prompt'}
                    </Button>
                </div>
            </div>
            {analysis && (
                <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800/50">
                    <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200">💡 Analysis & Suggestions</h3>
                    <pre className="mt-2 font-mono whitespace-pre-wrap text-sm text-indigo-700 dark:text-indigo-300">{analysis}</pre>
                </div>
            )}
        </section>
    );
}