# RLS Enable Plan — Loan Officer Platform (v7)

> **Goal:** Turn on Row-Level Security on every business table in Supabase, table by table, with dry-run + rollback, without breaking the app.
> **Owner:** DB admin (you), executed via Supabase SQL Editor.
> **Prerequisites:** Read `docs/SECURITY_AUDIT.md` first. The API-layer fixes (Phase 1) should be done **before** Phase 2 (this plan). RLS protects the browser/anon path; it does not fix the no-auth API routes.

---

## TL;DR

- We will enable RLS on **23 tables**, one at a time, inside `BEGIN; … ROLLBACK;` test blocks so a wrong policy never reaches production.
- Server-side API routes use the **service-role key**, which **bypasses RLS** by design — they will continue to work unchanged.
- Drizzle queries use the **`postgres` superuser** (`DATABASE_URL`), which also bypasses RLS — they too continue to work unchanged.
- The only place RLS actually applies today is the **browser** (anon key + user JWT) — `src/hooks/use-auth.ts` and `src/app/super-admin/dashboard/page.tsx`. We have to make sure the policies for `users`, `user_companies`, `companies`, and `leads` allow those reads for the right user.
- **Public profile pages** stay public: the server route (`/api/public-profile/[slug]`) uses the service-role key, so it keeps working. Anonymous browsers never query Supabase directly for profile data.

---

## Decisions Locked

Based on your answers:

| Question | Decision |
|---|---|
| `DATABASE_URL` user | `postgres.<project>` — superuser, has BYPASSRLS. Drizzle queries are NOT subject to RLS. (Optionally switch to a non-BYPASSRLS role in a future hardening pass.) |
| Should anon clients query Supabase directly? | **No.** Only the public profile flow is public, and that goes through `/api/public-profile/[slug]` which uses service-role on the server. The browser never reads Supabase as anon. |
| Public profile slugs | Anyone can open `https://app.example/<slug>` — the server reads the data with service-role and returns sanitized JSON. Direct anon queries on `loan_officer_public_links` / `users` / `companies` from a browser are **denied** by RLS. |
| Supabase Storage | Used for avatars / guides / videos. Lock per-user, allow public reads only for public-profile-related buckets. |
| `/api/contact/send`, `/api/send-verification` | Must remain reachable without login (for the public profile contact form + rate-search OTP). But rate-limited per-IP + per-email. |
| Upload routes (`/api/upload/avatar`, `/guide`, `/video`) | Require login. Owner can manage their own files only. |

---

## How Service-Role and BYPASSRLS Interact With Our Plan

| Path | DB role used | RLS applies? |
|---|---|---|
| Browser → Supabase (anon key + user JWT) | `authenticated` | ✅ Yes |
| Browser → Supabase (anon key, no JWT) | `anon` | ✅ Yes |
| Server `getSupabaseService()` → Supabase | `service_role` | ❌ Bypassed |
| Server Drizzle → Postgres directly | `postgres` (BYPASSRLS) | ❌ Bypassed |

**Conclusion:** RLS is *only* enforced on the first two rows. Server code is unchanged.

---

## Pre-Flight (one-time, run once before any per-table work)

### Step 0.1 — Wipe the broken policies and add helpers

The existing `supabase-policies.sql` has an infinite-recursion bug on the `users` SELECT policy. Wipe everything first and install a `SECURITY DEFINER` helper that reads `users.role` without recursing through RLS.

```sql
-- Wipe all existing policies in the public schema
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                   r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Helpers (SECURITY DEFINER to bypass RLS when reading users.role)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

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

REVOKE ALL ON FUNCTION public.current_user_role()        FROM public;
REVOKE ALL ON FUNCTION public.is_in_company(uuid)        FROM public;
REVOKE ALL ON FUNCTION public.is_company_admin_of(uuid)  FROM public;

GRANT EXECUTE ON FUNCTION public.current_user_role()       TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_in_company(uuid)       TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_company_admin_of(uuid) TO authenticated, anon, service_role;
```

### Step 0.2 — Gather baseline counts

Before turning RLS on, record the current count of every table. We'll compare after each test.

