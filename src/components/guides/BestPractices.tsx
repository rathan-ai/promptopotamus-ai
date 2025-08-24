import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);
export default function BestPractices() {
  const contentHtml = `
    <div class="space-y-8">
      <div class="grid md:grid-cols-2 gap-6">
        <article class="card p-6">
          <h4 class="font-semibold text-lg mb-3 text-gray-900 dark:text-white">✅ Do's</h4>
          <ul class="space-y-3 text-gray-600 dark:text-gray-400">
            <li><strong>Be Clear & Specific:</strong> Ambiguity is the enemy. Clearly state the task, context, and desired format.</li>
            <li><strong>Provide Examples:</strong> Guide the model's output structure and style with concrete examples.</li>
            <li><strong>Use Delimiters:</strong> Use markers like <code>###</code> or <code>---</code> to separate instructions from content.</li>
            <li><strong>Iterate & Test:</strong> Your first prompt is rarely your best. Refine and test systematically.</li>
            <li><strong>Specify Output Format:</strong> Be explicit about desired format (JSON, bullet points, table, etc.)</li>
          </ul>
        </article>

        <article class="card p-6">
          <h4 class="font-semibold text-lg mb-3 text-gray-900 dark:text-white">❌ Don'ts</h4>
          <ul class="space-y-3 text-gray-600 dark:text-gray-400">
            <li><strong>Don't Be Vague:</strong> Avoid unclear instructions like "make it better" or "analyze this".</li>
            <li><strong>Don't Overload:</strong> Don't cram multiple unrelated tasks into one prompt.</li>
            <li><strong>Don't Assume Context:</strong> The model doesn't remember previous conversations unless provided.</li>
            <li><strong>Don't Skip Testing:</strong> Always test prompts with different inputs to ensure consistency.</li>
            <li><strong>Don't Ignore Bias:</strong> Be aware of potential biases in model responses.</li>
          </ul>
        </article>
      </div>

      <article class="card p-6">
        <h4 class="font-semibold text-lg mb-3 text-gray-900 dark:text-white">🔧 Advanced Optimization Techniques</h4>
        <div class="grid md:grid-cols-2 gap-6 mt-4">
          <div>
            <h5 class="font-medium mb-2 text-gray-700 dark:text-gray-300">Temperature Control</h5>
            <p class="text-gray-600 dark:text-gray-400 text-sm">Lower temperature (0.1-0.3) for factual tasks, higher (0.7-0.9) for creative work.</p>
          </div>
          <div>
            <h5 class="font-medium mb-2 text-gray-700 dark:text-gray-300">Token Management</h5>
            <p class="text-gray-600 dark:text-gray-400 text-sm">Keep prompts concise but complete. Balance detail with efficiency.</p>
          </div>
          <div>
            <h5 class="font-medium mb-2 text-gray-700 dark:text-gray-300">Prompt Chaining</h5>
            <p class="text-gray-600 dark:text-gray-400 text-sm">Break complex tasks into sequential prompts for better accuracy.</p>
          </div>
          <div>
            <h5 class="font-medium mb-2 text-gray-700 dark:text-gray-300">Error Handling</h5>
            <p class="text-gray-600 dark:text-gray-400 text-sm">Include instructions for handling edge cases and uncertain scenarios.</p>
          </div>
        </div>
      </article>

      <article class="card p-6">
        <h4 class="font-semibold text-lg mb-3 text-gray-900 dark:text-white">📊 Evaluation & Testing Framework</h4>
        <div class="space-y-4">
          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <h5 class="font-medium mb-2 text-gray-700 dark:text-gray-300">Accuracy</h5>
              <p class="text-gray-600 dark:text-gray-400 text-sm">Does the output correctly answer the question or complete the task?</p>
            </div>
            <div>
              <h5 class="font-medium mb-2 text-gray-700 dark:text-gray-300">Consistency</h5>
              <p class="text-gray-600 dark:text-gray-400 text-sm">Does the model produce similar outputs for similar inputs?</p>
            </div>
            <div>
              <h5 class="font-medium mb-2 text-gray-700 dark:text-gray-300">Relevance</h5>
              <p class="text-gray-600 dark:text-gray-400 text-sm">Is the response directly related to the prompt and context?</p>
            </div>
          </div>
          <div class="bg-gray-100 dark:bg-gray-800/40 p-4 rounded-lg">
            <p class="text-gray-700 dark:text-gray-300 text-sm">
              <strong>Pro Tip:</strong> Create a test suite with diverse inputs to validate your prompts across different scenarios and edge cases.
            </p>
          </div>
        </div>
      </article>

      <article class="card p-6">
        <h4 class="font-semibold text-lg mb-3 text-gray-900 dark:text-white">🚨 Common Pitfalls to Avoid</h4>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <h5 class="font-medium mb-2 text-gray-700 dark:text-gray-300">Leading Questions</h5>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">❌ "Isn't Python the best programming language for AI?"</p>
            <p class="text-gray-600 dark:text-gray-400 text-sm">✅ "Compare Python, R, and Julia for AI development."</p>
          </div>
          <div>
            <h5 class="font-medium mb-2 text-gray-700 dark:text-gray-300">Instruction Conflicts</h5>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">❌ "Be brief but provide detailed explanations."</p>
            <p class="text-gray-600 dark:text-gray-400 text-sm">✅ "Provide a summary followed by detailed explanation."</p>
          </div>
          <div>
            <h5 class="font-medium mb-2 text-gray-700 dark:text-gray-300">Prompt Injection</h5>
            <p class="text-gray-600 dark:text-gray-400 text-sm">Be aware of user inputs that might override your instructions.</p>
          </div>
          <div>
            <h5 class="font-medium mb-2 text-gray-700 dark:text-gray-300">Context Window Limits</h5>
            <p class="text-gray-600 dark:text-gray-400 text-sm">Monitor token usage to avoid truncated responses.</p>
          </div>
        </div>
      </article>
    </div>
  `;
  return (
    <Section id="best-practices" title="Best Practices & Guidelines">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}