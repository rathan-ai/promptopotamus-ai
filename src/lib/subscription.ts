import { createClient } from '@supabase/supabase-js';

export type SubscriptionTier = 'free' | 'pro' | 'premium';
export type SubscriptionStatus = 'inactive' | 'active' | 'cancelled' | 'expired';

export interface UserSubscription {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
}

/**
 * Check if user has access to a specific feature based on their subscription
 */
export function hasFeatureAccess(
    subscription: UserSubscription, 
    requiredTier: SubscriptionTier
): boolean {
    // If user is not active, only allow free features
    if (!subscription.isActive && requiredTier !== 'free') {
        return false;
    }

    // Tier hierarchy: free < pro < premium
    const tierLevels = { 'free': 0, 'pro': 1, 'premium': 2 };
    const userLevel = tierLevels[subscription.tier];
    const requiredLevel = tierLevels[requiredTier];

    return userLevel >= requiredLevel;
}

/**
 * Get user subscription details from Supabase
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, subscription_start_date, subscription_end_date')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        // Default to free tier if no profile found
        return {
            tier: 'free',
            status: 'inactive',
            isActive: false
        };
    }

    const now = new Date();
    const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
    
    // Check if subscription is currently active
    let isActive = false;
    if (profile.subscription_status === 'active') {
        // If there's an end date, check if it hasn't expired
        isActive = endDate ? now <= endDate : true;
    }

    // Update status if subscription has expired
    if (profile.subscription_status === 'active' && endDate && now > endDate) {
        // Auto-expire subscription
        await supabase
            .from('profiles')
            .update({ subscription_status: 'expired' })
            .eq('id', userId);
        
        isActive = false;
    }

    return {
        tier: profile.subscription_tier || 'free',
        status: isActive ? 'active' : (profile.subscription_status || 'inactive'),
        startDate: profile.subscription_start_date,
        endDate: profile.subscription_end_date,
        isActive: isActive || profile.subscription_tier === 'free' // Free tier is always "active"
    };
}

/**
 * Usage limits based on subscription tier
 */
export const SUBSCRIPTION_LIMITS = {
    free: {
        promptEnhancements: 3,
        promptAnalyses: 5,
        templatesAccess: 'free' as const,
        exportFeatures: false,
        prioritySupport: false,
        examAttempts: 3, // per level, then need to purchase
        examRetries: false // no retries after failure
    },
    pro: {
        promptEnhancements: -1, // unlimited
        promptAnalyses: -1, // unlimited  
        templatesAccess: 'pro' as const,
        exportFeatures: true,
        prioritySupport: true,
        examAttempts: 5, // per level
        examRetries: true // 1 extra retry after failure
    },
    premium: {
        promptEnhancements: -1, // unlimited
        promptAnalyses: -1, // unlimited
        templatesAccess: 'premium' as const,
        exportFeatures: true,
        prioritySupport: true,
        customTemplates: true,
        teamFeatures: true,
        analytics: true,
        examAttempts: -1, // unlimited
        examRetries: true // unlimited retries
    }
};

/**
 * Check if user has exceeded usage limits
 */
export function checkUsageLimit(
    subscription: UserSubscription,
    feature: keyof typeof SUBSCRIPTION_LIMITS.free,
    currentUsage: number
): { allowed: boolean; limit: number; remaining: number } {
    const limits = SUBSCRIPTION_LIMITS[subscription.tier];
    const limit = limits[feature as keyof typeof limits] as number;
    
    if (limit === -1) {
        return { allowed: true, limit: -1, remaining: -1 }; // unlimited
    }
    
    const remaining = Math.max(0, limit - currentUsage);
    const allowed = remaining > 0;
    
    return { allowed, limit, remaining };
}

/**
 * Update user subscription after successful PayPal payment
 */
export async function updateSubscriptionFromPayment(
    userId: string,
    tier: SubscriptionTier,
    paymentMethod: 'paypal' | 'stripe' = 'paypal',
    transactionId?: string
): Promise<boolean> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const now = new Date();
        const startDate = now.toISOString();
        
        // Calculate end date (monthly subscription)
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);
        const endDateISO = endDate.toISOString();

        // Update user subscription
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                subscription_tier: tier,
                subscription_status: 'active',
                subscription_start_date: startDate,
                subscription_end_date: endDateISO,
                payment_method: paymentMethod,
                last_payment_date: startDate
            })
            .eq('id', userId);

        if (profileError) {
            console.error('Error updating subscription:', profileError);
            return false;
        }

        // Log the payment transaction if table exists
        if (transactionId) {
            await supabase
                .from('payment_transactions')
                .insert({
                    user_id: userId,
                    transaction_id: transactionId,
                    amount: tier === 'pro' ? 9.00 : 19.00,
                    currency: 'USD',
                    payment_method: paymentMethod,
                    status: 'completed',
                    subscription_tier: tier,
                    created_at: startDate
                })
                .single();
        }

        return true;
    } catch (error) {
        console.error('Error in updateSubscriptionFromPayment:', error);
        return false;
    }
}

/**
 * Cancel user subscription
 */
export async function cancelSubscription(userId: string): Promise<boolean> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                subscription_status: 'cancelled',
                subscription_tier: 'free'
            })
            .eq('id', userId);

        return !error;
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return false;
    }
}

/**
 * Check if user can take exam based on subscription and attempts
 */
export async function canTakeExam(
    userId: string, 
    level: 'beginner' | 'intermediate' | 'master'
): Promise<{
    canTake: boolean;
    reason?: string;
    attemptsRemaining: number;
    needsPurchase: boolean;
}> {
    const subscription = await getUserSubscription(userId);
    const limits = SUBSCRIPTION_LIMITS[subscription.tier];
    
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's quiz attempts for this level
    const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('quiz_level', level)
        .order('attempted_at', { ascending: false });

    // Get user's purchased attempts
    const { data: profile } = await supabase
        .from('profiles')
        .select('purchased_attempts')
        .eq('id', userId)
        .single();

    const purchasedAttempts = profile?.purchased_attempts?.[level] || 0;
    const usedAttempts = attempts?.length || 0;
    
    // Calculate base attempts from subscription
    const baseAttempts = limits.examAttempts === -1 ? 999 : limits.examAttempts;
    const totalAvailableAttempts = baseAttempts + purchasedAttempts;
    const remainingAttempts = totalAvailableAttempts - usedAttempts;

    if (remainingAttempts <= 0) {
        return {
            canTake: false,
            reason: subscription.tier === 'premium' 
                ? 'System error - Premium users should have unlimited attempts'
                : `You've used all ${totalAvailableAttempts} attempts for ${level} level. Purchase more to continue.`,
            attemptsRemaining: 0,
            needsPurchase: subscription.tier !== 'premium'
        };
    }

    return {
        canTake: true,
        attemptsRemaining: remainingAttempts === 999 ? -1 : remainingAttempts, // -1 for unlimited
        needsPurchase: false
    };
}