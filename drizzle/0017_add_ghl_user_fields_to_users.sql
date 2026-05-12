ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ghl_user_id" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ghl_user_payload" jsonb;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ghl_user_created_at" timestamp;
