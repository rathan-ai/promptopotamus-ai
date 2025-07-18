'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Save } from 'lucide-react';

export default function PromptBuilder() {
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
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
            setGeneratedPrompt(finalPrompt);
            navigator.clipboard.writeText(finalPrompt);
            toast.success('Prompt copied to clipboard!');
        } else {
            toast.error('Please fill out at least one field to generate a prompt.');
        }
    };

    const handleSave = async () => {
        const title = (document.getElementById('prompt-title') as HTMLInputElement)?.value;
        const task = (document.getElementById('generic-task') as HTMLInputElement)?.value;
        const finalPrompt = buildPromptText();

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
            toast.success(data.message);
        } else {
            toast.error(data.error);
        }
    };

    return (
        <section id="generator" className="bg-white dark:bg-neutral-800/50 p-6 md:p-8 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Interactive Prompt Builder</h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">Construct a detailed prompt. Log in to save your creations to your dashboard.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label htmlFor="prompt-title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">Title (Optional)</label>
                    <input id="prompt-title" type="text" className="mt-1 block w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2" placeholder="e.g., My History Lesson Plan Prompt" />
                </div>
                <div>
                    <label htmlFor="generic-persona" className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">Persona</label>
                    <input id="generic-persona" type="text" className="mt-1 block w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2" placeholder="e.g., A witty historian" />
                </div>
                <div>
                    <label htmlFor="generic-task" className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">Task</label>
                    <input id="generic-task" type="text" className="mt-1 block w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2" placeholder="e.g., Explain the fall of Rome" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="generic-context" className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">Context</label>
                    <textarea id="generic-context" rows={3} className="mt-1 block w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2" placeholder="e.g., For an audience of high-school students."></textarea>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="generic-format" className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">Format</label>
                    <input id="generic-format" type="text" className="mt-1 block w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2" placeholder="e.g., A three-paragraph summary" />
                </div>
            </div>

            {generatedPrompt && (
                <div className="mt-6 bg-neutral-100 dark:bg-neutral-900/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200">Generated Prompt:</h3>
                    <pre className="font-mono whitespace-pre-wrap text-sm mt-2 text-neutral-600 dark:text-neutral-300">{generatedPrompt}</pre>
                </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
                {user && (
                    <Button onClick={handleSave} variant="secondary">
                        <Save className="mr-2 h-4 w-4" /> Save Prompt
                    </Button>
                )}
                <Button onClick={handleGenerate}>
                    ✨ Generate & Copy Prompt
                </Button>
            </div>
        </section>
    );
}