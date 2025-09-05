CREATE TABLE "analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"officer_id" uuid,
	"event" text NOT NULL,
	"data" jsonb DEFAULT '{}',
	"user_agent" text,
	"ip_address" text,
	"referrer" text,
	"session_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"service" text NOT NULL,
	"key_value" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"website" text,
	"license_number" text,
	"address" jsonb,
	"phone" text,
	"email" text,
	"subscription" text DEFAULT 'basic',
	"subscription_expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"settings" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"officer_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"source" text NOT NULL,
	"status" text DEFAULT 'new',
	"priority" text DEFAULT 'medium',
	"loan_details" jsonb,
	"property_details" jsonb,
	"credit_score" integer,
	"loan_amount" numeric(15, 2),
	"down_payment" numeric(15, 2),
	"notes" text,
	"tags" jsonb DEFAULT '[]',
	"custom_fields" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"officer_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"template" text NOT NULL,
	"settings" jsonb DEFAULT '{}' NOT NULL,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_settings_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_settings_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"officer_id" uuid NOT NULL,
	"template" text NOT NULL,
	"settings" jsonb NOT NULL,
	"version" text NOT NULL,
	"storage_path" text,
	"is_auto_generated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rate_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"loan_type" text NOT NULL,
	"loan_term" integer NOT NULL,
	"rate" numeric(6, 4) NOT NULL,
	"apr" numeric(6, 4) NOT NULL,
	"points" numeric(6, 2) DEFAULT '0',
	"fees" numeric(10, 2) DEFAULT '0',
	"monthly_payment" numeric(12, 2),
	"loan_amount" numeric(15, 2),
	"credit_score" integer,
	"ltv" numeric(5, 2),
	"dti" numeric(5, 2),
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"preview_image" text,
	"category" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_premium" boolean DEFAULT false,
	"config" jsonb DEFAULT '{}' NOT NULL,
	"sections" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"role" text DEFAULT 'employee' NOT NULL,
	"permissions" jsonb DEFAULT '[]',
	"is_active" boolean DEFAULT true,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"avatar" text,
	"role" text DEFAULT 'employee' NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_officer_id_users_id_fk" FOREIGN KEY ("officer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_officer_id_users_id_fk" FOREIGN KEY ("officer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_settings" ADD CONSTRAINT "page_settings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_settings" ADD CONSTRAINT "page_settings_officer_id_users_id_fk" FOREIGN KEY ("officer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_settings" ADD CONSTRAINT "page_settings_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_settings_versions" ADD CONSTRAINT "page_settings_versions_page_settings_id_page_settings_id_fk" FOREIGN KEY ("page_settings_id") REFERENCES "public"."page_settings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_settings_versions" ADD CONSTRAINT "page_settings_versions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_settings_versions" ADD CONSTRAINT "page_settings_versions_officer_id_users_id_fk" FOREIGN KEY ("officer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_data" ADD CONSTRAINT "rate_data_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_companies" ADD CONSTRAINT "user_companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_companies" ADD CONSTRAINT "user_companies_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_company_idx" ON "analytics" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "analytics_officer_idx" ON "analytics" USING btree ("officer_id");--> statement-breakpoint
CREATE INDEX "analytics_event_idx" ON "analytics" USING btree ("event");--> statement-breakpoint
CREATE INDEX "analytics_created_at_idx" ON "analytics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "api_keys_company_idx" ON "api_keys" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "api_keys_service_idx" ON "api_keys" USING btree ("service");--> statement-breakpoint
CREATE INDEX "api_keys_active_idx" ON "api_keys" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "company_slug_idx" ON "companies" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "company_active_idx" ON "companies" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "leads_company_idx" ON "leads" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "leads_officer_idx" ON "leads" USING btree ("officer_id");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "page_settings_company_template_idx" ON "page_settings" USING btree ("company_id","template");--> statement-breakpoint
CREATE INDEX "page_settings_officer_idx" ON "page_settings" USING btree ("officer_id");--> statement-breakpoint
CREATE INDEX "page_settings_template_idx" ON "page_settings" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "page_settings_published_idx" ON "page_settings" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "page_settings_version_page_idx" ON "page_settings_versions" USING btree ("page_settings_id");--> statement-breakpoint
CREATE INDEX "page_settings_version_company_template_idx" ON "page_settings_versions" USING btree ("company_id","template");--> statement-breakpoint
CREATE INDEX "page_settings_version_idx" ON "page_settings_versions" USING btree ("version");--> statement-breakpoint
CREATE INDEX "rate_data_company_idx" ON "rate_data" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "rate_data_loan_type_idx" ON "rate_data" USING btree ("loan_type");--> statement-breakpoint
CREATE INDEX "rate_data_active_idx" ON "rate_data" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "rate_data_expires_idx" ON "rate_data" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "template_slug_idx" ON "templates" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "template_category_idx" ON "templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "template_active_idx" ON "templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "user_company_user_idx" ON "user_companies" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_company_company_idx" ON "user_companies" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "user_company_unique_idx" ON "user_companies" USING btree ("user_id","company_id");