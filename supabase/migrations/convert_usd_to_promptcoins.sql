-- Migration: Convert USD pricing to PromptCoin pricing
-- This converts all existing USD amounts to PromptCoins using 100 PC = $1 USD

BEGIN;

-- Update saved_prompts table: convert USD prices to PromptCoins
-- Round to nearest integer since PromptCoins must be whole numbers
UPDATE saved_prompts 
SET price = ROUND(price * 100)::INTEGER
WHERE price > 0;

-- Update smart_prompt_purchases table: convert USD purchase prices to PromptCoins
UPDATE smart_prompt_purchases 
SET purchase_price = ROUND(purchase_price * 100)::INTEGER
WHERE purchase_price > 0;

-- Update any other tables that might have USD pricing
-- (Add more tables here if they exist with USD pricing)

-- Log this migration
INSERT INTO promptcoin_transactions (
    user_id,
    transaction_type,
    amount,
    description,
    reference_type,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000000'::UUID, -- System user
    'system',
    0,
    'Database migration: Converted USD pricing to PromptCoins (100 PC = $1 USD)',
    'system_migration',
    NOW()
);

COMMIT;