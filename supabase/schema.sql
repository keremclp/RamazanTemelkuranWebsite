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
  category TEXT,
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
  cta_link TEXT,
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
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_books_slug ON books(slug);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_display_order ON books(display_order);
CREATE INDEX idx_media_event_id ON media(event_id);
CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_events_date ON events(event_date DESC);
CREATE INDEX idx_hero_slides_active ON hero_slides(is_active, display_order);
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

-- ADMIN (authenticated) policies — full CRUD
CREATE POLICY "Admin can manage books" ON books
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage events" ON events
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage media" ON media
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage hero slides" ON hero_slides
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage about content" ON about_content
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage contact messages" ON contact_messages
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage site settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- SEED DATA (placeholder content)
-- ============================================

-- Insert default about content
INSERT INTO about_content (biography, milestones, social_links)
VALUES (
  'Ramazan Temelkuran, edebiyat dünyasında önemli bir yere sahip olan yazar, eserleriyle okuyucularını derinden etkileyen ve düşünmeye sevk eden bir kalem. Yılların birikimiyle oluşturduğu eserlerinde toplumsal meseleleri bireysel hikayelerle harmanlıyor.

Birçok ödüle layık görülen yazar, ulusal ve uluslararası etkinliklerde okuyucularıyla buluşmaya devam ediyor. Edebiyatın toplumu dönüştürme gücüne inanan Temelkuran, yazarlık serüvenine tüm tutkusuyla devam etmektedir.',
  '[
    {"year": "2010", "title": "İlk Kitap", "description": "İlk romanı yayımlandı ve edebiyat çevrelerinde büyük ilgi gördü."},
    {"year": "2015", "title": "Edebiyat Ödülü", "description": "Yılın en iyi romanı dalında prestijli bir ödüle layık görüldü."},
    {"year": "2020", "title": "Uluslararası Tanınırlık", "description": "Eserleri farklı dillere çevrilmeye başlandı."},
    {"year": "2024", "title": "Yeni Eserler", "description": "Yeni kitaplarıyla okuyucularıyla buluşmaya devam ediyor."}
  ]'::jsonb,
  '{"instagram": "#", "youtube": "#"}'::jsonb
);

-- Insert default site settings
INSERT INTO site_settings (site_title, shopier_main_url, meta_description, social_links)
VALUES (
  'Ramazan Temelkuran',
  'https://shopier.com',
  'Yazar Ramazan Temelkuran''ın resmi web sitesi. Kitaplar, etkinlikler ve daha fazlası.',
  '{"instagram": "#", "youtube": "#"}'::jsonb
);

-- Insert sample books
INSERT INTO books (title, slug, description, shopier_url, publisher, publication_year, page_count, category, display_order)
VALUES
  (
    'Sessiz Fırtına',
    'sessiz-firtina',
    'Bir kasabanın sakin görünümü altında yatan derin çatışmaları ve insanların iç dünyalarını anlatan etkileyici bir roman. Toplumsal baskılar altında ezilen bireylerin sessiz direnişini konu alıyor.',
    'https://shopier.com',
    'Örnek Yayınevi',
    2023,
    320,
    'Roman',
    1
  ),
  (
    'Zamanın Kıyısında',
    'zamanin-kiyisinda',
    'Geçmiş ve gelecek arasında sıkışmış bir adamın, kendini ve hayatın anlamını arayışını anlatan felsefi bir roman. Zaman kavramını sorgulayan derin bir eser.',
    'https://shopier.com',
    'Örnek Yayınevi',
    2022,
    280,
    'Roman',
    2
  ),
  (
    'Düşüncenin İzleri',
    'dusuncenin-izleri',
    'Toplumsal değişimleri, kültürel dönüşümleri ve bireyin bu süreçteki yerini ele alan düşündürücü denemeler. Modern hayatın karmaşıklığına farklı bir perspektiften bakış.',
    'https://shopier.com',
    'Örnek Yayınevi',
    2021,
    240,
    'Deneme',
    3
  );

-- Insert sample events
INSERT INTO events (title, description, event_date, location)
VALUES
  ('Kitap Fuarı İmza Günü', 'İstanbul Kitap Fuarı''nda okuyucularla buluşma ve imza etkinliği.', '2024-11-15', 'İstanbul'),
  ('Edebiyat Söyleşisi', 'Çağdaş Türk edebiyatı üzerine bir söyleşi ve okuma etkinliği.', '2024-09-20', 'Ankara'),
  ('Yeni Kitap Lansman', 'Sessiz Fırtına romanının lansman etkinliği.', '2024-06-10', 'İzmir');

-- Insert sample hero slides
INSERT INTO hero_slides (image_url, title, subtitle, cta_text, cta_link, display_order, is_active)
VALUES
  ('/images/hero-placeholder.jpg', 'Yeni Kitap: Sessiz Fırtına', 'Şimdi tüm kitapçılarda ve Shopier''de', 'Kitabı İncele', '/books/sessiz-firtina', 1, true),
  ('/images/hero-placeholder.jpg', 'Edebiyatın Büyülü Dünyası', 'Kelimelerin gücüne inanıyoruz', 'Kitapları Keşfet', '/books', 2, true),
  ('/images/hero-placeholder.jpg', 'Etkinliklerimiz', 'İmza günleri ve söyleşilerden kareler', 'Galeriyi Gör', '/gallery', 3, true);
