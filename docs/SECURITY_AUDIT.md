# Security Audit — Loan Officer Platform (v7)

> **Status:** analysis only, no code or DB changes made yet.
> **Scope:** full repository scan of `src/`, `src/app/api/**`, schema, RLS SQL, env handling, middleware, browser-side Supabase usage, storage, cron, and upload routes.
> **Goal:** identify every security gap and produce a fix list before enabling RLS in Supabase.

---

## Executive Summary

The application is functional but has **several critical authentication and authorization gaps** that an attacker on the public internet can exploit today, without any login. The two biggest categories are:

1. **The Next.js auth middleware is fully disabled** (every `if` is commented out). The only thing protecting `/admin`, `/super-admin`, `/officers`, and `/api/*` today is the client-side `RouteGuard` — which only hides UI, it does **not** block direct API calls.
2. **Many API routes that use the Supabase service-role key never check who is calling them.** That means anonymous callers can read, modify, and delete data for any user or company.

In addition:
- **Row-Level Security (RLS) is currently OFF** on every business table (`disable-rls-temp.sql` was applied and never reverted).
- **Supabase Storage policies allow anonymous upload, update, and delete** in the `avatars` bucket.
- The pre-existing `supabase-policies.sql` has an **infinite-recursion bug** in the `users` SELECT policy, which is most likely why RLS got disabled in the first place.
- The committed `.har` files in the repo root may contain bearer tokens or request bodies (they are git-tracked).

`.env` and `.env.local` are properly gitignored. ✅ No secret leakage via env files.

---

## How Bad Is It? (One-Line TL;DR)

> Right now, anyone on the internet with the URL of this app can list every loan officer, every company, every lead's contact info; create or delete officers and companies; send invites or contact emails through your servers; and delete Cloudinary assets. RLS being off compounds this if the anon key is ever combined with a leaked JWT.

---

## Severity Legend

| Tag | Meaning |
|---|---|
| 🔴 **Critical** | Exploitable today by anyone with a public URL. Fix immediately. |
| 🟠 **High** | Exploitable with low effort or authenticated user can attack other users. |
| 🟡 **Medium** | Defense-in-depth; misconfiguration / hardening. |
| 🟢 **Low** | Nice to have; minor risk. |

---

## 🔴 Critical Issues

### C-1 — Auth middleware is fully disabled
**File:** `src/middleware.ts`
**Problem:** Every check in the middleware is commented out:
- `getSession()` is not called.
- `/customizer`, `/admin`, `/api/auth` route protection is commented out.
- API-route protection is commented out.

**Impact:** No network-layer auth on any route. The browser `RouteGuard.tsx` only hides UI — it does not block `curl`, Postman, or any external script from hitting `/api/*` directly.

**Fix direction:** Re-enable cookie session check and 401 on unauthenticated `/api/*` (except the explicitly-public list). Use `supabase.auth.getUser()` rather than `getSession()`.

---

### C-2 — API routes use the service-role key with no auth check
The service-role key bypasses RLS by design — any route that uses it must verify the caller first. The following routes do **not**:

| Route | Method | What attacker can do |
|---|---|---|
| `/api/leads` | `POST` | Create leads under any `officerId` / `companyId` from body. No token check. |
| `/api/delete-officer` | `DELETE` | Delete any non-active officer + auth user by id. |
| `/api/deactivate-officer` | `POST` | Deactivate any user by id. |
| `/api/delete-company` | `DELETE` | Delete any pending company + auth user. |
| `/api/send-invite` | `POST` | Send invite to arbitrary email (spam/phishing risk). |
| `/api/send-loan-officer-invite` | `POST` | Same. |
| `/api/resend-invite` | `POST` | Same (assumed). |
| `/api/resend-loan-officer-invite` | `POST` | Same (assumed). |
| `/api/super-admin/officers` | `GET` | Lists every officer + company + emails. |
| `/api/super-admin/officers` | `PATCH` | Activate / deactivate any officer. |
| `/api/super-admin/officers/[slug]/leads` | `GET` | Reads any officer's leads by slug. |
| `/api/companies/enhanced` | `GET` | Dumps all companies + `ghl_oauth_payload`, `company_metadata`, `invite_token`. |
| `/api/loan-officers?companyId=...` | `GET` | Lists every officer of any company. |
| `/api/profile?userId=...` | `GET` | Reads any user's profile by id. |
| `/api/user/update-email` | `POST` | Change any user's email (account takeover lever). |
| `/api/company/update-email` | `POST` | Change any company's admin email. |
| `/api/page-settings` | `GET / POST / PUT / DELETE` | Read or overwrite any officer's `page_settings`. |
| `/api/public-links` | `GET / POST / PUT / DELETE` | Read, create, rename, deactivate any officer's public link. |

