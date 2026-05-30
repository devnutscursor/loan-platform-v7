-- RLS helpers + policy wipe (safe to re-run)
-- This file is intended to be executed by a DB admin connection.
-- It does NOT enable RLS yet; it prepares non-recursive helper functions.

--> statement-breakpoint
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.is_in_company(target_company_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_companies uc
    WHERE uc.user_id = auth.uid()
      AND uc.company_id = target_company_id
      AND uc.is_active = true
  )
$$;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.is_company_admin_of(target_company_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_companies uc
    WHERE uc.user_id = auth.uid()
      AND uc.company_id = target_company_id
      AND uc.role = 'admin'
      AND uc.is_active = true
  )
$$;

--> statement-breakpoint
REVOKE ALL ON FUNCTION public.current_user_role()        FROM public;
REVOKE ALL ON FUNCTION public.is_in_company(uuid)        FROM public;
REVOKE ALL ON FUNCTION public.is_company_admin_of(uuid)  FROM public;

GRANT EXECUTE ON FUNCTION public.current_user_role()       TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_in_company(uuid)       TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_company_admin_of(uuid) TO authenticated, anon, service_role;

