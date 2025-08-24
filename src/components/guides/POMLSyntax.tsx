import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);

export default function POMLSyntax() {
  const contentHtml = `
    <div class="space-y-8">
      <!-- Core Tags Overview -->
      <div class="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-700/50">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Core Semantic Tags</h3>
        <p class="text-purple-800 dark:text-purple-300 mb-4">
          POML provides a rich set of semantic tags to structure your prompts logically and maintainably.
        </p>
        
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Essential Structure</h4>
            <div class="font-mono text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <div>&lt;<span class="text-slate-600 dark:text-purple-400">poml</span>&gt; - Root element</div>
              <div>&lt;<span class="text-slate-600 dark:text-purple-400">role</span>&gt; - AI personality/expertise</div>
              <div>&lt;<span class="text-slate-600 dark:text-purple-400">task</span>&gt; - Primary instruction</div>
              <div>&lt;<span class="text-slate-600 dark:text-purple-400">instructions</span>&gt; - Detailed guidance</div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Enhancement Tags</h4>
            <div class="font-mono text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <div>&lt;<span class="text-blue-600 dark:text-blue-400">example</span>&gt; - Show desired output</div>
              <div>&lt;<span class="text-blue-600 dark:text-blue-400">output-format</span>&gt; - Format constraints</div>
              <div>&lt;<span class="text-blue-600 dark:text-blue-400">context</span>&gt; - Background information</div>
              <div>&lt;<span class="text-blue-600 dark:text-blue-400">constraints</span>&gt; - Limitations/rules</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Role Tag Deep Dive -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold dark:text-white">The &lt;role&gt; Tag: Setting the Foundation</h3>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div class="p-5 card">
            <h4 class="font-semibold text-lg text-gray-900 dark:text-white mb-3">Basic Role Definition</h4>
            <pre class="font-mono bg-gray-900 text-white p-4 rounded-lg text-sm mb-3"><code>&lt;role&gt;You are an experienced data scientist&lt;/role&gt;</code></pre>
            <p class="text-blue-800 dark:text-blue-300 text-sm">Simple, straightforward role assignment</p>
          </div>

          <div class="p-5 card">
            <h4 class="font-semibold text-lg text-gray-900 dark:text-white mb-3">Enhanced Role with Attributes</h4>
            <pre class="font-mono bg-gray-900 text-white p-4 rounded-lg text-sm mb-3"><code>&lt;role expertise="machine learning" tone="professional"&gt;
  You are a senior ML engineer with 10+ years 
  of experience in predictive modeling
&lt;/role&gt;</code></pre>
            <p class="text-green-800 dark:text-green-300 text-sm">Detailed role with specific attributes</p>
          </div>
        </div>

        <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700/50">
          <h4 class="font-semibold text-amber-900 dark:text-amber-200 mb-2">💡 Role Best Practices</h4>
          <ul class="text-amber-800 dark:text-amber-300 space-y-1 text-sm">
            <li>• Be specific about expertise level (junior, senior, expert)</li>
            <li>• Include relevant experience or background</li>
            <li>• Specify communication style (casual, professional, academic)</li>
            <li>• Consider the target audience for the AI's responses</li>
          </ul>
        </div>
      </div>

      <!-- Task and Instructions -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold dark:text-white">Task Definition and Instructions</h3>
        
        <div class="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border">
          <h4 class="text-lg font-semibold text-teal-900 dark:text-teal-200 mb-4">Separating Concerns: Task vs Instructions</h4>
          
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h5 class="font-semibold text-teal-800 dark:text-teal-300 mb-2">&lt;task&gt; - The "What"</h5>
              <pre class="font-mono bg-gray-900 text-white p-3 rounded text-sm mb-2"><code>&lt;task&gt;
  Analyze customer feedback and identify 
  key improvement opportunities
&lt;/task&gt;</code></pre>
              <p class="text-teal-700 dark:text-teal-400 text-sm">High-level objective or goal</p>
            </div>
            
            <div>
              <h5 class="font-semibold text-teal-800 dark:text-teal-300 mb-2">&lt;instructions&gt; - The "How"</h5>
              <pre class="font-mono bg-gray-900 text-white p-3 rounded text-sm mb-2"><code>&lt;instructions&gt;
  1. Categorize feedback by sentiment
  2. Extract specific pain points
  3. Prioritize by frequency mentioned
  4. Suggest actionable solutions
&lt;/instructions&gt;</code></pre>
              <p class="text-teal-700 dark:text-teal-400 text-sm">Step-by-step methodology</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Integration Tags -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold dark:text-white">Data Integration: Beyond Text</h3>
        
        <div class="grid md:grid-cols-3 gap-6">
          <div class="p-5 card">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Images</h4>
            <pre class="font-mono bg-gray-900 text-white p-3 rounded text-xs mb-3"><code>&lt;img 
  src="chart.png" 
  alt="Sales data visualization"
  style="detailed-analysis"
/&gt;</code></pre>
            <p class="text-orange-800 dark:text-orange-300 text-sm">Embed images with contextual styling</p>
          </div>

          <div class="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700/50">
            <h4 class="font-semibold text-emerald-900 dark:text-emerald-200 mb-3">Documents</h4>
            <pre class="font-mono bg-gray-900 text-white p-3 rounded text-xs mb-3"><code>&lt;document 
  src="report.pdf"
  pages="1-5"
  focus="executive-summary"
/&gt;</code></pre>
            <p class="text-emerald-800 dark:text-emerald-300 text-sm">Include specific document sections</p>
          </div>

          <div class="p-5 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-700/50">
            <h4 class="font-semibold text-violet-900 dark:text-violet-200 mb-3">Structured Data</h4>
            <pre class="font-mono bg-gray-900 text-white p-3 rounded text-xs mb-3"><code>&lt;table 
  src="data.csv"
  columns="name,score,category"
  limit="100"
/&gt;</code></pre>
            <p class="text-violet-800 dark:text-violet-300 text-sm">Process tabular data efficiently</p>
          </div>
        </div>
      </div>

      <!-- Examples and Output Format -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold dark:text-white">Examples and Output Formatting</h3>
        
        <div class="p-6 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl border">
          <h4 class="text-lg font-semibold text-rose-900 dark:text-rose-200 mb-4">Powerful Example Structure</h4>
          
          <pre class="font-mono bg-gray-900 text-white p-4 rounded-lg text-sm mb-4"><code>&lt;example type="few-shot"&gt;
  &lt;input&gt;Customer Review: "The app crashes every time I try to upload photos"&lt;/input&gt;
  &lt;output&gt;
    Category: Technical Issue
    Sentiment: Negative
    Priority: High
    Suggested Action: Fix photo upload bug, implement crash reporting
  &lt;/output&gt;
&lt;/example&gt;

&lt;example type="few-shot"&gt;
  &lt;input&gt;Customer Review: "Love the new dashboard design, so intuitive!"&lt;/input&gt;
  &lt;output&gt;
    Category: UI/UX Feedback
    Sentiment: Positive
    Priority: Low (continue current approach)
    Suggested Action: Document design patterns for consistency
  &lt;/output&gt;
&lt;/example&gt;</code></pre>

          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h5 class="font-semibold text-gray-900 dark:text-white mb-2">Example Types:</h5>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <span class="font-mono text-sm bg-rose-100 dark:bg-rose-800/30 px-2 py-1 rounded">type="few-shot"</span>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Multiple training examples</p>
              </div>
              <div>
                <span class="font-mono text-sm bg-rose-100 dark:bg-rose-800/30 px-2 py-1 rounded">type="demonstration"</span>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Single detailed example</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Output Format Control -->
      <div class="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border">
        <h4 class="text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-4">Precise Output Control</h4>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h5 class="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Style Attributes</h5>
            <pre class="font-mono bg-gray-900 text-white p-3 rounded text-sm mb-3"><code>&lt;output-format 
  style="bullet"
  length="concise"
  tone="professional"
&gt;
  Provide insights in bullet points,
  maximum 5 points per category
&lt;/output-format&gt;</code></pre>
          </div>
          
          <div>
            <h5 class="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Format Constraints</h5>
            <pre class="font-mono bg-gray-900 text-white p-3 rounded text-sm mb-3"><code>&lt;output-format 
  format="json"
  schema="feedback-analysis"
&gt;
  {
    "sentiment": "positive|negative|neutral",
    "category": "string",
    "priority": "high|medium|low"
  }
&lt;/output-format&gt;</code></pre>
          </div>
        </div>
      </div>

      <!-- Advanced Features -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold dark:text-white">Advanced POML Features</h3>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div class="p-5 card">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Variables and Templating</h4>
            <pre class="font-mono bg-gray-900 text-white p-3 rounded text-sm mb-3"><code>&lt;poml&gt;
  &lt;variable name="industry" value="healthcare" /&gt;
  &lt;variable name="audience" value="executives" /&gt;
  
  &lt;role&gt;
    You are a {industry} analyst speaking to {audience}
  &lt;/role&gt;
  
  &lt;task&gt;Create industry-specific insights&lt;/task&gt;
&lt;/poml&gt;</code></pre>
            <p class="text-purple-800 dark:text-purple-300 text-sm">Reusable templates with dynamic content</p>
          </div>

          <div class="p-5 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-700/50">
            <h4 class="font-semibold text-cyan-900 dark:text-cyan-200 mb-3">Conditional Logic</h4>
            <pre class="font-mono bg-gray-900 text-white p-3 rounded text-sm mb-3"><code>&lt;if condition="audience == 'technical'"&gt;
  &lt;instructions&gt;
    Include technical details and code examples
  &lt;/instructions&gt;
&lt;/if&gt;

&lt;if condition="audience == 'executive'"&gt;
  &lt;instructions&gt;
    Focus on business impact and ROI
  &lt;/instructions&gt;
&lt;/if&gt;</code></pre>
            <p class="text-cyan-800 dark:text-cyan-300 text-sm">Dynamic prompts based on conditions</p>
          </div>
        </div>
      </div>

      <!-- CSS-like Styling -->
      <div class="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700/50">
        <h3 class="text-xl font-bold text-emerald-900 dark:text-emerald-200 mb-4">CSS-like Styling System</h3>
        <p class="text-emerald-800 dark:text-emerald-300 mb-4">
          Separate content from presentation using POML's powerful styling capabilities.
        </p>
        
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h5 class="font-semibold text-gray-900 dark:text-white mb-2">Style Definitions</h5>
            <pre class="font-mono bg-gray-900 text-white p-3 rounded text-xs"><code>&lt;style&gt;
  .verbose { 
    detail-level: high;
    explanation-depth: comprehensive;
  }
  
  .concise {
    word-limit: 100;
    format: bullet-points;
  }
&lt;/style&gt;</code></pre>
          </div>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h5 class="font-semibold text-gray-900 dark:text-white mb-2">Apply Styles</h5>
            <pre class="font-mono bg-gray-900 text-white p-3 rounded text-xs"><code>&lt;output-format class="concise"&gt;
  Summarize the key findings
&lt;/output-format&gt;

&lt;example style="verbose"&gt;
  Provide detailed explanation
&lt;/example&gt;</code></pre>
          </div>
        </div>
      </div>
    </div>
  `;

  return (
    <Section id="poml-syntax" title="POML Syntax & Components: Building Structured Prompts">
      <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}