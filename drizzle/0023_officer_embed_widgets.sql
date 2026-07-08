CREATE TABLE IF NOT EXISTS "officer_embed_widgets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "officer_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "embed_slug" text NOT NULL UNIQUE,
  "display_name" text,
  "nmls_number" text,
  "avatar_url" text,
  "is_enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "officer_embed_widgets_officer_id_unique" ON "officer_embed_widgets" ("officer_id");
CREATE INDEX IF NOT EXISTS "officer_embed_widgets_embed_slug_idx" ON "officer_embed_widgets" ("embed_slug");
