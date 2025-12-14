import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BookOpen, Wand2 } from "lucide-react";
import Introduction from "@/components/guides/Introduction";
import HowItWorks from "@/components/features/shared/HowItWorks";
import FeaturedPromptsShowcase from "@/components/features/prompts/FeaturedPromptsShowcase";
import { createServerClient } from '@/lib/supabase/server';

// Fetch featured prompts data server-side
async function getFeaturedPromptsData() {
  const supabase = await createServerClient();

  // Run all queries in parallel for better performance
  const [
    trendingResult,
    topRatedResult,
    mostPurchasedResult,
    recentlyAddedResult,
    freePromptsResult,
    editorsChoiceResult,
    statsResults
  ] = await Promise.all([
    // Trending prompts
    supabase
      .from('saved_prompts')
      .select('id, title, description, complexity_level, category, difficulty_level, price, downloads_count, rating_average, rating_count')
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .gt('downloads_count', 0)
      .order('downloads_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6),

    // Top rated
    supabase
      .from('saved_prompts')
      .select('id, title, description, complexity_level, category, difficulty_level, price, downloads_count, rating_average, rating_count')
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .gte('rating_count', 1)
      .order('rating_average', { ascending: false })
      .order('rating_count', { ascending: false })
      .limit(6),

    // Most purchased
    supabase
      .from('saved_prompts')
      .select('id, title, description, complexity_level, category, difficulty_level, price, downloads_count, rating_average, rating_count')
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .gt('downloads_count', 0)
      .order('downloads_count', { ascending: false })
      .limit(6),

    // Recently added
    supabase
      .from('saved_prompts')
      .select('id, title, description, complexity_level, category, difficulty_level, price, downloads_count, rating_average, rating_count, created_at')
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(6),

    // Free prompts
    supabase
      .from('saved_prompts')
      .select('id, title, description, complexity_level, category, difficulty_level, price, downloads_count, rating_average, rating_count')
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .eq('price', 0)
      .order('downloads_count', { ascending: false })
      .order('rating_average', { ascending: false })
      .limit(6),

    // Editor's choice
    supabase
      .from('saved_prompts')
      .select('id, title, description, complexity_level, category, difficulty_level, price, downloads_count, rating_average, rating_count')
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .not('description', 'is', null)
      .gte('rating_average', 4.0)
      .gte('rating_count', 2)
      .order('rating_average', { ascending: false })
      .order('downloads_count', { ascending: false })
      .limit(6),

    // Stats - run in parallel
    Promise.all([
      supabase
        .from('saved_prompts')
        .select('*', { count: 'exact', head: true })
        .eq('is_marketplace', true)
        .eq('is_public', true),
      supabase
        .from('saved_prompts')
        .select('user_id', { count: 'exact', head: true })
        .eq('is_marketplace', true)
        .eq('is_public', true),
      supabase
        .from('smart_prompt_purchases')
        .select('*', { count: 'exact', head: true })
    ])
  ]);

  return {
    sections: {
      trending: trendingResult.data || [],
      topRated: topRatedResult.data || [],
      mostPurchased: mostPurchasedResult.data || [],
      recentlyAdded: recentlyAddedResult.data || [],
      freePrompts: freePromptsResult.data || [],
      editorsChoice: editorsChoiceResult.data || []
    },
    stats: {
      totalPrompts: statsResults[0].count || 0,
      totalCreators: statsResults[1].count || 0,
      totalDownloads: statsResults[2].count || 0
    }
  };
}

export default async function HomePage() {
  // Fetch data server-side - no loading state needed, renders instantly
  const featuredData = await getFeaturedPromptsData();

  return (
    <div className="space-y-12">
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

      {/* Featured Prompts Marketplace - data passed as prop */}
      <FeaturedPromptsShowcase initialData={featuredData} />

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
