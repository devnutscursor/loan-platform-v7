CREATE TABLE "email_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"verification_code" text NOT NULL,
	"code_expires_at" timestamp NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_verifications_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "mortech_email_rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"called_at" timestamp DEFAULT now() NOT NULL,
	"search_params" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "mortech_investors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "mortech_investors_parent_id_unique" UNIQUE("parent_id")
);
--> statement-breakpoint
CREATE TABLE "mortech_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"investor_id" uuid,
	"parent_id" text NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"vendor_product_code" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "footer_modifications" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "mortech_products" ADD CONSTRAINT "mortech_products_investor_id_mortech_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."mortech_investors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_verifications_email_idx" ON "email_verifications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "email_verifications_code_expires_at_idx" ON "email_verifications" USING btree ("code_expires_at");--> statement-breakpoint
CREATE INDEX "mortech_email_rate_limits_email_idx" ON "mortech_email_rate_limits" USING btree ("email");--> statement-breakpoint
CREATE INDEX "mortech_email_rate_limits_called_at_idx" ON "mortech_email_rate_limits" USING btree ("called_at");--> statement-breakpoint
CREATE INDEX "mortech_email_rate_limits_email_called_at_idx" ON "mortech_email_rate_limits" USING btree ("email","called_at");--> statement-breakpoint
CREATE INDEX "mortech_investors_parent_id_idx" ON "mortech_investors" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "mortech_investors_active_idx" ON "mortech_investors" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "mortech_products_parent_product_idx" ON "mortech_products" USING btree ("parent_id","product_id");--> statement-breakpoint
CREATE INDEX "mortech_products_investor_idx" ON "mortech_products" USING btree ("investor_id");--> statement-breakpoint
CREATE INDEX "mortech_products_active_idx" ON "mortech_products" USING btree ("is_active");