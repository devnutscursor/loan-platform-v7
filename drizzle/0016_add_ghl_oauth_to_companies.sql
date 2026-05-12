ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "ghl_oauth_payload" jsonb;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "ghl_connected_at" timestamp;
