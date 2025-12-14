import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import { UserProfile, UserType, PaymentStatus } from '@/shared/types';

/**
 * Client-side authentication service
 */
export class AuthService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    return { user, error };
  }

  async signInWithEmail(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signUpWithEmail(email: string, password: string) {
    return await this.supabase.auth.signUp({
      email,
      password,
    });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async resetPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  }

  async updatePassword(password: string) {
    return await this.supabase.auth.updateUser({ password });
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}

/**
 * Server-side authentication service
 */
export class ServerAuthService {
  private supabasePromise;

  constructor() {
    this.supabasePromise = createServerClient();
  }

  async getCurrentUser() {
    const supabase = await this.supabasePromise;
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  async validateSession() {
    const supabase = await this.supabasePromise;
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  }
}

/**
 * User profile management service
 */
export class UserProfileService {
  private supabase: any;
  private isServerSide: boolean;

  constructor(serverSide = false) {
    this.isServerSide = serverSide;
    this.supabase = serverSide ? createServerClient() : createClient();
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const supabase = this.isServerSide ? await this.supabase : this.supabase;
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('payment_status, subscription_tier')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      // Default profile for new users
      return {
        type: 'free',
        paymentStatus: 'none'
      };
    }

    // Determine user type based on subscription tier or payment status
    const userType: UserType = profile.subscription_tier === 'pro' || profile.subscription_tier === 'premium' ? 'paid' : 'free';
    const paymentStatus: PaymentStatus = profile.payment_status || 'none';

    return {
      type: userType,
      paymentStatus
    };
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    return await this.supabase
      .from('profiles')
      .update({
        payment_status: updates.paymentStatus
      })
      .eq('id', userId);
  }

  async createUserProfile(userId: string, email: string) {
    return await this.supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        payment_status: 'none'
      });
  }
}

// Export singleton instances
export const authService = new AuthService();
export const serverAuthService = new ServerAuthService();
export const userProfileService = new UserProfileService();
export const serverUserProfileService = new UserProfileService(true);
