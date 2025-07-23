'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { followUser, unfollowUser, checkFollowStatus } from '@/lib/user-profiles';
import { useUser } from '@/lib/auth';
import toast from 'react-hot-toast';

interface FollowButtonProps {
  targetUserId: string;
  onFollowChange?: (isFollowing: boolean, followerCount: number) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
  showIcon?: boolean;
  className?: string;
}

export default function FollowButton({
  targetUserId,
  onFollowChange,
  size = 'md',
  variant = 'primary',
  showIcon = true,
  className = ''
}: FollowButtonProps) {
  const { user: currentUser } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (currentUser && currentUser.id !== targetUserId) {
      checkFollowingStatus();
    } else {
      setInitialLoading(false);
    }
  }, [currentUser, targetUserId]);

  const checkFollowingStatus = async () => {
    if (!currentUser) return;
    
    try {
      const following = await checkFollowStatus(currentUser.id, targetUserId);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error('Please sign in to follow users');
      return;
    }

    if (currentUser.id === targetUserId) {
      toast.error('You cannot follow yourself');
      return;
    }

    setLoading(true);
    try {
      let success;
      let newFollowingState;
      let followerDelta;
      
      if (isFollowing) {
        success = await unfollowUser(currentUser.id, targetUserId);
        newFollowingState = false;
        followerDelta = -1;
        if (success) {
          toast.success('Unfollowed successfully');
        }
      } else {
        success = await followUser(currentUser.id, targetUserId);
        newFollowingState = true;
        followerDelta = 1;
        if (success) {
          toast.success('Following successfully');
        }
      }

      if (success) {
        setIsFollowing(newFollowingState);
        onFollowChange?.(newFollowingState, followerDelta);
      } else {
        toast.error('Something went wrong');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if user is viewing their own profile
  if (!currentUser || currentUser.id === targetUserId) {
    return null;
  }

  if (initialLoading) {
    return (
      <Button
        size={size}
        variant="outline"
        disabled
        className={className}
      >
        <div className="w-4 h-4 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin" />
      </Button>
    );
  }

  const buttonVariant = isFollowing ? 'outline' : variant;

  return (
    <Button
      size={size}
      variant={buttonVariant}
      onClick={handleFollowToggle}
      disabled={loading}
      className={`transition-all duration-200 ${
        isFollowing 
          ? 'hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-600' 
          : ''
      } ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {showIcon && (
            <>
              {isFollowing ? (
                <UserMinus className="w-4 h-4 mr-1" />
              ) : (
                <UserPlus className="w-4 h-4 mr-1" />
              )}
            </>
          )}
          {isFollowing ? 'Unfollow' : 'Follow'}
        </>
      )}
    </Button>
  );
}

// Compact version for inline use
export function CompactFollowButton({ targetUserId, className }: { targetUserId: string; className?: string }) {
  return (
    <FollowButton
      targetUserId={targetUserId}
      size="sm"
      variant="outline"
      showIcon={false}
      className={className}
    />
  );
}

// Icon-only version for space-constrained areas
export function IconFollowButton({ targetUserId, className }: { targetUserId: string; className?: string }) {
  const { user: currentUser } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.id !== targetUserId) {
      checkFollowingStatus();
    }
  }, [currentUser, targetUserId]);

  const checkFollowingStatus = async () => {
    if (!currentUser) return;
    
    try {
      const following = await checkFollowStatus(currentUser.id, targetUserId);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error('Please sign in to follow users');
      return;
    }

    setLoading(true);
    try {
      let success;
      
      if (isFollowing) {
        success = await unfollowUser(currentUser.id, targetUserId);
        if (success) {
          setIsFollowing(false);
          toast.success('Unfollowed');
        }
      } else {
        success = await followUser(currentUser.id, targetUserId);
        if (success) {
          setIsFollowing(true);
          toast.success('Following');
        }
      }

      if (!success) {
        toast.error('Something went wrong');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.id === targetUserId) {
    return null;
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`p-2 rounded-full transition-colors duration-200 ${
        isFollowing
          ? 'bg-blue-100 text-blue-600 hover:bg-red-100 hover:text-red-600 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-red-900/30 dark:hover:text-red-400'
          : 'bg-neutral-100 text-neutral-600 hover:bg-blue-100 hover:text-blue-600 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'
      } ${className}`}
      title={isFollowing ? 'Unfollow' : 'Follow'}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="w-4 h-4" />
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
    </button>
  );
}