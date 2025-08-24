'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Introduction from "@/components/guides/Introduction";
import FeaturedPromptsShowcase from "@/components/features/prompts/FeaturedPromptsShowcase";
import HowItWorks from "@/components/features/shared/HowItWorks";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BookOpen, Wand2 } from "lucide-react";
import AdminStatusDebug from "@/components/debug/AdminStatusDebug";

export default function HomePage() {
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
      {/* Admin Status Debug - Temporary */}
      <AdminStatusDebug />
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto">
        <Introduction />
        
        {/* CTA to Tools */}
        <div className="text-center mt-8">
          <Link href="/tools">
            <Button size="lg">
              <Wand2 className="w-5 h-5 mr-2" />
              Try Prompt Tools Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Prompts Marketplace */}
      <FeaturedPromptsShowcase />
      
      {/* How It Works Section */}
      <HowItWorks />
      
      {/* Link to Guides */}
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Want to Learn More?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
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