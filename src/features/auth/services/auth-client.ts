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
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        avatar_url,
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
      type: profile.subscription_tier === 'pro' || profile.subscription_tier === 'premium' ? 'paid' : 'free',
      paymentStatus: profile.payment_status === 'active' ? 'active' : 'none'
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const profileUpdates: any = {};

    // UserProfile only contains type and paymentStatus
    // These are typically managed by the system, not directly updatable by users
    if (updates.paymentStatus !== undefined) {
      profileUpdates.payment_status = updates.paymentStatus;
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