**Fix direction:**
- Add a single `requireAuth(req)` helper that validates the bearer token and returns `{ user, role, companyId }`.
- Per-route, also enforce role: super-admin routes require `role === 'super_admin'`, company-admin routes require admin of the relevant `companyId`, officer routes require ownership.

---

### C-3 — Row-Level Security is OFF on every business table
**File:** `disable-rls-temp.sql` was run and never reverted.
**Tables affected:** `users`, `companies`, `user_companies`, `templates`, `page_settings`, `page_settings_versions`, `leads`, `rate_data`, `api_keys`, `analytics` — and every newer table (selected_rates, manual_rates, mortech_*, email_verifications, public_link_usage, loan_officer_public_links, officer_content_*) also has no RLS.

**Impact:** If the anon key is ever combined with a stolen JWT (e.g. via a leaked HAR file — see C-7), the attacker has full DB access through PostgREST.

**Fix direction:** Use the **RLS Enable Plan** (`docs/RLS_ENABLE_PLAN.md`) — enable table-by-table with dry-run + rollback.

---

### C-4 — `supabase-policies.sql` has an infinite-recursion bug
**File:** `supabase-policies.sql` lines 17–25 (and similar admin-check policies).

The `users` SELECT policy queries `users` to check if the caller is a super-admin. Postgres throws `infinite recursion detected in policy for relation "users"`. This is almost certainly why RLS got disabled.

**Fix direction:** Use a `SECURITY DEFINER` helper function (`current_user_role()`) that bypasses RLS to read `users.role`. Full SQL provided in `docs/RLS_ENABLE_PLAN.md`.

---

### C-5 — Supabase Storage policies allow anonymous everything in `avatars`
**File:** `fix-storage-rls.sql`

```sql
CREATE POLICY "Enable public uploads for avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');
-- + read, update, delete with no auth.uid() restriction
```

**Impact:** Anyone can upload, overwrite, or **delete** any avatar in the bucket. No tie-back to user identity.

**Fix direction:** Scope INSERT/UPDATE/DELETE to `auth.uid()::text = (storage.foldername(name))[1]`, and upload avatars under a per-user folder path. SELECT can remain public for avatars (they are public images), but other buckets (guides, videos) should also be locked to the owner unless the file is for a public profile.

---

### C-6 — `/api/upload/avatar` (and likely `guide`, `video`) accept anonymous calls and arbitrary `publicId` for delete
**File:** `src/app/api/upload/avatar/route.ts`

- `POST` has no auth → anyone can burn Cloudinary quota.
- `DELETE` accepts `publicId` from JSON body and calls `cloudinary.uploader.destroy(publicId)` → anyone can **delete any Cloudinary asset** in the account, including other users' avatars, videos, and guides.

**Fix direction:** Require auth on `POST`. On `DELETE`, also require auth, and verify the `publicId` belongs to a record (avatar / guide / video) owned by the calling user before destroying it.

---

### C-7 — Six HAR files are committed to git
**Files in repo root:**
- `initial_load_content.har`
- `initial_load_dash.har`
- `latest_localhost_after.har`
- `refresh_localhost_after.har`
- `reload_load_content.har`
- `reload_load_dash.har`

**Impact:** HAR captures from a browser session typically contain `Authorization: Bearer <jwt>` headers, Supabase session cookies, and full request bodies. If anyone external has access to this repo, they have your test users' tokens at the time of capture and can replay them until expiry, plus any PII in the request bodies.

**Fix direction:**
1. Rotate any user passwords whose tokens appear in these HARs.
2. `git rm --cached *.har`
3. Add `*.har` to `.gitignore`.
4. Rewrite git history (`git filter-repo` or BFG) and force-push.
5. If pushed publicly, consider these tokens permanently leaked.

---

## 🟠 High Issues

### H-1 — Password-reset token sent in URL query string
**File:** `src/lib/password-reset-token.ts`, `src/app/api/auth/request-password-reset/route.ts`

