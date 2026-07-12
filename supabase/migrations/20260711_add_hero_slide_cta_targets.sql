-- Replace manually entered slider links with content-oriented CTA targets.

ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS cta_type TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS cta_book_id UUID,
  ADD COLUMN IF NOT EXISTS cta_external_url TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'hero_slides_cta_type_check'
  ) THEN
    ALTER TABLE hero_slides
      ADD CONSTRAINT hero_slides_cta_type_check
      CHECK (
        cta_type IN (
          'none',
          'books',
          'book',
          'gallery',
          'about',
          'contact',
          'shopier',
          'external'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'hero_slides_cta_book_id_fkey'
  ) THEN
    ALTER TABLE hero_slides
      ADD CONSTRAINT hero_slides_cta_book_id_fkey
      FOREIGN KEY (cta_book_id)
      REFERENCES books(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

UPDATE hero_slides AS slide
SET cta_book_id = book.id
FROM books AS book
WHERE slide.cta_link = '/books/' || book.slug;

UPDATE hero_slides
SET cta_external_url = cta_link
WHERE cta_link ~* '^https?://';

UPDATE hero_slides
SET cta_type = CASE
  WHEN NULLIF(BTRIM(cta_text), '') IS NULL
    OR NULLIF(BTRIM(cta_link), '') IS NULL THEN 'none'
  WHEN cta_book_id IS NOT NULL THEN 'book'
  WHEN cta_link = '/books' THEN 'books'
  WHEN cta_link = '/gallery' THEN 'gallery'
  WHEN cta_link = '/about' THEN 'about'
  WHEN cta_link = '/contact' THEN 'contact'
  WHEN cta_link ~* '^https?://' THEN 'external'
  ELSE 'none'
END;

CREATE INDEX IF NOT EXISTS idx_hero_slides_cta_book
  ON hero_slides(cta_book_id);
