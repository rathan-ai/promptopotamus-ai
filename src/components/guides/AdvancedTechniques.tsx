import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);
export default function AdvancedTechniques() {
  const contentHtml = `
    <div class="space-y-8">
      <article class="p-6 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50">
        <h4 class="font-semibold text-lg mb-2 text-neutral-900 dark:text-white">Chain-of-Thought (CoT)</h4>
        <p class="text-neutral-600 dark:text-neutral-400 mb-4">Encourage the model to "think step-by-step" to solve complex reasoning problems.</p>
        <pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?<br /><br />A: Roger started with 5 balls. 2 cans of 3 tennis balls is 6 balls. 5 + 6 = 11. The answer is 11.</code></pre>
      </article>
      
      <article class="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/50">
        <h4 class="font-semibold text-lg mb-2 text-blue-900 dark:text-blue-200">Tree of Thoughts (ToT)</h4>
        <p class="text-blue-700 dark:text-blue-300 mb-4">Explore multiple reasoning paths simultaneously for complex problem-solving.</p>
        <pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Problem: Plan a 3-day trip to Tokyo<br /><br />Let me explore three different approaches:<br /><br />Path 1 (Culture): Day 1: Temples, Day 2: Museums, Day 3: Traditional districts<br />Path 2 (Modern): Day 1: Shibuya/Harajuku, Day 2: Tech districts, Day 3: Skyscrapers<br />Path 3 (Mixed): Day 1: Traditional morning + modern evening, Day 2: Nature + city, Day 3: Food tour<br /><br />Evaluating each path for feasibility, cost, and experience quality...</code></pre>
      </article>

      <article class="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700/50">
        <h4 class="font-semibold text-lg mb-2 text-green-900 dark:text-green-200">ReAct (Reason + Act)</h4>
        <p class="text-green-700 dark:text-green-300 mb-4">Combine reasoning with actions to solve problems that require information gathering.</p>
        <pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Question: What's the weather like in the capital of Japan?<br /><br />Thought: I need to find the capital of Japan first, then get weather information.<br />Action: The capital of Japan is Tokyo.<br />Thought: Now I need current weather data for Tokyo.<br />Action: [Search for Tokyo weather]<br />Observation: Current temperature is 22°C, partly cloudy<br />Thought: I have the information needed to answer.<br />Answer: Tokyo (Japan's capital) currently has partly cloudy weather at 22°C.</code></pre>
      </article>

      <article class="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700/50">
        <h4 class="font-semibold text-lg mb-2 text-purple-900 dark:text-purple-200">Self-Consistency</h4>
        <p class="text-purple-700 dark:text-purple-300 mb-4">Generate multiple reasoning paths and select the most consistent answer.</p>
        <pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Problem: If a store has a 20% off sale, and then applies an additional 10% discount, what's the total discount?<br /><br />Path 1: 20% + 10% = 30% total discount<br />Path 2: First 20% off $100 = $80, then 10% off $80 = $72, so 28% total discount<br />Path 3: Compound discount = 1 - (0.8 × 0.9) = 1 - 0.72 = 28% total discount<br /><br />Paths 2 and 3 agree: 28% total discount is correct.</code></pre>
      </article>

      <article class="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700/50">
        <h4 class="font-semibold text-lg mb-2 text-orange-900 dark:text-orange-200">Step-Back Prompting</h4>
        <p class="text-orange-700 dark:text-orange-300 mb-4">Ask broader questions to establish context before tackling specific problems.</p>
        <pre class="font-mono bg-neutral-900 text-white p-4 rounded-lg overflow-x-auto text-sm"><code>Specific Question: How do I optimize this React component's performance?<br /><br />Step-Back Question: What are the general principles of React performance optimization?<br /><br />General Answer: React performance is optimized through:<br />- Minimizing re-renders (React.memo, useMemo, useCallback)<br />- Code splitting and lazy loading<br />- Virtual scrolling for large lists<br />- Optimizing bundle size<br /><br />Now applying to your specific component: [specific optimization strategy]</code></pre>
      </article>
    </div>
  `;
  return (
    <Section id="advanced-techniques" title="Advanced Prompting Techniques">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}