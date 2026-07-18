-- Create the avatars storage bucket used by profile photo uploads.
-- Existing migrations created policies for this bucket, but not the bucket itself.
-- Recorded remotely as migration version 20260708163512.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  false,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Avatars: authenticated can read" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: users insert own folder" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: users update own folder" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: users delete own folder" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: public can read" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: users can insert own folder" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: users can update own folder" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: users can delete own folder" ON storage.objects;

CREATE POLICY "Avatars: public can read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Avatars: users can insert own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars: users can update own folder"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars: users can delete own folder"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

GRANT ALL ON storage.objects TO service_role;
