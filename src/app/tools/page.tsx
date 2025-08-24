'use client';

import PromptBuilder from "@/components/features/prompts/PromptBuilder";
import PromptAnalyzer from "@/components/features/prompts/PromptAnalyzer";
import POMLAnalyzer from "@/components/features/analysis/POMLAnalyzer";

export default function ToolsPage() {
  return (
    <div className="w-full max-w-none space-y-8">
      {/* Interactive Tools */}
      <PromptBuilder />
      <PromptAnalyzer />
      <POMLAnalyzer />
    </div>
  );
}