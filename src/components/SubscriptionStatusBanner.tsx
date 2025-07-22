'use client';

import { useState, useEffect } from 'react';
import { Crown, Gift, Zap, Settings, Calendar, Users, Star, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { getUserSubscription, type UserSubscription, SUBSCRIPTION_LIMITS } from '@/lib/subscription';
import UpgradeModal from './UpgradeModal';
import Link from 'next/link';

const tierConfig = {
  free: {
    icon: Gift,
    label: 'Free Plan',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-700'
  },
  pro: {
    icon: Zap,
    label: 'Pro Plan',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700'
  },
  premium: {
    icon: Crown,
    label: 'Premium Plan',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-700'
  }
};

interface SubscriptionStatusBannerProps {
  user: User | null;
  compact?: boolean;
}

export default function SubscriptionStatusBanner({ user, compact = false }: SubscriptionStatusBannerProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userSub = await getUserSubscription(user.id);
        setSubscription(userSub);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  if (!user || loading) {
    return null;
  }

  if (dismissed) {
    return null;
  }

  if (!subscription) {
    return null;
  }

  const config = tierConfig[subscription.tier];
  const Icon = config.icon;
  const limits = SUBSCRIPTION_LIMITS[subscription.tier];

  // Compact version for integration into other components
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${config.bgColor} ${config.borderColor} border`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`font-medium ${config.color}`}>{config.label}</span>
        {subscription.tier === 'free' && (
          <Button size="sm" variant="ghost" onClick={() => setShowUpgradeModal(true)}>
            Upgrade
          </Button>
        )}
      </div>
    );
  }

  // Get days remaining for paid plans
  const getDaysRemaining = () => {
    if (!subscription.endDate || subscription.tier === 'free') return null;
    const end = new Date(subscription.endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <>
      <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor} relative`}>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
        >
          <X className="w-4 h-4 text-neutral-400" />
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className={`font-semibold ${config.color}`}>
                {config.label}
                {subscription.tier !== 'free' && subscription.status === 'active' && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs rounded-full">
                    Active
                  </span>
                )}
              </h3>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {subscription.tier === 'free' ? (
                  <span>
                    {limits.promptEnhancements} enhancements • {limits.promptAnalyses} analyses • Basic features
                  </span>
                ) : (
                  <span>
                    Unlimited usage • Priority support • Advanced features
                    {daysRemaining && daysRemaining > 0 && (
                      <span className="ml-2">• {daysRemaining} days remaining</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {subscription.tier === 'free' ? (
              <Button onClick={() => setShowUpgradeModal(true)}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            ) : (
              <div className="flex gap-2">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </Link>
                {subscription.tier === 'pro' && (
                  <Button size="sm" onClick={() => setShowUpgradeModal(true)}>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Usage Progress for Free Users */}
        {subscription.tier === 'free' && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>This month's usage</span>
              <span className="text-neutral-600 dark:text-neutral-400">Upgrade for unlimited</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span>AI Enhancements</span>
                  <span className="text-neutral-600">3/3</span>
                </div>
                <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Prompt Analyses</span>
                  <span className="text-neutral-600">5/5</span>
                </div>
                <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Preview */}
        {subscription.tier === 'free' && (
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <h4 className="font-medium mb-2 text-neutral-900 dark:text-white">
              Unlock with Pro/Premium:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>Unlimited AI tools</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Premium templates</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-purple-500" />
                <span>Advanced analytics</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showUpgradeModal && (
        <UpgradeModal 
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </>
  );
}