The reset URL is `/auth/reset-password?token=<jwt>`. Tokens in URLs are:
- Logged by reverse proxies and Vercel/Amplify logs.
- Saved in browser history.
- Leaked via the `Referer` header when the user clicks an outbound link on the reset page.
- Visible in screenshots.

**Fix direction:** Either (a) store a short opaque token in a `password_reset_tokens` table, single-use, and look it up server-side; or (b) keep JWT but force the reset page to set `<meta name="referrer" content="no-referrer">`, mark the link single-use via `jti` and a server-side blocklist, and strip the token from the URL bar via `history.replaceState` on page load.

---

### H-2 — `POST /api/page-settings` is IDOR-vulnerable
**File:** `src/app/api/page-settings/route.ts`

`officerId` is read directly from the request body, and the row is overwritten / inserted with no token check, no ownership check. With middleware disabled (C-1), this is exploitable by anyone.

**Fix direction:** Require auth; derive `officerId` from the session, not the body. Same pattern needed in `PUT` and `DELETE`.

---

### H-3 — `PUT /api/public-links` and `DELETE /api/public-links` trust caller-supplied `linkId`
**File:** `src/app/api/public-links/route.ts`

`linkId` from body / query is used to update or deactivate the link, with no check that the link belongs to the caller.

**Fix direction:** Require auth; before update/delete, verify `select user_id from loan_officer_public_links where id = $linkId` equals `auth.uid()`.

---

### H-4 — `/api/user/update-email` doesn't sync `auth.users.email`
**File:** `src/app/api/user/update-email/route.ts`

The route updates `public.users.email` but never calls `supabase.auth.admin.updateUserById(userId, { email })`. After a change, `public.users.email !== auth.users.email`, which:
- Breaks invite/password-reset lookups by email.
- Allows account-takeover: change the email in `public.users` to your own, then trigger a password reset that goes to your inbox.

**Fix direction:** Update both records in the same handler, in a transaction, and verify ownership of the new email before applying (e.g. email-confirmation OTP).

---

### H-5 — Service-role Supabase client created at module-load in ~30 files
**Pattern repeated in:** `src/app/api/leads/route.ts`, `src/app/api/profile/route.ts`, `src/app/api/super-admin/officers/route.ts`, `src/app/api/analytics/*`, `src/app/api/officers/dashboard/route.ts`, etc.

```ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

**Impact:**
- Easier for the wrong key to leak into a stack trace or error message.
- No single place to add tracing, retries, or future hardening.

**Fix direction:** Use the existing `getSupabaseService()` from `src/lib/supabase/service.ts` everywhere. Delete the duplicates.

---

### H-6 — `CRON_SECRET_TOKEN` comparison is timing-leaky
**Files:** `src/app/api/cron/**/route.ts`, `src/app/api/public-profile/active-slugs/route.ts`

```ts
if (authHeader !== expected) return 401;
```

`!==` on strings is short-circuit and timing-dependent. Theoretically exploitable across many requests to leak the secret byte-by-byte.

**Fix direction:** Use `crypto.timingSafeEqual` on equal-length `Buffer`s, after a length check.

---

### H-7 — Mass PII logged via `console.log` to production logs
**Files (sample):** `src/app/api/leads/route.ts`, `src/app/api/analytics/recent-activity/route.ts`, `src/app/api/super-admin/officers/route.ts`, `src/hooks/use-auth.ts`.

Examples found:
- Full request bodies including emails and phone numbers (`POST /api/leads`).
- `console.log('Updating email for user', userId, 'to', newEmail)`.
- `console.log('🔍 Combined officers data:', officers)` (logs whole officer list).
- User IDs and emails logged on every auth state change.

These end up in Vercel/Amplify log retention by default.

**Fix direction:** Replace with structured logging that omits PII; or gate verbose logs behind `process.env.LOG_LEVEL === 'debug'` and never enable `debug` in production.

---

### H-8 — `/api/contact/send` is unauthenticated, no rate limit, no captcha
**File:** `src/app/api/contact/send/route.ts`

It is *meant* to be public (it's the contact form on the public profile), but as-is it can be used as an open SMTP relay through your nodemailer config. An attacker can fire 100 req/sec to spam emails to arbitrary recipients with arbitrary content.

**Fix direction:**
- Per-IP rate limit (e.g. 5/min, 30/day) using Upstash Redis (already in the project).
- Validate `recipientEmail` against a whitelist (must belong to a known active officer).
- Optionally add hCaptcha/Cloudflare Turnstile on the public profile contact form.

---

### H-9 — `/api/send-verification` and `/api/auth/request-password-reset` are not rate-limited
**Files:** `src/app/api/send-verification/route.ts`, `src/app/api/auth/request-password-reset/route.ts`

Same risk as H-8: open endpoints that send emails. Can be abused for email-bombing (sending many verification codes to a target inbox).

**Fix direction:** Per-email and per-IP rate limiting (Upstash Redis sliding window). Re-use the existing `mortech-email-rate-limit` pattern.

---

### H-10 — `/api/officers/manual-rates?officerId=...` and `/api/officers/selected-rates?officerId=...` allow anonymous read of any officer's rates
**Files:** `src/app/api/officers/manual-rates/route.ts`, `src/app/api/officers/selected-rates/route.ts`

These have an "if `officerIdParam` provided, skip auth" branch. Intended for the public profile, but means anyone can iterate UUIDs and dump rate data for every officer.

**Fix direction:** Either (a) move public reads behind `/api/public-profile/[slug]/rates` which validates the slug → officer mapping, or (b) require the request to also include the public-profile slug and verify it's an active public link for that officer.

---

## 🟡 Medium Issues

### M-1 — `DATABASE_URL` uses the `postgres` superuser (BYPASSRLS)
**File:** `src/lib/db/index.ts`, `.env.local`

The URL `postgresql://postgres.<project>...` uses Supabase's `postgres` role, which has `BYPASSRLS`. **All Drizzle queries bypass RLS**, even after we enable it.

