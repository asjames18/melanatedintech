-- Enforce post-media upload limits on the server.
--
-- The 4 MB cap and the PNG/JPEG/WebP/GIF allowlist existed only in
-- src/components/feed/feed-composer.tsx, and the bucket's insert policy checked
-- nothing but the bucket name. Any signed-in user calling supabase.storage
-- directly could upload a file of any size and any type, into any other user's
-- folder, and the bucket is readable by anon — an unmetered public file host
-- attached to the project's storage bill.
--
-- The avatars bucket beside it already does all three of these correctly; this
-- brings post-media in line. Limits mirror POST_MEDIA_MAX_BYTES and ACCEPTED.

update storage.buckets
   set file_size_limit = 4194304, -- 4 MB, matches POST_MEDIA_MAX_BYTES
       allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
 where id = 'post-media';

-- Scope writes to the uploader's own folder. The client already builds paths as
-- `${user.id}/post-<ts>-<rand>.<ext>`, and every existing object conforms, so
-- this rejects nothing that legitimately exists today.
drop policy if exists "Authenticated can upload post media" on storage.objects;

create policy "Authenticated can upload post media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'post-media'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );
