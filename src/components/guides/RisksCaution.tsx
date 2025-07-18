import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);
export default function RisksCaution() {
  const contentHtml = `<p class="text-neutral-700 dark:text-neutral-300 mb-4">Be mindful of common pitfalls:</p><ul class="list-disc list-inside space-y-3 text-neutral-700 dark:text-neutral-300"><li><strong>Bias:</strong> Models can reflect biases from their training data. Scrutinize outputs.</li><li><strong>Hallucination:</strong> Models can invent facts. Always verify critical information.</li><li><strong>Privacy:</strong> Never include sensitive personal or corporate data in your prompts.</li></ul>`;
  return (
    <Section id="risks-caution" title="Risks & Caution">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}