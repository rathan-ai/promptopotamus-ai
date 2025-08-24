'use client';

import { useState, useEffect } from 'react';
import { Zap, TrendingUp, Star } from 'lucide-react';
import { UserExperience, achievementEngine } from '@/lib/achievements';
import { useUser } from '@/lib/auth';

interface XPProgressProps {
  userId?: string;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export default function XPProgress({
  userId,
  showDetails = true,
  compact = false,
  className = ''
}: XPProgressProps) {
  const { user } = useUser();
  const [userXP, setUserXP] = useState<UserExperience | null>(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadUserXP();
    }
  }, [targetUserId]);

  const loadUserXP = async () => {
    if (!targetUserId) return;
    
    try {
      const xpData = await achievementEngine.getUserExperience(targetUserId);
      setUserXP(xpData);
    } catch (error) {
      console.error('Error loading user XP:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-neutral-200 dark:bg-neutral-700 rounded-lg h-20"></div>
      </div>
    );
  }

  if (!userXP) {
    return null;
  }

  const progress = achievementEngine.getCurrentLevelProgress(
    userXP.total_xp, 
    userXP.current_level
  );

  const getLevelTitle = (level: number): string => {
    if (level < 5) return 'Promptling';
    if (level < 10) return 'Prompt Apprentice';
    if (level < 20) return 'Prompt Artisan';
    if (level < 35) return 'Prompt Expert';
    if (level < 50) return 'Prompt Master';
    return 'Prompt Legend';
  };

  const getLevelColor = (level: number): string => {
    if (level < 5) return 'text-gray-600';
    if (level < 10) return 'text-emerald-600';
    if (level < 20) return 'text-slate-600';
    if (level < 35) return 'text-slate-600';
    if (level < 50) return 'text-yellow-600';
    return 'text-slate-600';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <Zap className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-sm">{userXP.total_xp}</span>
        </div>
        <div className="w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-slate-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <span className="text-sm font-medium">
          Lv.{userXP.current_level}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-slate-400 to-orange-500 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              Level {userXP.current_level}
            </h3>
            <p className={`text-sm font-medium ${getLevelColor(userXP.current_level)}`}>
              {getLevelTitle(userXP.current_level)}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
            <TrendingUp className="w-4 h-4" />
            <span>{userXP.total_xp} Total XP</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-1">
          <span>{progress.current} XP</span>
          <span>{500} XP</span>
        </div>
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 via-slate-500 to-pink-500 h-3 rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${progress.percentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
          </div>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {progress.needed} XP until level {userXP.current_level + 1}
        </p>
      </div>

      {/* Category Breakdown */}
      {showDetails && Object.keys(userXP.category_xp).length > 0 && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-1">
            <Star className="w-4 h-4" />
            XP Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(userXP.category_xp).map(([category, xp]) => (
              <div key={category} className="flex justify-between text-sm">
                <span className="capitalize text-neutral-600 dark:text-neutral-400">
                  {category}:
                </span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {xp} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper components
export const CompactXPProgress = ({ userId, className }: { userId?: string; className?: string }) => (
  <XPProgress userId={userId} compact showDetails={false} className={className} />
);

export const DetailedXPProgress = ({ userId, className }: { userId?: string; className?: string }) => (
  <XPProgress userId={userId} showDetails className={className} />
);