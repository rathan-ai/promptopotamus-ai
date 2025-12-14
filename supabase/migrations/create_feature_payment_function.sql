-- Create function for deducting PromptCoins for platform features
-- This function ensures PromptCoin deduction happens atomically for any feature

CREATE OR REPLACE FUNCTION deduct_promptcoins_for_feature(
    p_user_id UUID,
    p_amount INTEGER,
    p_feature TEXT,
    p_description TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    current_analysis INTEGER := 0;
    current_enhancement INTEGER := 0;
    current_exam INTEGER := 0;
    current_export INTEGER := 0;
    total_balance INTEGER := 0;
    remaining_amount INTEGER := p_amount;
BEGIN
    -- Start transaction
    BEGIN
        -- Get current user balance
        SELECT 
            COALESCE(credits_analysis, 0),
            COALESCE(credits_enhancement, 0),
            COALESCE(credits_exam, 0),
            COALESCE(credits_export, 0)
        INTO 
            current_analysis,
            current_enhancement,
            current_exam,
            current_export
        FROM profiles 
        WHERE id = p_user_id;
        
        -- Calculate total balance
        total_balance := current_analysis + current_enhancement + current_exam + current_export;
        
        -- Check if user has sufficient balance
        IF total_balance < p_amount THEN
            RAISE EXCEPTION 'Insufficient PromptCoins. Required: %, Available: %', p_amount, total_balance;
        END IF;
        
        -- Deduct PromptCoins in order: export, analysis, enhancement, exam
        -- This priority order ensures we use the cheapest credits first
        
        -- Deduct from export credits first
        IF remaining_amount > 0 AND current_export > 0 THEN
            IF current_export >= remaining_amount THEN
                current_export := current_export - remaining_amount;
                remaining_amount := 0;
            ELSE
                remaining_amount := remaining_amount - current_export;
                current_export := 0;
            END IF;
        END IF;
        
        -- Deduct from analysis credits
        IF remaining_amount > 0 AND current_analysis > 0 THEN
            IF current_analysis >= remaining_amount THEN
                current_analysis := current_analysis - remaining_amount;
                remaining_amount := 0;
            ELSE
                remaining_amount := remaining_amount - current_analysis;
                current_analysis := 0;
            END IF;
        END IF;
        
        -- Deduct from enhancement credits
        IF remaining_amount > 0 AND current_enhancement > 0 THEN
            IF current_enhancement >= remaining_amount THEN
                current_enhancement := current_enhancement - remaining_amount;
                remaining_amount := 0;
            ELSE
                remaining_amount := remaining_amount - current_enhancement;
                current_enhancement := 0;
            END IF;
        END IF;
        
        -- Deduct from exam credits last
        IF remaining_amount > 0 AND current_exam > 0 THEN
            IF current_exam >= remaining_amount THEN
                current_exam := current_exam - remaining_amount;
                remaining_amount := 0;
            ELSE
                remaining_amount := remaining_amount - current_exam;
                current_exam := 0;
            END IF;
        END IF;
        
        -- Final check - this should never happen if our logic is correct
        IF remaining_amount > 0 THEN
            RAISE EXCEPTION 'Unable to deduct full amount. Remaining: %', remaining_amount;
        END IF;
        
        -- Update user's PromptCoin balance
        UPDATE profiles 
        SET 
            credits_analysis = current_analysis,
            credits_enhancement = current_enhancement,
            credits_exam = current_exam,
            credits_export = current_export,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        -- Log the transaction for audit
        INSERT INTO promptcoin_transactions (
            user_id,
            transaction_type,
            amount,
            description,
            reference_id,
            reference_type,
            created_at
        ) VALUES (
            p_user_id,
            'feature_usage',
            -p_amount,
            COALESCE(p_description, CONCAT('Feature Usage: ', p_feature)),
            p_feature,
            'feature_usage',
            NOW()
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Re-raise the exception to rollback the transaction
            RAISE;
    END;
END;
$$ LANGUAGE plpgsql;