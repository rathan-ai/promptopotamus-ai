import React from 'react';
import Link from 'next/link';
import { Brain, Award, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);

export default function Introduction() {
  const contentHtml = `
    <p class="text-lg text-neutral-700 dark:text-neutral-300 mb-4">
      A prompt is your instruction to a Large Language Model (LLM). Effective prompting is the art and science of crafting these instructions to get precise, relevant, and creative results. It's an iterative process that blends clarity, context, and clever design.
    </p>
    <blockquote class="border-l-4 border-indigo-500 pl-4 italic text-neutral-600 dark:text-neutral-400 mb-6">
      Prompt engineering is the key that unlocks the full potential of AI. It's how we turn a general-purpose model into a specialized expert for any task.
    </blockquote>
  `;

  return (
    <Section id="introduction" title="Welcome to Promptopotamus">
      <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      
      {/* Enhanced CTA Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Ready to Transform Your AI Experience?
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-2xl mx-auto">
            Discover professionally crafted Smart Prompts from certified creators, or learn to build your own with our comprehensive guides and tools.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/smart-prompts">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Brain className="w-4 h-4 mr-2" />
                Explore Smart Prompts
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Link href="/certificates">
              <Button variant="outline" className="border-blue-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <Award className="w-4 h-4 mr-2" />
                Get Certified
              </Button>
            </Link>
          </div>

          <div className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            Join thousands of professionals enhancing their AI workflows
          </div>
        </div>
      </div>
    </Section>
  );
}