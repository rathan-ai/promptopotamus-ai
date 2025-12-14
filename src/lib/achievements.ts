'use client';

import { createClient } from '@/lib/supabase/client';

export interface Achievement {
  id: string;
  achievement_key: string;
  name: string;
  description: string;
  icon: string;
  category: 'creation' | 'engagement' | 'social' | 'learning';
  criteria: {
    type: string;
    threshold: number;
    level?: string;
  };
  reward_type: string;
  reward_value?: any;
  xp_points: number;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  metadata?: any;
  achievement?: Achievement;
}

export interface UserExperience {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  category_xp: Record<string, number>;
  last_xp_earned_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  streak_type: 'daily_login' | 'prompt_creation' | 'marketplace_activity';
  current_count: number;
  longest_count: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

/**
 * Achievement Engine - Manages user achievements, XP, and streaks
 */
export class AchievementEngine {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Award XP to user and check for achievements
   */
  async awardXP(
    userId: string, 
    points: number, 
    category: string, 
    context: string,
    metadata?: any
  ): Promise<{ newLevel: number; achievements: Achievement[] }> {
    try {
      // Get or create user experience record
      let userXP = await this.getUserExperience(userId);
      if (!userXP) {
        userXP = await this.createUserExperience(userId);
      }

      if (!userXP) {
        throw new Error('Failed to get user experience');
      }

      const oldLevel = userXP.current_level;
      const newTotalXP = userXP.total_xp + points;
      const newLevel = this.calculateLevel(newTotalXP);
      const newCategoryXP = { ...userXP.category_xp };
      newCategoryXP[category] = (newCategoryXP[category] || 0) + points;

      // Update user XP
      const { error: updateError } = await this.supabase
        .from('user_experience')
        .update({
          total_xp: newTotalXP,
          current_level: newLevel,
          category_xp: newCategoryXP,
          last_xp_earned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {

        return { newLevel: oldLevel, achievements: [] };
      }

      // Check for new achievements
      const newAchievements = await this.checkAchievements(userId, {
        context,
        oldLevel,
        newLevel,
        xpEarned: points,
        category,
        metadata
      });

      return { newLevel, achievements: newAchievements };
    } catch (error) {

      return { newLevel: 1, achievements: [] };
    }
  }

  /**
   * Check and award achievements based on user activity
   */
  async checkAchievements(
    userId: string, 
    context: {
      context: string;
      oldLevel?: number;
      newLevel?: number;
      xpEarned?: number;
      category?: string;
      metadata?: any;
    }
  ): Promise<Achievement[]> {
    try {
      // Get all active achievements
      const { data: achievements, error } = await this.supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true);

      if (error || !achievements) {

        return [];
      }

      // Get user's existing achievements
      const { data: userAchievements } = await this.supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);

      const earnedAchievementIds = new Set(
        userAchievements?.map(ua => ua.achievement_id) || []
      );

      const newAchievements: Achievement[] = [];

      for (const achievement of achievements) {
        // Skip if already earned
        if (earnedAchievementIds.has(achievement.id)) {
          continue;
        }

        // Check if achievement criteria are met
        const isEarned = await this.checkAchievementCriteria(
          userId, 
          achievement, 
          context
        );

        if (isEarned) {
          // Award achievement
          const awarded = await this.awardAchievement(
            userId, 
            achievement.id,
            context.metadata
          );

          if (awarded) {
            newAchievements.push(achievement);
          }
        }
      }

      return newAchievements;
    } catch (error) {

      return [];
    }
  }

  /**
   * Check if specific achievement criteria are met
   */
  private async checkAchievementCriteria(
    userId: string,
    achievement: Achievement,
    context: any
  ): Promise<boolean> {
    try {
      const { type, threshold, level } = achievement.criteria;

      switch (type) {
        case 'prompt_count':
          const { count: promptCount } = await this.supabase
            .from('saved_prompts')
            .select('id', { count: 'exact' })
            .eq('user_id', userId);
          return (promptCount || 0) >= threshold;

        case 'sales_count':
          const { count: salesCount } = await this.supabase
            .from('smart_prompt_purchases')
            .select('id', { count: 'exact' })
            .eq('seller_id', userId);
          return (salesCount || 0) >= threshold;

        case 'purchases_count':
          const { count: purchasesCount } = await this.supabase
            .from('smart_prompt_purchases')
            .select('id', { count: 'exact' })
            .eq('buyer_id', userId);
          return (purchasesCount || 0) >= threshold;

        case 'reviews_count':
          // Assuming we have reviews in prompt_comments
          const { count: reviewsCount } = await this.supabase
            .from('prompt_comments')
            .select('id', { count: 'exact' })
            .eq('user_id', userId);
          return (reviewsCount || 0) >= threshold;

        case 'streak_days':
          const streak = await this.getCurrentStreak(userId, 'daily_login');
          return streak >= threshold;

        case 'follows_count':
          const userProfile = await this.supabase
            .from('user_profiles_extended')
            .select('total_following')
            .eq('user_id', userId)
            .single();
          return (userProfile.data?.total_following || 0) >= threshold;

        case 'followers_count':
          const followerProfile = await this.supabase
            .from('user_profiles_extended')
            .select('total_followers')
            .eq('user_id', userId)
            .single();
          return (followerProfile.data?.total_followers || 0) >= threshold;

        case 'comments_count':
          const { count: commentsCount } = await this.supabase
            .from('prompt_comments')
            .select('id', { count: 'exact' })
            .eq('user_id', userId);
          return (commentsCount || 0) >= threshold;

        case 'certificate_earned':
          const { count: certCount } = await this.supabase
            .from('user_certificates')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .eq('level', level);
          return (certCount || 0) > 0;

        default:
          return false;
      }
    } catch (error) {

      return false;
    }
  }

