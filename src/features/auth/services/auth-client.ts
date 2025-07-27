/**
 * Client-side authentication service
 */

import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/shared/types';

/**
 * Client-side authentication service
 */
export class ClientAuthService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    return { user, error };
  }

  /**
   * Get user profile with PromptCoin balances
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        credits_analysis,
        credits_enhancement,
        credits_exam,
        credits_export,
        payment_status,
        subscription_tier,
        subscription_expires_at,
        created_at,
        updated_at
      `)
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    // Transform to UserProfile format
    return {
      id: profile.id,
      fullName: profile.full_name || '',
      email: profile.email || '',
      avatarUrl: profile.avatar_url,
      type: profile.payment_status === 'active' ? 'paid' : 'free',
      paymentStatus: profile.payment_status || 'inactive',
      subscriptionTier: profile.subscription_tier || 'free',
      subscriptionExpiresAt: profile.subscription_expires_at,
      totalPromptCoins: {
        analysis: profile.credits_analysis || 0,
        enhancement: profile.credits_enhancement || 0,
        exam: profile.credits_exam || 0,
        export: profile.credits_export || 0
      },
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const profileUpdates: any = {};

    if (updates.fullName !== undefined) {
      profileUpdates.full_name = updates.fullName;
    }
    if (updates.email !== undefined) {
      profileUpdates.email = updates.email;
    }
    if (updates.avatarUrl !== undefined) {
      profileUpdates.avatar_url = updates.avatarUrl;
    }

    const { error } = await this.supabase
      .from('profiles')
      .update({
        ...profileUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    return { error };
  }

  /**
   * Sign out user
   */
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}

// Export singleton instance for client use
export const clientAuthService = new ClientAuthService();