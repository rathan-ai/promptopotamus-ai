-- Update existing admin_settings policies to use profiles.role instead of user_metadata
-- Run this in Supabase SQL Editor if you already have the admin_settings table

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can manage settings" ON admin_settings;

-- Create new policy using profiles.role
CREATE POLICY "Admin users can manage settings" ON admin_settings
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Update the PostgreSQL function to use profiles.role
CREATE OR REPLACE FUNCTION update_setting_value(
    setting_category TEXT,
    setting_key TEXT,
    setting_value JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is admin using profiles table
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    UPDATE admin_settings 
    SET value = setting_value,
        updated_at = NOW(),
        updated_by = auth.uid()
    WHERE category = setting_category 
    AND key = setting_key;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;