  /**
   * Award achievement to user
   */
  async awardAchievement(
    userId: string, 
    achievementId: string, 
    metadata?: any
  ): Promise<boolean> {
    try {
      // Insert user achievement
      const { error: insertError } = await this.supabase
        .from('user_achievements')
        .insert([{
          user_id: userId,
          achievement_id: achievementId,
          metadata: metadata || null
        }]);

      if (insertError) {
        if (insertError.code === '23505') {
          // Already awarded
          return true;
        }

        return false;
      }

      // Award XP for achievement
      const { data: achievement } = await this.supabase
        .from('achievement_definitions')
        .select('xp_points, category')
        .eq('id', achievementId)
        .single();

      if (achievement && achievement.xp_points > 0) {
        await this.awardXP(
          userId,
          achievement.xp_points,
          achievement.category,
          'achievement_earned',
          { achievementId }
        );
      }

      return true;
    } catch (error) {

      return false;
    }
  }

  /**
   * Update user streak
   */
  async updateStreak(
    userId: string,
    streakType: 'daily_login' | 'prompt_creation' | 'marketplace_activity'
  ): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get existing streak
      let { data: streak } = await this.supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('streak_type', streakType)
        .single();

      if (!streak) {
        // Create new streak
        const { data: newStreak, error } = await this.supabase
          .from('user_streaks')
          .insert([{
            user_id: userId,
            streak_type: streakType,
            current_count: 1,
            longest_count: 1,
            last_activity_date: today
          }])
          .select('*')
          .single();

        if (error) {

          return 0;
        }

        return 1;
      }

      const lastActivityDate = new Date(streak.last_activity_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

      let newCurrentCount = streak.current_count;
      let newLongestCount = streak.longest_count;

      if (diffDays === 0) {
        // Same day, no change
        return streak.current_count;
      } else if (diffDays === 1) {
        // Consecutive day, increment streak
        newCurrentCount = streak.current_count + 1;
        newLongestCount = Math.max(newLongestCount, newCurrentCount);
      } else {
        // Streak broken, reset to 1
        newCurrentCount = 1;
      }

      // Update streak
      const { error: updateError } = await this.supabase
        .from('user_streaks')
        .update({
          current_count: newCurrentCount,
          longest_count: newLongestCount,
          last_activity_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('id', streak.id);

      if (updateError) {

        return streak.current_count;
      }

      return newCurrentCount;
    } catch (error) {

      return 0;
    }
  }

  /**
   * Get current streak for user
   */
  async getCurrentStreak(
    userId: string,
    streakType: 'daily_login' | 'prompt_creation' | 'marketplace_activity'
  ): Promise<number> {
    try {
      const { data: streak } = await this.supabase
        .from('user_streaks')
        .select('current_count, last_activity_date')
        .eq('user_id', userId)
        .eq('streak_type', streakType)
        .single();

      if (!streak) return 0;

      // Check if streak is still valid (not broken)
      const lastActivityDate = new Date(streak.last_activity_date);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        // Streak is broken
        return 0;
      }

      return streak.current_count;
    } catch (error) {

      return 0;
    }
  }

  /**
   * Get user experience
   */
  async getUserExperience(userId: string): Promise<UserExperience | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_experience')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {

        return null;
      }

      return data;
    } catch (error) {

      return null;
    }
  }

  /**
   * Create user experience record
   */
  async createUserExperience(userId: string): Promise<UserExperience | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_experience')
        .insert([{
          user_id: userId,
          total_xp: 0,
          current_level: 1,
          category_xp: {}
        }])
        .select('*')
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
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_achievements')
        .select(`
          *,
          achievement_definitions!user_achievements_achievement_id_fkey(*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) {

        return [];
      }

      return data || [];
    } catch (error) {

      return [];
    }
  }

  /**
   * Calculate level from total XP
   */
  private calculateLevel(totalXP: number): number {
    // Simple level calculation: every 500 XP = 1 level
    // Level 1: 0-499 XP
    // Level 2: 500-999 XP
    // Level 3: 1000-1499 XP, etc.
    return Math.floor(totalXP / 500) + 1;
  }

  /**
   * Calculate XP needed for next level
   */
  getXPForNextLevel(currentLevel: number): number {
    return currentLevel * 500;
  }

  /**
   * Calculate XP progress in current level
   */
  getCurrentLevelProgress(totalXP: number, currentLevel: number): {
    current: number;
    needed: number;
    percentage: number;
  } {
    const currentLevelXP = (currentLevel - 1) * 500;
    const nextLevelXP = currentLevel * 500;
    const currentProgress = totalXP - currentLevelXP;
    const neededForNext = nextLevelXP - totalXP;
    const percentage = (currentProgress / 500) * 100;

    return {
      current: currentProgress,
      needed: neededForNext,
      percentage: Math.min(percentage, 100)
    };
  }
}

// Export singleton instance
export const achievementEngine = new AchievementEngine();