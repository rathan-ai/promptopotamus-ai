import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);
export default function BasicTechniques() {
  const contentHtml = `<div class="grid md:grid-cols-2 gap-6"><article class="p-6 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50"><h4 class="font-semibold text-lg mb-2 text-neutral-900 dark:text-white">Zero-Shot Prompting</h4><p class="text-neutral-600 dark:text-neutral-400 mb-4">The simplest form: just ask the model to perform a task with no prior examples.</p><pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Classify the following movie review as POSITIVE, NEUTRAL, or NEGATIVE.<br /><br />Review: "The movie was an interesting attempt, but the plot felt underdeveloped."<br />Sentiment:</code></pre></article><article class="p-6 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50"><h4 class="font-semibold text-lg mb-2 text-neutral-900 dark:text-white">Few-Shot Prompting</h4><p class="text-neutral-600 dark:text-neutral-400 mb-4">Provide a few examples (shots) to teach the model the desired pattern and format.</p><pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Translate English to French.<br /><br />sea otter => loutre de mer<br />cheese => fromage<br />- - -<br />car =></code></pre></article></div>`;
  return (
    <Section id="basic-techniques" title="Basic Prompting Techniques">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}