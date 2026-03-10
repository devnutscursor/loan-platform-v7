ALTER TABLE "companies" ADD COLUMN "has_mortech_subscription" boolean DEFAULT true;

CREATE TABLE "manual_rates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "officer_id" uuid NOT NULL,
  "company_id" uuid NOT NULL,
  "rate_data" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "manual_rates_officer_id_users_id_fk" FOREIGN KEY ("officer_id") REFERENCES "users"("id") ON DELETE cascade,
  CONSTRAINT "manual_rates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE cascade
);

CREATE INDEX "manual_rates_officer_idx" ON "manual_rates" ("officer_id");
CREATE INDEX "manual_rates_company_idx" ON "manual_rates" ("company_id");
