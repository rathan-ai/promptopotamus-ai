'use client';

import { useState } from 'react';
import { 
  Star, Trophy, Crown, DollarSign, TrendingUp, ShoppingCart, 
  MessageCircle, Calendar, Flame, Users, Heart, MessageSquare, 
  Award, Zap, Gift, Sparkles 
} from 'lucide-react';
import { Achievement, UserAchievement } from '@/lib/achievements';

interface AchievementBadgeProps {
  achievement: Achievement | UserAchievement;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  showXP?: boolean;
  earned?: boolean;
  earnedAt?: string;
  className?: string;
}

const IconMap = {
  star: Star,
  trophy: Trophy,
  crown: Crown,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'shopping-cart': ShoppingCart,
  'message-circle': MessageCircle,
  calendar: Calendar,
  flame: Flame,
  users: Users,
  heart: Heart,
  'message-square': MessageSquare,
  award: Award,
  zap: Zap,
  gift: Gift,
  sparkles: Sparkles
};

const CategoryColors = {
  creation: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-600',
    text: 'text-blue-800 dark:text-blue-300',
    icon: 'text-slate-600 dark:text-slate-400'
  },
  engagement: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-300 dark:border-emerald-600',
    text: 'text-green-800 dark:text-green-300',
    icon: 'text-emerald-600 dark:text-emerald-500'
  },
  social: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-300 dark:border-slate-600',
    text: 'text-purple-800 dark:text-purple-300',
    icon: 'text-slate-600 dark:text-purple-400'
  },
  learning: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-yellow-300 dark:border-yellow-600',
    text: 'text-yellow-800 dark:text-yellow-300',
    icon: 'text-yellow-600 dark:text-slate-400'
  }
};

const SizeClasses = {
  sm: {
    container: 'w-12 h-12',
    icon: 'w-6 h-6',
    text: 'text-xs'
  },
  md: {
    container: 'w-16 h-16',
    icon: 'w-8 h-8',
    text: 'text-sm'
  },
  lg: {
    container: 'w-20 h-20',
    icon: 'w-10 h-10',
    text: 'text-base'
  }
};

export default function AchievementBadge({
  achievement,
  size = 'md',
  showTooltip = true,
  showXP = false,
  earned = true,
  earnedAt,
  className = ''
}: AchievementBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Handle both Achievement and UserAchievement types
  const achievementData = 'achievement' in achievement ? achievement.achievement : achievement;
  if (!achievementData) return null;

  const Icon = IconMap[achievementData.icon as keyof typeof IconMap] || Star;
  const categoryStyle = CategoryColors[achievementData.category];
  const sizeClasses = SizeClasses[size];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const badgeContent = (
    <div
      className={`
        relative flex items-center justify-center rounded-full border-2 cursor-pointer transition-all duration-200
        ${sizeClasses.container}
        ${earned 
          ? `${categoryStyle.bg} ${categoryStyle.border} hover:scale-105 hover:shadow-lg` 
          : 'bg-neutral-100 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-600 opacity-60'
        }
        ${className}
      `}
      onClick={() => showTooltip && setShowDetails(!showDetails)}
    >
      <Icon 
        className={`
          ${sizeClasses.icon}
          ${earned ? categoryStyle.icon : 'text-neutral-400 dark:text-neutral-600'}
        `}
      />
      
      {/* Sparkle effect for newly earned achievements */}
      {earned && earnedAt && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-slate-400 rounded-full animate-pulse"></div>
        </div>
      )}
      
      {/* XP indicator */}
      {showXP && achievementData.xp_points > 0 && (
        <div className="absolute -bottom-1 -right-1 bg-slate-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {achievementData.xp_points}
        </div>
      )}
    </div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <div className="relative inline-block">
      {badgeContent}
      
      {/* Tooltip */}
      {showDetails && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-4 max-w-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className={`
                p-2 rounded-full ${categoryStyle.bg} ${categoryStyle.border} border
              `}>
                <Icon className={`w-5 h-5 ${categoryStyle.icon}`} />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-white">
                  {achievementData.name}
                </h4>
                <span className={`
                  text-xs px-2 py-1 rounded-full font-medium
                  ${categoryStyle.bg} ${categoryStyle.text}
                `}>
                  {achievementData.category}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              {achievementData.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                {achievementData.xp_points > 0 && (
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {achievementData.xp_points} XP
                  </span>
                )}
              </div>
              {earned && earnedAt && (
                <span>
                  Earned {formatDate(earnedAt)}
                </span>
              )}
              {earned && 'earned_at' in achievement && (
                <span>
                  Earned {formatDate(achievement.earned_at)}
                </span>
              )}
            </div>
            
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-2 h-2 bg-white dark:bg-neutral-800 border-r border-b border-neutral-200 dark:border-neutral-700 transform rotate-45"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper components for different use cases
export const CompactAchievementBadge = ({ 
  achievement, 
  className 
}: { 
  achievement: Achievement | UserAchievement; 
  className?: string; 
}) => (
  <AchievementBadge
    achievement={achievement}
    size="sm"
    showTooltip={false}
    className={className}
  />
);

export const AchievementWithXP = ({ 
  achievement, 
  className 
}: { 
  achievement: Achievement | UserAchievement; 
  className?: string; 
}) => (
  <AchievementBadge
    achievement={achievement}
    size="lg"
    showXP
    className={className}
  />
);

export const UnlockedAchievement = ({ 
  achievement, 
  earnedAt, 
  className 
}: { 
  achievement: Achievement; 
  earnedAt: string; 
  className?: string; 
}) => (
  <AchievementBadge
    achievement={achievement}
    size="lg"
    showXP
    earnedAt={earnedAt}
    className={className}
  />
);

export const LockedAchievement = ({ 
  achievement, 
  className 
}: { 
  achievement: Achievement; 
  className?: string; 
}) => (
  <AchievementBadge
    achievement={achievement}
    size="md"
    earned={false}
    className={className}
  />
);