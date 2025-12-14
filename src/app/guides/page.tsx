'use client';

import BasicTechniques from "@/components/guides/BasicTechniques";
import AdvancedTechniques from "@/components/guides/AdvancedTechniques";
import PromptRecipes from "@/components/guides/PromptRecipes";
import IndustryGuides from "@/components/guides/IndustryGuides";
import ExploringModels from "@/components/guides/ExploringModels";
import BestPractices from "@/components/guides/BestPractices";
import RisksCaution from "@/components/guides/RisksCaution";
import FurtherReading from "@/components/guides/FurtherReading";
import POMLFundamentals from "@/components/guides/POMLFundamentals";
import POMLSyntax from "@/components/guides/POMLSyntax";
import POMLBestPractices from "@/components/guides/POMLBestPractices";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

const SectionSeparator = () => <hr className="my-12 border-t border-gray-200 dark:border-gray-700" />;

export default function GuidesPage() {
  return (
    <div className="w-full max-w-none space-y-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <button className="btn btn-outline btn-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Prompt Engineering Guides
        </h1>
      </div>

      {/* Guide Sections */}
      <BasicTechniques />
      <SectionSeparator />
      <AdvancedTechniques />
      <SectionSeparator />
      <PromptRecipes />
      <SectionSeparator />
      
      {/* POML Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-700/50 mb-12">
        <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200 mb-3">
          🚀 POML: Next-Generation Prompt Engineering
        </h2>
        <p className="text-indigo-800 dark:text-indigo-300 mb-4">
          Master Microsoft&apos;s revolutionary Prompt Orchestration Markup Language - the future of structured, maintainable AI prompts.
        </p>
        <div className="flex gap-2 text-sm">
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300 rounded-full">New Technology</span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300 rounded-full">Industry Standard</span>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 rounded-full">40% More Efficient</span>
        </div>
      </div>
      
      <POMLFundamentals />
      <SectionSeparator />
      <POMLSyntax />
      <SectionSeparator />
      <POMLBestPractices />
      <SectionSeparator />
      
      <IndustryGuides />
      <SectionSeparator />
      <ExploringModels />
      <SectionSeparator />
      <BestPractices />
      <SectionSeparator />
      <RisksCaution />
      <SectionSeparator />
      <FurtherReading />
    </div>
  );
}