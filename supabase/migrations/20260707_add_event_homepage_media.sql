-- Add explicit homepage cover selection for event cards.
-- Run this once in the Supabase SQL Editor if your database was created
-- before `events.homepage_media_id` was added to `supabase/schema.sql`.

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS homepage_media_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'events_homepage_media_id_fkey'
  ) THEN
    ALTER TABLE events
      ADD CONSTRAINT events_homepage_media_id_fkey
      FOREIGN KEY (homepage_media_id) REFERENCES media(id) ON DELETE SET NULL;
  END IF;
END $$;
