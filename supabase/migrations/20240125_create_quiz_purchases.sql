-- Create quiz_purchases table to track quiz attempt purchases
CREATE TABLE IF NOT EXISTS public.quiz_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_intent_id TEXT NOT NULL UNIQUE,
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'master')),
    attempts_purchased INTEGER NOT NULL DEFAULT 3,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_quiz_purchases_user_id ON public.quiz_purchases(user_id);
CREATE INDEX idx_quiz_purchases_payment_intent_id ON public.quiz_purchases(payment_intent_id);
CREATE INDEX idx_quiz_purchases_created_at ON public.quiz_purchases(created_at DESC);

-- Enable RLS
ALTER TABLE public.quiz_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own purchases
CREATE POLICY "Users can view their own quiz purchases" ON public.quiz_purchases
    FOR SELECT USING (auth.uid() = user_id);

-- Only the system can insert purchases (via service role)
CREATE POLICY "Service role can insert quiz purchases" ON public.quiz_purchases
    FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Grant permissions
GRANT SELECT ON public.quiz_purchases TO authenticated;
GRANT ALL ON public.quiz_purchases TO service_role;