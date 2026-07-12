-- Ensure the media bucket and its browser/admin access policies exist.
-- Run this once in the Supabase SQL Editor before testing storage cleanup.

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public can read media bucket files" ON storage.objects;
CREATE POLICY "Public can read media bucket files" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated users can upload media files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update media files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete media files" ON storage.objects;

DO $$
BEGIN
  IF to_regprocedure('public.is_admin()') IS NOT NULL THEN
    EXECUTE $policy$
      CREATE POLICY "Admins can upload media files" ON storage.objects
        FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'media' AND public.is_admin())
    $policy$;
    EXECUTE $policy$
      CREATE POLICY "Admins can update media files" ON storage.objects
        FOR UPDATE TO authenticated
        USING (bucket_id = 'media' AND public.is_admin())
        WITH CHECK (bucket_id = 'media' AND public.is_admin())
    $policy$;
    EXECUTE $policy$
      CREATE POLICY "Admins can delete media files" ON storage.objects
        FOR DELETE TO authenticated
        USING (bucket_id = 'media' AND public.is_admin())
    $policy$;
  ELSE
    CREATE POLICY "Authenticated users can upload media files" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'media');
    CREATE POLICY "Authenticated users can update media files" ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'media')
      WITH CHECK (bucket_id = 'media');
    CREATE POLICY "Authenticated users can delete media files" ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = 'media');
  END IF;
END
$$;
