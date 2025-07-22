-- Add PayPal support to purchases table
ALTER TABLE smart_prompt_purchases 
ADD COLUMN paypal_order_id TEXT;

-- Create index for PayPal orders
CREATE INDEX IF NOT EXISTS idx_smart_prompt_purchases_paypal_order_id 
ON smart_prompt_purchases(paypal_order_id);

-- Make stripe_payment_intent_id nullable since we now have multiple payment providers
ALTER TABLE smart_prompt_purchases 
ALTER COLUMN stripe_payment_intent_id DROP NOT NULL;