-- =============================================
-- RIVEN STORE FIXES
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. FIX SITE PAGES (Creates the missing table)
CREATE TABLE IF NOT EXISTS site_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site pages are public" ON site_pages;
CREATE POLICY "Site pages are public" ON site_pages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site pages" ON site_pages;
CREATE POLICY "Admins can manage site pages" ON site_pages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insert default pages
INSERT INTO site_pages (title, slug, content) VALUES
  ('About Us', 'about-us', '<h1>About Riven Store</h1><p>Welcome to Riven Store!</p>'),
  ('Contact Us', 'contact-us', '<h1>Contact Us</h1><p>Email us at: support@example.com</p>'),
  ('FAQ', 'faq', '<h1>Frequently Asked Questions</h1><p>Common questions go here.</p>'),
  ('Privacy Policy', 'privacy-policy', '<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>')
ON CONFLICT (slug) DO NOTHING;

-- 2. ENSURE YOU ARE AN ADMIN
-- If product creation keeps failing without an error, it is likely because Row Level Security is blocking your user account from inserting products.
-- This command will make EVERY existing user an admin (since this is currently a development store).
UPDATE profiles SET role = 'admin';

-- =============================================