```sql
-- as service_role / postgres (default SQL editor role)
SELECT 'users'                            AS t, count(*) FROM public.users
UNION ALL SELECT 'companies',                    count(*) FROM public.companies
UNION ALL SELECT 'user_companies',               count(*) FROM public.user_companies
UNION ALL SELECT 'templates',                    count(*) FROM public.templates
UNION ALL SELECT 'page_settings',                count(*) FROM public.page_settings
UNION ALL SELECT 'page_settings_versions',       count(*) FROM public.page_settings_versions
UNION ALL SELECT 'leads',                        count(*) FROM public.leads
UNION ALL SELECT 'rate_data',                    count(*) FROM public.rate_data
UNION ALL SELECT 'api_keys',                     count(*) FROM public.api_keys
UNION ALL SELECT 'analytics',                    count(*) FROM public.analytics
UNION ALL SELECT 'loan_officer_public_links',    count(*) FROM public.loan_officer_public_links
UNION ALL SELECT 'public_link_usage',            count(*) FROM public.public_link_usage
UNION ALL SELECT 'officer_content_faqs',         count(*) FROM public.officer_content_faqs
UNION ALL SELECT 'officer_content_videos',       count(*) FROM public.officer_content_videos
UNION ALL SELECT 'officer_content_guides',       count(*) FROM public.officer_content_guides
UNION ALL SELECT 'selected_rates',               count(*) FROM public.selected_rates
UNION ALL SELECT 'manual_rates',                 count(*) FROM public.manual_rates
UNION ALL SELECT 'mortech_todays_rates_snapshot',count(*) FROM public.mortech_todays_rates_snapshot
UNION ALL SELECT 'mortech_api_calls',            count(*) FROM public.mortech_api_calls
UNION ALL SELECT 'mortech_email_rate_limits',    count(*) FROM public.mortech_email_rate_limits
UNION ALL SELECT 'mortech_investors',            count(*) FROM public.mortech_investors
UNION ALL SELECT 'mortech_products',             count(*) FROM public.mortech_products
UNION ALL SELECT 'email_verifications',          count(*) FROM public.email_verifications;
```

Save this output. After enabling RLS we'll re-run it as service_role (counts must be **identical**), then re-run it impersonating each user role.

### Step 0.3 — Pick 3 real users for dry-run impersonation

You need 3 known users:

| Role | Where to find one |
|---|---|
| Super admin | `SELECT id, email FROM public.users WHERE role = 'super_admin' LIMIT 1;` |
| Company admin | `SELECT id, email FROM public.users WHERE role = 'company_admin' LIMIT 1;` |
| Employee (officer) | `SELECT id, email FROM public.users WHERE role = 'employee' LIMIT 1;` |

Record the three UUIDs — we'll use them below as `<sa_id>`, `<ca_id>`, `<emp_id>`.

---

## The Dry-Run Pattern (used for every table)

For each table we will:

1. `BEGIN;`
2. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
3. Create the policies for that table.
4. Run baseline `count(*)` impersonating each of the 4 roles (anon, employee, company_admin, super_admin).
5. Compare to expected.
6. If wrong: `ROLLBACK;` — nothing applied. Fix the SQL and try again.
7. If right: `COMMIT;` — RLS is live for that one table.
8. Open the app and test the user-facing flows that touch this table.
9. Move to the next table.

### How to impersonate roles inside an SQL editor session

Supabase SQL Editor runs as `postgres`. To simulate a user-JWT request we override the role and JWT claims **just for that transaction**:

```sql
-- Become anon (no JWT)
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role":"anon"}';

-- Become an authenticated employee
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<emp_id>"}';

-- Become an authenticated company_admin
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<ca_id>"}';

-- Become an authenticated super_admin
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<sa_id>"}';

-- Go back to service_role / postgres
RESET ROLE;
RESET "request.jwt.claims";
```

> `SET LOCAL` resets at the end of the transaction, so it's safe inside `BEGIN; … ROLLBACK;`.

---

## Per-Table Plan

We will go in the order of **lowest risk first**. Each section below is self-contained — copy/paste, dry-run, then commit or rollback.

### Ordering (least → most disruptive)

