CREATE TABLE "officer_content_faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"officer_id" uuid NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "officer_content_guides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"officer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text,
	"cloudinary_public_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "officer_content_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"officer_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"video_url" text NOT NULL,
	"thumbnail_url" text,
	"duration" text,
	"cloudinary_public_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "officer_content_faqs" ADD CONSTRAINT "officer_content_faqs_officer_id_users_id_fk" FOREIGN KEY ("officer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "officer_content_guides" ADD CONSTRAINT "officer_content_guides_officer_id_users_id_fk" FOREIGN KEY ("officer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "officer_content_videos" ADD CONSTRAINT "officer_content_videos_officer_id_users_id_fk" FOREIGN KEY ("officer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "officer_content_faqs_officer_idx" ON "officer_content_faqs" USING btree ("officer_id");--> statement-breakpoint
CREATE INDEX "officer_content_faqs_category_idx" ON "officer_content_faqs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "officer_content_guides_officer_idx" ON "officer_content_guides" USING btree ("officer_id");--> statement-breakpoint
CREATE INDEX "officer_content_guides_category_idx" ON "officer_content_guides" USING btree ("category");--> statement-breakpoint
CREATE INDEX "officer_content_videos_officer_idx" ON "officer_content_videos" USING btree ("officer_id");--> statement-breakpoint
CREATE INDEX "officer_content_videos_category_idx" ON "officer_content_videos" USING btree ("category");