import React from 'react';

export default function BestPractices() {
  const contentHtml = `<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300"><li><strong>Provide Examples:</strong> Use few-shot prompts to guide formatting.</li><li><strong>Design with Simplicity:</strong> Keep prompts clear and concise.</li><li><strong>Be Specific About the Output:</strong> Define structure and style.</li><li><strong>Use Instructions over Constraints:</strong> Tell the model what to do.</li><li><strong>Experiment:</strong> Vary wording, order, and examples.</li><li><strong>Document Your Attempts:</strong> Track results for iterative improvement.</li></ul>`;
  return (
    <section id="best-practices" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-semibold mb-6">Best Practices</h2>
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml.replace(/\\n/g, '<br />') }} />
    </section>
  );
}