'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Code2, CheckCircle, AlertCircle, XCircle, BarChart3, Lightbulb, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface AnalysisResult {
  score: number;
  structure: {
    hasRole: boolean;
    hasTask: boolean;
    hasInstructions: boolean;
    hasOutputFormat: boolean;
    hasExamples: boolean;
    hasConstraints: boolean;
  };
  issues: string[];
  suggestions: string[];
  complexity: 'Basic' | 'Intermediate' | 'Advanced';
  completeness: number;
}

export default function POMLAnalyzer() {
  const [pomlContent, setPomlContent] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePOML = () => {
    if (!pomlContent.trim()) {
      toast.error('Please enter POML content to analyze');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const result = performAnalysis(pomlContent);
      setAnalysis(result);
      setIsAnalyzing(false);
      toast.success('POML analysis completed!');
    }, 1500);
  };

  const performAnalysis = (content: string): AnalysisResult => {
    const structure = {
      hasRole: /<role\s[^>]*>/.test(content),
      hasTask: /<task\s*>/.test(content),
      hasInstructions: /<instructions\s*>/.test(content),
      hasOutputFormat: /<output-format\s[^>]*>/.test(content),
      hasExamples: /<example\s[^>]*>/.test(content),
      hasConstraints: /<constraints\s*>/.test(content)
    };

    const structureCount = Object.values(structure).filter(Boolean).length;
    const completeness = Math.round((structureCount / 6) * 100);
    
    let score = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Core structure scoring
    if (structure.hasRole) score += 25;
    else issues.push('Missing <role> definition');
    
    if (structure.hasTask) score += 25;
    else issues.push('Missing <task> specification');
    
    if (structure.hasOutputFormat) score += 20;
    else suggestions.push('Add <output-format> for better response structure');
    
    if (structure.hasInstructions) score += 15;
    else suggestions.push('Include <instructions> for clearer guidance');
    
    if (structure.hasExamples) score += 10;
    else suggestions.push('Add <example> tags to improve understanding');
    
    if (structure.hasConstraints) score += 5;
    else suggestions.push('Consider adding <constraints> for boundary setting');

    // Attribute analysis
    const roleAttributes = (content.match(/<role\s[^>]*>/g) || [])[0];
    if (roleAttributes) {
      if (!roleAttributes.includes('expertise=')) {
        suggestions.push('Add expertise attribute to <role> for better context');
        score -= 3;
      }
      if (!roleAttributes.includes('tone=')) {
        suggestions.push('Specify tone attribute in <role> for consistent voice');
        score -= 2;
      }
    }

    const outputFormatAttributes = (content.match(/<output-format\s[^>]*>/g) || [])[0];
    if (outputFormatAttributes) {
      if (!outputFormatAttributes.includes('style=')) {
        suggestions.push('Add style attribute to <output-format>');
        score -= 2;
      }
    }

    // Content quality checks
    const taskContent = content.match(/<task\s*>([\s\S]*?)<\/task>/)?.[1]?.trim();
    if (taskContent && taskContent.length < 20) {
      issues.push('Task description is too brief');
      score -= 5;
    }

    // Complexity determination
    let complexity: 'Basic' | 'Intermediate' | 'Advanced' = 'Basic';
    if (structureCount >= 4 && structure.hasExamples) complexity = 'Intermediate';
    if (structureCount >= 5 && structure.hasConstraints && structure.hasExamples) complexity = 'Advanced';

    return {
      score: Math.max(0, Math.min(100, score)),
      structure,
      issues,
      suggestions,
      complexity,
      completeness
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-500';
    if (score >= 60) return 'text-yellow-600 dark:text-slate-400';
    return 'text-slate-600 dark:text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const samplePOML = `<poml>
  <role expertise="marketing" tone="professional" experience="senior">
    You are a senior marketing strategist with expertise in digital campaigns
  </role>
  
  <task>
    Create a comprehensive social media strategy for a new SaaS product launch
  </task>
  
  <instructions>
    1. Analyze target audience demographics
    2. Identify key social media platforms
    3. Develop content themes and posting schedule
    4. Create engagement strategies
    5. Define success metrics and KPIs
  </instructions>
  
  <example type="demonstration">
    <input>B2B productivity tool</input>
    <output>LinkedIn focus, thought leadership content, 3x weekly posts</output>
  </example>
  
  <constraints>
    - Budget limit: $10,000/month
    - Timeline: 3-month campaign
    - Brand voice: Professional yet approachable
  </constraints>
  
  <output-format style="structured" length="comprehensive">
    ## Strategy Overview
    - Platform selection with rationale
    - Content calendar template
    - Engagement tactics
    - Performance metrics
  </output-format>
</poml>`;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title flex items-center">
          <Code2 className="w-5 h-5 mr-2" />
          POML Analyzer
        </h2>
        <p className="card-description">
          Analyze your POML prompts for structure, completeness, and best practices compliance
        </p>
      </div>
      
      <div className="card-content space-y-6">
        {/* Input Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="form-label">POML Content</label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPomlContent(samplePOML)}
            >
              <Code2 className="w-4 h-4 mr-1" />
              Load Sample
            </Button>
          </div>
          
          <textarea
            value={pomlContent}
            onChange={(e) => setPomlContent(e.target.value)}
            placeholder="Paste your POML prompt here for analysis..."
            className="form-input font-mono text-sm min-h-[200px] resize-y w-full"
            rows={12}
          />
        </div>

        {/* Analyze Button */}
        <Button 
          onClick={analyzePOML}
          disabled={isAnalyzing || !pomlContent.trim()}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <BarChart3 className="w-4 h-4 mr-2 animate-pulse" />
              Analyzing POML...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analyze POML
            </>
          )}
        </Button>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className={`p-4 border rounded-lg ${getScoreBackground(analysis.score)}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Overall POML Score</h3>
                <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}/100
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Complexity: <strong>{analysis.complexity}</strong></span>
                <span>Completeness: <strong>{analysis.completeness}%</strong></span>
              </div>
            </div>

            {/* Structure Analysis */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-700 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Structure Analysis
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(analysis.structure).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    {value ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-500 mr-2" />
                    )}
                    <span className={value ? 'text-emerald-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                      {key.replace('has', '').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues */}
            {analysis.issues.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-700 rounded-lg">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Issues Found ({analysis.issues.length})
                </h3>
                <ul className="space-y-1 text-sm">
                  {analysis.issues.map((issue, index) => (
                    <li key={index} className="flex items-start text-red-700 dark:text-red-300">
                      <span className="w-1 h-1 bg-slate-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span className="break-words">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-700 rounded-lg">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Improvement Suggestions ({analysis.suggestions.length})
                </h3>
                <ul className="space-y-1 text-sm">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start text-amber-700 dark:text-amber-300">
                      <span className="w-1 h-1 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span className="break-words">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Analysis Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Analysis Summary</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const summary = `POML Analysis Results:
Score: ${analysis.score}/100
Complexity: ${analysis.complexity}
Completeness: ${analysis.completeness}%

Issues: ${analysis.issues.length > 0 ? analysis.issues.join('; ') : 'None'}
Suggestions: ${analysis.suggestions.length > 0 ? analysis.suggestions.join('; ') : 'None'}`;
                    copyToClipboard(summary);
                  }}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {analysis.score >= 80 ? (
                  "Excellent POML structure! Your prompt follows best practices and should produce high-quality results."
                ) : analysis.score >= 60 ? (
                  "Good foundation, but there's room for improvement. Address the suggestions to enhance prompt effectiveness."
                ) : (
                  "Significant improvements needed. Focus on core structure elements and follow POML best practices."
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}