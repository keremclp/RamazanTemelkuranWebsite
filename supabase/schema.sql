-- ============================================
-- Ramazan Temelkuran Website — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. BOOKS
-- ============================================
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  shopier_url TEXT NOT NULL DEFAULT '',
  publisher TEXT,
  publication_year INTEGER,
  page_count INTEGER,
  isbn TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. EVENTS
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  location TEXT,
  homepage_media_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. MEDIA (photos & video embeds)
-- ============================================
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE events
  ADD CONSTRAINT events_homepage_media_id_fkey
  FOREIGN KEY (homepage_media_id) REFERENCES media(id) ON DELETE SET NULL;

-- ============================================
-- 4. HERO SLIDES (homepage slider)
-- ============================================
CREATE TABLE hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  cta_text TEXT,
  -- Deprecated after CTA target migration; retained for backwards compatibility.
  cta_link TEXT,
  cta_type TEXT NOT NULL DEFAULT 'none'
    CHECK (cta_type IN ('none', 'books', 'book', 'gallery', 'about', 'contact', 'shopier', 'external')),
  cta_book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  cta_external_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 5. ABOUT CONTENT (single row)
-- ============================================
CREATE TABLE about_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  biography TEXT NOT NULL DEFAULT '',
  portrait_image_url TEXT,
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 6. CONTACT MESSAGES
-- ============================================
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 7. SITE SETTINGS (single row)
-- ============================================
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_title TEXT NOT NULL DEFAULT 'Ramazan Temelkuran',
  shopier_main_url TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  contact_location TEXT NOT NULL DEFAULT '',
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 8. ADMIN ALLOWLIST
-- ============================================
CREATE TABLE admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_books_slug ON books(slug);
CREATE INDEX idx_books_display_order ON books(display_order);
CREATE INDEX idx_media_event_id ON media(event_id);
CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_events_date ON events(event_date DESC);
CREATE INDEX idx_hero_slides_active ON hero_slides(is_active, display_order);
CREATE INDEX idx_hero_slides_cta_book ON hero_slides(cta_book_id);
CREATE INDEX idx_contact_messages_read ON contact_messages(is_read, created_at DESC);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER about_content_updated_at
  BEFORE UPDATE ON about_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies (anyone can read public content)
CREATE POLICY "Public can read books" ON books
  FOR SELECT USING (true);

CREATE POLICY "Public can read events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Public can read media" ON media
  FOR SELECT USING (true);

CREATE POLICY "Public can read active hero slides" ON hero_slides
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read about content" ON about_content
  FOR SELECT USING (true);

CREATE POLICY "Public can read site settings" ON site_settings
  FOR SELECT USING (true);

-- PUBLIC INSERT for contact messages (anyone can submit)
CREATE POLICY "Anyone can submit contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- ADMIN allowlist — only rows in admin_users receive full CRUD access.
CREATE POLICY "Users can read own admin membership" ON admin_users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can manage books" ON books
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin can manage events" ON events
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin can manage media" ON media
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin can manage hero slides" ON hero_slides
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin can manage about content" ON about_content
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin can manage contact messages" ON contact_messages
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin can manage site settings" ON site_settings
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================
-- SUPABASE STORAGE
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY "Public can read media bucket files" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'media');

CREATE POLICY "Admins can upload media files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "Admins can update media files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "Admins can delete media files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());

-- After creating the Supabase Auth administrator, grant access once:
-- INSERT INTO public.admin_users (user_id)
-- SELECT id FROM auth.users WHERE email = 'your-admin@example.com'
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- SEED DATA (safe empty defaults)
-- ============================================

-- Insert an empty about row for the admin editor.
INSERT INTO about_content (biography, milestones, social_links)
VALUES ('', '[]'::jsonb, '{}'::jsonb);

-- Insert default site settings
INSERT INTO site_settings (
  site_title,
  shopier_main_url,
  meta_description,
  contact_email,
  contact_location,
  social_links
)
VALUES (
  'Ramazan Temelkuran',
  '',
  'Yazar Ramazan Temelkuran''ın resmi web sitesi. Kitaplar, etkinlikler ve daha fazlası.',
  '',
  '',
  '{}'::jsonb
);
