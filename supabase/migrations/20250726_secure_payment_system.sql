-- Critical Security Updates for Payment System
-- This migration adds missing fields and security enhancements

-- 1. Update smart_prompt_purchases table with missing PromptCoin support
ALTER TABLE smart_prompt_purchases 
ADD COLUMN IF NOT EXISTS promptcoins_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(20) DEFAULT 'stripe',
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20) DEFAULT NULL CHECK (refund_status IN ('pending', 'completed', 'failed', 'cancelled'));

-- Add constraints
ALTER TABLE smart_prompt_purchases 
ADD CONSTRAINT check_payment_provider 
CHECK (payment_provider IN ('stripe', 'paypal', 'promptcoins', 'free', 'custom'));

-- Make purchase_price allow NULL for free transactions
ALTER TABLE smart_prompt_purchases 
ALTER COLUMN purchase_price DROP NOT NULL;

-- Add indexes for performance and security queries
CREATE INDEX IF NOT EXISTS idx_purchases_payment_provider ON smart_prompt_purchases(payment_provider);
CREATE INDEX IF NOT EXISTS idx_purchases_transaction_id ON smart_prompt_purchases(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_purchases_refund_status ON smart_prompt_purchases(refund_status) WHERE refund_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_purchases_promptcoins ON smart_prompt_purchases(promptcoins_used) WHERE promptcoins_used > 0;

-- 2. Create PromptCoin transaction audit trail
CREATE TABLE IF NOT EXISTS promptcoin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL DEFAULT 0,
    balance_after INTEGER NOT NULL DEFAULT 0,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'earn', 'refund', 'admin_credit', 'admin_debit')),
    reference_type VARCHAR(30), -- 'recipe_purchase', 'credit_purchase', 'analysis', 'enhancement', etc.
    reference_id VARCHAR(255),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure amount makes sense for transaction type
    CONSTRAINT check_amount_sign CHECK (
        (transaction_type IN ('purchase', 'earn', 'refund', 'admin_credit') AND amount > 0) OR
        (transaction_type IN ('spend', 'admin_debit') AND amount < 0)
    )
);

