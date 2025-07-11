import React from 'react';

export default function PromptRecipes() {
  const contentHtml = `<p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Here are some ready-to-use prompt templates for common tasks. Just copy, paste, and fill in the blanks!</p><div className="space-y-6"><div className="bg-white dark:bg-gray-700 p-4 rounded-lg border shadow-sm"><div className="flex justify-between items-center mb-2"><h4 className="font-semibold text-slate-900 dark:text-white">The Quick Summarizer</h4><button className="copy-btn bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-slate-300 transition">Copy</button></div><pre className="bg-slate-900 text-white p-4 rounded-lg overflow-x-auto"><code>Summarize the following text in [number] key bullet points. Identify the main argument, the evidence used, and the conclusion.\n\n[Paste text here]</code></pre></div><div className="bg-white dark:bg-gray-700 p-4 rounded-lg border shadow-sm"><div className="flex justify-between items-center mb-2"><h4 className="font-semibold text-slate-900 dark:text-white">The Simple Explainer (ELI5)</h4><button className="copy-btn bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-slate-300 transition">Copy</button></div><pre className="bg-slate-900 text-white p-4 rounded-lg overflow-x-auto"><code>Explain the concept of [complex topic, e.g., "Quantum Computing"] to me as if I were 5 years old. Use a simple analogy.</code></pre></div></div>`;
  return (
    <section id="prompt-recipes" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-semibold mb-6">Prompt Recipes</h2>
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml.replace(/\\n/g, '<br />') }} />
    </section>
  );
}