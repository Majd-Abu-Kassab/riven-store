-- =============================================
-- RIVEN E-COMMERCE STORE — SITE PAGES SCHEMA
-- Run this SQL in your Supabase SQL Editor to create the site_pages table
-- =============================================

CREATE TABLE IF NOT EXISTS site_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;

-- Everyone can view site pages
CREATE POLICY "Site pages are public" ON site_pages
  FOR SELECT USING (true);

-- Only admins can manage site pages
CREATE POLICY "Admins can manage site pages" ON site_pages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-update updated_at for site_pages
DROP TRIGGER IF EXISTS site_pages_updated_at ON site_pages;
CREATE TRIGGER site_pages_updated_at
  BEFORE UPDATE ON site_pages
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Insert default site pages
INSERT INTO site_pages (title, slug, content) VALUES
  ('About Us', 'about-us', '<h1>About Riven Store</h1><p>Welcome to Riven Store, your number one source for all things premium.</p>'),
  ('Contact Us', 'contact-us', '<h1>Contact Us</h1><p>Email us at: support@rivenstore.example.com</p>'),
  ('FAQ', 'faq', '<h1>Frequently Asked Questions</h1><p>Here are some common questions.</p>'),
  ('Privacy Policy', 'privacy-policy', '<h1>Privacy Policy</h1><p>Your privacy is critically important to us.</p>'),
  ('Terms of Service', 'terms-of-service', '<h1>Terms of Service</h1><p>These terms apply to all visitors, users and others who access or use the Service.</p>')
ON CONFLICT (slug) DO NOTHING;
