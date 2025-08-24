import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);

export default function POMLFundamentals() {
  const contentHtml = `
    <div class="space-y-8">
      <!-- Introduction -->
      <div class="card p-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">What is POML?</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          <strong>POML (Prompt Orchestration Markup Language)</strong> is Microsoft's revolutionary approach to structured prompt engineering. 
          It brings the power of markup languages like HTML to AI prompting, making prompts more organized, maintainable, and powerful.
        </p>
        <div class="bg-gray-100 dark:bg-gray-800/30 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Key Benefits:</h4>
          <ul class="text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>40% higher efficiency</strong> in crafting complex prompts</li>
            <li>• <strong>65% reduction</strong> in version control conflicts</li>
            <li>• <strong>30% boost</strong> in team productivity</li>
            <li>• Improved maintainability and reusability</li>
          </ul>
        </div>
      </div>

      <!-- Traditional vs POML -->
      <div class="grid md:grid-cols-2 gap-6">
        <div class="card p-6">
          <h4 class="font-semibold text-lg mb-3 text-gray-900 dark:text-white">❌ Traditional Prompting</h4>
          <pre class="font-mono bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>You are a helpful teacher. Explain photosynthesis to a 10-year-old using simple language. Keep it under 100 words and make it engaging. Use the attached diagram if helpful.</code></pre>
          <div class="mt-3 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Problems:</strong></p>
            <ul class="list-disc list-inside space-y-1">
              <li>Hard to parse and modify</li>
              <li>No structure or organization</li>
              <li>Difficult to reuse components</li>
              <li>Version control challenges</li>
            </ul>
          </div>
        </div>

        <div class="p-6 card">
          <h4 class="font-semibold text-lg mb-3 text-gray-900 dark:text-white">✅ POML Structured</h4>
          <pre class="font-mono bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>&lt;poml&gt;
  &lt;role&gt;You are a patient teacher explaining concepts to a 10-year-old.&lt;/role&gt;
  &lt;task&gt;Explain photosynthesis using the provided image.&lt;/task&gt;
  &lt;img src="photosynthesis_diagram.png" alt="Diagram of photosynthesis"/&gt;
  &lt;output-format&gt;
    Start with "Hey there, future scientist!" and keep under 100 words.
  &lt;/output-format&gt;
&lt;/poml&gt;</code></pre>
          <div class="mt-3 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Benefits:</strong></p>
            <ul class="list-disc list-inside space-y-1">
              <li>Clear semantic structure</li>
              <li>Easy to modify components</li>
              <li>Reusable and modular</li>
              <li>Version control friendly</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Core Concepts -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold dark:text-white">Core POML Concepts</h3>
        
        <div class="grid md:grid-cols-3 gap-6">
          <div class="p-5 card">
            <h4 class="font-semibold text-lg text-gray-900 dark:text-white mb-3">Semantic Tags</h4>
            <p class="text-gray-600 dark:text-gray-400 mb-3">Structure your prompts with meaningful components:</p>
            <div class="font-mono text-sm space-y-1">
              <div>&lt;<span class="text-gray-700 dark:text-gray-300">role</span>&gt; - Define AI's personality</div>
              <div>&lt;<span class="text-gray-700 dark:text-gray-300">task</span>&gt; - Specify what to do</div>
              <div>&lt;<span class="text-gray-700 dark:text-gray-300">example</span>&gt; - Provide demonstrations</div>
              <div>&lt;<span class="text-gray-700 dark:text-gray-300">output-format</span>&gt; - Set constraints</div>
            </div>
          </div>

          <div class="p-5 card">
            <h4 class="font-semibold text-lg text-gray-900 dark:text-white mb-3">Data Integration</h4>
            <p class="text-gray-600 dark:text-gray-400 mb-3">Embed various data types seamlessly:</p>
            <div class="font-mono text-sm space-y-1">
              <div>&lt;<span class="text-gray-700 dark:text-gray-300">img</span>&gt; - Images</div>
              <div>&lt;<span class="text-gray-700 dark:text-gray-300">document</span>&gt; - Text files</div>
              <div>&lt;<span class="text-gray-700 dark:text-gray-300">table</span>&gt; - Structured data</div>
              <div>&lt;<span class="text-gray-700 dark:text-gray-300">csv</span>&gt; - CSV data</div>
            </div>
          </div>

          <div class="card p-5">
            <h4 class="font-semibold text-lg text-gray-900 dark:text-white mb-3">Styling System</h4>
            <p class="text-gray-600 dark:text-gray-400 mb-3">Control presentation with CSS-like styling:</p>
            <div class="font-mono text-sm space-y-1">
              <div><span class="text-gray-700 dark:text-gray-300">style</span>="verbose"</div>
              <div><span class="text-gray-700 dark:text-gray-300">style</span>="bullet"</div>
              <div><span class="text-gray-700 dark:text-gray-300">format</span>="json"</div>
              <div><span class="text-gray-700 dark:text-gray-300">length</span>="short"</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Basic Example -->
      <div class="card p-6">
        <h3 class="text-xl font-bold dark:text-white mb-4">Your First POML Prompt</h3>
        <p class="text-gray-700 dark:text-gray-300 mb-4">
          Here's a complete example showing how to structure a content creation prompt:
        </p>
        
        <pre class="font-mono bg-gray-900 text-white p-6 rounded-lg overflow-x-auto text-sm mb-4"><code>&lt;poml&gt;
  &lt;role&gt;You are a creative content writer specializing in engaging blog posts.&lt;/role&gt;
  
  &lt;task&gt;
    Write a compelling blog post introduction about sustainable living tips
    that will hook readers and encourage them to continue reading.
  &lt;/task&gt;
  
  &lt;example&gt;
    &lt;input&gt;Topic: Zero waste lifestyle&lt;/input&gt;
    &lt;output&gt;
      Did you know that the average person generates 4.5 pounds of waste every single day? 
      That's over 1,600 pounds per year! But what if I told you that you could cut that 
      number by 90% without sacrificing comfort or convenience?
    &lt;/output&gt;
  &lt;/example&gt;
  
  &lt;output-format length="short"&gt;
    - Start with a surprising statistic or question
    - Keep under 150 words
    - End with a hook that promises value
    - Use conversational tone
  &lt;/output-format&gt;
&lt;/poml&gt;</code></pre>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Why This Structure Works:</h4>
          <ul class="text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>🎭 Clear Role:</strong> Establishes the AI's expertise and writing style</li>
            <li><strong>🎯 Focused Task:</strong> Specific, actionable instruction</li>
            <li><strong>📝 Concrete Example:</strong> Shows exactly what good output looks like</li>
            <li><strong>📏 Output Constraints:</strong> Sets boundaries and expectations</li>
          </ul>
        </div>
      </div>

      <!-- Getting Started -->
      <div class="card p-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Ready to Get Started?</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          POML transforms how you think about prompt engineering. Instead of crafting monolithic text blocks, 
          you build modular, maintainable prompt architectures.
        </p>
        
        <div class="bg-gray-100 dark:bg-gray-800/30 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Next Steps:</h4>
          <ol class="text-gray-600 dark:text-gray-400 space-y-1">
            <li>1. 📖 Learn POML syntax and components</li>
            <li>2. 🛠️ Try our POML-enabled Prompt Builder</li>
            <li>3. 📋 Browse POML templates in our library</li>
            <li>4. 🏆 Earn your POML certification</li>
          </ol>
        </div>
      </div>
    </div>
  `;

  return (
    <Section id="poml-fundamentals" title="POML Fundamentals: The Future of Prompt Engineering">
      <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}