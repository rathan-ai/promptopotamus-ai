import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);
export default function PromptRecipes() {
  const contentHtml = `
    <div class="space-y-8">
      <p class="text-lg text-gray-600 dark:text-gray-400 mb-6">Copy-and-paste templates for common tasks. Just fill in the blanks!</p>
      
      <div class="space-y-6">
        <div class="card p-6">
          <h4 class="font-semibold text-lg text-gray-900 dark:text-white mb-3">The Quick Summarizer</h4>
          <pre class="font-mono bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Summarize the following text in [number] key bullet points. Identify the main argument, the evidence used, and the conclusion.<br /><br />[Paste text here]</code></pre>
        </div>
        
        <div class="card p-6">
          <h4 class="font-semibold text-lg text-gray-900 dark:text-white mb-3">The ELI5 (Explain Like I'm 5)</h4>
          <pre class="font-mono bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Explain the concept of [complex topic, e.g., "black holes"] to me as if I were 5 years old. Use a simple analogy.</code></pre>
        </div>
        
        <div class="card p-6">
          <h4 class="font-semibold text-lg text-gray-900 dark:text-white mb-3">The Creative Brief</h4>
          <pre class="font-mono bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>You are a [role, e.g., "marketing expert"]. Create a [deliverable] for [target audience] about [topic].<br /><br />Requirements:<br />- Tone: [formal/casual/persuasive]<br />- Length: [word count]<br />- Include: [specific elements]</code></pre>
        </div>
        
        <div class="card p-6">
          <h4 class="font-semibold text-lg text-gray-900 dark:text-white mb-3">The Problem Solver</h4>
          <pre class="font-mono bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>I'm facing this challenge: [describe problem]<br /><br />Please provide:<br />1. Three possible solutions<br />2. Pros and cons of each<br />3. Your recommended approach with reasoning</code></pre>
        </div>
        
        <div class="card p-6">
          <h4 class="font-semibold text-lg text-gray-900 dark:text-white mb-3">The Code Reviewer</h4>
          <pre class="font-mono bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Review this [language] code for:<br />- Performance issues<br />- Security vulnerabilities<br />- Best practice violations<br />- Code readability<br /><br />[paste code here]<br /><br />Provide specific suggestions for improvement.</code></pre>
        </div>
      </div>
    </div>
  `;
  return (
    <Section id="prompt-recipes" title="Prompt Recipes: Ready-to-Use Templates">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}