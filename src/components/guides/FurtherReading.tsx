import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);
export default function FurtherReading() {
  const contentHtml = `<p class="text-lg text-neutral-600 dark:text-neutral-300 mb-6">This guide builds on the work of many researchers. For a deeper dive, explore these sources.</p><ul class="list-disc list-inside space-y-3 text-neutral-700 dark:text-neutral-300"><li><a href="https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline">DeepLearning.AI - ChatGPT Prompt Engineering</a></li><li><a href="https://arxiv.org/abs/2201.11903" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline">Paper: Chain-of-Thought Prompting Elicits Reasoning in LLMs</a></li></ul>`;
  return (
    <Section id="further-reading" title="Further Reading & Sources">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}