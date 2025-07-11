'use client';
import { useState } from 'react';

const Loader = () => <span className="loader"></span>;

export default function PromptAnalyzer() {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        const userPrompt = (document.getElementById('analyzer-input') as HTMLTextAreaElement).value;
        if (!userPrompt) return;

        setIsLoading(true);
        setAnalysis('');

        // NOTE: This is a placeholder for the actual API call.
        setTimeout(() => {
            setAnalysis(`This is a simulated analysis for the prompt: "${userPrompt}"`);
            setIsLoading(false);
        }, 2000);
    };

    return (
        <section id="analyzer" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
            <h2 className="text-4xl font-bold text-primary-600 dark:text-indigo-300 mb-4">Prompt Analyzer</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Paste your prompt below to get AI-powered feedback and suggestions for improvement.</p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="analyzer-input" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Your Prompt</label>
                    <textarea id="analyzer-input" rows={5} className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/50 bg-gray-50 dark:bg-gray-700" placeholder="e.g., Tell me about space."></textarea>
                </div>
                <div className="flex justify-end">
                    <button type="button" onClick={handleAnalyze} disabled={isLoading} className="px-6 py-3 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition disabled:opacity-50">
                        {isLoading ? <Loader /> : '🔬 Analyze Prompt'}
                    </button>
                </div>
            </div>
            {analysis && (
                <div className="mt-8 bg-sky-50 dark:bg-sky-900/50 p-6 rounded-lg border border-sky-200 dark:border-sky-800 text-slate-700 dark:text-slate-300 space-y-4">
                    <h3 className="text-2xl font-bold">💡 AI Analysis & Suggestions</h3>
                    <p className="whitespace-pre-wrap">{analysis}</p>
                </div>
            )}
        </section>
    );
}