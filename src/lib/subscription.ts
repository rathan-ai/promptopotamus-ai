import { createClient } from '@supabase/supabase-js';

export type UserType = 'free' | 'paid'; // Simplified user types
export type PaymentStatus = 'none' | 'active' | 'cancelled';

export interface UserProfile {
    type: UserType;
    paymentStatus: PaymentStatus;
    totalPromptCoins: {
        analysis: number;
        enhancement: number;
        exam: number;
        export: number;
    };
}

/**
 * Check if user has sufficient PromptCoins for a specific action
 */
export function hasPromptCoins(
    profile: UserProfile, 
    action: 'analysis' | 'enhancement' | 'exam' | 'export',
    required: number = 1
): boolean {
    return profile.totalPromptCoins[action] >= required;
}

/**
 * Get user profile with PromptCoin balances from Supabase
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile, error } = await supabase
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
                analysis: FREE_DAILY_LIMITS.analysis, // 50 PC (5 analyses)
                enhancement: FREE_DAILY_LIMITS.enhancement, // 45 PC (3 enhancements)
                exam: FREE_DAILY_LIMITS.exam, // 150 PC (3 attempts)
                export: FREE_DAILY_LIMITS.export // 0 PC (no free exports)
            }
        };
    }

    const hasPaidPromptCoins = 
        (profile.credits_analysis || 0) > FREE_DAILY_LIMITS.analysis ||
        (profile.credits_enhancement || 0) > FREE_DAILY_LIMITS.enhancement ||
        (profile.credits_exam || 0) > FREE_DAILY_LIMITS.exam ||
        (profile.credits_export || 0) > FREE_DAILY_LIMITS.export;

    return {
        type: hasPaidPromptCoins ? 'paid' : 'free',
        paymentStatus: profile.payment_status || 'none',
        totalPromptCoins: {
            analysis: profile.credits_analysis || FREE_DAILY_LIMITS.analysis,
            enhancement: profile.credits_enhancement || FREE_DAILY_LIMITS.enhancement,
            exam: profile.credits_exam || FREE_DAILY_LIMITS.exam,
            export: profile.credits_export || FREE_DAILY_LIMITS.export
        }
    };
}

/**
 * Free tier daily limits (resets daily) - in PromptCoins
 */
export const FREE_DAILY_LIMITS = {
    analysis: 50, // 5 analyses at 10 PC each
    enhancement: 45, // 3 enhancements at 15 PC each  
    exam: 150, // 3 total attempts at 50 PC each
    export: 0 // No free exports
};

/**
 * PromptCoin costs per action
 */
export const PROMPTCOIN_COSTS = {
    analysis: 10,
    enhancement: 15,
    exam: 50,
    export: 5,
    // Recipe costs (100 PC = $1 USD)
    recipe_simple: 100,    // $1 recipes
    recipe_smart: 500,     // $5 recipes  
    recipe_complex: 1000   // $10 recipes
};

/**
 * Convert USD to PromptCoins (100 PC = $1)
 */
export function usdToPromptCoins(usdAmount: number): number {
    return Math.round(usdAmount * 100);
}

/**
 * Convert PromptCoins to USD (100 PC = $1)
 */
export function promptCoinsToUsd(pcAmount: number): number {
    return pcAmount / 100;
}

/**
 * Deduct PromptCoins from user account
 */
export async function deductPromptCoins(
    userId: string,
    action: 'analysis' | 'enhancement' | 'exam' | 'export',
    amount: number = 1
): Promise<boolean> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const columnName = `credits_${action}`;
    
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                [columnName]: supabase.rpc('greatest', [
                    supabase.rpc('coalesce', [supabase.raw(columnName), FREE_DAILY_LIMITS[action]]) - amount,
                    0
                ])
            })
            .eq('id', userId);

        return !error;
    } catch (error) {
        console.error('Error deducting PromptCoins:', error);
        return false;
    }
}

/**
 * Add PromptCoins to user account after successful payment
 */
