-- Add indexes for public profile page performance optimization
-- These indexes will significantly speed up queries used by the public profile page

--> statement-breakpoint
-- Index on loanOfficerPublicLinks.publicSlug for fast slug lookups
CREATE INDEX IF NOT EXISTS "idx_loan_officer_public_links_public_slug" ON "loan_officer_public_links" ("public_slug");

--> statement-breakpoint
-- Composite index on pageSettings for officerId, isPublished, and updatedAt
-- This optimizes the query: WHERE officerId = ? AND isPublished = true ORDER BY updatedAt DESC
CREATE INDEX IF NOT EXISTS "idx_page_settings_officer_published_updated" ON "page_settings" ("officer_id", "is_published", "updated_at" DESC);

--> statement-breakpoint
-- Composite index on templates for userId, isSelected, and isActive
-- This optimizes queries for user's selected template
CREATE INDEX IF NOT EXISTS "idx_templates_user_selected_active" ON "templates" ("user_id", "is_selected", "is_active");

--> statement-breakpoint
-- Composite index on templates for slug, isDefault, and isActive
-- This optimizes queries for default templates
CREATE INDEX IF NOT EXISTS "idx_templates_slug_default_active" ON "templates" ("slug", "is_default", "is_active");

--> statement-breakpoint
-- Composite index on templates for userId, slug, and isActive
-- This optimizes preview mode template queries
CREATE INDEX IF NOT EXISTS "idx_templates_user_slug_active" ON "templates" ("user_id", "slug", "is_active");