| # | Table | Why this order |
|---|---|---|
| 1 | `mortech_todays_rates_snapshot` | Server-only; service_role bypasses. Safest first. |
| 2 | `mortech_api_calls` | Write-only via service_role. |
| 3 | `mortech_email_rate_limits` | Same. |
| 4 | `email_verifications` | Same (highly sensitive — must be locked). |
| 5 | `mortech_investors` | Catalog, server-only. |
| 6 | `mortech_products` | Same. |
| 7 | `public_link_usage` | Service-role write, no browser read. |
| 8 | `officer_content_faqs` | Owner + service_role. |
| 9 | `officer_content_videos` | Same. |
| 10 | `officer_content_guides` | Same. |
| 11 | `selected_rates` | Owner + service_role. |
| 12 | `manual_rates` | Same. |
| 13 | `api_keys` | Sensitive — strict. |
| 14 | `analytics` | Company-scoped. |
| 15 | `rate_data` | Company-scoped. |
| 16 | `page_settings` | Officer-scoped. |
| 17 | `page_settings_versions` | Same. |
| 18 | `leads` | Officer/company-scoped — browser also reads via super-admin dashboard. |
| 19 | `templates` | Needs anon read for public profile — test public profile right after. |
| 20 | `loan_officer_public_links` | Public profile path uses service-role; lock anon. |
| 21 | `user_companies` | Browser reads in `use-auth.ts` + dashboards. |
| 22 | `companies` | Browser reads in `use-auth.ts` + super-admin dashboard. |
| 23 | `users` | Last — every page reads it on login. Highest risk. |

After each commit, smoke-test the app (see "Browser Smoke Tests" at bottom).

---

### Group A — Service-role-only tables (Tables 1–7)

These tables are never read by the browser. Just enable RLS with no policies. `service_role` and `postgres` (BYPASSRLS) keep working; `anon` and `authenticated` get denied by default.

```sql
BEGIN;

ALTER TABLE public.mortech_todays_rates_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortech_api_calls             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortech_email_rate_limits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verifications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortech_investors             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortech_products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_link_usage             ENABLE ROW LEVEL SECURITY;

-- Dry-run: as anon, all 7 should return 0
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role":"anon"}';
SELECT 'mortech_todays_rates_snapshot', count(*) FROM public.mortech_todays_rates_snapshot
UNION ALL SELECT 'mortech_api_calls',         count(*) FROM public.mortech_api_calls
UNION ALL SELECT 'mortech_email_rate_limits', count(*) FROM public.mortech_email_rate_limits
UNION ALL SELECT 'email_verifications',       count(*) FROM public.email_verifications
UNION ALL SELECT 'mortech_investors',         count(*) FROM public.mortech_investors
UNION ALL SELECT 'mortech_products',          count(*) FROM public.mortech_products
UNION ALL SELECT 'public_link_usage',         count(*) FROM public.public_link_usage;
-- expected: every row returns 0

RESET ROLE; RESET "request.jwt.claims";

-- as service_role, counts should equal baseline
SET LOCAL ROLE service_role;
-- same SELECT block as above
-- expected: equals baseline numbers from Step 0.2

RESET ROLE;
COMMIT;
```

**Smoke test after commit:** trigger any cron route once (e.g. `/api/cron/mortech/sync-catalog`), make sure it still returns 200. Hit the public profile (`/<slug>`) — it should still load (public_link_usage write happens via service-role).

---

### Group B — Owner-only tables (Tables 8–12)

`officer_content_faqs`, `officer_content_videos`, `officer_content_guides`, `selected_rates`, `manual_rates`.

Policy: only the owner (`officer_id = auth.uid()`) sees and edits. `service_role` bypasses (so server reads via `getSupabaseService()` always work). Super-admin gets full access for moderation.

```sql
BEGIN;

ALTER TABLE public.officer_content_faqs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_content_videos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_content_guides  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selected_rates          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_rates            ENABLE ROW LEVEL SECURITY;

-- For each of the 5 tables, apply the same 2 policies:

CREATE POLICY officer_content_faqs_owner_all ON public.officer_content_faqs
  FOR ALL USING (officer_id = auth.uid())
  WITH CHECK (officer_id = auth.uid());
CREATE POLICY officer_content_faqs_super_admin_all ON public.officer_content_faqs
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');

CREATE POLICY officer_content_videos_owner_all ON public.officer_content_videos
  FOR ALL USING (officer_id = auth.uid())
  WITH CHECK (officer_id = auth.uid());
CREATE POLICY officer_content_videos_super_admin_all ON public.officer_content_videos
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');

CREATE POLICY officer_content_guides_owner_all ON public.officer_content_guides
  FOR ALL USING (officer_id = auth.uid())
  WITH CHECK (officer_id = auth.uid());
CREATE POLICY officer_content_guides_super_admin_all ON public.officer_content_guides
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');

CREATE POLICY selected_rates_owner_all ON public.selected_rates
  FOR ALL USING (officer_id = auth.uid())
  WITH CHECK (officer_id = auth.uid());
CREATE POLICY selected_rates_super_admin_all ON public.selected_rates
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');

CREATE POLICY manual_rates_owner_all ON public.manual_rates
  FOR ALL USING (officer_id = auth.uid())
  WITH CHECK (officer_id = auth.uid());
CREATE POLICY manual_rates_super_admin_all ON public.manual_rates
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');

-- Dry-run: as employee, count of selected_rates should equal "rows where officer_id = <emp_id>"
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<emp_id>"}';
SELECT count(*) FROM public.selected_rates;
-- expected: same as `SELECT count(*) FROM selected_rates WHERE officer_id = '<emp_id>'` (run as postgres)

-- as anon, count should be 0
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role":"anon"}';
SELECT count(*) FROM public.selected_rates;
-- expected: 0

RESET ROLE; RESET "request.jwt.claims";
COMMIT;
```

