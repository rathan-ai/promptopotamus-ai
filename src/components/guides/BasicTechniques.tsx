import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);
export default function BasicTechniques() {
  const contentHtml = `
    <div class="space-y-6">
      <div class="grid md:grid-cols-2 gap-6">
        <article class="card p-6">
          <h4 class="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Zero-Shot Prompting</h4>
          <p class="text-gray-600 dark:text-gray-400 mb-4">The simplest form: just ask the model to perform a task with no prior examples.</p>
          <pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Classify the following movie review as POSITIVE, NEUTRAL, or NEGATIVE.<br /><br />Review: "The movie was an interesting attempt, but the plot felt underdeveloped."<br />Sentiment:</code></pre>
        </article>
        
        <article class="card p-6">
          <h4 class="font-semibold text-lg mb-2 text-gray-900 dark:text-white">One-Shot Prompting</h4>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Provide a single example to demonstrate the desired format and style.</p>
          <pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Extract the company name from the email signature.<br /><br />Example:<br />Email: "Best regards, John Smith, Senior Developer at TechCorp"<br />Company: TechCorp<br /><br />Email: "Sincerely, Sarah Johnson, Marketing Lead at InnovateLabs"<br />Company:</code></pre>
        </article>
      </div>

      <article class="card p-6">
        <h4 class="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Few-Shot Prompting</h4>
        <p class="text-gray-600 dark:text-gray-400 mb-4">Provide multiple examples (2-5) to teach the model the desired pattern and format.</p>
        <pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Translate English to French.<br /><br />sea otter => loutre de mer<br />cheese => fromage<br />beautiful => belle<br />mountain => montagne<br />- - -<br />car =></code></pre>
      </article>

      <div class="grid md:grid-cols-2 gap-6">
        <article class="card p-6">
          <h4 class="font-semibold text-lg mb-2 text-gray-900 dark:text-white">System Prompting</h4>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Set the AI's role and behavior with system-level instructions.</p>
          <pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>SYSTEM: You are a helpful customer service representative for an online bookstore. Always be polite, empathetic, and offer solutions.<br /><br />USER: I ordered a book last week but it hasn't arrived yet. I'm getting frustrated.</code></pre>
        </article>

        <article class="card p-6">
          <h4 class="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Role Prompting</h4>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Ask the AI to assume a specific role or persona for specialized responses.</p>
          <pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Act as a senior software architect. Review this code and suggest improvements:<br /><br />[CODE BLOCK]<br /><br />Focus on scalability, maintainability, and performance considerations.</code></pre>
        </article>
      </div>

      <article class="card p-6">
        <h4 class="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Contextual Prompting</h4>
        <p class="text-gray-600 dark:text-gray-400 mb-4">Provide relevant background context to help the AI understand the situation better.</p>
        <pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Context: You're helping a small startup (5 employees) choose between cloud platforms for their first web application. They have limited budget and technical expertise.<br /><br />Question: Should we use AWS, Google Cloud, or Azure for hosting our React app with a Node.js backend?</code></pre>
      </article>
    </div>
  `;
  return (
    <Section id="basic-techniques" title="Basic Prompting Techniques">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}