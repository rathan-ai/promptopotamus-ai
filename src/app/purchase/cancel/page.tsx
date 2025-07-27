'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, HelpCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const packages = {
  starter: { name: 'Starter Pack', promptCoins: '500 PC', price: '$5' },
  pro: { name: 'Pro Pack', promptCoins: '2,000 PC', price: '$20' },
  premium: { name: 'Premium Pack', promptCoins: '5,000 PC', price: '$50' }
};

function CancelContent() {
  const searchParams = useSearchParams();
  
  const packageId = searchParams.get('package') as keyof typeof packages || 'pro';
  const packageInfo = packages[packageId];

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-center">
      {/* Cancel Icon */}
      <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-12 h-12 text-white" />
      </div>

      {/* Cancel Message */}
      <h1 className="text-display text-neutral-900 dark:text-white mb-4">
        Purchase Cancelled
      </h1>
      
      <p className="text-body-large text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
        Your payment was cancelled and no charges were made to your account.
      </p>

      {/* Cancelled Package Info */}
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700/50 p-6 mb-8">
        <h2 className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-3">
          Cancelled: {packageInfo.name}
        </h2>
        
        <div className="space-y-2 text-orange-800 dark:text-orange-300">
          <div className="flex justify-between items-center">
            <span>PromptCoins:</span>
            <span className="font-medium">{packageInfo.promptCoins}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Price:</span>
            <span className="font-medium">{packageInfo.price}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Status:</span>
            <span>Not Purchased</span>
          </div>
        </div>
      </div>

      {/* Common Reasons */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 mb-8 text-left">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <h3 className="text-lg font-semibold dark:text-white">Common Reasons for Cancellation</h3>
        </div>
        
        <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></span>
            <span>Changed mind about the package size</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></span>
            <span>Wanted to review features before purchasing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></span>
            <span>Payment method issues</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></span>
            <span>Accidental navigation away from payment</span>
          </li>
        </ul>
      </div>

      {/* What's Next */}
      <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold dark:text-white mb-4">What Would You Like to Do?</h3>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h4 className="font-medium dark:text-white mb-2">Try Again</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Complete your purchase with the same package
            </p>
            <Link href={`/purchase?package=${packageId}`}>
              <Button size="sm" className="w-full">
                <RefreshCw className="w-3 h-3 mr-2" />
                Retry Purchase
              </Button>
            </Link>
          </div>
          
          <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h4 className="font-medium dark:text-white mb-2">Choose Different</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Browse all available packages
            </p>
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="w-full">
                View All Packages
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Link href="/pricing">
          <Button size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </Button>
        </Link>
        
        <Link href="/dashboard">
          <Button size="lg" variant="outline">
            Go to Dashboard
          </Button>
        </Link>
      </div>

      {/* Free Options */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/50 p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
          Continue with Free Credits
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
          You can still use Promptopotamus with daily free credits while you decide.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/smart-prompts" className="text-blue-600 dark:text-blue-400 hover:underline">
            Browse Free Prompts
          </Link>
          <span className="text-blue-300 dark:text-blue-600">•</span>
          <Link href="/templates" className="text-blue-600 dark:text-blue-400 hover:underline">
            Free AI Templates
          </Link>
          <span className="text-blue-300 dark:text-blue-600">•</span>
          <Link href="/help/promptcoins" className="text-blue-600 dark:text-blue-400 hover:underline">
            Learn About PromptCoins
          </Link>
        </div>
      </div>

      {/* Support */}
      <div className="mt-8 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
          Having trouble with payments?
        </p>
        <Link href="mailto:support@promptopotamus.com" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
          Contact our support team
        </Link>
      </div>
    </div>
  );
}

export default function PurchaseCancelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CancelContent />
    </Suspense>
  );
}