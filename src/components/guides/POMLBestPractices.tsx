import React from 'react';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id}>
      <h2 className="text-3xl font-bold mb-6 dark:text-white">{title}</h2>
      <div className="prose dark:prose-invert text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
);

export default function POMLBestPractices() {
  const contentHtml = `
    <div class="space-y-8">
      <!-- Introduction -->
      <div class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700/50">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">POML Best Practices: Professional Prompt Engineering</h3>
        <p class="text-blue-800 dark:text-blue-300 mb-4">
          Master the art of POML with industry-proven practices that maximize prompt effectiveness, maintainability, and team collaboration.
        </p>
        <div class="bg-blue-100 dark:bg-blue-800/30 p-4 rounded-lg">
          <p class="text-gray-900 dark:text-white font-medium">
            💡 These practices are derived from Microsoft's internal testing and community feedback from hundreds of POML implementations.
          </p>
        </div>
      </div>

      <!-- Modular Design Principles -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold dark:text-white">1. Modular Design Principles</h3>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div class="p-5 card">
            <h4 class="font-semibold text-lg text-gray-900 dark:text-white mb-3">✅ Do: Atomic Components</h4>
            <pre class="font-mono bg-gray-900 text-white p-3 rounded text-sm mb-3"><code>&lt;!-- Reusable role component --&gt;
&lt;role id="data-scientist"&gt;
  You are a senior data scientist with expertise 
  in machine learning and statistical analysis
&lt;/role&gt;

&lt;!-- Reusable output format --&gt;
&lt;output-format id="executive-summary"&gt;
  Provide insights in executive summary format:
  - Key findings (3-5 bullet points)
  - Impact assessment
  - Recommended actions
&lt;/output-format&gt;</code></pre>
            <p class="text-green-800 dark:text-green-300 text-sm">Create reusable components with unique IDs for consistency across prompts.</p>
          </div>

          <div class="p-5 card p-6">
            <h4 class="font-semibold text-lg text-red-900 dark:text-red-200 mb-3">❌ Avoid: Monolithic Blocks</h4>
            <pre class="font-mono bg-gray-900 text-white p-3 rounded text-sm mb-3"><code>&lt;task&gt;
  You are a data scientist. Analyze the sales data 
  and provide insights. Focus on trends, anomalies,
  and predictions. Format as executive summary with
  bullet points and include methodology details and 
  statistical significance and confidence intervals...
&lt;/task&gt;</code></pre>
            <p class="text-red-800 dark:text-red-300 text-sm">Mixing multiple concerns in a single tag makes prompts hard to maintain and reuse.</p>
          </div>
        </div>
      </div>

      <!-- Component Organization -->
      <div class="p-6 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">2. Logical Component Organization</h3>
        
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border mb-4">
          <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Recommended Structure Order:</h4>
          <ol class="space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>1. Variables & Imports</strong> - Define reusable values</li>
            <li><strong>2. Role Definition</strong> - Establish AI personality</li>
            <li><strong>3. Context</strong> - Background information</li>
            <li><strong>4. Task</strong> - Primary objective</li>
            <li><strong>5. Instructions</strong> - Detailed methodology</li>
            <li><strong>6. Data/Examples</strong> - Supporting materials</li>
            <li><strong>7. Output Format</strong> - Response structure</li>
            <li><strong>8. Constraints</strong> - Limitations and rules</li>
          </ol>
        </div>

        <pre class="font-mono bg-gray-900 text-white p-4 rounded-lg text-sm"><code>&lt;poml&gt;
  &lt;!-- Variables --&gt;
  &lt;variable name="analysis_type" value="quarterly_review" /&gt;
  
  &lt;!-- Role --&gt;
  &lt;role expertise="business-analysis" experience="senior"&gt;
    You are a senior business analyst
  &lt;/role&gt;
  
  &lt;!-- Context --&gt;
  &lt;context&gt;
    Analyzing Q3 performance data for strategic planning
  &lt;/context&gt;
  
  &lt;!-- Task --&gt;
  &lt;task&gt;Conduct {analysis_type} performance analysis&lt;/task&gt;
  
  &lt;!-- Instructions --&gt;
  &lt;instructions&gt;
    1. Identify key performance indicators
    2. Compare against previous quarters
    3. Highlight significant trends
  &lt;/instructions&gt;
  
  &lt;!-- Data --&gt;
  &lt;table src="q3_data.csv" /&gt;
  
  &lt;!-- Output Format --&gt;
  &lt;output-format style="executive-summary" /&gt;
  
  &lt;!-- Constraints --&gt;
  &lt;constraints&gt;
    Maximum 2 pages, focus on actionable insights
  &lt;/constraints&gt;
&lt;/poml&gt;</code></pre>
      </div>

      <!-- Version Control Best Practices -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold dark:text-white">3. Version Control and Collaboration</h3>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div class="p-5 card">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">📝 Documentation Standards</h4>
            <pre class="font-mono bg-gray-900 text-white p-3 rounded text-sm mb-3"><code>&lt;poml version="2.1" author="team-ai"&gt;
  &lt;!-- 
    Purpose: Customer feedback analysis
    Last modified: 2025-01-15
    Dependencies: sentiment-model-v3
    Changelog: Added multi-language support
  --&gt;
  
  &lt;metadata&gt;
    &lt;title&gt;Customer Feedback Analyzer&lt;/title&gt;
    &lt;description&gt;
      Analyzes customer feedback for sentiment,
      topics, and actionable insights
    &lt;/description&gt;
    &lt;tags&gt;feedback, sentiment, nlp&lt;/tags&gt;
  &lt;/metadata&gt;</code></pre>
            <p class="text-blue-800 dark:text-blue-300 text-sm">Include metadata and clear documentation for team collaboration.</p>
          </div>

          <div class="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700/50">
            <h4 class="font-semibold text-emerald-900 dark:text-emerald-200 mb-3">🔄 Component Versioning</h4>
            <pre class="font-mono bg-gray-900 text-white p-3 rounded text-sm mb-3"><code>&lt;!-- Import stable components --&gt;
&lt;import src="roles/analyst-v2.poml" /&gt;
&lt;import src="formats/executive-summary-v1.poml" /&gt;

&lt;!-- Use semantic versioning --&gt;
&lt;role ref="analyst-v2"&gt;
  &lt;specialization&gt;financial-markets&lt;/specialization&gt;
&lt;/role&gt;

&lt;output-format ref="executive-summary-v1" 
               length="concise" /&gt;</code></pre>
            <p class="text-emerald-800 dark:text-emerald-300 text-sm">Reference versioned components to maintain stability across updates.</p>
          </div>
        </div>
      </div>

      <!-- Testing and Validation -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold dark:text-white">4. Testing and Validation Strategies</h3>
        
        <div class="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border">
          <h4 class="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-4">A/B Testing POML Prompts</h4>
          
          <div class="grid md:grid-cols-2 gap-4 mb-4">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h5 class="font-semibold text-gray-900 dark:text-white mb-2">Version A: Detailed Role</h5>
              <pre class="font-mono bg-gray-900 text-white p-3 rounded text-xs"><code>&lt;role expertise="marketing" experience="10-years"&gt;
  You are a senior marketing strategist with 
  extensive experience in B2B campaigns
&lt;/role&gt;</code></pre>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h5 class="font-semibold text-gray-900 dark:text-white mb-2">Version B: Concise Role</h5>
              <pre class="font-mono bg-gray-900 text-white p-3 rounded text-xs"><code>&lt;role&gt;
  You are a marketing expert
&lt;/role&gt;</code></pre>
            </div>
          </div>
          
          <div class="bg-amber-100 dark:bg-amber-800/30 p-4 rounded-lg">
            <h5 class="font-semibold text-amber-900 dark:text-amber-200 mb-2">Testing Metrics:</h5>
            <ul class="text-amber-800 dark:text-amber-300 space-y-1 text-sm">
              <li>• Response relevance and accuracy</li>
              <li>• Consistency across multiple runs</li>
              <li>• Time to generate response</li>
              <li>• User satisfaction scores</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Performance Optimization -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold dark:text-white">5. Performance Optimization</h3>
        
        <div class="grid md:grid-cols-3 gap-6">
          <div class="p-5 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-700/50">
            <h4 class="font-semibold text-cyan-900 dark:text-cyan-200 mb-3">🚀 Token Efficiency</h4>
            <ul class="text-cyan-800 dark:text-cyan-300 space-y-2 text-sm">
              <li>• Use concise, precise language</li>
              <li>• Remove redundant instructions</li>
              <li>• Leverage style attributes vs. verbose descriptions</li>
              <li>• Use refs instead of repeating content</li>
            </ul>
            <div class="mt-3 p-2 bg-cyan-100 dark:bg-cyan-800/30 rounded text-xs">
              <code>style="concise"</code> vs.<br/>
              <code>"Please be brief and to the point"</code>
            </div>
          </div>

          <div class="p-5 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-700/50">
            <h4 class="font-semibold text-rose-900 dark:text-rose-200 mb-3">⚡ Caching Strategies</h4>
            <ul class="text-rose-800 dark:text-rose-300 space-y-2 text-sm">
              <li>• Cache compiled POML templates</li>
              <li>• Reuse role and format definitions</li>
              <li>• Store frequently used examples</li>
              <li>• Implement template warming</li>
            </ul>
            <div class="mt-3 p-2 bg-rose-100 dark:bg-rose-800/30 rounded text-xs">
              Cache hit rate target: <strong>&gt;85%</strong>
            </div>
          </div>

          <div class="p-5 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-700/50">
            <h4 class="font-semibold text-violet-900 dark:text-violet-200 mb-3">📊 Monitoring</h4>
            <ul class="text-violet-800 dark:text-violet-300 space-y-2 text-sm">
              <li>• Track prompt performance metrics</li>
              <li>• Monitor token usage patterns</li>
              <li>• Alert on error rate spikes</li>
              <li>• Log successful patterns</li>
            </ul>
            <div class="mt-3 p-2 bg-violet-100 dark:bg-violet-800/30 rounded text-xs">
              SLA target: <strong>&lt;2s response time</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Common Pitfalls -->
      <div class="p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-200 dark:border-red-700/50">
        <h3 class="text-xl font-bold text-red-900 dark:text-red-200 mb-4">6. Common Pitfalls to Avoid</h3>
        
        <div class="space-y-4">
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h4 class="font-semibold text-red-700 dark:text-red-400 mb-2">🚫 Over-Engineering</h4>
            <p class="text-gray-700 dark:text-gray-300 text-sm mb-2">
              Don't create unnecessary complexity. Simple tasks don't need elaborate POML structures.
            </p>
            <div class="flex gap-4 text-xs">
              <div class="flex-1">
                <div class="font-semibold text-slate-600 dark:text-red-400 mb-1">Too Complex:</div>
                <code class="bg-gray-100 dark:bg-gray-700 p-1 rounded">15+ nested components for basic translation</code>
              </div>
              <div class="flex-1">
                <div class="font-semibold text-emerald-600 dark:text-emerald-500 mb-1">Right Size:</div>
                <code class="bg-gray-100 dark:bg-gray-700 p-1 rounded">Simple role + task + output format</code>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h4 class="font-semibold text-red-700 dark:text-red-400 mb-2">🚫 Inconsistent Naming</h4>
            <p class="text-gray-700 dark:text-gray-300 text-sm mb-2">
              Establish naming conventions and stick to them across your organization.
            </p>
            <div class="grid md:grid-cols-2 gap-4 text-xs">
              <div>
                <div class="font-semibold text-slate-600 dark:text-red-400 mb-1">Inconsistent:</div>
                <div class="space-y-1 font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <div>id="DataAnalyst"</div>
                  <div>id="content_writer"</div>
                  <div>id="Marketing-Specialist"</div>
                </div>
              </div>
              <div>
                <div class="font-semibold text-emerald-600 dark:text-emerald-500 mb-1">Consistent:</div>
                <div class="space-y-1 font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <div>id="data-analyst"</div>
                  <div>id="content-writer"</div>
                  <div>id="marketing-specialist"</div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h4 class="font-semibold text-red-700 dark:text-red-400 mb-2">🚫 Ignoring Context Length</h4>
            <p class="text-gray-700 dark:text-gray-300 text-sm">
              Monitor total prompt length including data. Large POML templates can exceed model context windows.
            </p>
            <div class="mt-2 p-2 bg-red-100 dark:bg-red-800/30 rounded text-xs">
              <strong>Best Practice:</strong> Use <code>limit</code> attributes on data sources and implement pagination for large datasets.
            </div>
          </div>
        </div>
      </div>

      <!-- Team Collaboration -->
      <div class="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700/50">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">7. Team Collaboration Excellence</h3>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold text-green-800 dark:text-green-300 mb-3">🤝 Code Review Process</h4>
            <ul class="text-emerald-700 dark:text-emerald-500 space-y-2 text-sm">
              <li>• Review POML structure and organization</li>
              <li>• Validate example quality and diversity</li>
              <li>• Check for reusable component opportunities</li>
              <li>• Ensure consistent naming conventions</li>
              <li>• Test with edge cases and error conditions</li>
            </ul>
          </div>
          
          <div>
            <h4 class="font-semibold text-green-800 dark:text-green-300 mb-3">📚 Knowledge Sharing</h4>
            <ul class="text-emerald-700 dark:text-emerald-500 space-y-2 text-sm">
              <li>• Maintain shared component library</li>
              <li>• Document successful patterns</li>
              <li>• Share performance optimization tips</li>
              <li>• Create domain-specific templates</li>
              <li>• Regular POML best practices sessions</li>
            </ul>
          </div>
        </div>
        
        <div class="mt-4 p-4 bg-green-100 dark:bg-green-800/30 rounded-lg">
          <h4 class="font-semibold text-gray-900 dark:text-white mb-2">🏆 Success Metrics</h4>
          <div class="grid md:grid-cols-3 gap-4 text-sm">
            <div class="text-center">
              <div class="text-2xl font-bold text-emerald-700 dark:text-emerald-500">40%</div>
              <div class="text-emerald-600 dark:text-emerald-600">Faster Development</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-emerald-700 dark:text-emerald-500">65%</div>
              <div class="text-emerald-600 dark:text-emerald-600">Fewer Conflicts</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-emerald-700 dark:text-emerald-500">30%</div>
              <div class="text-emerald-600 dark:text-emerald-600">Higher Productivity</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Reference -->
      <div class="p-6 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl border">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Reference Checklist</h3>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-3">Before Deployment ✅</h4>
            <ul class="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>☐ Components are atomic and reusable</li>
              <li>☐ Logical structure order maintained</li>
              <li>☐ Consistent naming conventions</li>
              <li>☐ Metadata and documentation added</li>
              <li>☐ Examples are diverse and high-quality</li>
              <li>☐ Output format is well-defined</li>
            </ul>
          </div>
          
          <div>
            <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-3">Post-Deployment 📊</h4>
            <ul class="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>☐ Performance metrics monitored</li>
              <li>☐ User feedback collected</li>
              <li>☐ A/B test results analyzed</li>
              <li>☐ Token usage optimized</li>
              <li>☐ Error rates within SLA</li>
              <li>☐ Team knowledge sharing completed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;

  return (
    <Section id="poml-best-practices" title="POML Best Practices: Professional Standards">
      <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Section>
  );
}