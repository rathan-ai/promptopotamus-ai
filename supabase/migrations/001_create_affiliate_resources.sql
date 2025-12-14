-- Create affiliate_resources table for admin-managed affiliate links
CREATE TABLE IF NOT EXISTS affiliate_resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    description TEXT,
    price VARCHAR(50),
    category VARCHAR(100),
    badge VARCHAR(100),
    color VARCHAR(50),
    icon VARCHAR(10),
    affiliate_link TEXT NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    rating DECIMAL(2,1) DEFAULT 5.0,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_resources_active ON affiliate_resources(is_active);
CREATE INDEX IF NOT EXISTS idx_affiliate_resources_category ON affiliate_resources(category);

-- Insert existing affiliate data
INSERT INTO affiliate_resources (name, provider, description, price, category, badge, color, icon, affiliate_link, features, rating, display_order) VALUES
('ChatGPT Plus', 'OpenAI', 'The most popular AI assistant with GPT-4, perfect for advanced prompt engineering practice.', '$20/month', 'AI Assistant', 'Most Popular', 'bg-green-500', '🤖', 'https://chat.openai.com/auth/login?ref=promptopotamus', '["GPT-4 Access", "Faster Response Times", "Priority Access", "Custom Instructions"]', 4.8, 1),
('Claude Pro', 'Anthropic', 'Advanced AI with superior reasoning capabilities and longer context windows.', '$20/month', 'AI Assistant', 'Editor''s Choice', 'bg-purple-500', '🧠', 'https://claude.ai/login?ref=promptopotamus', '["Claude 3.5 Sonnet", "200K Context Window", "Priority Bandwidth", "Advanced Reasoning"]', 4.7, 2),
('Gemini Advanced', 'Google', 'Google''s most capable AI model with integrated Google Workspace features.', '$19.99/month', 'AI Assistant', 'Best Integration', 'bg-blue-500', '💎', 'https://gemini.google.com/advanced?ref=promptopotamus', '["Gemini Ultra Access", "Google Integration", "Multimodal Capabilities", "2TB Storage"]', 4.6, 3),
('Grok Premium', 'xAI', 'Witty AI with real-time information and uncensored responses.', '$16/month', 'AI Assistant', 'Most Fun', 'bg-orange-500', '🚀', 'https://grok.x.ai?ref=promptopotamus', '["Real-time Data", "Less Restricted", "Twitter Integration", "Humor & Wit"]', 4.3, 4),
('Notion AI', 'Notion', 'AI-powered productivity within your favorite workspace and note-taking app.', '$10/month', 'Productivity', 'Best Value', 'bg-gray-500', '📝', 'https://notion.so/ai?ref=promptopotamus', '["Writing Assistant", "Content Generation", "Notion Integration", "Team Collaboration"]', 4.4, 5),
('Midjourney', 'Midjourney Inc.', 'Premium AI image generation for creative prompt engineering practice.', '$10/month', 'Image Generation', 'Creative Pro', 'bg-pink-500', '🎨', 'https://midjourney.com/account/?ref=promptopotamus', '["High-Quality Images", "Commercial Usage", "Fast Generation", "Style Variety"]', 4.9, 6);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_affiliate_resources_updated_at
    BEFORE UPDATE ON affiliate_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();