'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Gift, Zap, Crown, User } from 'lucide-react';
import { clsx } from 'clsx';

interface UserIdentityBadgeProps {
  className?: string;
  showTierName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  user?: any;
}

const TIER_CONFIG = {
  free: {
    icon: Gift,
    name: 'Explorer',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-300 dark:border-gray-600',
    gradient: 'from-gray-400 to-gray-600',
    tagline: 'Learning the Ropes'
  },
  pro: {
    icon: Zap,
    name: 'Creator',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-600',
    gradient: 'from-blue-500 to-purple-600',
    tagline: 'Building Excellence'
  },
  premium: {
    icon: Crown,
    name: 'Master',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
    borderColor: 'border-yellow-400 dark:border-yellow-500',
    gradient: 'from-yellow-500 via-orange-500 to-red-500',
    tagline: 'Premium Member'
  }
};

export default function UserIdentityBadge({ 
  className = '', 
  showTierName = true, 
  size = 'md',
  user 
}: UserIdentityBadgeProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('payment_status')
          .eq('id', user.id)
          .single();
        
        if (error || !profileData) {
          setProfile({ tier: 'free' });
        } else {
          // Determine tier based on payment status
          const tier = profileData.payment_status === 'active' ? 'paid' : 'free';
          setProfile({ tier });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setProfile({ tier: 'free' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  if (loading || !profile || !user) {
    return (
      <div className={clsx(
        'animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full',
        {
          'w-8 h-8': size === 'sm',
          'w-10 h-10': size === 'md',
          'w-12 h-12': size === 'lg'
        },
        className
      )} />
    );
  }

  const config = TIER_CONFIG[profile.tier || 'free'];
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      badge: 'w-6 h-6'
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      badge: 'w-8 h-8'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      badge: 'w-10 h-10'
    }
  };

  const sizes = sizeClasses[size];

  if (!showTierName) {
    // Badge-only mode - circular badge with icon
    return (
      <div
        className={clsx(
          'relative inline-flex items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-105',
          config.bgColor,
          config.borderColor,
          sizes.badge,
          className
        )}
        title={`${config.name} • ${config.tagline}`}
      >
        <IconComponent className={clsx(sizes.icon, config.color)} />
        {(profile.tier || 'free') === 'premium' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border border-white dark:border-gray-900 animate-pulse" />
        )}
      </div>
    );
  }

  // Full badge with tier name
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border transition-all duration-200 hover:shadow-md font-medium',
        config.bgColor,
        config.borderColor,
        config.color,
        sizes.container,
        className
      )}
    >
      <div className="relative">
        <IconComponent className={sizes.icon} />
        {(profile.tier || 'free') === 'premium' && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="font-semibold leading-tight">{config.name}</span>
        {size === 'lg' && (
          <span className="text-xs opacity-75 leading-tight">{config.tagline}</span>
        )}
      </div>

      {/* Subtle gradient border effect for premium */}
      {(profile.tier || 'free') === 'premium' && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 blur-sm -z-10" />
      )}
    </div>
  );
}

// Hook for getting user identity
export function useUserIdentity(userId?: string) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('payment_status')
          .eq('id', userId)
          .single();
        
        if (error || !profileData) {
          setProfile({ tier: 'free' });
        } else {
          // Determine tier based on payment status
          const tier = profileData.payment_status === 'active' ? 'paid' : 'free';
          setProfile({ tier });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setProfile({ tier: 'free' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return {
    profile,
    loading,
    tierConfig: profile ? TIER_CONFIG[profile.tier || 'free'] : null
  };
}