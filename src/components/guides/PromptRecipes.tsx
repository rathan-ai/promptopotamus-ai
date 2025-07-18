import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);
export default function PromptRecipes() {
  const contentHtml = `<p class="text-lg text-neutral-600 dark:text-neutral-300 mb-6">Copy-and-paste templates for common tasks. Just fill in the blanks!</p><div class="space-y-6"><div class="bg-white dark:bg-neutral-800/50 p-4 rounded-lg border dark:border-neutral-700 "><h4 class="font-semibold text-neutral-900 dark:text-white">The Quick Summarizer</h4><pre class="mt-2 font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto"><code>Summarize the following text in [number] key bullet points. Identify the main argument, the evidence used, and the conclusion.<br /><br />[Paste text here]</code></pre></div><div class="bg-white dark:bg-neutral-800/50 p-4 rounded-lg border dark:border-neutral-700"><h4 class="font-semibold text-neutral-900 dark:text-white">The ELI5 (Explain Like I'm 5)</h4><pre class="mt-2 font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto"><code>Explain the concept of [complex topic, e.g., "black holes"] to me as if I were 5 years old. Use a simple analogy.</code></pre></div></div>`;
  return (
    <Section id="prompt-recipes" title="Prompt Recipes">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}