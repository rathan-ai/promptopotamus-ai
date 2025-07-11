import React from 'react';

export default function FurtherReading() {
  const contentHtml = `<p className="text-lg text-gray-600 dark:text-gray-300 mb-6">This guide was built upon the work of many researchers and practitioners. For a deeper dive, we recommend exploring the original sources.</p><ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-gray-300"><li><a href="https://cloud.google.com/vertex-ai/docs/generative-ai/learn/prompts/introduction-prompt-design" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-indigo-400 hover:underline">Google Cloud - Introduction to Prompting</a></li><li><a href="https://arxiv.org/abs/2201.11903" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-indigo-400 hover:underline">Chain-of-Thought Prompting Elicits Reasoning in Large Language Models</a></li></ul>`;
  return (
    <section id="further-reading" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-semibold mb-6">Further Reading & Sources</h2>
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml.replace(/\\n/g, '<br />') }} />
    </section>
  );
}