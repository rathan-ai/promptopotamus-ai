import React from 'react';

export default function RisksCaution() {
  const contentHtml = `<p className="text-gray-700 dark:text-gray-300 mb-4">Be mindful of common pitfalls:</p><ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300"><li><strong>Ambiguity Risk:</strong> Vague prompts yield irrelevant outputs. Be specific.</li><li><strong>Bias Caution:</strong> Avoid language that reinforces stereotypes.</li><li><strong>Overfitting Concern:</strong> Too many examples can rigidify responses.</li><li><strong>Privacy Risk:</strong> Never include sensitive data.</li><li><strong>Misinterpretation:</strong> Models may misunderstand—test thoroughly.</li></ul>`;
  return (
    <section id="risks-caution" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-semibold mb-6">Risks & Caution</h2>
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml.replace(/\\n/g, '<br />') }} />
    </section>
  );
}