'use client';

import { createClient } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  bio?: string;
  website?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  expertise_tags: string[];
  reputation_score: number;
  total_followers: number;
  total_following: number;
  created_at: string;
  updated_at: string;
  // Profile data from auth
  profiles?: {
    name: string;
    email: string;
    role: string;
  };
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface ProfileUpdateData {
  bio?: string;
  website?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  expertise_tags?: string[];
}

/**
 * User Profile Management System
 */
export class UserProfileManager {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Get user profile by user ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles_extended')
        .select(`
          *,
          profiles!user_profiles_extended_user_id_fkey(name, email, role)
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          return await this.createUserProfile(userId);
        }
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Create a new user profile
   */
  async createUserProfile(userId: string, profileData?: Partial<ProfileUpdateData>): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles_extended')
        .insert([{
          user_id: userId,
          bio: profileData?.bio || null,
          website: profileData?.website || null,
          twitter_handle: profileData?.twitter_handle || null,
          linkedin_url: profileData?.linkedin_url || null,
          expertise_tags: profileData?.expertise_tags || [],
          reputation_score: 0,
          total_followers: 0,
          total_following: 0
        }])
        .select(`
          *,
          profiles!user_profiles_extended_user_id_fkey(name, email, role)
        `)
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, profileData: ProfileUpdateData): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles_extended')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select(`
          *,
          profiles!user_profiles_extended_user_id_fkey(name, email, role)
        `)
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) {
      console.error('Cannot follow yourself');
      return false;
    }

    try {
      // Insert follow relationship
      const { error: followError } = await this.supabase
        .from('user_follows')
        .insert([{
          follower_id: followerId,
          following_id: followingId
        }]);

      if (followError) {
        if (followError.code === '23505') {
          console.log('Already following this user');
          return true; // Already following
        }
        console.error('Error creating follow relationship:', followError);
        return false;
      }

      // Update follower count for the user being followed
      await this.updateFollowerCount(followingId, 1);
      // Update following count for the follower
      await this.updateFollowingCount(followerId, 1);

      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) {
        console.error('Error removing follow relationship:', error);
        return false;
      }

      // Update follower count for the user being unfollowed
      await this.updateFollowerCount(followingId, -1);
      // Update following count for the unfollower
      await this.updateFollowingCount(followerId, -1);

      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  /**
   * Get user's followers
   */
  async getUserFollowers(userId: string, limit = 20, offset = 0): Promise<UserProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_follows')
        .select(`
          follower_id,
          created_at,
          user_profiles_extended!user_follows_follower_id_fkey(
            *,
            profiles!user_profiles_extended_user_id_fkey(name, email, role)
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching followers:', error);
        return [];
      }

      return data.map(follow => follow.user_profiles_extended).filter(Boolean);
    } catch (error) {
      console.error('Error getting user followers:', error);
      return [];
    }
  }

  /**
   * Get users that the user is following
   */
  async getUserFollowing(userId: string, limit = 20, offset = 0): Promise<UserProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_follows')
        .select(`
          following_id,
          created_at,
          user_profiles_extended!user_follows_following_id_fkey(
            *,
            profiles!user_profiles_extended_user_id_fkey(name, email, role)
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching following:', error);
        return [];
      }

      return data.map(follow => follow.user_profiles_extended).filter(Boolean);
    } catch (error) {
      console.error('Error getting user following:', error);
      return [];
    }
  }

  /**
   * Get popular users (by follower count)
   */
  async getPopularUsers(limit = 10, offset = 0): Promise<UserProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles_extended')
        .select(`
          *,
          profiles!user_profiles_extended_user_id_fkey(name, email, role)
        `)
        .order('total_followers', { ascending: false })
        .order('reputation_score', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching popular users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting popular users:', error);
      return [];
    }
  }

  /**
   * Get suggested users to follow
   */
  async getSuggestedUsers(userId: string, limit = 5): Promise<UserProfile[]> {
    try {
      // Get users that current user's followed users also follow
      // This is a simplified recommendation algorithm
      const { data, error } = await this.supabase
        .from('user_profiles_extended')
        .select(`
          *,
          profiles!user_profiles_extended_user_id_fkey(name, email, role)
        `)
        .neq('user_id', userId)
        .not('user_id', 'in', `(
          SELECT following_id FROM user_follows WHERE follower_id = '${userId}'
        )`)
        .order('total_followers', { ascending: false })
        .order('reputation_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching suggested users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting suggested users:', error);
      return [];
    }
  }

  /**
   * Search users by name or expertise
   */
  async searchUsers(query: string, limit = 20, offset = 0): Promise<UserProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles_extended')
        .select(`
          *,
          profiles!user_profiles_extended_user_id_fkey(name, email, role)
        `)
        .or(`profiles.name.ilike.%${query}%,expertise_tags.cs.{${query}}`)
        .order('total_followers', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Update follower count
   */
  private async updateFollowerCount(userId: string, delta: number): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('increment_follower_count', {
        user_id: userId,
        increment: delta
      });

      if (error) {
        // Fallback to manual update if RPC doesn't exist
        const { data: profile } = await this.supabase
          .from('user_profiles_extended')
          .select('total_followers')
          .eq('user_id', userId)
          .single();

        if (profile) {
          await this.supabase
            .from('user_profiles_extended')
            .update({ 
              total_followers: Math.max(0, profile.total_followers + delta),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        }
      }
    } catch (error) {
      console.error('Error updating follower count:', error);
    }
  }

  /**
   * Update following count
   */
  private async updateFollowingCount(userId: string, delta: number): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('increment_following_count', {
        user_id: userId,
        increment: delta
      });

      if (error) {
        // Fallback to manual update if RPC doesn't exist
        const { data: profile } = await this.supabase
          .from('user_profiles_extended')
          .select('total_following')
          .eq('user_id', userId)
          .single();

        if (profile) {
          await this.supabase
            .from('user_profiles_extended')
            .update({ 
              total_following: Math.max(0, profile.total_following + delta),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        }
      }
    } catch (error) {
      console.error('Error updating following count:', error);
    }
  }
}

// Export singleton instance
export const userProfileManager = new UserProfileManager();

/**
 * Helper functions for easy access
 */
export async function getCurrentUserProfile(userId: string): Promise<UserProfile | null> {
  return userProfileManager.getUserProfile(userId);
}

export async function followUser(followerId: string, followingId: string): Promise<boolean> {
  return userProfileManager.followUser(followerId, followingId);
}

export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
  return userProfileManager.unfollowUser(followerId, followingId);
}

export async function checkFollowStatus(followerId: string, followingId: string): Promise<boolean> {
  return userProfileManager.isFollowing(followerId, followingId);
}