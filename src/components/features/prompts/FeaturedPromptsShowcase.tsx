'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Star, ShoppingBag, Clock, Gift, Award, ArrowRight, Brain, Users, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PromptCardSkeleton, StatsSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import FeaturedPromptCard from './FeaturedPromptCard';

interface FeaturedPrompt {
  id: number;
  title: string;
  description: string;
  complexity_level: 'simple' | 'smart' | 'recipe';
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  downloads_count: number;
  rating_average: number;
  rating_count: number;
  profiles?: {
    full_name: string;
  };
}

interface FeaturedPromptsData {
  sections: {
    trending: FeaturedPrompt[];
    topRated: FeaturedPrompt[];
    mostPurchased: FeaturedPrompt[];
    recentlyAdded: FeaturedPrompt[];
    freePrompts: FeaturedPrompt[];
    editorsChoice: FeaturedPrompt[];
  };
  stats: {
    totalPrompts: number;
    totalCreators: number;
    totalDownloads: number;
  };
}

const sections = [
  {
    id: 'trending',
    title: 'Trending Now',
    icon: TrendingUp,
    description: 'Hot Smart Prompts gaining popularity',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20'
  },
  {
    id: 'topRated',
    title: 'Top Rated',
    icon: Star,
    description: 'Highest rated prompts by our community',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
  },
  {
    id: 'mostPurchased',
    title: 'Best Sellers',
    icon: ShoppingBag,
    description: 'Most purchased Smart Prompts',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    id: 'recentlyAdded',
    title: 'Recently Added',
    icon: Clock,
    description: 'Recently added prompts',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    id: 'freePrompts',
    title: 'Free Prompts',
    icon: Gift,
    description: 'Quality prompts at no cost',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    id: 'editorsChoice',
    title: "Editor's Choice",
    icon: Award,
    description: 'Handpicked premium prompts',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  }
] as const;

export default function FeaturedPromptsShowcase() {
  const [data, setData] = useState<FeaturedPromptsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPrompts = async () => {
      try {
        const response = await fetch('/api/smart-prompts/featured');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.error('Failed to fetch featured prompts');
        }
      } catch (error) {
        console.error('Error fetching featured prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPrompts();
  }, []);

  if (loading) {
    return (
      <div className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <div className="h-10 w-96 bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded-lg mx-auto mb-4 animate-shimmer"></div>
            <div className="h-6 w-3/4 bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded mx-auto mb-8 animate-shimmer"></div>
            
            {/* Stats Skeleton */}
            <StatsSkeleton className="mb-8" />
            
            {/* CTA Buttons Skeleton */}
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="h-12 w-40 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-lg animate-shimmer"></div>
              <div className="h-12 w-36 bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded-lg animate-shimmer"></div>
            </div>
          </div>

          {/* Featured Sections Skeleton */}
          <div className="space-y-12">
            {[1, 2, 3].map((section) => (
              <div key={section} className="space-y-6">
                {/* Section Header Skeleton */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded-lg animate-shimmer"></div>
                    <div>
                      <div className="h-8 w-32 bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded mb-2 animate-shimmer"></div>
                      <div className="h-4 w-48 bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded animate-shimmer"></div>
                    </div>
                  </div>
                  <div className="h-9 w-20 bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded animate-shimmer"></div>
                </div>

                {/* Prompts Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((card) => (
                    <PromptCardSkeleton key={card} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Stats Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Smart Prompts Marketplace
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-3xl mx-auto">
            Discover professionally crafted prompts. Transform your AI interactions with templates, recipes, and intelligent workflows.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-center mb-2">
                <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                {data.stats.totalPrompts}+
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Smart Prompts</p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                Admin
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Created by</p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-center mb-2">
                <Download className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                {data.stats.totalDownloads}+
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Downloads</p>
            </div>
          </div>

          {/* Main CTA */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/smart-prompts">
              <Button size="lg" className="text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Brain className="w-5 h-5 mr-2" />
                Browse All Prompts
              </Button>
            </Link>
            <Link href="/certificates">
              <Button size="lg" variant="outline">
                <Award className="w-5 h-5 mr-2" />
                Get Certified to Sell
              </Button>
            </Link>
          </div>
        </div>

        {/* Featured Sections */}
        <div className="space-y-12">
          {sections.map((section) => {
            const sectionData = data.sections[section.id];
            const SectionIcon = section.icon;
            
            if (!sectionData || sectionData.length === 0) {
              return null;
            }

            return (
              <div key={section.id} className="space-y-6">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${section.bgColor}`}>
                      <SectionIcon className={`w-6 h-6 ${section.color}`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {section.title}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  
                  <Link href={`/smart-prompts?sort=${section.id}`}>
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Prompts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sectionData.slice(0, 3).map((prompt) => (
                    <FeaturedPromptCard
                      key={prompt.id}
                      prompt={prompt}
                      variant="compact"
                      showStats={true}
                    />
                  ))}
                </div>

                {sectionData.length > 3 && (
                  <div className="text-center">
                    <Link href={`/smart-prompts?sort=${section.id}`}>
                      <Button variant="outline">
                        View {sectionData.length - 3} More {section.title}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-white dark:bg-neutral-800 rounded-lg p-8 shadow-sm border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            Ready to Level Up Your AI Prompts?
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-2xl mx-auto">
            Use Smart Prompts to enhance your AI workflows. 
            Get certified and start creating your own prompts today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/smart-prompts">
              <Button size="lg">
                Start Browsing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/certificates">
              <Button size="lg" variant="outline">
                Get Certified
                <Award className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}