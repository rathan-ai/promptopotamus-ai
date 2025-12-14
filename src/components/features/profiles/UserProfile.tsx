'use client';

import { useState, useEffect } from 'react';
import { User, MapPin, Link, Twitter, Linkedin, Users, UserPlus, UserMinus, Edit3, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserProfile, followUser, unfollowUser, checkFollowStatus, userProfileManager } from '@/lib/user-profiles';
import UserIdentityBadge from './UserIdentityBadge';
import { useUser } from '@/lib/hooks/useUser';
import toast from 'react-hot-toast';

interface UserProfileProps {
  userId: string;
  showFollowButton?: boolean;
  showEditButton?: boolean;
  onEditClick?: () => void;
  compact?: boolean;
  className?: string;
}

export default function UserProfileComponent({
  userId,
  showFollowButton = true,
  showEditButton = false,
  onEditClick,
  compact = false,
  className = ''
}: UserProfileProps) {
  const { user: currentUser } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    if (currentUser && showFollowButton && currentUser.id !== userId) {
      checkFollowingStatus();
    }
  }, [userId, currentUser]);

  const loadProfile = async () => {
    try {
      const profileData = await userProfileManager.getUserProfile(userId);
      setProfile(profileData);
    } catch (error) {
      // Error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowingStatus = async () => {
    if (!currentUser) return;
    
    try {
      const following = await checkFollowStatus(currentUser.id, userId);
      setIsFollowing(following);
    } catch (error) {
      // Error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error('Please sign in to follow users');
      return;
    }

    if (currentUser.id === userId) {
      toast.error('You cannot follow yourself');
      return;
    }

    setFollowLoading(true);
    try {
      let success;
      
      if (isFollowing) {
        success = await unfollowUser(currentUser.id, userId);
        if (success) {
          setIsFollowing(false);
          setProfile(prev => prev ? { 
            ...prev, 
            total_followers: Math.max(0, prev.total_followers - 1) 
          } : null);
          toast.success('Unfollowed successfully');
        }
      } else {
        success = await followUser(currentUser.id, userId);
        if (success) {
          setIsFollowing(true);
          setProfile(prev => prev ? { 
            ...prev, 
            total_followers: prev.total_followers + 1 
          } : null);
          toast.success('Following successfully');
        }
      }

      if (!success) {
        toast.error('Something went wrong');
      }
    } catch (error) {
      // Error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-neutral-300 dark:bg-neutral-600 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-neutral-300 dark:bg-neutral-600 rounded w-48"></div>
              <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded w-32"></div>
              <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`${className}`}>
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 text-center">
          <User className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
          <p className="text-neutral-600 dark:text-neutral-400">Profile not found</p>
        </div>
      </div>
    );
  }

  const userTier = profile.profiles?.role === 'premium' ? 'premium' : 
                  profile.profiles?.role === 'pro' ? 'pro' : 'free';

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {profile.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-neutral-900 dark:text-white truncate">
              {profile.profiles?.name || 'Unknown User'}
            </p>
            <UserIdentityBadge user={{ tier: userTier }} size="sm" showTierName={false} />
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
            {profile.bio || 'Prompt enthusiast'}
          </p>
        </div>
        {showFollowButton && currentUser && currentUser.id !== userId && (
          <Button
            size="sm"
            variant={isFollowing ? "outline" : "default"}
            onClick={handleFollowToggle}
            disabled={followLoading}
            className="flex-shrink-0"
          >
            {followLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isFollowing ? (
              <>
                <UserMinus className="w-3 h-3 mr-1" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3 mr-1" />
                Follow
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-slate-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {profile.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                {profile.profiles?.name || 'Unknown User'}
              </h3>
              <UserIdentityBadge user={{ tier: userTier }} />
            </div>
            <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{profile.total_followers} followers</span>
              </div>
              <div className="flex items-center gap-1">
                <UserPlus className="w-4 h-4" />
                <span>{profile.total_following} following</span>
              </div>
              {profile.reputation_score > 0 && (
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>{profile.reputation_score} reputation</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {showEditButton && onEditClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={onEditClick}
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Edit Profile
            </Button>
          )}
          {showFollowButton && currentUser && currentUser.id !== userId && (
            <Button
              size="sm"
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollowToggle}
              disabled={followLoading}
            >
              {followLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4 mr-1" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {profile.bio && (
        <p className="text-neutral-700 dark:text-neutral-300 mb-4">
          {profile.bio}
        </p>
      )}

      {/* Expertise Tags */}
      {profile.expertise_tags && profile.expertise_tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.expertise_tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-slate-400"
            >
              <Star className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Social Links */}
      <div className="flex items-center gap-4 text-sm">
        {profile.website && (
          <a
            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:underline"
          >
            <Link className="w-4 h-4" />
            Website
          </a>
        )}
        {profile.twitter_handle && (
          <a
            href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:underline"
          >
            <Twitter className="w-4 h-4" />
            Twitter
          </a>
        )}
        {profile.linkedin_url && (
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:underline"
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}

// Export convenient wrapper components
export const CompactUserProfile = ({ userId, className }: { userId: string; className?: string }) => (
  <UserProfileComponent userId={userId} compact className={className} />
);

export const FollowableUserProfile = ({ userId, className }: { userId: string; className?: string }) => (
  <UserProfileComponent userId={userId} showFollowButton className={className} />
);

export const EditableUserProfile = ({ 
  userId, 
  onEditClick, 
  className 
}: { 
  userId: string; 
  onEditClick: () => void; 
  className?: string; 
}) => (
  <UserProfileComponent 
    userId={userId} 
    showEditButton 
    showFollowButton={false}
    onEditClick={onEditClick} 
    className={className} 
  />
);