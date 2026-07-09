-- Remove book categories from existing Supabase projects.
-- Run this once in the Supabase SQL Editor after deploying the code change.

DROP INDEX IF EXISTS idx_books_category;

ALTER TABLE books
  DROP COLUMN IF EXISTS category;
