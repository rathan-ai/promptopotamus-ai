import React from 'react';

export default function AdvancedTechniques() {
  const contentHtml = `<div className="space-y-6"><article className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Chain-of-Thought (CoT) Prompting</h4><p className="text-gray-600 dark:text-gray-400 mb-4">Encourage the model to think step-by-step for complex reasoning tasks.</p><pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm"><code>When I was 3 years old, my partner was 3 times my age. Now, I am 20 years old. How old is my partner? Let's think step by step.</code></pre></article><article className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Step-back Prompting</h4><p className="text-gray-600 dark:text-gray-400 mb-4">Prompt the LLM to first consider a general question related to the specific task, then feed that answer into a subsequent prompt.</p></article><article className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Self-Consistency</h4><p className="text-gray-600 dark:text-gray-400 mb-4">Run the same prompt multiple times to generate diverse reasoning paths, then choose the most common answer.</p></article></div>`;
  return (
    <section id="advanced-techniques" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-semibold mb-6">Advanced Prompting Techniques</h2>
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml.replace(/\\n/g, '<br />') }} />
    </section>
  );
}