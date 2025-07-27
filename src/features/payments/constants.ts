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
    id: 'donate',
    name: 'Donate & Support',
    description: 'Support Promptopotamus development',
    price: 1,
    promptCoins: '100 PC + Thank You',
    features: [
      'Support platform development',
      '100 PromptCoins bonus',
      'Contribution recognition',
      'Help keep platform free',
      'Community appreciation'
    ],
    popular: false,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
  },
  {
    id: 'starter',
    name: 'Starter Pack',
    description: 'Perfect for getting started with AI prompting',
    price: 1,
    promptCoins: '100 PC',
    features: [
      '6 prompt enhancements',
      '10 prompt analyses', 
      '2 exam attempts',
      '20 export operations',
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
    price: 5,
    promptCoins: '500 PC',
    features: [
      '33 prompt enhancements',
      '50 prompt analyses',
      '10 exam attempts', 
      '100 export operations',
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
    price: 10,
    promptCoins: '1,000 PC',
    features: [
      '66 prompt enhancements',
      '100 prompt analyses',
      '20 exam attempts',
      '200 export operations', 
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