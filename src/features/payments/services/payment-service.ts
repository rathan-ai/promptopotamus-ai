// Server-side only payment service
import { createServerClient } from '@/lib/supabase/server';
import { PaymentTransaction, UserProfile } from '@/shared/types';
import { FEATURE_PRICING } from './payment-constants';

// Re-export pricing constants
export { FEATURE_PRICING } from './payment-constants';

/**
 * Payment service for handling direct USD transactions
 */
export class PaymentService {
  private supabase;

  constructor() {
    // This will be initialized async in each method
    this.supabase = null as any;
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createServerClient();
    }
    return this.supabase;
  }

  /**
   * Process a payment for a specific feature
   */
  async processFeaturePayment(
    userId: string,
    feature: keyof typeof FEATURE_PRICING,
    transactionId: string,
    paymentProvider: string
  ): Promise<boolean> {
    const amount = FEATURE_PRICING[feature];
    
    try {
      // Log the transaction
      await this.logTransaction(
        userId,
        'purchase',
        amount,
        `Payment for ${feature.toLowerCase().replace('_', ' ')}`,
        transactionId,
        paymentProvider
      );

      // Feature-specific post-payment logic could go here
      // For example, granting exam attempts, etc.

      return true;
    } catch (error) {
      console.error('Error processing feature payment:', error);
      return false;
    }
  }

  /**
   * Process a Smart Prompt purchase
   */
  async processSmartPromptPurchase(
    buyerId: string,
    sellerId: string,
    promptId: string,
    price: number,
    transactionId: string,
    paymentProvider: string
  ): Promise<boolean> {
    try {
      // Calculate platform fee (e.g., 20%)
      const platformFee = price * 0.20;
      const sellerEarnings = price - platformFee;

      // Record the purchase
      const supabase = await this.getSupabase();
      const { error: purchaseError } = await supabase
        .from('smart_prompt_purchases')
        .insert({
          prompt_id: promptId,
          buyer_id: buyerId,
          seller_id: sellerId,
          price: price,
          platform_fee: platformFee,
          seller_earnings: sellerEarnings,
          transaction_id: transactionId,
          payment_provider: paymentProvider,
          created_at: new Date().toISOString()
        });

      if (purchaseError) {
        console.error('Error recording Smart Prompt purchase:', purchaseError);
        return false;
      }

      // Log the transaction
      await this.logTransaction(
        buyerId,
        'smart_prompt_purchase',
        price,
        `Purchased Smart Prompt #${promptId}`,
        transactionId,
        paymentProvider
      );

      // Log seller earnings
      await this.logTransaction(
        sellerId,
        'smart_prompt_sale',
        sellerEarnings,
        `Earned from Smart Prompt #${promptId} sale`,
        transactionId,
        paymentProvider
      );

      return true;
    } catch (error) {
      console.error('Error processing Smart Prompt purchase:', error);
      return false;
    }
  }

  /**
   * Process exam payment
   */
  async processExamPayment(
    userId: string,
    examLevel: string,
    transactionId: string,
    paymentProvider: string
  ): Promise<boolean> {
    try {
      const amount = FEATURE_PRICING.EXAM_ATTEMPT;

      // Grant exam attempt
      const supabase = await this.getSupabase();
      const { error } = await supabase
        .from('exam_attempts')
        .insert({
          user_id: userId,
          exam_level: examLevel,
          payment_amount: amount,
          transaction_id: transactionId,
          payment_provider: paymentProvider,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error granting exam attempt:', error);
        return false;
      }

      // Log the transaction
      await this.logTransaction(
        userId,
        'exam_attempt',
        amount,
        `Exam attempt for ${examLevel} level`,
        transactionId,
        paymentProvider
      );

      return true;
    } catch (error) {
      console.error('Error processing exam payment:', error);
      return false;
    }
  }

  /**
   * Log transaction for audit purposes
   */
  private async logTransaction(
    userId: string,
    type: string,
    amount: number,
    description: string,
    transactionId: string,
    paymentProvider: string
  ): Promise<void> {
    try {
      const supabase = await this.getSupabase();
      await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          type,
          amount,
          currency: 'USD',
          description,
          transaction_id: transactionId,
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
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
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

  /**
   * Get user's total earnings from Smart Prompt sales
   */
  async getUserEarnings(userId: string): Promise<number> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('smart_prompt_purchases')
      .select('seller_earnings')
      .eq('seller_id', userId);

    if (error) {
      console.error('Error fetching user earnings:', error);
      return 0;
    }

    const totalEarnings = data?.reduce((sum: number, purchase: any) => sum + purchase.seller_earnings, 0) || 0;
    return Math.round(totalEarnings * 100) / 100;
  }
}

// Export singleton instance for server-side use only
export const serverPaymentService = new PaymentService();