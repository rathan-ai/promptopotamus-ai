'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Search, Copy, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AnalysisResult {
  score: number;
  clarity: number;
  specificity: number;
  actionability: number;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
}

export default function PromptAnalyzer() {
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePrompt = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to analyze');
      return;
    }

    setIsAnalyzing(true);
    
    // Simple analysis logic (in a real app, this would call an AI service)
    setTimeout(() => {
      const wordCount = prompt.split(' ').length;
      const hasQuestion = prompt.includes('?');
      const hasContext = wordCount > 10;
      const hasSpecifics = /\b(specific|detailed|step-by-step|example)\b/i.test(prompt);
      
      const clarity = hasQuestion ? 85 : hasContext ? 75 : 60;
      const specificity = hasSpecifics ? 90 : wordCount > 15 ? 70 : 50;
      const actionability = /\b(write|create|generate|explain|analyze)\b/i.test(prompt) ? 85 : 65;
      
      const score = Math.round((clarity + specificity + actionability) / 3);
      
      const result: AnalysisResult = {
        score,
        clarity,
        specificity,
        actionability,
        suggestions: [
          score < 70 ? 'Consider being more specific about what you want' : 'Great specificity!',
          !hasQuestion && score < 80 ? 'Try adding a clear question or request' : 'Clear request structure',
          wordCount < 10 ? 'Consider adding more context for better results' : 'Good context provided'
        ],
        strengths: [
          hasContext && 'Provides good context',
          hasSpecifics && 'Includes specific requirements',
          hasQuestion && 'Has clear question structure'
        ].filter(Boolean) as string[],
        improvements: [
          !hasContext && 'Add more context about the task',
          !hasSpecifics && 'Be more specific about requirements',
          !hasQuestion && 'Include a clear question or action'
        ].filter(Boolean) as string[]
      };
      
      setAnalysis(result);
      setIsAnalyzing(false);
      toast.success('Analysis complete!');
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const clearAnalysis = () => {
    setPrompt('');
    setAnalysis(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-500';
    if (score >= 60) return 'text-yellow-600 dark:text-slate-400';
    return 'text-slate-600 dark:text-red-400';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-slate-600" />;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Prompt Analyzer
        </h2>
        <p className="card-description">
          Analyze your prompts for clarity, specificity, and effectiveness
        </p>
      </div>
      
      <div className="card-content space-y-6">
        {/* Input Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="form-label">Prompt to Analyze</label>
            {prompt && (
              <span className="text-sm text-gray-500">
                {prompt.split(' ').length} words
              </span>
            )}
          </div>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste your AI prompt here for analysis..."
            className="form-input min-h-[120px] resize-y"
            rows={5}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={analyzePrompt}
            disabled={isAnalyzing || !prompt.trim()}
            className="flex-1"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analyze Prompt
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={clearAnalysis}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Overall Score</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(analysis, null, 2))}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Results
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                {getScoreIcon(analysis.score)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score}/100
                    </span>
                    <span className="text-sm text-gray-500">
                      {analysis.score >= 80 ? 'Excellent' : analysis.score >= 60 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className={`text-xl font-bold ${getScoreColor(analysis.clarity)}`}>
                  {analysis.clarity}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Clarity</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className={`text-xl font-bold ${getScoreColor(analysis.specificity)}`}>
                  {analysis.specificity}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Specificity</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className={`text-xl font-bold ${getScoreColor(analysis.actionability)}`}>
                  {analysis.actionability}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Actionability</div>
              </div>
            </div>

            {/* Strengths and Improvements */}
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.strengths.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Strengths
                  </h4>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index}>• {strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysis.improvements.length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Improvements
                  </h4>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                    {analysis.improvements.map((improvement, index) => (
                      <li key={index}>• {improvement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}