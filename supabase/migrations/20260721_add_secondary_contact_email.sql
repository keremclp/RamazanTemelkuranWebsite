ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS contact_email_secondary TEXT NOT NULL DEFAULT '';

UPDATE public.site_settings
SET
  contact_email = 'yazarvesair@gmail.com',
  contact_email_secondary = 'ramazantemelkuran1@hotmail.com';

NOTIFY pgrst, 'reload schema';