export async function addPromptCoinsFromPayment(
    userId: string,
    promptCoinsToAdd: {
        analysis?: number;
        enhancement?: number;
        exam?: number;
        export?: number;
    },
    paymentMethod: 'paypal' | 'stripe' = 'paypal',
    transactionId?: string,
    amount?: number
): Promise<boolean> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const now = new Date().toISOString();
        
        // Build update object
        const updateData: any = {
            payment_status: 'active',
            last_payment_date: now
        };

        // Add PromptCoins to existing balances
        if (promptCoinsToAdd.analysis) {
            updateData.credits_analysis = supabase.rpc('coalesce', [supabase.raw('credits_analysis'), 0]) + promptCoinsToAdd.analysis;
        }
        if (promptCoinsToAdd.enhancement) {
            updateData.credits_enhancement = supabase.rpc('coalesce', [supabase.raw('credits_enhancement'), 0]) + promptCoinsToAdd.enhancement;
        }
        if (promptCoinsToAdd.exam) {
            updateData.credits_exam = supabase.rpc('coalesce', [supabase.raw('credits_exam'), 0]) + promptCoinsToAdd.exam;
        }
        if (promptCoinsToAdd.export) {
            updateData.credits_export = supabase.rpc('coalesce', [supabase.raw('credits_export'), 0]) + promptCoinsToAdd.export;
        }

        // Update user PromptCoins
        const { error: profileError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId);

        if (profileError) {
            console.error('Error updating PromptCoins:', profileError);
            return false;
        }

        // Log the payment transaction
        if (transactionId && amount) {
            await supabase
                .from('payment_transactions')
                .insert({
                    user_id: userId,
                    transaction_id: transactionId,
                    amount: amount,
                    currency: 'USD',
                    payment_method: paymentMethod,
                    status: 'completed',
                    promptcoins_purchased: promptCoinsToAdd,
                    created_at: now
                });
        }

        return true;
    } catch (error) {
        console.error('Error in addPromptCoinsFromPayment:', error);
        return false;
    }
}


/**
 * Check if user can take exam based on available PromptCoins
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
    const profile = await getUserProfile(userId);
    
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

    const usedAttempts = attempts?.length || 0;
    const availablePromptCoins = profile.totalPromptCoins.exam;
    const remainingAttempts = availablePromptCoins;

    if (remainingAttempts <= 0) {
        return {
            canTake: false,
            reason: `You need exam PromptCoins to take the ${level} level exam. Purchase exam attempts to continue.`,
            attemptsRemaining: 0,
            needsPurchase: true
        };
    }

    return {
        canTake: true,
        attemptsRemaining: remainingAttempts,
        needsPurchase: false
    };
}

/**
 * Purchase recipe with PromptCoins
 */
