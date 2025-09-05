-- Add isActive column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS company_active_idx ON companies(is_active);

-- Update existing companies to be active
UPDATE companies SET is_active = true WHERE is_active IS NULL;


