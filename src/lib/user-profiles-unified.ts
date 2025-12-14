import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

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
 * Unified User Profile Management System
 * Works on both client and server side
 */
export class UnifiedUserProfileManager {
  private isServerSide: boolean;
  private clientSupabase?: SupabaseClient;

  constructor(isServerSide = false) {
    this.isServerSide = isServerSide;
    if (!isServerSide) {
      this.clientSupabase = createClient();
    }
  }

  private async getSupabase(): Promise<SupabaseClient> {
    if (this.isServerSide) {
      return await createServerClient();
    }
    return this.clientSupabase!;
  }

  /**
   * Get user profile by user ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const supabase = await this.getSupabase();
      
      const { data, error } = await supabase
        .from('user_profiles_extended')
        .select(`
          *,
          profiles!user_profiles_extended_user_id_fkey(name, email, role)
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return await this.createUserProfile(userId);
        }
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create a new user profile
   */
  async createUserProfile(userId: string, profileData?: Partial<ProfileUpdateData>): Promise<UserProfile | null> {
    try {
      const supabase = await this.getSupabase();
      
      const { data, error } = await supabase
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
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, profileData: ProfileUpdateData): Promise<UserProfile | null> {
    try {
      const supabase = await this.getSupabase();
      
      const { data, error } = await supabase
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
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) {
      return false;
    }

    try {
      const supabase = await this.getSupabase();
      
      const { error: followError } = await supabase
        .from('user_follows')
        .insert([{
          follower_id: followerId,
          following_id: followingId
        }]);

      if (followError) {
        if (followError.code === '23505') {
          return true; // Already following
        }
        return false;
      }

      await this.updateFollowerCount(followingId, 1);
      await this.updateFollowingCount(followerId, 1);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase();
      
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) {
        return false;
      }

      await this.updateFollowerCount(followingId, -1);
      await this.updateFollowingCount(followerId, -1);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase();
      
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user's followers
   */
  async getUserFollowers(userId: string, limit = 20, offset = 0): Promise<UserProfile[]> {
    try {
      const supabase = await this.getSupabase();
      
      const { data, error } = await supabase
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
        return [];
      }

      return (data?.map(follow => follow.user_profiles_extended).filter(Boolean) || []) as unknown as UserProfile[];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get users that the user is following
   */
  async getUserFollowing(userId: string, limit = 20, offset = 0): Promise<UserProfile[]> {
    try {
      const supabase = await this.getSupabase();
      
      const { data, error } = await supabase
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
        return [];
      }

      return (data?.map(follow => follow.user_profiles_extended).filter(Boolean) || []) as unknown as UserProfile[];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get popular users (by follower count)
   */
  async getPopularUsers(limit = 10, offset = 0): Promise<UserProfile[]> {
    try {
      const supabase = await this.getSupabase();
      
      const { data, error } = await supabase
        .from('user_profiles_extended')
        .select(`
          *,
          profiles!user_profiles_extended_user_id_fkey(name, email, role)
        `)
        .order('total_followers', { ascending: false })
        .order('reputation_score', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get suggested users to follow
   */
  async getSuggestedUsers(userId: string, limit = 5): Promise<UserProfile[]> {
    try {
      const supabase = await this.getSupabase();
      
      const { data, error } = await supabase
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
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Search users by name or expertise
   */
  async searchUsers(query: string, limit = 20, offset = 0): Promise<UserProfile[]> {
    try {
      const supabase = await this.getSupabase();
      
      const { data, error } = await supabase
        .from('user_profiles_extended')
        .select(`
          *,
          profiles!user_profiles_extended_user_id_fkey(name, email, role)
        `)
        .or(`profiles.name.ilike.%${query}%,expertise_tags.cs.{${query}}`)
        .order('total_followers', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Update follower count
   */
  private async updateFollowerCount(userId: string, delta: number): Promise<void> {
    try {
      const supabase = await this.getSupabase();
      
      const { data: profile } = await supabase
        .from('user_profiles_extended')
        .select('total_followers')
        .eq('user_id', userId)
        .single();

      if (profile) {
        await supabase
          .from('user_profiles_extended')
          .update({ 
            total_followers: Math.max(0, profile.total_followers + delta),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Update following count
   */
  private async updateFollowingCount(userId: string, delta: number): Promise<void> {
    try {
      const supabase = await this.getSupabase();
      
      const { data: profile } = await supabase
        .from('user_profiles_extended')
        .select('total_following')
        .eq('user_id', userId)
        .single();

      if (profile) {
        await supabase
          .from('user_profiles_extended')
          .update({ 
            total_following: Math.max(0, profile.total_following + delta),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }
    } catch (error) {
      // Silent error
    }
  }
}

// Export instances for client and server
export const clientUserProfileManager = new UnifiedUserProfileManager(false);
export const serverUserProfileManager = new UnifiedUserProfileManager(true);

// Helper functions for backward compatibility
export async function getCurrentUserProfile(userId: string, isServer = false): Promise<UserProfile | null> {
  const manager = isServer ? serverUserProfileManager : clientUserProfileManager;
  return manager.getUserProfile(userId);
}

export async function followUser(followerId: string, followingId: string, isServer = false): Promise<boolean> {
  const manager = isServer ? serverUserProfileManager : clientUserProfileManager;
  return manager.followUser(followerId, followingId);
}

export async function unfollowUser(followerId: string, followingId: string, isServer = false): Promise<boolean> {
  const manager = isServer ? serverUserProfileManager : clientUserProfileManager;
  return manager.unfollowUser(followerId, followingId);
}

export async function checkFollowStatus(followerId: string, followingId: string, isServer = false): Promise<boolean> {
  const manager = isServer ? serverUserProfileManager : clientUserProfileManager;
  return manager.isFollowing(followerId, followingId);
}