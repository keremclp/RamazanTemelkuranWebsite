-- Add editable public contact details to site settings.

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS contact_email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_location TEXT NOT NULL DEFAULT '';

UPDATE public.site_settings
SET
  contact_email = COALESCE(contact_email, ''),
  contact_location = COALESCE(contact_location, '')
WHERE contact_email IS NULL OR contact_location IS NULL;

NOTIFY pgrst, 'reload schema';