**Smoke test after commit:**
- Officer dashboard loads selected rates and content tabs.
- Public profile (`/<slug>`) still shows the officer's selected rates and content (because the route uses service-role).

---

### Group C — Company-scoped tables (Tables 13–17)

`api_keys`, `analytics`, `rate_data`, `page_settings`, `page_settings_versions`.

Policy: super_admin all; company_admin of that company; users that belong to that company; service_role bypass.

Important: `api_keys` is more sensitive — only super_admin + company_admin (not regular employees) should read.

```sql
BEGIN;

ALTER TABLE public.api_keys                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_data               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_settings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_settings_versions  ENABLE ROW LEVEL SECURITY;

-- API keys — super_admin + company_admin only
CREATE POLICY api_keys_super_admin_all ON public.api_keys
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');
CREATE POLICY api_keys_company_admin_all ON public.api_keys
  FOR ALL USING (is_company_admin_of(company_id))
  WITH CHECK (is_company_admin_of(company_id));

-- Analytics — all company members can read; only company_admin + super_admin write
CREATE POLICY analytics_super_admin_all ON public.analytics
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');
CREATE POLICY analytics_company_admin_all ON public.analytics
  FOR ALL USING (is_company_admin_of(company_id))
  WITH CHECK (is_company_admin_of(company_id));
CREATE POLICY analytics_company_read ON public.analytics
  FOR SELECT USING (is_in_company(company_id));

-- Rate data — same pattern
CREATE POLICY rate_data_super_admin_all ON public.rate_data
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');
CREATE POLICY rate_data_company_admin_all ON public.rate_data
  FOR ALL USING (is_company_admin_of(company_id))
  WITH CHECK (is_company_admin_of(company_id));
CREATE POLICY rate_data_company_read ON public.rate_data
  FOR SELECT USING (is_in_company(company_id));

-- Page settings — officer owns their row; company_admin manages company rows; super_admin all
CREATE POLICY page_settings_owner_all ON public.page_settings
  FOR ALL USING (officer_id = auth.uid())
  WITH CHECK (officer_id = auth.uid());
CREATE POLICY page_settings_company_admin_all ON public.page_settings
  FOR ALL USING (is_company_admin_of(company_id))
  WITH CHECK (is_company_admin_of(company_id));
CREATE POLICY page_settings_super_admin_all ON public.page_settings
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');

CREATE POLICY page_settings_versions_owner_all ON public.page_settings_versions
  FOR ALL USING (officer_id = auth.uid())
  WITH CHECK (officer_id = auth.uid());
CREATE POLICY page_settings_versions_company_admin_all ON public.page_settings_versions
  FOR ALL USING (is_company_admin_of(company_id))
  WITH CHECK (is_company_admin_of(company_id));
CREATE POLICY page_settings_versions_super_admin_all ON public.page_settings_versions
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');

-- Dry-run impersonations (run inside the same transaction)
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<emp_id>"}';
SELECT 'analytics as emp', count(*) FROM public.analytics;
SELECT 'api_keys as emp',  count(*) FROM public.api_keys;  -- expected 0

SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<ca_id>"}';
SELECT 'analytics as ca', count(*) FROM public.analytics;
SELECT 'api_keys as ca',  count(*) FROM public.api_keys;   -- expected = rows of that company

SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<sa_id>"}';
SELECT 'analytics as sa', count(*) FROM public.analytics;  -- expected = baseline

RESET ROLE; RESET "request.jwt.claims";
COMMIT;
```

