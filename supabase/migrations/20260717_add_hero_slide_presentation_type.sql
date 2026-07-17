-- Add explicit visual presentation modes to the manually managed homepage slider.
-- Existing slides remain promotional image slides.

ALTER TABLE public.hero_slides
  ADD COLUMN IF NOT EXISTS presentation_type TEXT NOT NULL DEFAULT 'image';

ALTER TABLE public.hero_slides
  DROP CONSTRAINT IF EXISTS hero_slides_presentation_type_check;

ALTER TABLE public.hero_slides
  ADD CONSTRAINT hero_slides_presentation_type_check
  CHECK (presentation_type IN ('image', 'book'));

UPDATE public.hero_slides
SET presentation_type = 'image'
WHERE presentation_type IS NULL;

NOTIFY pgrst, 'reload schema';
