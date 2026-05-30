DELETE FROM public.user_companies
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, company_id
        ORDER BY is_active DESC, joined_at DESC NULLS LAST, id DESC
      ) AS rn
    FROM public.user_companies
  ) ranked
  WHERE rn > 1
);
--> statement-breakpoint
DROP INDEX IF EXISTS public.user_company_unique_idx;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS user_companies_user_company_unique
ON public.user_companies (user_id, company_id);