---

### Group D — Leads (Table 18)

```sql
BEGIN;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY leads_super_admin_all ON public.leads
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');

CREATE POLICY leads_officer_own ON public.leads
  FOR ALL USING (officer_id = auth.uid())
  WITH CHECK (officer_id = auth.uid());

CREATE POLICY leads_company_admin ON public.leads
  FOR ALL USING (is_company_admin_of(company_id))
  WITH CHECK (is_company_admin_of(company_id));

-- Dry-run impersonations
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<emp_id>"}';
SELECT count(*) FROM public.leads;
-- expected: rows where officer_id = <emp_id>

SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<ca_id>"}';
SELECT count(*) FROM public.leads;
-- expected: rows where company_id in (companies of ca)

SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<sa_id>"}';
SELECT count(*) FROM public.leads;
-- expected: baseline

RESET ROLE; RESET "request.jwt.claims";
COMMIT;
```

**Smoke test:** Officer dashboard leads list, super-admin dashboard leads section.

---

### Group E — Templates (Table 19) — needs anon read

```sql
BEGIN;

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Public-profile pages read templates server-side (service-role), but to be safe
-- we also allow anon + authenticated to read active templates (since template content is
-- not sensitive on its own).
CREATE POLICY templates_public_read ON public.templates
  FOR SELECT USING (is_active = true);

CREATE POLICY templates_owner_all ON public.templates
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY templates_super_admin_all ON public.templates
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');

-- Dry-run
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role":"anon"}';
SELECT count(*) FROM public.templates;
-- expected: count of active templates (default + user customizations marked active)

RESET ROLE; RESET "request.jwt.claims";
COMMIT;
```

**Smoke test:** Public profile page, officers customizer page, super-admin dashboard.

---

### Group F — `loan_officer_public_links` (Table 20)

```sql
BEGIN;

ALTER TABLE public.loan_officer_public_links ENABLE ROW LEVEL SECURITY;

-- Owner can read + manage their own link
CREATE POLICY public_links_owner_all ON public.loan_officer_public_links
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Company admin can see links of their company
CREATE POLICY public_links_company_admin_all ON public.loan_officer_public_links
  FOR ALL USING (is_company_admin_of(company_id))
  WITH CHECK (is_company_admin_of(company_id));

-- Super admin all
CREATE POLICY public_links_super_admin_all ON public.loan_officer_public_links
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');

-- NOTE: anon has NO direct read access. The public profile route uses service-role
-- on the server and never queries this table from the browser.

-- Dry-run
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role":"anon"}';
SELECT count(*) FROM public.loan_officer_public_links;
-- expected: 0

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<emp_id>"}';
SELECT count(*) FROM public.loan_officer_public_links;
-- expected: rows where user_id = <emp_id>

RESET ROLE; RESET "request.jwt.claims";
COMMIT;
```

**Smoke test (critical):** Open `https://app.example/<some-active-slug>` from a logged-out browser. Public profile page must still load. (It loads via `/api/public-profile/[slug]` → `getPublicProfileData` → `getSupabaseService()` → service-role read.)

---

### Group G — `user_companies` (Table 21)

This table is read by `src/hooks/use-auth.ts` on **every login**, so the policy must let an employee read their own row. Otherwise the app can't determine the user's company.

```sql
BEGIN;

ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_companies_super_admin_all ON public.user_companies
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');

-- Self can read + insert their own user_companies rows (joined-at flow)
CREATE POLICY user_companies_self_select ON public.user_companies
  FOR SELECT USING (user_id = auth.uid());

-- Company admin can read + manage their company's user_companies
CREATE POLICY user_companies_company_admin_all ON public.user_companies
  FOR ALL USING (is_company_admin_of(company_id))
  WITH CHECK (is_company_admin_of(company_id));

-- Dry-run
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<emp_id>"}';
SELECT count(*) FROM public.user_companies;
-- expected: rows where user_id = <emp_id>

SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<ca_id>"}';
SELECT count(*) FROM public.user_companies;
-- expected: own rows + every officer of their company

SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<sa_id>"}';
SELECT count(*) FROM public.user_companies;
-- expected: baseline

RESET ROLE; RESET "request.jwt.claims";
COMMIT;
```

