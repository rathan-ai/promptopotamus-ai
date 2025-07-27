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
    id: 'starter',
    name: 'Starter Pack',
    description: 'Perfect for getting started with AI prompting',
    price: 5,
    promptCoins: '500 PC',
    features: [
      '33 prompt enhancements',
      '50 prompt analyses', 
      '10 exam attempts',
      '100 export operations',
      'Smart Recipe purchases',
      'All prompt templates',
      'Priority email support',
      'No expiration on credits'
    ],
    popular: false,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    description: 'Ideal for professionals and active users',
    price: 20,
    promptCoins: '2,000 PC',
    features: [
      '133 prompt enhancements',
      '200 prompt analyses',
      '40 exam attempts', 
      '400 export operations',
      'Smart Recipe purchases',
      'All prompt templates',
      'Priority support',
      'No expiration on credits'
    ],
    popular: true,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    description: 'Perfect for power users and teams',
    price: 50,
    promptCoins: '5,000 PC',
    features: [
      '333 prompt enhancements',
      '500 prompt analyses',
      '100 exam attempts',
      '1,000 export operations', 
      'Smart Recipe purchases',
      'All prompt templates',
      'Priority support',
      'No expiration on credits'
    ],
    popular: false,
    color: 'from-orange-500 to-red-500',
    bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
  }
];

/**
 * Get package by ID
 */
export function getPackageById(packageId: string): PromptCoinPackage | null {
  return PROMPTCOIN_PACKAGES.find(pkg => pkg.id === packageId) || null;
}