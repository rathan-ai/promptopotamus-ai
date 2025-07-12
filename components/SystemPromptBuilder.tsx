'use client';
import { useState } from 'react';

export default function SystemPromptBuilder() {
    const [finalPrompt, setFinalPrompt] = useState('');

    const handleBuild = () => {
        const systemPrompt = (document.getElementById('system-prompt') as HTMLTextAreaElement).value;
        const userPrompt = (document.getElementById('user-prompt') as HTMLInputElement).value;
        const fullPrompt = `${systemPrompt}\n\nUser: ${userPrompt}`;
        setFinalPrompt(fullPrompt);
    };

    return (
        <section id="system-builder" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
            <h2 className="text-4xl font-bold text-primary-600 dark:text-indigo-300 mb-4">System Prompt Builder</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Design a robust prompt by separating the system instructions from the end-user query.</p>
            <div className="space-y-6">
                <div>
                    <label htmlFor="system-prompt" className="block text-sm font-medium">System Prompt (The AI's Instructions)</label>
                    <textarea id="system-prompt" rows={5} className="mt-1 block w-full rounded-lg" placeholder="e.g., You are a helpful assistant that translates English to French."></textarea>
                </div>
                <div>
                    <label htmlFor="user-prompt" className="block text-sm font-medium">End-User Prompt</label>
                    <input id="user-prompt" type="text" className="mt-1 block w-full rounded-lg" placeholder="e.g., Hello" />
                </div>
                <div className="flex justify-end">
                    <button type="button" onClick={handleBuild} className="px-6 py-3 bg-primary-600 text-white rounded-lg">Build & Copy</button>
                </div>
            </div>
            {finalPrompt && (
                <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg">Final Combined Prompt</h3>
                    <pre className="whitespace-pre-wrap text-sm mt-2">{finalPrompt}</pre>
                </div>
            )}
        </section>
    );
}