**Smoke test:** Log out, log back in as each of the three roles. The role-detection in `use-auth.ts` must succeed (dashboard loads with correct nav).

---

### Group H — `companies` (Table 22)

`src/hooks/use-auth.ts` reads `companies` to check `deactivated`. `src/app/super-admin/dashboard/page.tsx` reads all companies.

```sql
BEGIN;

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY companies_super_admin_all ON public.companies
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');

-- Members of a company can read their company
CREATE POLICY companies_member_select ON public.companies
  FOR SELECT USING (is_in_company(id));

-- Company admin can update their company
CREATE POLICY companies_admin_update ON public.companies
  FOR UPDATE USING (is_company_admin_of(id))
  WITH CHECK (is_company_admin_of(id));

-- Dry-run
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<emp_id>"}';
SELECT count(*) FROM public.companies;
-- expected: 1 (their company)

SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<sa_id>"}';
SELECT count(*) FROM public.companies;
-- expected: baseline

RESET ROLE; RESET "request.jwt.claims";
COMMIT;
```

**Smoke test:**
- Super-admin dashboard loads list of companies.
- Officer dashboard works.
- `useAuth` deactivation-check still works (try logging in as a deactivated user — should be signed out).

---

### Group I — `users` (Table 23) — LAST and MOST CAREFUL

This is the highest-risk table because:
- Every page reads it on login (via `use-auth.ts`).
- The recursion bug C-4 was here.
- Wrong policy = no one can log in.

```sql
BEGIN;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Super admin all
CREATE POLICY users_super_admin_all ON public.users
  FOR ALL USING (current_user_role() = 'super_admin')
  WITH CHECK (current_user_role() = 'super_admin');

-- Self read + update
CREATE POLICY users_self_select ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY users_self_update ON public.users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Company admin can read users of their company
CREATE POLICY users_company_admin_select ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies uc
      WHERE uc.user_id = public.users.id
        AND public.is_company_admin_of(uc.company_id)
    )
  );

-- Dry-run impersonations
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<emp_id>"}';
SELECT count(*) FROM public.users;
-- expected: 1 (themselves)

SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<ca_id>"}';
SELECT count(*) FROM public.users;
-- expected: themselves + every employee of their company

SET LOCAL "request.jwt.claims" TO '{"role":"authenticated","sub":"<sa_id>"}';
SELECT count(*) FROM public.users;
-- expected: baseline

SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role":"anon"}';
SELECT count(*) FROM public.users;
-- expected: 0

RESET ROLE; RESET "request.jwt.claims";
COMMIT;
```

**Smoke test (MUST RUN):**
1. Open an incognito browser, go to `/auth`, log in as each of the three roles.
2. Each must successfully load their respective dashboard (`/super-admin/dashboard`, `/admin/dashboard`, `/officers/dashboard`).
3. Open `/officers/profile` as the officer — profile data must load.
4. Open a public profile page in incognito (no JWT) — must still work.

If anything fails at this step:

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

That immediately restores access without dropping policies. Then debug, re-enable.

---

## Storage RLS (run after Group I commits)

This locks `avatars`, `videos`, `guides` buckets per-user. SELECT is public for avatars (they appear on public profiles); writes are scoped to `auth.uid()` folder. Adjust per your buckets.

