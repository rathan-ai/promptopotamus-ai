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
        prioritySupport: false
    },
    pro: {
        promptEnhancements: -1, // unlimited
        promptAnalyses: -1, // unlimited  
        templatesAccess: 'pro' as const,
        exportFeatures: true,
        prioritySupport: true
    },
    premium: {
        promptEnhancements: -1, // unlimited
        promptAnalyses: -1, // unlimited
        templatesAccess: 'premium' as const,
        exportFeatures: true,
        prioritySupport: true,
        customTemplates: true,
        teamFeatures: true,
        analytics: true
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