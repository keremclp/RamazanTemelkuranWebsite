-- Restrict all content mutations to explicitly approved administrator accounts.
-- The migration automatically approves the only existing Auth user.
-- If the project has zero or multiple Auth users, it leaves the allowlist
-- empty so an administrator can be selected explicitly.

BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
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

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DO $$
DECLARE
  auth_user_count INTEGER;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users) THEN
    SELECT COUNT(*) INTO auth_user_count FROM auth.users;

    IF auth_user_count = 1 THEN
      INSERT INTO public.admin_users (user_id)
      SELECT id FROM auth.users;
    ELSE
      RAISE NOTICE
        'Admin role was not assigned automatically: found % Auth users. Add the intended user to public.admin_users explicitly.',
        auth_user_count;
    END IF;
  END IF;
END
$$;

DROP POLICY IF EXISTS "Users can read own admin membership" ON public.admin_users;
CREATE POLICY "Users can read own admin membership"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin can manage books" ON public.books;
CREATE POLICY "Admin can manage books"
  ON public.books
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can manage events" ON public.events;
CREATE POLICY "Admin can manage events"
  ON public.events
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can manage media" ON public.media;
CREATE POLICY "Admin can manage media"
  ON public.media
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can manage hero slides" ON public.hero_slides;
CREATE POLICY "Admin can manage hero slides"
  ON public.hero_slides
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can manage about content" ON public.about_content;
CREATE POLICY "Admin can manage about content"
  ON public.about_content
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can manage contact messages" ON public.contact_messages;
CREATE POLICY "Admin can manage contact messages"
  ON public.contact_messages
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can manage site settings" ON public.site_settings;
CREATE POLICY "Admin can manage site settings"
  ON public.site_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can upload media files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update media files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete media files" ON storage.objects;

CREATE POLICY "Admins can upload media files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "Admins can update media files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "Admins can delete media files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());

NOTIFY pgrst, 'reload schema';

COMMIT;
