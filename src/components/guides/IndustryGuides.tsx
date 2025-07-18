import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);
export default function IndustryGuides() {
  const contentHtml = `<p class="text-lg text-neutral-600 dark:text-neutral-300 mb-6">See how prompting can be applied in different professional fields.</p><div id="industry-education" class="mt-8"><h3 class="text-2xl font-semibold mb-4 dark:text-white">Education</h3><article class="p-6 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50"><h4 class="font-medium mb-2 text-neutral-900 dark:text-white">Design a Lesson Plan</h4><pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Act as a high school history teacher. Create a lesson plan for a 1-hour class on the main causes of World War I. The plan should include learning objectives, key terms, a 15-minute lecture outline, a 20-minute group activity, and a simple assessment question.</code></pre></article></div>`;
  return (
    <Section id="industry-guides" title="Industry-Specific Examples">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}