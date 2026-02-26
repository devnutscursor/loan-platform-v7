-- Run this in Supabase SQL Editor if mortech_investors / mortech_products are missing.
-- Safe to run multiple times (uses IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS "public"."mortech_investors" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "parent_id" text NOT NULL,
  "name" text NOT NULL,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "mortech_investors_parent_id_unique" UNIQUE("parent_id")
);

CREATE TABLE IF NOT EXISTS "public"."mortech_products" (
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

ALTER TABLE "public"."mortech_products"
  DROP CONSTRAINT IF EXISTS "mortech_products_investor_id_mortech_investors_id_fk";
ALTER TABLE "public"."mortech_products"
  ADD CONSTRAINT "mortech_products_investor_id_mortech_investors_id_fk"
  FOREIGN KEY ("investor_id") REFERENCES "public"."mortech_investors"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "mortech_investors_parent_id_idx" ON "public"."mortech_investors" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "mortech_investors_active_idx" ON "public"."mortech_investors" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "mortech_products_parent_product_idx" ON "public"."mortech_products" USING btree ("parent_id","product_id");
CREATE INDEX IF NOT EXISTS "mortech_products_investor_idx" ON "public"."mortech_products" USING btree ("investor_id");
CREATE INDEX IF NOT EXISTS "mortech_products_active_idx" ON "public"."mortech_products" USING btree ("is_active");
