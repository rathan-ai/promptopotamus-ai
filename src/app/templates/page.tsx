import type { Metadata } from 'next';
import { aiTemplates } from '@/lib/data';
import TemplateCard from '@/components/TemplateCard';

export const metadata: Metadata = {
  title: 'AI Templates & Prompt Packs',
  description: 'Browse our library of ready-to-use AI templates for business, productivity, and more.',
};

export default function TemplatesPage() {
  const groupedTemplates: Record<string, typeof aiTemplates> = {};

  aiTemplates.forEach(template => {
    if (!groupedTemplates[template.category]) {
      groupedTemplates[template.category] = [];
    }
    groupedTemplates[template.category].push(template);
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold dark:text-white">AI Templates & Prompt Packs</h1>
        <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">A library of powerful, ready-to-use prompts to supercharge your workflow.</p>
      </div>

      <div className="space-y-12">
        {Object.entries(groupedTemplates).map(([category, templates]) => (
          <section key={category}>
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-neutral-300 dark:border-neutral-700 dark:text-white">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <TemplateCard key={template.id} title={template.title} prompt={template.prompt} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}