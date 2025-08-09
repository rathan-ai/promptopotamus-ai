'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Introduction from "@/components/guides/Introduction";
import FeaturedPromptsShowcase from "@/components/features/prompts/FeaturedPromptsShowcase";
import HowItWorks from "@/components/features/shared/HowItWorks";
import PromptBuilder from "@/components/features/prompts/PromptBuilder";
import PromptAnalyzer from "@/components/features/prompts/PromptAnalyzer";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BookOpen } from "lucide-react";


export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto">
        <Introduction />
      </div>

      
      {/* Featured Prompts Marketplace */}
      <FeaturedPromptsShowcase />
      
      {/* How It Works Section */}
      <HowItWorks />
      
      {/* Interactive Tools */}
      <div className="max-w-4xl mx-auto space-y-12">
        <PromptBuilder />
        <PromptAnalyzer />
      </div>
      
      {/* Link to Guides */}
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-h2 text-neutral-900 dark:text-white mb-4">
          Want to Learn More?
        </h2>
        <p className="text-body text-neutral-600 dark:text-neutral-400 mb-6">
          Explore our comprehensive guides on prompt engineering techniques and best practices.
        </p>
        <Link href="/guides">
          <Button size="lg" variant="outline">
            <BookOpen className="w-5 h-5 mr-2" />
            View All Guides
          </Button>
        </Link>
      </div>
    </div>
  );
}