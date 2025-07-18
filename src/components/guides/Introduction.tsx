import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);
export default function Introduction() {
  const contentHtml = `<p class="text-lg text-neutral-700 dark:text-neutral-300 mb-4">A prompt is your instruction to a Large Language Model (LLM). Effective prompting is the art and science of crafting these instructions to get precise, relevant, and creative results. It’s an iterative process that blends clarity, context, and clever design.</p><blockquote class="border-l-4 border-indigo-500 pl-4 italic text-neutral-600 dark:text-neutral-400">Prompt engineering is the key that unlocks the full potential of AI. It’s how we turn a general-purpose model into a specialized expert for any task.</blockquote>`;
  return (
    <Section id="introduction" title="Welcome to Promptopotamus">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}