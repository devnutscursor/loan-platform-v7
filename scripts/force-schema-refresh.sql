-- Force schema cache refresh in Supabase
-- Run this in Supabase SQL Editor

-- 1. Drop and recreate a dummy function to force cache refresh
CREATE OR REPLACE FUNCTION refresh_schema_cache() 
RETURNS void AS $$
BEGIN
    -- This forces Supabase to refresh its schema cache
    PERFORM 1;
END;
$$ LANGUAGE plpgsql;

-- 2. Call the function
SELECT refresh_schema_cache();

-- 3. Drop the function
DROP FUNCTION refresh_schema_cache();

-- 4. Verify companies table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Test insert with isActive
INSERT INTO public.companies (
    id, name, slug, website, email, is_active, subscription, settings, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'Cache Refresh Test',
    'cache-refresh-test',
    'https://test.com',
    'test@cache.com',
    true,
    'basic',
    '{}',
    NOW(),
    NOW()
) RETURNING *;

-- 6. Clean up test record
DELETE FROM public.companies WHERE name = 'Cache Refresh Test';

