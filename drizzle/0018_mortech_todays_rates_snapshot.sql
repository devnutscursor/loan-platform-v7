CREATE TABLE IF NOT EXISTS "mortech_todays_rates_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope_key" text DEFAULT 'global' NOT NULL,
	"bucket_id" text NOT NULL,
	"rate_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "mortech_todays_rates_snapshot_scope_bucket_uq"
	ON "mortech_todays_rates_snapshot" ("scope_key", "bucket_id");

CREATE INDEX IF NOT EXISTS "mortech_todays_rates_snapshot_bucket_idx"
	ON "mortech_todays_rates_snapshot" ("bucket_id");
