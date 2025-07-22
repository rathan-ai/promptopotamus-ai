import Introduction from "@/components/guides/Introduction";
import FeaturedPromptsShowcase from "@/components/FeaturedPromptsShowcase";
import PromptBuilder from "@/components/PromptBuilder";
import PromptAnalyzer from "@/components/PromptAnalyzer";
import BasicTechniques from "@/components/guides/BasicTechniques";
import AdvancedTechniques from "@/components/guides/AdvancedTechniques";
import PromptRecipes from "@/components/guides/PromptRecipes";
import IndustryGuides from "@/components/guides/IndustryGuides";
import ExploringModels from "@/components/guides/ExploringModels";
import BestPractices from "@/components/guides/BestPractices";
import RisksCaution from "@/components/guides/RisksCaution";
import FurtherReading from "@/components/guides/FurtherReading";

const SectionSeparator = () => <hr className="my-12 border-t border-dashed border-neutral-200 dark:border-neutral-800" />;

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto">
        <Introduction />
      </div>
      
      {/* Featured Prompts Marketplace */}
      <FeaturedPromptsShowcase />
      
      {/* Educational Content */}
      <div className="max-w-4xl mx-auto space-y-12">
        <SectionSeparator />
        <PromptBuilder />
        <SectionSeparator />
        <PromptAnalyzer />
        <SectionSeparator />
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
    </div>
  );
}