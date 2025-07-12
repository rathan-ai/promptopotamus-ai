import React from 'react';

export default function Introduction() {
  const contentHtml = `<p className="text-gray-700 dark:text-gray-300 mb-4">A prompt is the input you provide to a Large Language Model (LLM) to get a specific output. Crafting an effective prompt involves model choice, wording, structure, and context—it’s a creative and iterative process.</p><blockquote className="border-l-4 border-primary-500 dark:border-indigo-400 pl-4 italic text-gray-600 dark:text-gray-400">Prompt engineering is the process of designing high-quality prompts that guide LLMs to produce accurate and relevant outputs.</blockquote>`;
  return (
    <section id="introduction" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-semibold mb-6">Introduction</h2>
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml.replace(/\\n/g, '<br />') }} />
    </section>
  );
}