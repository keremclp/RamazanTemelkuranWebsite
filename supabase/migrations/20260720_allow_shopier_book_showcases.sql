-- Allow curated book compositions to link either to the Books page or to the
-- configured Shopier storefront. Event compositions remain fixed to Gallery.

CREATE OR REPLACE FUNCTION public.save_hero_slide_with_selections(
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
        FROM public.books
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
        FROM public.events
        WHERE events.id = selection.event_id
      )
    ) THEN
      RAISE EXCEPTION 'Selected events must exist';
    END IF;

    v_cta_type := 'gallery';
    v_book_ids := ARRAY[]::UUID[];
  END IF;

  IF p_slide_id IS NULL THEN
    INSERT INTO public.hero_slides (
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
    UPDATE public.hero_slides
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

  DELETE FROM public.hero_slide_books
  WHERE hero_slide_id = v_slide_id;

  DELETE FROM public.hero_slide_events
  WHERE hero_slide_id = v_slide_id;

  IF p_visual_source = 'selected_books' THEN
    INSERT INTO public.hero_slide_books (
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
    INSERT INTO public.hero_slide_events (
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

NOTIFY pgrst, 'reload schema';
