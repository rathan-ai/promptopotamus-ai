'use client';
import { useState } from 'react';

const Loader = () => <div className="loader" style={{width: '20px', height: '20px', border: '3px solid #fff', borderBottomColor: 'transparent'}}></div>;

export default function PromptBuilder() {
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const getGenericPrompt = () => {
        let p = '';
        const persona = (document.getElementById('generic-persona') as HTMLInputElement).value;
        const task = (document.getElementById('generic-task') as HTMLInputElement).value;
        const context = (document.getElementById('generic-context') as HTMLTextAreaElement).value;
        const format = (document.getElementById('generic-format') as HTMLInputElement).value;
        if (persona) p += `Act as ${persona}. `;
        if (task) p += `Your task: ${task}. `;
        if (context) p += `Context: ${context}. `;
        if (format) p += `Format: ${format}.`;
        return p.trim();
    };

    const handleGenerate = async () => {
        const prompt = getGenericPrompt();
        setGeneratedPrompt(prompt);
        setIsLoading(true);
        setAiResponse('');
        setTimeout(() => {
            setAiResponse(`This is a simulated AI response for the prompt: "' + prompt + '"`);
            setIsLoading(false);
        }, 2000);
    };

    return (
        <section id="generator" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
            <h2 className="text-4xl font-bold text-primary-600 dark:text-indigo-300 mb-4">Prompt Builder</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Craft your prompt below, then click Generate to get a response from the AI.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="generic-persona" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Persona</label>
                    <input id="generic-persona" type="text" className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/50 bg-gray-50 dark:bg-gray-700" placeholder="e.g., A witty historian" />
                </div>
                <div>
                    <label htmlFor="generic-task" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Task</label>
                    <input id="generic-task" type="text" className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/50 bg-gray-50 dark:bg-gray-700" placeholder="e.g., Explain the fall of Rome" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="generic-context" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Context</label>
                    <textarea id="generic-context" rows={4} className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/50 bg-gray-50 dark:bg-gray-700" placeholder="Background info or examples"></textarea>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="generic-format" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Format</label>
                    <input id="generic-format" type="text" className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/50 bg-gray-50 dark:bg-gray-700" placeholder="e.g., Three bullet points" />
                </div>
                <div className="md:col-span-2 flex justify-end">
                    <button type="button" onClick={handleGenerate} disabled={isLoading} className="px-6 py-3 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition disabled:opacity-50 flex items-center justify-center w-48">
                        {isLoading ? <Loader /> : '✨ Generate Response'}
                    </button>
                </div>
            </div>
            {generatedPrompt && (
                <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow">
                    <h3 className="font-semibold text-lg">Generated Prompt</h3>
                    <pre className="whitespace-pre-wrap text-sm mt-2">{generatedPrompt}</pre>
                </div>
            )}
            {aiResponse && (
                <div className="mt-8 bg-sky-50 dark:bg-sky-900/50 p-6 rounded-lg border border-sky-200 dark:border-sky-800 text-slate-700 dark:text-slate-300 space-y-4">
                    <h3 className="text-2xl font-bold">✨ AI Response</h3>
                    <p>{aiResponse}</p>
                </div>
            )}
        </section>
    );
}