This isn't a vulnerability per-se (Drizzle runs on your server), but it means:
- RLS only protects the browser/anon-key path.
- If the DATABASE_URL ever leaks, the attacker gets full DB access with no policy enforcement.

**Fix direction (optional, defense-in-depth):** Create a separate Postgres role (e.g. `app_user`) without `BYPASSRLS`, grant it the necessary table permissions, and use that role in `DATABASE_URL`. Drizzle queries will then also be policy-checked. Not required for v1, but recommended for v2.

---

### M-2 — Browser code directly reads protected tables via anon key + JWT
**Files:**
- `src/hooks/use-auth.ts` (reads `users`, `user_companies`, `companies`)
- `src/app/super-admin/dashboard/page.tsx` (reads `companies`, `user_companies`, `users`, `leads`)
- `src/app/officers/profile/OfficersProfileClient.tsx` (reads `users`)
- `src/app/officers/todays-rates/TodaysRatesClient.tsx` (reads `companies`)
- `src/app/auth/page.tsx` (reads `users`)

**Impact:** As long as RLS is off, the anon JWT can read any row in these tables. After RLS is on, these queries are protected — but only if the policies are correct. This is the code path most sensitive to policy errors.

**Fix direction:** No change required for the RLS plan to work, but **prefer moving these reads to server API routes** so the browser only gets minimum data and the role checks live in one place.

---

### M-3 — `templates` POST allows mass-assignment via `customSettings`
**File:** `src/app/api/templates/user/route.ts`

```ts
colors: { ...baseTemplate.colors, ...customSettings.colors },
typography: { ...baseTemplate.typography, ...customSettings.typography },
...
```

If `customSettings.colors` contains arbitrary keys, they all get merged in. Not a critical issue because the schema is JSONB, but malicious input can inject fields the UI later renders (e.g. `customCSS` containing `</style><script>`, the existing field).

**Fix direction:** Validate `customSettings` against a strict Zod schema before merging. Sanitize any field that ends up in an HTML or `<style>` context.

---

### M-4 — `loanstar-test.html`, `decode-jwt.js`, scripts and SQL files at repo root
**Files:** Many `.sql`, `.sh`, `.js`, `.html` files in the repo root.

`decode-jwt.js` exists and the SQL files (`fix-rls-*`, `disable-rls-temp.sql`, etc.) are committed. None are vulnerabilities themselves, but they:
- Pollute the repo and increase the surface area an attacker scans.
- Some (e.g. `disable-rls-temp.sql`) document how to weaken security if someone uses them by accident.

