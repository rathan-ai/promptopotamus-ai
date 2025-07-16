import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);
export default function BestPractices() {
  const contentHtml = `<ul class="list-disc list-inside space-y-3 text-neutral-700 dark:text-neutral-300"><li><strong>Be Clear & Specific:</strong> Ambiguity is the enemy. Clearly state the task, context, and desired format.</li><li><strong>Provide Examples (Few-Shot):</strong> Guide the model's output structure and style with examples.</li><li><strong>Assign a Persona:</strong> Tell the model who to be (e.g., "Act as a NASA astrophysicist").</li><li><strong>Use Delimiters:</strong> Use markers like <code>###</code> or <code>---</code> to separate instructions from content.</li><li><strong>Iterate:</strong> Your first prompt is rarely your best. Refine and test your prompts.</li></ul>`;
  return (
    <Section id="best-practices" title="Best Practices">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}