'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Coins, ArrowRight, Sparkles, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const packages = {
  starter: { name: 'Starter Pack', promptCoins: '500 PC', price: '$5' },
  pro: { name: 'Pro Pack', promptCoins: '2,000 PC', price: '$20' },
  premium: { name: 'Premium Pack', promptCoins: '5,000 PC', price: '$50' }
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const [confettiShown, setConfettiShown] = useState(false);
  
  const packageId = searchParams.get('package') as keyof typeof packages || 'pro';
  const packageInfo = packages[packageId];

  useEffect(() => {
    // Simple confetti effect
    if (!confettiShown) {
      setConfettiShown(true);
      // You could add a proper confetti library here
    }
  }, [confettiShown]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-center">
      {/* Success Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Success Message */}
      <h1 className="text-display gradient-text mb-4">
        🎉 Purchase Successful!
      </h1>
      
      <p className="text-body-large text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
        Your PromptCoins have been added to your account and are ready to use immediately.
      </p>

      {/* Purchase Details */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700/50 p-6 mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Coins className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h2 className="text-xl font-bold text-green-900 dark:text-green-200">
            {packageInfo.name} Activated
          </h2>
        </div>
        
        <div className="space-y-2 text-green-800 dark:text-green-300">
          <div className="flex justify-between items-center">
            <span>PromptCoins Added:</span>
            <span className="font-bold text-lg">{packageInfo.promptCoins}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Amount Paid:</span>
            <span className="font-bold">{packageInfo.price}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Status:</span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Active & Ready to Use
            </span>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 mb-8">
        <h3 className="text-lg font-semibold dark:text-white mb-4">What's Next?</h3>
        
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">1</span>
            </div>
            <div>
              <h4 className="font-medium dark:text-white">Start Using Your PromptCoins</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Use your credits for prompt analysis, enhancement, exams, and exports
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">2</span>
            </div>
            <div>
              <h4 className="font-medium dark:text-white">Explore Smart Prompts</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Browse and purchase high-quality prompt templates from the marketplace
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">3</span>
            </div>
            <div>
              <h4 className="font-medium dark:text-white">Track Your Usage</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Monitor your PromptCoin balance and usage in your dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Link href="/dashboard">
          <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Coins className="w-4 h-4 mr-2" />
            View Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        
        <Link href="/smart-prompts">
          <Button size="lg" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Browse Smart Prompts
          </Button>
        </Link>
      </div>

      {/* Help Section */}
      <div className="text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
          Need help getting started?
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/help/promptcoins" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            PromptCoin Help
          </Link>
          <span className="text-neutral-300 dark:text-neutral-600">•</span>
          <Link href="mailto:support@promptopotamus.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Contact Support
          </Link>
          <span className="text-neutral-300 dark:text-neutral-600">•</span>
          <Link href="/templates" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            AI Templates
          </Link>
        </div>
      </div>

      {/* Celebration Note */}
      <div className="mt-12 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
        <p className="text-sm text-purple-700 dark:text-purple-300">
          🎊 Welcome to the PromptCoin ecosystem! Your credits never expire, so take your time exploring all the features.
        </p>
      </div>
    </div>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}