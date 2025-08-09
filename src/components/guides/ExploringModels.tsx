import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);
export default function ExploringModels() {
  const contentHtml = `<p class="text-lg text-neutral-600 dark:text-neutral-300 mb-6">Techniques in this guide apply broadly, but different models have unique strengths. Explore platforms like Hugging Face (for open models) and specialized models like Llama 3.</p><div class="p-6 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50"><h4 class="font-medium mb-2 text-neutral-900 dark:text-white">Hugging Face & Llama</h4><p class="text-neutral-600 dark:text-neutral-400 mb-4">Hugging Face is a hub for finding and testing models. Llama, by Meta, is a powerful open-source model you can run locally for greater control.</p><pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Act as Llama 3, the latest open-source model from Meta. Briefly introduce yourself and highlight two of your key improvements over previous versions.</code></pre></div>`;
  return (
    <Section id="exploring-models" title="Exploring Different Models">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}