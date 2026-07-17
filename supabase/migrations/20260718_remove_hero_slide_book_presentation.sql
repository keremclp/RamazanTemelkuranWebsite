-- Remove the retired homepage book-showcase mode after the compatible
-- promotional-only application code has been deployed and verified.

-- Any unexpected old book-showcase row is made safe before its supporting
-- columns are removed. The administrator can later attach a landscape image
-- and reactivate it as a normal promotional slide if desired.
UPDATE public.hero_slides
SET is_active = false
WHERE presentation_type = 'book';

UPDATE public.hero_slides
SET
  cta_type = 'books',
  cta_link = '/books'
WHERE cta_type = 'book';

ALTER TABLE public.hero_slides
  DROP CONSTRAINT IF EXISTS hero_slides_cta_type_check;

ALTER TABLE public.hero_slides
  ADD CONSTRAINT hero_slides_cta_type_check
  CHECK (
    cta_type IN (
      'none',
      'books',
      'gallery',
      'about',
      'contact',
      'shopier',
      'external'
    )
  );

ALTER TABLE public.hero_slides
  DROP COLUMN IF EXISTS cta_book_id,
  DROP COLUMN IF EXISTS presentation_type;

NOTIFY pgrst, 'reload schema';