**Fix direction:** Move all helper scripts to `scripts/` or `docs/`. Delete `disable-rls-temp.sql` after RLS is enabled.

---

### M-5 — No global rate-limit
Only the Mortech / email-verification flows have rate limits. Every other endpoint is unbounded.

**Fix direction:** Add per-IP rate limiting at the middleware layer using Upstash Redis (already a dependency).

---

### M-6 — No CORS configuration
Next.js API routes accept requests from any origin. For an internal admin app this is acceptable; for a public-facing service, restrict the API CORS origin to the production domain.

---

## 🟢 Low Issues

### L-1 — Avatar upload: no malware scan, no per-user size cap
Per-file 10 MB cap exists, but no daily/per-user cap. An attacker (after C-6 is fixed) could still burn the Cloudinary quota for a logged-in account.

### L-2 — `getSession()` is used in dev/test code paths
On the server, `getUser()` is the correct primitive (it validates the JWT). The codebase mostly uses `getUser()` — keep it that way.

### L-3 — Open `/api/widgets/idx` returns a hard-coded IDX broker ID
Not a vuln, but verify this is intentional public exposure.

### L-4 — Many `.md` files in root contain implementation history that mention internal IDs / paths
Mostly harmless, but could give an attacker recon. Move to `docs/`.

---

## Issues That Will Be Fixed By Enabling RLS

Some of the above are partially mitigated once RLS is on. Cross-reference:

| Issue | Mitigated by RLS? | Still needs code fix? |
|---|---|---|
| C-1 (middleware) | No | Yes |
| C-2 (no-auth API routes) | Partially (only the Supabase-JS paths; service-role bypass means most still wide open) | **Yes — RLS does not fix this** |
| C-3 (RLS off) | Yes (that's what we're doing) | No |
| C-4 (recursion bug) | Fixed in the new SQL | No |
| C-5 (storage) | Yes (storage RLS section) | No |
| C-6 (Cloudinary) | No | Yes |
| C-7 (HAR files) | No | Yes (git history rewrite + rotate) |
| H-1 → H-10 | No | Yes |
| M-1 (BYPASSRLS) | Partial | Optional |
| M-2 (browser direct reads) | Yes (policies enforce) | Optional |

**Important takeaway:** RLS protects the **database** layer. It does **not** protect a Next.js API route that uses the service-role key. Most of the critical issues here are API-route issues, not DB issues. **Fixing RLS without fixing the API routes leaves you exposed.**

---

## Recommended Fix Order

This is the order I would do it in. Each step is independent enough to ship on its own.

### Phase 0 — Stop the bleeding (today)
1. **C-7**: Remove HAR files from git and force-push history rewrite. Rotate any user passwords/tokens that may have been captured.
2. **C-1**: Re-enable middleware with a strict allow-list for public routes.

