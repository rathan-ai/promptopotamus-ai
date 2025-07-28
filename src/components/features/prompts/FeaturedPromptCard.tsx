'use client';

import Link from 'next/link';
import { Star, Download, DollarSign, User, Brain, Zap, Coins } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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

interface FeaturedPromptCardProps {
  prompt: FeaturedPrompt;
  variant?: 'default' | 'compact';
  showStats?: boolean;
}

const complexityColors = {
  simple: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  smart: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  recipe: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
};

const complexityIcons = {
  simple: Zap,
  smart: Brain,
  recipe: Brain
};

export default function FeaturedPromptCard({ 
  prompt, 
  variant = 'default',
  showStats = true 
}: FeaturedPromptCardProps) {
  const ComplexityIcon = complexityIcons[prompt.complexity_level];
  
  const renderStars = (rating: number, size: 'sm' | 'xs' = 'sm') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-3 h-3';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-neutral-300 dark:text-neutral-600'
            }`}
          />
        ))}
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group">
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <ComplexityIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${complexityColors[prompt.complexity_level]}`}>
                {prompt.complexity_level}
              </span>
            </div>
            <div className="text-right">
              {prompt.price > 0 ? (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Coins className="w-4 h-4" />
                  <span className="text-sm font-semibold">{prompt.price} PC</span>
                </div>
              ) : (
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Free
                </span>
              )}
            </div>
          </div>

          <h3 className="font-semibold text-sm dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 overflow-hidden" 
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
            {prompt.title}
          </h3>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 overflow-hidden"
             style={{
               display: '-webkit-box',
               WebkitLineClamp: 2,
               WebkitBoxOrient: 'vertical',
             }}>
            {prompt.description}
          </p>

          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-1">
              {renderStars(prompt.rating_average, 'xs')}
              <span>({prompt.rating_count})</span>
            </div>
            
            {showStats && (
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{prompt.downloads_count}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-3">
          <Link href={`/smart-prompts/${prompt.id}`}>
            <Button size="sm" className="w-full text-xs">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <ComplexityIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${complexityColors[prompt.complexity_level]}`}>
              {prompt.complexity_level}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
              {prompt.category}
            </span>
          </div>
          <div className="text-right">
            {prompt.price > 0 ? (
              <div className="flex items-center text-amber-600 dark:text-amber-400">
                <Coins className="w-4 h-4 mr-1" />
                <span className="font-semibold">{prompt.price} PC</span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Free
              </span>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-lg dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
          {prompt.title}
        </h3>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 overflow-hidden"
           style={{
             display: '-webkit-box',
             WebkitLineClamp: 3,
             WebkitBoxOrient: 'vertical',
           }}>
          {prompt.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {renderStars(prompt.rating_average)}
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                ({prompt.rating_count})
              </span>
            </div>
            
            {showStats && (
              <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                <Download className="w-4 h-4" />
                <span className="text-sm">{prompt.downloads_count}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
            <User className="w-4 h-4 mr-1" />
            {prompt.profiles?.full_name || 'Anonymous'}
          </div>
          
          <Link href={`/smart-prompts/${prompt.id}`}>
            <Button size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}