-- Add indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_promptcoin_transactions_user_id ON promptcoin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_promptcoin_transactions_type ON promptcoin_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_promptcoin_transactions_reference ON promptcoin_transactions(reference_type, reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_promptcoin_transactions_created_at ON promptcoin_transactions(created_at DESC);

-- 3. Create payment security log table
CREATE TABLE IF NOT EXISTS payment_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type VARCHAR(30) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    ip_address INET,
    user_agent TEXT,
    request_data JSONB DEFAULT '{}',
    response_data JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for security monitoring
CREATE INDEX IF NOT EXISTS idx_payment_security_events_user_id ON payment_security_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_security_events_type ON payment_security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_security_events_severity ON payment_security_events(severity);
CREATE INDEX IF NOT EXISTS idx_payment_security_events_created_at ON payment_security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_security_events_ip ON payment_security_events(ip_address) WHERE ip_address IS NOT NULL;

-- 4. Add RLS policies for new tables
ALTER TABLE promptcoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_security_events ENABLE ROW LEVEL SECURITY;

-- Users can only see their own PromptCoin transactions
CREATE POLICY "Users can see their own PromptCoin transactions" ON promptcoin_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Only authenticated users can create PromptCoin transactions (through API)
CREATE POLICY "Service can create PromptCoin transactions" ON promptcoin_transactions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Security events are only visible to admins (no public access)
CREATE POLICY "Admin only access to security events" ON payment_security_events
    FOR ALL USING (false); -- Explicit deny - only service role can access

-- 5. Create security functions
CREATE OR REPLACE FUNCTION log_promptcoin_transaction(
    p_user_id UUID,
    p_amount INTEGER,
    p_transaction_type VARCHAR(20),
    p_reference_type VARCHAR(30) DEFAULT NULL,
    p_reference_id VARCHAR(255) DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
    transaction_id UUID;
BEGIN
    -- Get current balance (sum of all analysis, enhancement, exam, export credits)
    SELECT COALESCE(
        (SELECT credits_analysis FROM profiles WHERE id = p_user_id), 0
    ) + COALESCE(
        (SELECT credits_enhancement FROM profiles WHERE id = p_user_id), 0
    ) + COALESCE(
        (SELECT credits_exam FROM profiles WHERE id = p_user_id), 0
    ) + COALESCE(
        (SELECT credits_export FROM profiles WHERE id = p_user_id), 0
    ) INTO current_balance;
    
    -- Calculate new balance
    new_balance := current_balance + p_amount;
    
    -- Insert transaction record
    INSERT INTO promptcoin_transactions (
        user_id, amount, balance_before, balance_after,
        transaction_type, reference_type, reference_id,
        description, metadata
    ) VALUES (
        p_user_id, p_amount, current_balance, new_balance,
        p_transaction_type, p_reference_type, p_reference_id,
        p_description, p_metadata
    ) RETURNING id INTO transaction_id;
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_payment_security_event(
    p_event_type VARCHAR(30),
    p_severity VARCHAR(10),
    p_user_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_request_data JSONB DEFAULT '{}',
    p_response_data JSONB DEFAULT '{}',
    p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO payment_security_events (
        user_id, event_type, severity, ip_address, user_agent,
        request_data, response_data, error_message
    ) VALUES (
        p_user_id, p_event_type, p_severity, p_ip_address, p_user_agent,
        p_request_data, p_response_data, p_error_message
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Add PromptCoin credit columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS credits_analysis INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS credits_enhancement INTEGER DEFAULT 45,
ADD COLUMN IF NOT EXISTS credits_exam INTEGER DEFAULT 150,
ADD COLUMN IF NOT EXISTS credits_export INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ DEFAULT NULL;

-- Add indexes for PromptCoin queries
CREATE INDEX IF NOT EXISTS idx_profiles_credits_analysis ON profiles(credits_analysis) WHERE credits_analysis > 0;
CREATE INDEX IF NOT EXISTS idx_profiles_credits_enhancement ON profiles(credits_enhancement) WHERE credits_enhancement > 0;
CREATE INDEX IF NOT EXISTS idx_profiles_credits_exam ON profiles(credits_exam) WHERE credits_exam > 0;
CREATE INDEX IF NOT EXISTS idx_profiles_credits_export ON profiles(credits_export) WHERE credits_export > 0;
CREATE INDEX IF NOT EXISTS idx_profiles_payment_status ON profiles(payment_status) WHERE payment_status != 'none';

-- 7. Create view for user PromptCoin balance summary
CREATE OR REPLACE VIEW user_promptcoin_balance AS
SELECT 
    p.id as user_id,
    COALESCE(p.credits_analysis, 0) as analysis_coins,
    COALESCE(p.credits_enhancement, 0) as enhancement_coins,
    COALESCE(p.credits_exam, 0) as exam_coins,
    COALESCE(p.credits_export, 0) as export_coins,
    (COALESCE(p.credits_analysis, 0) + 
     COALESCE(p.credits_enhancement, 0) + 
     COALESCE(p.credits_exam, 0) + 
     COALESCE(p.credits_export, 0)) as total_coins,
    p.payment_status,
    p.last_payment_date
FROM profiles p;

-- Add RLS policy for the view
ALTER VIEW user_promptcoin_balance SET (security_barrier = true);
CREATE POLICY "Users can see their own balance" ON user_promptcoin_balance
    FOR SELECT USING (auth.uid() = user_id);

-- 8. Update existing payment_transactions table if it exists
DO $$
BEGIN
    -- Check if payment_transactions table exists and add missing columns
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_transactions') THEN
        -- Add promptcoins_purchased column if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'payment_transactions' 
                      AND column_name = 'promptcoins_purchased') THEN
            ALTER TABLE payment_transactions 
            ADD COLUMN promptcoins_purchased JSONB DEFAULT '{}';
        END IF;
        
        -- Add payment_provider column if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'payment_transactions' 
                      AND column_name = 'payment_provider') THEN
            ALTER TABLE payment_transactions 
            ADD COLUMN payment_provider VARCHAR(20) DEFAULT 'stripe';
        END IF;
    END IF;
END $$;

-- 9. Create trigger to auto-log PromptCoin balance changes
CREATE OR REPLACE FUNCTION trigger_log_promptcoin_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log when credits are added (purchase)
    IF (COALESCE(NEW.credits_analysis, 0) > COALESCE(OLD.credits_analysis, 0)) THEN
        PERFORM log_promptcoin_transaction(
            NEW.id,
            (COALESCE(NEW.credits_analysis, 0) - COALESCE(OLD.credits_analysis, 0)),
            'purchase',
            'credit_purchase',
            NULL,
            'Analysis credits purchased'
        );
    END IF;
    
    -- Log when credits are deducted (spend)
    IF (COALESCE(NEW.credits_analysis, 0) < COALESCE(OLD.credits_analysis, 0)) THEN
        PERFORM log_promptcoin_transaction(
            NEW.id,
            -1 * (COALESCE(OLD.credits_analysis, 0) - COALESCE(NEW.credits_analysis, 0)),
            'spend',
            'analysis',
            NULL,
            'Analysis credits spent'
        );
    END IF;
    
    -- Similar for enhancement credits
    IF (COALESCE(NEW.credits_enhancement, 0) > COALESCE(OLD.credits_enhancement, 0)) THEN
        PERFORM log_promptcoin_transaction(
            NEW.id,
            (COALESCE(NEW.credits_enhancement, 0) - COALESCE(OLD.credits_enhancement, 0)),
            'purchase',
            'credit_purchase',
            NULL,
            'Enhancement credits purchased'
        );
    END IF;
    
    IF (COALESCE(NEW.credits_enhancement, 0) < COALESCE(OLD.credits_enhancement, 0)) THEN
        PERFORM log_promptcoin_transaction(
            NEW.id,
            -1 * (COALESCE(OLD.credits_enhancement, 0) - COALESCE(NEW.credits_enhancement, 0)),
            'spend',
            'enhancement',
            NULL,
            'Enhancement credits spent'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_promptcoin_audit ON profiles;
CREATE TRIGGER trigger_promptcoin_audit
    AFTER UPDATE OF credits_analysis, credits_enhancement, credits_exam, credits_export
    ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_promptcoin_changes();

-- 10. Add comment documentation
COMMENT ON TABLE promptcoin_transactions IS 'Audit trail for all PromptCoin movements and transactions';
COMMENT ON TABLE payment_security_events IS 'Security event logging for payment-related activities';
COMMENT ON FUNCTION log_promptcoin_transaction IS 'Securely log PromptCoin transactions with balance tracking';
COMMENT ON FUNCTION log_payment_security_event IS 'Log security events for payment monitoring';
COMMENT ON VIEW user_promptcoin_balance IS 'User-accessible view of PromptCoin balances';

-- Migration complete notification
DO $$
BEGIN
    RAISE NOTICE 'Payment security migration completed successfully';
    RAISE NOTICE 'Added: PromptCoin audit trail, security event logging, improved payment tracking';
END $$;