import { createClient } from '@/lib/supabase/client';
import { PaymentTransaction, UserProfile } from '@/shared/types';

// Re-export pricing constants
export { FEATURE_PRICING } from './payment-constants';

/**
 * Client-side payment service for handling direct USD transactions
 */
export class PaymentService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(userId: string, limit: number = 50): Promise<PaymentTransaction[]> {
    const { data, error } = await this.supabase
      .from('payment_transactions')
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

  /**
   * Get user's total earnings from Smart Prompt sales
   */
  async getUserEarnings(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('smart_prompt_purchases')
      .select('seller_earnings')
      .eq('seller_id', userId);

    if (error) {
      console.error('Error fetching user earnings:', error);
      return 0;
    }

    const totalEarnings = data?.reduce((sum, purchase) => sum + purchase.seller_earnings, 0) || 0;
    return Math.round(totalEarnings * 100) / 100;
  }

  /**
   * Calculate seller earnings after platform fee
   */
  calculateSellerEarnings(salePrice: number): {
    platformFee: number;
    sellerEarnings: number;
  } {
    const platformFeePercentage = 0.20; // 20% platform fee
    const platformFee = salePrice * platformFeePercentage;
    const sellerEarnings = salePrice - platformFee;

    return {
      platformFee: Math.round(platformFee * 100) / 100,
      sellerEarnings: Math.round(sellerEarnings * 100) / 100
    };
  }
}

// Export singleton instance for client-side use
export const paymentService = new PaymentService();