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
  is_published BOOLEAN NOT NULL DEFAULT true,
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
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
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
  image_url TEXT,
  title TEXT,
  subtitle TEXT,
  cta_text TEXT,
  -- Deprecated after CTA target migration; retained for backwards compatibility.
  cta_link TEXT,
  cta_type TEXT NOT NULL DEFAULT 'none'
    CHECK (cta_type IN ('none', 'books', 'gallery', 'about', 'contact', 'shopier', 'external')),
  cta_external_url TEXT,
  visual_source TEXT NOT NULL DEFAULT 'uploaded_image'
    CHECK (visual_source IN ('uploaded_image', 'selected_books', 'selected_events')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hero_slide_books (
  hero_slide_id UUID NOT NULL
    REFERENCES hero_slides(id) ON DELETE CASCADE,
  book_id UUID NOT NULL
    REFERENCES books(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  PRIMARY KEY (hero_slide_id, book_id)
);

CREATE TABLE hero_slide_events (
  hero_slide_id UUID NOT NULL
    REFERENCES hero_slides(id) ON DELETE CASCADE,
  event_id UUID NOT NULL
    REFERENCES events(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  PRIMARY KEY (hero_slide_id, event_id)
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

-- Browser uploads remain temporary until the related content row is saved.
CREATE TABLE temporary_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bucket TEXT NOT NULL DEFAULT 'media',
  object_path TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL UNIQUE,
  uploaded_by UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Durable contact-form throttling shared by all server instances.
CREATE TABLE contact_rate_limits (
  client_key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_books_slug ON books(slug);
CREATE INDEX idx_books_display_order ON books(display_order);
CREATE INDEX idx_books_published_order ON books(is_published, display_order);
CREATE INDEX idx_media_event_id ON media(event_id);
CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_events_date ON events(event_date DESC);
CREATE INDEX idx_hero_slides_active ON hero_slides(is_active, display_order);
CREATE INDEX idx_hero_slide_books_order
  ON hero_slide_books(hero_slide_id, display_order);
CREATE INDEX idx_hero_slide_events_order
  ON hero_slide_events(hero_slide_id, display_order);
CREATE INDEX idx_contact_messages_read ON contact_messages(is_read, created_at DESC);
CREATE INDEX idx_temporary_uploads_created_at ON temporary_uploads(created_at);

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

CREATE OR REPLACE FUNCTION save_hero_slide_with_selections(
  p_slide_id UUID,
  p_image_url TEXT,
  p_title TEXT,
  p_subtitle TEXT,
  p_cta_text TEXT,
  p_cta_type TEXT,
  p_cta_external_url TEXT,
  p_display_order INTEGER,
  p_is_active BOOLEAN,
  p_visual_source TEXT,
  p_book_ids UUID[],
  p_event_ids UUID[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_slide_id UUID;
  v_image_url TEXT := NULLIF(BTRIM(COALESCE(p_image_url, '')), '');
  v_book_ids UUID[] := COALESCE(p_book_ids, ARRAY[]::UUID[]);
  v_event_ids UUID[] := COALESCE(p_event_ids, ARRAY[]::UUID[]);
  v_cta_type TEXT := p_cta_type;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  IF p_visual_source NOT IN (
    'uploaded_image',
    'selected_books',
    'selected_events'
  ) THEN
    RAISE EXCEPTION 'Invalid hero slide visual source';
  END IF;

  IF COALESCE(p_display_order, 0) < 0 THEN
    RAISE EXCEPTION 'Display order cannot be negative';
  END IF;

  IF p_visual_source = 'uploaded_image' THEN
    IF v_image_url IS NULL THEN
      RAISE EXCEPTION 'Uploaded-image slides require an image';
    END IF;

    IF p_cta_type NOT IN (
      'none',
      'books',
      'gallery',
      'about',
      'contact',
      'shopier',
      'external'
    ) THEN
      RAISE EXCEPTION 'Invalid hero slide CTA type';
    END IF;

    IF p_cta_type = 'external' AND (
      NULLIF(BTRIM(COALESCE(p_cta_external_url, '')), '') IS NULL
      OR p_cta_external_url !~* '^https?://'
    ) THEN
      RAISE EXCEPTION 'External hero slide CTA requires an HTTP(S) URL';
    END IF;

    v_book_ids := ARRAY[]::UUID[];
    v_event_ids := ARRAY[]::UUID[];
  ELSIF p_visual_source = 'selected_books' THEN
    IF CARDINALITY(v_book_ids) < 1 OR CARDINALITY(v_book_ids) > 6 THEN
      RAISE EXCEPTION 'Selected-book slides require between one and six books';
    END IF;

    IF CARDINALITY(v_book_ids) <> (
      SELECT COUNT(DISTINCT selection.book_id)
      FROM UNNEST(v_book_ids) AS selection(book_id)
    ) THEN
      RAISE EXCEPTION 'A book cannot be selected more than once';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM UNNEST(v_book_ids) AS selection(book_id)
      WHERE NOT EXISTS (
        SELECT 1
        FROM books
        WHERE books.id = selection.book_id
          AND books.is_published = true
      )
    ) THEN
      RAISE EXCEPTION 'Selected books must exist and be published';
    END IF;

    IF p_cta_type NOT IN ('books', 'shopier') THEN
      RAISE EXCEPTION 'Selected-book slides must target Books or Shopier';
    END IF;

    v_cta_type := p_cta_type;
    v_event_ids := ARRAY[]::UUID[];
  ELSE
    IF CARDINALITY(v_event_ids) < 1 OR CARDINALITY(v_event_ids) > 6 THEN
      RAISE EXCEPTION 'Selected-event slides require between one and six events';
    END IF;

    IF CARDINALITY(v_event_ids) <> (
      SELECT COUNT(DISTINCT selection.event_id)
      FROM UNNEST(v_event_ids) AS selection(event_id)
    ) THEN
      RAISE EXCEPTION 'An event cannot be selected more than once';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM UNNEST(v_event_ids) AS selection(event_id)
      WHERE NOT EXISTS (
        SELECT 1
        FROM events
        WHERE events.id = selection.event_id
      )
    ) THEN
      RAISE EXCEPTION 'Selected events must exist';
    END IF;

    v_cta_type := 'gallery';
    v_book_ids := ARRAY[]::UUID[];
  END IF;

  IF p_slide_id IS NULL THEN
    INSERT INTO hero_slides (
      image_url,
      title,
      subtitle,
      cta_text,
      cta_link,
      cta_type,
      cta_external_url,
      visual_source,
      display_order,
      is_active
    )
    VALUES (
      v_image_url,
      NULLIF(BTRIM(COALESCE(p_title, '')), ''),
      NULLIF(BTRIM(COALESCE(p_subtitle, '')), ''),
      NULLIF(BTRIM(COALESCE(p_cta_text, '')), ''),
      NULL,
      v_cta_type,
      CASE
        WHEN v_cta_type = 'external'
          THEN NULLIF(BTRIM(COALESCE(p_cta_external_url, '')), '')
        ELSE NULL
      END,
      p_visual_source,
      COALESCE(p_display_order, 0),
      COALESCE(p_is_active, true)
    )
    RETURNING id INTO v_slide_id;
  ELSE
    UPDATE hero_slides
    SET
      image_url = v_image_url,
      title = NULLIF(BTRIM(COALESCE(p_title, '')), ''),
      subtitle = NULLIF(BTRIM(COALESCE(p_subtitle, '')), ''),
      cta_text = NULLIF(BTRIM(COALESCE(p_cta_text, '')), ''),
      cta_link = NULL,
      cta_type = v_cta_type,
      cta_external_url = CASE
        WHEN v_cta_type = 'external'
          THEN NULLIF(BTRIM(COALESCE(p_cta_external_url, '')), '')
        ELSE NULL
      END,
      visual_source = p_visual_source,
      display_order = COALESCE(p_display_order, 0),
      is_active = COALESCE(p_is_active, true)
    WHERE id = p_slide_id
    RETURNING id INTO v_slide_id;

    IF v_slide_id IS NULL THEN
      RAISE EXCEPTION 'Hero slide not found';
    END IF;
  END IF;

  DELETE FROM hero_slide_books
  WHERE hero_slide_id = v_slide_id;

  DELETE FROM hero_slide_events
  WHERE hero_slide_id = v_slide_id;

  IF p_visual_source = 'selected_books' THEN
    INSERT INTO hero_slide_books (
      hero_slide_id,
      book_id,
      display_order
    )
    SELECT
      v_slide_id,
      selection.book_id,
      (selection.position - 1)::INTEGER
    FROM UNNEST(v_book_ids) WITH ORDINALITY
      AS selection(book_id, position);
  ELSIF p_visual_source = 'selected_events' THEN
    INSERT INTO hero_slide_events (
      hero_slide_id,
      event_id,
      display_order
    )
    SELECT
      v_slide_id,
      selection.event_id,
      (selection.position - 1)::INTEGER
    FROM UNNEST(v_event_ids) WITH ORDINALITY
      AS selection(event_id, position);
  END IF;

  RETURN v_slide_id;
END;
$$;

REVOKE ALL ON FUNCTION save_hero_slide_with_selections(
  UUID,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  INTEGER,
  BOOLEAN,
  TEXT,
  UUID[],
  UUID[]
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION save_hero_slide_with_selections(
  UUID,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  INTEGER,
  BOOLEAN,
  TEXT,
  UUID[],
  UUID[]
) TO authenticated;

CREATE OR REPLACE FUNCTION submit_contact_message(
  p_client_key TEXT,
  p_name TEXT,
  p_email TEXT,
  p_subject TEXT,
  p_message TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_time TIMESTAMPTZ := NOW();
  limit_row contact_rate_limits%ROWTYPE;
BEGIN
  IF p_client_key !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid client key';
  END IF;

  IF LENGTH(BTRIM(p_name)) NOT BETWEEN 1 AND 120
    OR LENGTH(BTRIM(p_email)) NOT BETWEEN 3 AND 254
    OR BTRIM(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    OR LENGTH(BTRIM(p_subject)) NOT BETWEEN 1 AND 160
    OR LENGTH(BTRIM(p_message)) NOT BETWEEN 10 AND 3000 THEN
    RAISE EXCEPTION 'Invalid contact payload';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_client_key, 0));
  DELETE FROM contact_rate_limits
    WHERE updated_at < current_time - INTERVAL '24 hours';

  SELECT * INTO limit_row
  FROM contact_rate_limits
  WHERE client_key = p_client_key
  FOR UPDATE;

  IF NOT FOUND OR limit_row.window_started_at <= current_time - INTERVAL '10 minutes' THEN
    INSERT INTO contact_rate_limits (
      client_key, request_count, window_started_at, updated_at
    ) VALUES (
      p_client_key, 1, current_time, current_time
    )
    ON CONFLICT (client_key) DO UPDATE SET
      request_count = 1,
      window_started_at = current_time,
      updated_at = current_time;
  ELSIF limit_row.request_count >= 5 THEN
    RETURN 'rate_limited';
  ELSE
    UPDATE contact_rate_limits SET
      request_count = request_count + 1,
      updated_at = current_time
    WHERE client_key = p_client_key;
  END IF;

  INSERT INTO contact_messages (name, email, subject, message)
  VALUES (p_name, p_email, p_subject, p_message);

  RETURN 'accepted';
END;
$$;

REVOKE ALL ON FUNCTION submit_contact_message(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_contact_message(TEXT, TEXT, TEXT, TEXT, TEXT)
  TO service_role;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slide_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slide_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_rate_limits ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies (anyone can read public content)
CREATE POLICY "Public can read books" ON books
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can read events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Public can read media" ON media
  FOR SELECT USING (true);

CREATE POLICY "Public can read active hero slides" ON hero_slides
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active hero slide books" ON hero_slide_books
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM hero_slides
      WHERE hero_slides.id = hero_slide_books.hero_slide_id
        AND hero_slides.is_active = true
    )
    AND EXISTS (
      SELECT 1
      FROM books
      WHERE books.id = hero_slide_books.book_id
        AND books.is_published = true
    )
  );

CREATE POLICY "Public can read active hero slide events" ON hero_slide_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM hero_slides
      WHERE hero_slides.id = hero_slide_events.hero_slide_id
        AND hero_slides.is_active = true
    )
  );

CREATE POLICY "Public can read about content" ON about_content
  FOR SELECT USING (true);

CREATE POLICY "Public can read site settings" ON site_settings
  FOR SELECT USING (true);

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

CREATE POLICY "Admin can manage hero slide books" ON hero_slide_books
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin can manage hero slide events" ON hero_slide_events
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

CREATE POLICY "Admin can manage temporary uploads" ON temporary_uploads
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT ON hero_slide_books TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON hero_slide_books TO authenticated;
GRANT ALL ON hero_slide_books TO service_role;

GRANT SELECT ON hero_slide_events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON hero_slide_events TO authenticated;
GRANT ALL ON hero_slide_events TO service_role;

-- ============================================
-- SUPABASE STORAGE
-- ============================================
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'media',
  'media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

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
