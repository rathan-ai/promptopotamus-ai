import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);
export default function AdvancedTechniques() {
  const contentHtml = `<article class="p-6 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50"><h4 class="font-semibold text-lg mb-2 text-neutral-900 dark:text-white">Chain-of-Thought (CoT)</h4><p class="text-neutral-600 dark:text-neutral-400 mb-4">Encourage the model to "think step-by-step" to solve complex reasoning problems.</p><pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?<br /><br />A: Roger started with 5 balls. 2 cans of 3 tennis balls is 6 balls. 5 + 6 = 11. The answer is 11.</code></pre></article>`;
  return (
    <Section id="advanced-techniques" title="Advanced Prompting Techniques">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}