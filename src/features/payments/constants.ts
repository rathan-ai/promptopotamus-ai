/**
 * Payment constants that can be used on both client and server
 */

import type { PromptCoinPackage } from '@/shared/types';

/**
 * PromptCoin cost constants
 */
export const PROMPTCOIN_COSTS = {
  analysis: 10,
  enhancement: 15,
  exam: 50,
  export: 5,
  recipe_simple: 100,
  recipe_smart: 500,
  recipe_complex: 1000
};

/**
 * Free daily limits for non-paying users
 */
export const FREE_DAILY_LIMITS = {
  analysis: 50,      // 5 analyses per day
  enhancement: 45,   // 3 enhancements per day
  exam: 150,         // 3 exam attempts per day
  export: 0          // No exports for free users
};

/**
 * Available PromptCoin packages
 */
export const PROMPTCOIN_PACKAGES: PromptCoinPackage[] = [
  {
    id: 'free',
    name: 'Continue Free',
    description: 'Use daily free limits',
    price: 0,
    promptCoins: 'Free Daily Limits',
    features: [
      '3 prompt enhancements/day',
      '5 prompt analyses/day', 
      '3 exam attempts/day',
      'Basic prompt templates',
      'Community support'
    ],
    popular: false,
    color: 'from-gray-500 to-slate-500',
    bgColor: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20'
  },
  {
    id: 'custom',
    name: 'Custom Amount',
    description: 'Enter your own amount',
    price: 0, // Will be set dynamically
    promptCoins: 'Custom PC',
    features: [
      'Enter any amount',
      'Flexible pricing',
      'Immediate delivery',
      'No expiration on credits'
    ],
    popular: false,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
  }
];

/**
 * Get package by ID
 */
export function getPackageById(packageId: string): PromptCoinPackage | null {
  return PROMPTCOIN_PACKAGES.find(pkg => pkg.id === packageId) || null;
}