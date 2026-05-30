-- Supabase Storage RLS policies (storage.objects)
-- This file is structured for scripts/run-migration.ts:
-- - Each breakpoint chunk must NOT start with "--"
-- - Each chunk should contain exactly ONE SQL statement

--> statement-breakpoint
DO $$
BEGIN
  -- Supabase Storage typically already has RLS enabled.
  -- Some roles/connections cannot ALTER storage.objects; ignore if not permitted.
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN insufficient_privilege THEN
  NULL;
END $$;

--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE storage.objects FORCE ROW LEVEL SECURITY;
EXCEPTION WHEN insufficient_privilege THEN
  NULL;
END $$;

--> statement-breakpoint
DROP POLICY IF EXISTS "Enable public uploads for avatars" ON storage.objects;

--> statement-breakpoint
DROP POLICY IF EXISTS "Enable public read access for avatars" ON storage.objects;

--> statement-breakpoint
DROP POLICY IF EXISTS "Enable public updates for avatars" ON storage.objects;

--> statement-breakpoint
DROP POLICY IF EXISTS "Enable public deletes for avatars" ON storage.objects;

--> statement-breakpoint
DROP POLICY IF EXISTS avatars_public_read ON storage.objects;

--> statement-breakpoint
DROP POLICY IF EXISTS avatars_owner_insert ON storage.objects;

--> statement-breakpoint
DROP POLICY IF EXISTS avatars_owner_update ON storage.objects;

--> statement-breakpoint
DROP POLICY IF EXISTS avatars_owner_delete ON storage.objects;

--> statement-breakpoint
CREATE POLICY avatars_public_read ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

--> statement-breakpoint
CREATE POLICY avatars_owner_insert
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

--> statement-breakpoint
CREATE POLICY avatars_owner_update
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

--> statement-breakpoint
CREATE POLICY avatars_owner_delete
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

