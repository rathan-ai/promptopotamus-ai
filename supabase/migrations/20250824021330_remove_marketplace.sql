-- Migration: Remove Marketplace Functionality
-- Description: Converts platform from multi-vendor marketplace to admin-only prompt selling
-- Date: 2025-01-28

BEGIN;

-- 1. Update saved_prompts table to remove marketplace-specific columns
ALTER TABLE saved_prompts 
DROP COLUMN IF EXISTS is_marketplace CASCADE,
DROP COLUMN IF EXISTS seller_commission CASCADE,
DROP COLUMN IF EXISTS is_public CASCADE,
ADD COLUMN IF NOT EXISTS is_admin_prompt BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Mark all existing admin prompts
UPDATE saved_prompts 
SET is_admin_prompt = TRUE 
WHERE user_id IN (
  SELECT id FROM profiles 
  WHERE email IN ('admin@promptopotamus.com', 'support@promptopotamus.com')
  OR is_admin = TRUE
);

-- 3. Deactivate all non-admin prompts from being sold
UPDATE saved_prompts 
SET is_active = FALSE 
WHERE is_admin_prompt = FALSE;

-- 4. Update smart_prompt_purchases to simplify structure
ALTER TABLE smart_prompt_purchases
DROP COLUMN IF EXISTS seller_earnings CASCADE,
DROP COLUMN IF EXISTS platform_fee CASCADE,
ADD COLUMN IF NOT EXISTS is_admin_purchase BOOLEAN DEFAULT TRUE;

-- 5. Create admin_prompts view for easier querying
CREATE OR REPLACE VIEW admin_prompts AS
SELECT 
  sp.*,
  COUNT(DISTINCT spp.buyer_id) as total_purchases,
  COALESCE(SUM(spp.purchase_price), 0) as total_revenue
FROM saved_prompts sp
LEFT JOIN smart_prompt_purchases spp ON sp.id = spp.prompt_id
WHERE sp.is_admin_prompt = TRUE AND sp.is_active = TRUE
GROUP BY sp.id;

-- 6. Create function to ensure only admins can create sellable prompts
CREATE OR REPLACE FUNCTION check_admin_prompt_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- If trying to create a prompt for sale (has price > 0)
  IF NEW.price > 0 THEN
    -- Check if user is admin
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = NEW.user_id 
      AND (is_admin = TRUE OR email IN ('admin@promptopotamus.com', 'support@promptopotamus.com'))
    ) THEN
      RAISE EXCEPTION 'Only administrators can create prompts for sale';
    END IF;
    -- Mark as admin prompt
    NEW.is_admin_prompt := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for admin prompt validation
DROP TRIGGER IF EXISTS validate_admin_prompt_creation ON saved_prompts;
CREATE TRIGGER validate_admin_prompt_creation
  BEFORE INSERT OR UPDATE ON saved_prompts
  FOR EACH ROW
  EXECUTE FUNCTION check_admin_prompt_creation();

-- 8. Update RLS policies for saved_prompts
DROP POLICY IF EXISTS "Users can view public prompts" ON saved_prompts;
DROP POLICY IF EXISTS "Users can view marketplace prompts" ON saved_prompts;

-- Allow users to view only admin prompts or their own
CREATE POLICY "Users can view admin prompts or own prompts" ON saved_prompts
  FOR SELECT
  USING (
    is_admin_prompt = TRUE 
    OR auth.uid() = user_id
  );

-- Only admins can create prompts with prices
CREATE POLICY "Only admins can create priced prompts" ON saved_prompts
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND (
      price = 0 
      OR price IS NULL 
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND is_admin = TRUE
      )
    )
  );

-- 9. Clean up unused marketplace tables
DROP TABLE IF EXISTS marketplace_categories CASCADE;
DROP TABLE IF EXISTS seller_profiles CASCADE;
DROP TABLE IF EXISTS marketplace_reviews CASCADE;
DROP TABLE IF EXISTS seller_payouts CASCADE;

-- 10. Create admin dashboard stats function
CREATE OR REPLACE FUNCTION get_admin_sales_stats()
RETURNS TABLE (
  total_prompts INTEGER,
  active_prompts INTEGER,
  total_sales INTEGER,
  total_revenue DECIMAL,
  avg_sale_price DECIMAL,
  best_selling_prompt_id UUID,
  best_selling_prompt_title TEXT,
  recent_sales_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT sp.id)::INTEGER as total_prompts,
    COUNT(DISTINCT CASE WHEN sp.is_active THEN sp.id END)::INTEGER as active_prompts,
    COUNT(spp.id)::INTEGER as total_sales,
    COALESCE(SUM(spp.purchase_price), 0) as total_revenue,
    COALESCE(AVG(spp.purchase_price), 0) as avg_sale_price,
    best_seller.prompt_id as best_selling_prompt_id,
    best_seller.title as best_selling_prompt_title,
    COUNT(DISTINCT CASE 
      WHEN spp.purchased_at > NOW() - INTERVAL '7 days' 
      THEN spp.id 
    END)::INTEGER as recent_sales_count
  FROM saved_prompts sp
  LEFT JOIN smart_prompt_purchases spp ON sp.id = spp.prompt_id
  LEFT JOIN LATERAL (
    SELECT 
      spp2.prompt_id,
      sp2.title,
      COUNT(*) as sale_count
    FROM smart_prompt_purchases spp2
    JOIN saved_prompts sp2 ON spp2.prompt_id = sp2.id
    WHERE sp2.is_admin_prompt = TRUE
    GROUP BY spp2.prompt_id, sp2.title
    ORDER BY sale_count DESC
    LIMIT 1
  ) best_seller ON TRUE
  WHERE sp.is_admin_prompt = TRUE;
END;
$$ LANGUAGE plpgsql;

-- 11. Grant necessary permissions
GRANT SELECT ON admin_prompts TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_sales_stats() TO authenticated;

COMMIT;

-- Add helpful comments
COMMENT ON COLUMN saved_prompts.is_admin_prompt IS 'Indicates if this prompt was created by an admin for sale';
COMMENT ON COLUMN saved_prompts.is_active IS 'Indicates if this prompt is currently available for purchase';
COMMENT ON VIEW admin_prompts IS 'View of all admin-created prompts with sales statistics';
COMMENT ON FUNCTION get_admin_sales_stats() IS 'Returns comprehensive sales statistics for admin dashboard';