```sql
-- Drop the over-permissive policies installed by fix-storage-rls.sql
DROP POLICY IF EXISTS "Enable public uploads for avatars"     ON storage.objects;
DROP POLICY IF EXISTS "Enable public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Enable public updates for avatars"     ON storage.objects;
DROP POLICY IF EXISTS "Enable public deletes for avatars"     ON storage.objects;

-- AVATARS bucket: public read, owner-scoped writes
CREATE POLICY avatars_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY avatars_owner_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY avatars_owner_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY avatars_owner_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- GUIDES bucket: public read (so public profile can show them), owner-scoped writes
CREATE POLICY guides_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'guides');

CREATE POLICY guides_owner_write ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'guides'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY guides_owner_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'guides'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY guides_owner_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'guides'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- VIDEOS bucket: same pattern as guides
CREATE POLICY videos_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY videos_owner_write ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY videos_owner_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY videos_owner_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

> **Important:** This policy expects uploads to use the path convention `<user_id>/<filename>`. Today's `/api/upload/avatar` uploads to Cloudinary, not Supabase Storage — so the bucket may currently be empty or used for a different purpose. Verify by running:
> ```sql
> SELECT bucket_id, count(*) FROM storage.objects GROUP BY bucket_id;
> ```
> If buckets are empty or unused, you can drop the policies and ignore. If they have data, you may need a one-time migration to move existing files into per-user folders.

---

## Browser Smoke Tests (run after each commit step)

| Role | URL | Expected |
|---|---|---|
| anon | `/<active-public-slug>` | Public profile renders, contact form, rate search work |
| employee | login → `/officers/dashboard` | Leads list + public link + template all load |
| employee | `/officers/leads/<lead-id>` | Loads |
| employee | `/officers/customizer` | Template editor loads with existing settings |
| employee | `/officers/todays-rates` | Rates display |
| employee | `/officers/content-management` | Owned FAQs/videos/guides show |
| employee | `/officers/profile` | Profile data loads |
| company_admin | login → `/admin/dashboard` | Companies / officers / leads of own company |
| company_admin | `/admin/loanofficers` → click one | Officer detail loads |
| company_admin | `/admin/insights` | Insights for own company |
| super_admin | login → `/super-admin/dashboard` | All data |
| super_admin | `/super-admin/officers` | Lists all |
| super_admin | `/super-admin/companies` | Lists all |
| super_admin | `/super-admin/insights` | All-company insights |
| Cron (with bearer token) | `POST /api/cron/mortech/sync-catalog` | 200 |
| Cron | `POST /api/cron/ghl/refresh-tokens` | 200 |
| Cron | `POST /api/cron/mortech/refresh-selected-rates` | 200 |
| Public | `GET /api/public-profile/<slug>` | 200, profile JSON |

---

## Rollback

To disable RLS on a specific table (does NOT drop policies — they remain for next enable):

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

To revert everything to the pre-RLS state (matches the existing `disable-rls-temp.sql`):

```sql
ALTER TABLE public.users                    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies                DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_companies           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates                DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_settings            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_settings_versions   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads                    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_data                DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics                DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_officer_public_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_link_usage        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_content_faqs     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_content_videos   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_content_guides   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.selected_rates           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_rates             DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortech_todays_rates_snapshot DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortech_api_calls        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortech_email_rate_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortech_investors        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortech_products         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verifications      DISABLE ROW LEVEL SECURITY;
```

---

## Will Code Change Be Needed?

**For RLS alone:** No code change is required. The reasons:
- API routes use service-role → bypass RLS.
- Drizzle uses `postgres` role → bypass RLS.
- Browser code (`use-auth.ts`, super-admin dashboard) reads tables that the policies above allow for the right user.

**For Public Profile to keep working:** Already handled — it goes through `/api/public-profile/[slug]` which uses service-role on the server. Browsers never query Supabase directly for profile data.

**Code changes still recommended (separate from RLS — see `docs/SECURITY_AUDIT.md`):**
- Re-enable Next.js middleware auth (`src/middleware.ts`).
- Add `requireAuth(req, role?)` to all the no-auth API routes.
- Fix `/api/upload/avatar` and friends.
- Add rate-limits to `/api/contact/send`, `/api/send-verification`, `/api/auth/request-password-reset`.
- Remove HAR files from git, rotate any captured tokens.

These are tracked in `docs/SECURITY_AUDIT.md`.

---

## Conclusion (Sharable Summary)

- **23 Supabase tables** will be locked down with RLS, in **9 batched commits**, in order from lowest to highest risk.
- Every batch is wrapped in `BEGIN; … ROLLBACK;` for dry-run testing.
- **Service-role** (server API) and **postgres-superuser** (Drizzle) both bypass RLS — so no server code changes are needed.
- The **only** browser-side reads that RLS affects are `users`, `user_companies`, `companies`, `leads`, `templates` (active) — all policies above are designed to keep those working.
- **Public profile pages remain public** because they go through the server route, which uses service-role.
- Supabase Storage buckets (avatars, guides, videos) get owner-scoped write policies; reads stay public so the public profile keeps showing them.
- Rollback is one `ALTER TABLE … DISABLE ROW LEVEL SECURITY;` per table.

**One-line conclusion:** Enabling RLS is safe to do without touching application code, as long as we follow the order above and dry-run each table before commit. The hard security work is the API-layer fixes in `SECURITY_AUDIT.md`, not RLS itself.
