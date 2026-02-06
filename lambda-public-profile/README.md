# Public Profile Lambda (Option B – Provisioned Concurrency)

This Lambda serves public profile data by slug. Use it with **Provisioned Concurrency** so the first load is always fast (no cold start).

## Deploy

### 1. Build and zip

```bash
cd lambda-public-profile
npm install
zip -r ../lambda-public-profile.zip .
```

### 2. AWS Console – Create Lambda

- **Runtime:** Node.js 18.x  
- **Handler:** `index.handler` (default)  
- **Upload:** Use `lambda-public-profile.zip` from project root  

### 3. Environment variables (Lambda → Configuration → Environment variables)

| Name | Value |
|------|--------|
| `SUPABASE_URL` | Same as Amplify (e.g. `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as Amplify service role key |
| `PROFILE_CACHE_TTL_MS` | Optional; default 120000 (2 min) |

### 4. Configuration

- **Timeout:** 2 minutes (120 seconds)  
- **Function URL:** Create URL, auth **NONE**, CORS enabled (or rely on response headers).  
  URL format: `https://xxxxxxxx.lambda-url.<region>.on.aws/`  
- **Provisioned concurrency:** Configuration → Concurrency → Edit → **Provisioned concurrency = 1** (or 2). Save.

### 5. Frontend (Amplify env)

In Amplify → Environment variables, add:

- `NEXT_PUBLIC_PUBLIC_PROFILE_API_URL` = your Lambda function URL (no trailing slash), e.g.  
  `https://xxxxxxxx.lambda-url.us-east-1.on.aws`

If you use a build spec (e.g. `build.yml`) that builds `.env.production` from env, add:

```yaml
- env | grep '^NEXT_PUBLIC_PUBLIC_PROFILE_API_URL=' >> .env.production
```

When this is set, the public profile page will call the Lambda instead of `/api/public-profile/[slug]`. Templates still load from Amplify (`/api/public-templates/...`).

## API

- **GET `/{slug}`** – Returns same JSON as Next.js `GET /api/public-profile/[slug]`  
  Example: `https://xxx.lambda-url.region.on.aws/abc-123-def`

## After enabling Provisioned Concurrency

- You can **remove the EventBridge keep-warm trigger**; it’s no longer needed for this flow.

## Cost (rough)

- Provisioned concurrency (1 instance): ~\$10–18/month depending on region and memory.  
- Invocations: pay per request as usual.
