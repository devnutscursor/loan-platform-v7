ALTER TABLE "officer_embed_widgets" ALTER COLUMN "officer_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "officer_embed_widgets" ADD COLUMN IF NOT EXISTS "is_external" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "officer_embed_widgets" ADD COLUMN IF NOT EXISTS "contact_email" text;
--> statement-breakpoint
ALTER TABLE "officer_embed_widgets" ADD COLUMN IF NOT EXISTS "accent_color" text;
