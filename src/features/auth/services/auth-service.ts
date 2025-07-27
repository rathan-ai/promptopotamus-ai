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
  private supabase;

  constructor() {
    this.supabase = createServerClient();
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    return { user, error };
  }

  async validateSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    return { session, error };
  }
}

/**
 * User profile management service
 */
export class UserProfileService {
  private supabase;

  constructor(serverSide = false) {
    this.supabase = serverSide ? createServerClient() : createClient();
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('credits_analysis, credits_enhancement, credits_exam, credits_export, payment_status')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      // Default profile for new users with free PromptCoins
      return {
        type: 'free',
        paymentStatus: 'none',
        totalPromptCoins: {
          analysis: 50,   // 5 analyses
          enhancement: 45, // 3 enhancements  
          exam: 150,      // 3 exam attempts
          export: 0       // No exports for free
        }
      };
    }

    // Determine user type based on total credits
    const totalCredits = (profile.credits_analysis || 0) + 
                        (profile.credits_enhancement || 0) + 
                        (profile.credits_exam || 0) + 
                        (profile.credits_export || 0);
    
    const userType: UserType = totalCredits > 250 ? 'paid' : 'free';
    const paymentStatus: PaymentStatus = profile.payment_status || 'none';

    return {
      type: userType,
      paymentStatus,
      totalPromptCoins: {
        analysis: profile.credits_analysis || 0,
        enhancement: profile.credits_enhancement || 0,
        exam: profile.credits_exam || 0,
        export: profile.credits_export || 0
      }
    };
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    return await this.supabase
      .from('profiles')
      .update({
        credits_analysis: updates.totalPromptCoins?.analysis,
        credits_enhancement: updates.totalPromptCoins?.enhancement,
        credits_exam: updates.totalPromptCoins?.exam,
        credits_export: updates.totalPromptCoins?.export,
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
        credits_analysis: 50,
        credits_enhancement: 45,
        credits_exam: 150,
        credits_export: 0,
        payment_status: 'none'
      });
  }
}

// Export singleton instances
export const authService = new AuthService();
export const serverAuthService = new ServerAuthService();
export const userProfileService = new UserProfileService();
export const serverUserProfileService = new UserProfileService(true);