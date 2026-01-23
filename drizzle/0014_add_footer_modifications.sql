-- Add footer_modifications column to templates table
ALTER TABLE "templates" ADD COLUMN "footer_modifications" jsonb DEFAULT '{}';