### Phase 1 — Lock down the API surface (this week)
3. Build one `requireAuth(req, { role?, companyId? })` helper.
4. Apply it to **every** route in C-2 (delete-officer, deactivate-officer, send-invite, profile, update-email, super-admin/*, page-settings, public-links, etc.).
5. **C-6**: Add auth + ownership check to upload routes.
6. **H-1**: Move password-reset token out of URL (or `referrer="no-referrer"` + single-use).
7. **H-2, H-3, H-4**: Fix IDOR + email-update.
8. **H-8, H-9**: Add rate-limit to contact, send-verification, request-password-reset.

### Phase 2 — Enable RLS (next week, after Phase 1)
9. Follow `docs/RLS_ENABLE_PLAN.md` table-by-table with dry-run.
10. **C-5**: Fix Supabase Storage policies.

### Phase 3 — Hardening (next sprint)
11. **H-5**: Consolidate service-role client to a single import.
12. **H-6**: timing-safe cron secret comparison.
13. **H-7**: Remove / gate PII logs.
14. **M-1**: Switch `DATABASE_URL` to a non-BYPASSRLS role.
15. **M-3**: Validate `customSettings` with Zod.
16. **M-4**: Move helper SQL/scripts to subfolders.

---

## Conclusion / TL;DR for Sharing

**One paragraph:** The biggest two problems are (1) authentication middleware is fully disabled, and (2) about 20 API endpoints that use the Supabase service-role key never verify who is calling them. Together, they expose admin operations (delete officer, change emails, dump all companies, send invites, delete uploads) to anyone with the URL. RLS is also off and the existing RLS SQL file has a recursion bug. Six HAR files in the repo may contain user bearer tokens. `.env` files are correctly gitignored.

**Top 5 things to fix first:**

1. ✅ Remove HAR files from git + rotate any captured tokens.
2. ✅ Re-enable Next.js middleware auth check.
3. ✅ Add a `requireAuth(req, role?)` helper and apply it to every admin / super-admin / write API route listed in C-2.
4. ✅ Lock down `/api/upload/avatar` (and guide/video) — require auth, verify ownership before delete.
5. ✅ Enable Row-Level Security on all 23 tables per `docs/RLS_ENABLE_PLAN.md` with the corrected (non-recursive) policies. Lock down Supabase Storage policies.

**Time estimate (rough):** ~3–5 dev-days for Phase 1, ~1 day for Phase 2 (RLS rollout), ~2 days for Phase 3 hardening. **Phase 0 can be done in under 30 minutes** and should be done first.

---

## Appendix — Full File-by-File Findings

| File | Issue ID | Severity |
|---|---|---|
| `src/middleware.ts` | C-1 | 🔴 |
| `src/app/api/leads/route.ts` (POST) | C-2 | 🔴 |
| `src/app/api/delete-officer/route.ts` | C-2 | 🔴 |
| `src/app/api/deactivate-officer/route.ts` | C-2 | 🔴 |
| `src/app/api/delete-company/route.ts` | C-2 | 🔴 |
| `src/app/api/send-invite/route.ts` | C-2 | 🔴 |
| `src/app/api/send-loan-officer-invite/route.ts` | C-2 | 🔴 |
| `src/app/api/super-admin/officers/route.ts` | C-2 | 🔴 |
| `src/app/api/super-admin/officers/[slug]/leads/route.ts` | C-2 | 🔴 |
| `src/app/api/companies/enhanced/route.ts` | C-2 | 🔴 |
| `src/app/api/loan-officers/route.ts` | C-2 | 🔴 |
| `src/app/api/profile/route.ts` | C-2 | 🔴 |
| `src/app/api/user/update-email/route.ts` | C-2, H-4 | 🔴 |
| `src/app/api/company/update-email/route.ts` | C-2 | 🔴 |
| `src/app/api/page-settings/route.ts` | C-2, H-2 | 🔴 |
| `src/app/api/public-links/route.ts` | C-2, H-3 | 🔴 |
| `disable-rls-temp.sql` (applied to DB) | C-3 | 🔴 |
| `supabase-policies.sql` (recursion) | C-4 | 🔴 |
| `fix-storage-rls.sql` (applied to DB) | C-5 | 🔴 |
| `src/app/api/upload/avatar/route.ts` | C-6 | 🔴 |
| `*.har` in repo root | C-7 | 🔴 |
| `src/lib/password-reset-token.ts` + reset URL flow | H-1 | 🟠 |
| `~30 routes with inline createClient(serviceKey)` | H-5 | 🟠 |
| `src/app/api/cron/**/route.ts` | H-6 | 🟠 |
| Multiple files with `console.log(PII)` | H-7 | 🟠 |
| `src/app/api/contact/send/route.ts` | H-8 | 🟠 |
| `src/app/api/send-verification/route.ts` | H-9 | 🟠 |
| `src/app/api/auth/request-password-reset/route.ts` | H-9 | 🟠 |
| `src/app/api/officers/manual-rates/route.ts` (GET public mode) | H-10 | 🟠 |
| `src/app/api/officers/selected-rates/route.ts` (GET public mode) | H-10 | 🟠 |
| `.env.local` DATABASE_URL uses `postgres` superuser | M-1 | 🟡 |
| `src/hooks/use-auth.ts` (direct browser table reads) | M-2 | 🟡 |
| `src/app/super-admin/dashboard/page.tsx` (direct browser table reads) | M-2 | 🟡 |
| `src/app/api/templates/user/route.ts` (mass-assignment) | M-3 | 🟡 |
| Various `.sql` / `.sh` / `.js` files at repo root | M-4 | 🟡 |
| No global rate limit | M-5 | 🟡 |
| No CORS allow-list | M-6 | 🟡 |
| `/api/upload/avatar` no daily user cap | L-1 | 🟢 |
| `/api/widgets/idx` hard-coded broker ID | L-3 | 🟢 |
