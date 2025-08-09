'use client';

import BasicTechniques from "@/components/guides/BasicTechniques";
import AdvancedTechniques from "@/components/guides/AdvancedTechniques";
import PromptRecipes from "@/components/guides/PromptRecipes";
import IndustryGuides from "@/components/guides/IndustryGuides";
import ExploringModels from "@/components/guides/ExploringModels";
import BestPractices from "@/components/guides/BestPractices";
import RisksCaution from "@/components/guides/RisksCaution";
import FurtherReading from "@/components/guides/FurtherReading";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

const SectionSeparator = () => <hr className="my-12 border-t border-neutral-200 dark:border-neutral-800" />;

export default function GuidesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-h1 text-neutral-900 dark:text-white">
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