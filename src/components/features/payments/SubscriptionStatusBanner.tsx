'use client';

import { useState, useEffect } from 'react';
import { Coins, Gift, Zap, Settings, Users, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { User } from '@supabase/supabase-js';
import { clientAuthService } from '@/features/auth/services/auth-client';
import type { UserProfile } from '@/shared/types';
import UpgradeModal from './UpgradeModal';
import Link from 'next/link';

const userTypeConfig = {
  free: {
    icon: Gift,
    label: 'Free Daily Credits',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-700'
  },
  paid: {
    icon: Coins,
    label: 'PromptCoin User',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700'
  }
};

interface PromptCoinStatusBannerProps {
  user: User | null;
  compact?: boolean;
}

export default function PromptCoinStatusBanner({ user, compact = false }: PromptCoinStatusBannerProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userProfile = await clientAuthService.getUserProfile(user.id);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user || loading) {
    return null;
  }

  if (dismissed) {
    return null;
  }

  if (!profile) {
    return null;
  }

  const config = userTypeConfig[profile.type];
  const Icon = config.icon;
  const totalPromptCoins = Object.values(profile.totalPromptCoins).reduce((sum, pc) => sum + pc, 0);

  // Compact version for integration into other components
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${config.bgColor} ${config.borderColor} border`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`font-medium ${config.color}`}>{config.label}</span>
        <span className="text-xs text-neutral-600 dark:text-neutral-400">{totalPromptCoins} PC</span>
        {profile.type === 'free' && (
          <Button size="sm" variant="ghost" onClick={() => setShowUpgradeModal(true)}>
            Buy Credits
          </Button>
        )}
      </div>
    );
  }

  // Calculate PromptCoin breakdown
  const getPromptCoinBreakdown = () => {
    const { analysis, enhancement, exam, export: exportPC } = profile.totalPromptCoins;
    return {
      analysis,
      enhancement,
      exam,
      export: exportPC,
      total: totalPromptCoins
    };
  };

  const pcBreakdown = getPromptCoinBreakdown();

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
                {profile.paymentStatus === 'active' && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs rounded-full">
                    Active
                  </span>
                )}
              </h3>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                <span>
                  Total: {pcBreakdown.total} PC • Analysis: {pcBreakdown.analysis} • Enhancement: {pcBreakdown.enhancement} • Exam: {pcBreakdown.exam} • Export: {pcBreakdown.export}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pcBreakdown.total < 100 && (
              <Button onClick={() => setShowUpgradeModal(true)}>
                <Coins className="w-4 h-4 mr-2" />
                Buy More Credits
              </Button>
            )}
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </Link>
          </div>
        </div>

        {/* PromptCoin Balance Breakdown */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>PromptCoin Balance</span>
            <span className="text-neutral-600 dark:text-neutral-400">Purchase more anytime</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span>Enhancement Credits</span>
                <span className="text-neutral-600">{pcBreakdown.enhancement} PC</span>
              </div>
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                  style={{width: `${Math.min(100, (pcBreakdown.enhancement / 100) * 100)}%`}}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Analysis Credits</span>
                <span className="text-neutral-600">{pcBreakdown.analysis} PC</span>
              </div>
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                  style={{width: `${Math.min(100, (pcBreakdown.analysis / 100) * 100)}%`}}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Exam Credits</span>
                <span className="text-neutral-600">{pcBreakdown.exam} PC</span>
              </div>
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                  style={{width: `${Math.min(100, (pcBreakdown.exam / 150) * 100)}%`}}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Export Credits</span>
                <span className="text-neutral-600">{pcBreakdown.export} PC</span>
              </div>
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
                  style={{width: `${Math.min(100, (pcBreakdown.export / 50) * 100)}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Low Balance Warning */}
        {pcBreakdown.total < 50 && (
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <h4 className="font-medium mb-2 text-neutral-900 dark:text-white">
              Running low on PromptCoins:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-blue-500" />
                <span>Credits never expire</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Pay only for what you use</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <span>Instant top-up available</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <span>No monthly commitments</span>
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