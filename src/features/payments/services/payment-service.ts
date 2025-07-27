import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import { PromptCoinPackage, PaymentTransaction, UserProfile } from '@/shared/types';

import { 
  PROMPTCOIN_COSTS, 
  FREE_DAILY_LIMITS, 
  PROMPTCOIN_PACKAGES,
  getPackageById as getPackageByIdConstant
} from '../constants';

/**
 * Payment service for handling PromptCoin transactions
 */
export class PaymentService {
  private supabase;

  constructor(serverSide = false) {
    this.supabase = serverSide ? createServerClient() : createClient();
  }

  /**
   * Check if user has sufficient PromptCoins for a specific action
   */
  hasPromptCoins(
    profile: UserProfile, 
    action: keyof typeof PROMPTCOIN_COSTS,
    required: number = 1
  ): boolean {
    const cost = PROMPTCOIN_COSTS[action] * required;
    
    switch (action) {
      case 'analysis':
        return profile.totalPromptCoins.analysis >= cost;
      case 'enhancement':
        return profile.totalPromptCoins.enhancement >= cost;
      case 'exam':
        return profile.totalPromptCoins.exam >= cost;
      case 'export':
        return profile.totalPromptCoins.export >= cost;
      default:
        return false;
    }
  }

  /**
   * Deduct PromptCoins for a specific action
   */
  async deductPromptCoins(
    userId: string,
    action: keyof typeof PROMPTCOIN_COSTS,
    amount: number = 1
  ): Promise<boolean> {
    const cost = PROMPTCOIN_COSTS[action] * amount;
    let columnName: string;

    switch (action) {
      case 'analysis':
        columnName = 'credits_analysis';
        break;
      case 'enhancement':
        columnName = 'credits_enhancement';
        break;
      case 'exam':
        columnName = 'credits_exam';
        break;
      case 'export':
        columnName = 'credits_export';
        break;
      default:
        return false;
    }

    const { error } = await this.supabase
      .from('profiles')
      .update({
        [columnName]: this.supabase.sql`${columnName} - ${cost}`
      })
      .eq('id', userId)
      .gte(columnName, cost);

    if (error) {
      console.error('Error deducting PromptCoins:', error);
      return false;
    }

    // Log the transaction
    await this.logTransaction(userId, 'usage', cost, `Used ${cost} PC for ${action}`);
    return true;
  }

  /**
   * Add PromptCoins from payment
   */
  async addPromptCoinsFromPayment(
    userId: string,
    promptCoinsToAdd: {
      analysis: number;
      enhancement: number;
      exam: number;
      export: number;
    },
    paymentProvider: string,
    transactionId: string,
    paymentAmount: number
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({
          credits_analysis: this.supabase.sql`credits_analysis + ${promptCoinsToAdd.analysis}`,
          credits_enhancement: this.supabase.sql`credits_enhancement + ${promptCoinsToAdd.enhancement}`,
          credits_exam: this.supabase.sql`credits_exam + ${promptCoinsToAdd.exam}`,
          credits_export: this.supabase.sql`credits_export + ${promptCoinsToAdd.export}`,
          payment_status: 'active'
        })
        .eq('id', userId);

      if (error) {
        console.error('Error adding PromptCoins:', error);
        return false;
      }

      // Log the transaction
      const totalCoins = Object.values(promptCoinsToAdd).reduce((sum, coins) => sum + coins, 0);
      await this.logTransaction(
        userId, 
        'purchase', 
        paymentAmount, 
        `Purchased ${totalCoins} PromptCoins via ${paymentProvider}`,
        transactionId,
        paymentProvider
      );

      return true;
    } catch (error) {
      console.error('Error in addPromptCoinsFromPayment:', error);
      return false;
    }
  }

  /**
   * Get available PromptCoin packages
   */
  getPromptCoinPackages(): PromptCoinPackage[] {
    return PROMPTCOIN_PACKAGES;
  }

  /**
   * Get package by ID
   */
  getPackageById(packageId: string): PromptCoinPackage | null {
    return getPackageByIdConstant(packageId);
  }

  /**
   * Log transaction for audit purposes
   */
  private async logTransaction(
    userId: string,
    type: 'purchase' | 'usage' | 'refund',
    amount: number,
    description: string,
    transactionId?: string,
    paymentProvider?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('promptcoin_transactions')
        .insert({
          user_id: userId,
          type,
          amount,
          description,
          transaction_id: transactionId || `${type}_${Date.now()}`,
          payment_provider: paymentProvider,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging transaction:', error);
      // Don't throw error as this is for logging purposes
    }
  }

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(userId: string, limit: number = 50): Promise<PaymentTransaction[]> {
    const { data, error } = await this.supabase
      .from('promptcoin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }

    return data || [];
  }
}

// Export singleton instances
export const paymentService = new PaymentService();
export const serverPaymentService = new PaymentService(true);