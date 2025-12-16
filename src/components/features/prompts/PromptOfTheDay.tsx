'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Star, Download, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PromptOfTheDayData {
  id: number;
  title: string;
  description: string;
  category: string;
  complexity_level: string;
  difficulty_level: string;
  price: number;
  downloads_count: number;
  rating_average: number;
  rating_count: number;
}

interface PromptOfTheDayProps {
  prompt: PromptOfTheDayData | null;
  dateString: string;
}

export default function PromptOfTheDay({ prompt, dateString }: PromptOfTheDayProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!prompt) {
    return null;
  }

  const complexityColors: Record<string, string> = {
    simple: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    smart: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    recipe: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    intermediate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-white dark:bg-neutral-900 rounded-xl p-6 md:p-8">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">Prompt of the Day</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <Calendar className="w-4 h-4" />
            <span>{dateString}</span>
          </div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                {prompt.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 line-clamp-2">
                {prompt.description}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${complexityColors[prompt.complexity_level] || complexityColors.simple}`}>
                {prompt.complexity_level.charAt(0).toUpperCase() + prompt.complexity_level.slice(1)}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficultyColors[prompt.difficulty_level] || difficultyColors.beginner}`}>
                {prompt.difficulty_level.charAt(0).toUpperCase() + prompt.difficulty_level.slice(1)}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {prompt.category}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              {prompt.rating_count > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {prompt.rating_average.toFixed(1)}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    ({prompt.rating_count} reviews)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Download className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-600 dark:text-neutral-400">
                  {prompt.downloads_count} downloads
                </span>
              </div>
            </div>
          </div>

          {/* CTA Side */}
          <div className="flex flex-col justify-center items-center md:items-end gap-4">
            <div className="text-center md:text-right">
              <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                {prompt.price === 0 ? (
                  <span className="text-green-600 dark:text-green-400">Free</span>
                ) : (
                  <span>${prompt.price.toFixed(2)}</span>
                )}
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {prompt.price === 0 ? 'No cost to get started' : 'One-time purchase'}
              </p>
            </div>

            <Link href={`/smart-prompts/${prompt.id}`}>
              <Button
                size="lg"
                className={`group transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}
              >
                View Prompt
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/10 to-purple-500/10 rounded-full blur-2xl -z-10" />
      </div>
    </div>
  );
}