export async function purchaseRecipeWithPromptCoins(
    buyerId: string,
    recipeId: number,
    promptCoinPrice: number,
    sellerId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // Log security event for purchase attempt
        await supabase.rpc('log_payment_security_event', {
            p_user_id: buyerId,
            p_event_type: 'promptcoin_purchase_attempt',
            p_severity: 'low',
            p_request_data: { recipe_id: recipeId, price: promptCoinPrice }
        });

        // Check if buyer has sufficient PromptCoins
        const buyerProfile = await getUserProfile(buyerId);
        const totalPromptCoins = Object.values(buyerProfile.totalPromptCoins).reduce((sum, pc) => sum + pc, 0);

        if (totalPromptCoins < promptCoinPrice) {
            // Log insufficient funds attempt
            await supabase.rpc('log_payment_security_event', {
                p_user_id: buyerId,
                p_event_type: 'insufficient_promptcoins',
                p_severity: 'medium',
                p_error_message: `Insufficient funds: ${totalPromptCoins} < ${promptCoinPrice}`
            });

            return {
                success: false,
                error: `Insufficient PromptCoins. You need ${promptCoinPrice} PC but only have ${totalPromptCoins} PC.`
            };
        }

        // Start transaction
        const now = new Date().toISOString();

        // Deduct PromptCoins from buyer (spread across categories as needed)
        let remaining = promptCoinPrice;
        const updates: any = {};

        // Deduct from analysis first, then enhancement, then exam
        if (remaining > 0 && buyerProfile.totalPromptCoins.analysis > 0) {
            const deductFromAnalysis = Math.min(remaining, buyerProfile.totalPromptCoins.analysis);
            updates.credits_analysis = Math.max(0, buyerProfile.totalPromptCoins.analysis - deductFromAnalysis);
            remaining -= deductFromAnalysis;
        }
        if (remaining > 0 && buyerProfile.totalPromptCoins.enhancement > 0) {
            const deductFromEnhancement = Math.min(remaining, buyerProfile.totalPromptCoins.enhancement);
            updates.credits_enhancement = Math.max(0, buyerProfile.totalPromptCoins.enhancement - deductFromEnhancement);
            remaining -= deductFromEnhancement;
        }
        if (remaining > 0 && buyerProfile.totalPromptCoins.exam > 0) {
            const deductFromExam = Math.min(remaining, buyerProfile.totalPromptCoins.exam);
            updates.credits_exam = Math.max(0, buyerProfile.totalPromptCoins.exam - deductFromExam);
            remaining -= deductFromExam;
        }

        // Update buyer's PromptCoins
        const { error: buyerUpdateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', buyerId);

        if (buyerUpdateError) {
            return { success: false, error: 'Failed to deduct PromptCoins from buyer account' };
        }

        // Credit seller's PromptCoins (add to analysis category)
        const { error: sellerUpdateError } = await supabase
            .from('profiles')
            .update({
                credits_analysis: supabase.rpc('coalesce', [supabase.raw('credits_analysis'), 0]) + promptCoinPrice
            })
            .eq('id', sellerId);

        if (sellerUpdateError) {
            console.error('Error crediting seller:', sellerUpdateError);
            // Continue anyway - we can resolve this manually if needed
        }

        // Create purchase record with new security fields
        const { error: purchaseError } = await supabase
            .from('smart_prompt_purchases')
            .insert({
                prompt_id: recipeId,
                buyer_id: buyerId,
                seller_id: sellerId,
                purchase_price: promptCoinsToUsd(promptCoinPrice), // Store as USD equivalent
                promptcoins_used: promptCoinPrice,
                payment_provider: 'promptcoins',
                transaction_id: `pc_${Date.now()}_${buyerId.slice(-8)}_${recipeId}`,
                purchased_at: now
            });

        if (purchaseError) {
            return { success: false, error: 'Failed to record purchase' };
        }

        // Update download count
        await supabase
            .from('saved_prompts')
            .update({ downloads_count: supabase.rpc('coalesce', [supabase.raw('downloads_count'), 0]) + 1 })
            .eq('id', recipeId);

        // Log successful purchase
        await supabase.rpc('log_payment_security_event', {
            p_user_id: buyerId,
            p_event_type: 'promptcoin_purchase_success',
            p_severity: 'low',
            p_response_data: { 
                recipe_id: recipeId, 
                promptcoins_used: promptCoinPrice,
                transaction_id: `pc_${Date.now()}_${buyerId.slice(-8)}_${recipeId}`
            }
        });

        // Log the PromptCoin transaction
        await supabase.rpc('log_promptcoin_transaction', {
            p_user_id: buyerId,
            p_amount: -promptCoinPrice,
            p_transaction_type: 'spend',
            p_reference_type: 'recipe_purchase',
            p_reference_id: recipeId.toString(),
            p_description: `Purchased recipe with ${promptCoinPrice} PromptCoins`
        });

        // Log seller earning
        await supabase.rpc('log_promptcoin_transaction', {
            p_user_id: sellerId,
            p_amount: promptCoinPrice,
            p_transaction_type: 'earn',
            p_reference_type: 'recipe_sale',
            p_reference_id: recipeId.toString(),
            p_description: `Earned ${promptCoinPrice} PromptCoins from recipe sale`
        });

        return { success: true };

    } catch (error) {
        console.error('Error in purchaseRecipeWithPromptCoins:', error);
        
        // Log critical security event
        try {
            await supabase.rpc('log_payment_security_event', {
                p_user_id: buyerId,
                p_event_type: 'promptcoin_purchase_error',
                p_severity: 'critical',
                p_error_message: error instanceof Error ? error.message : 'Unknown error',
                p_request_data: { recipe_id: recipeId, price: promptCoinPrice }
            });
        } catch (logError) {
            console.error('Failed to log security event:', logError);
        }
        
        return { success: false, error: 'Internal error processing purchase' };
    }
}