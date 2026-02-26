# AWS Cron Setup: Catalog Sync + Refresh Selected Rates

This doc answers your questions and gives **exact steps** (where to click, what to paste) for:
- Creating the secret token
- Creating both Lambda functions (with full code)
- Scheduling them with EventBridge

---

## (i) Catalog sync: new rows vs replace?

**Current behavior: replace entire catalog (no “update same ID”).**

- `syncMortechCatalogToDb()` does:
  1. **TRUNCATE** `mortech_products` and `mortech_investors` (all rows deleted).
  2. **INSERT** all investors and products from Mortech again.

So we do **not** “update existing rows if IDs match.” We always **delete all catalog rows** and **insert fresh rows**. Each run gives a full refresh; DB IDs are new (e.g. auto-increment), Mortech `parent_id` / `product_id` are in the data.

If you later want “upsert by Mortech product_id” (update if exists, insert if not), that would be a separate code change; for the dropdown, full replace is the intended behavior.

---

## (ii) How to create the secret token

**Option A – Terminal (recommended)**

1. Open a terminal.
2. Run:
   ```bash
   openssl rand -base64 32
   ```
3. Copy the whole line of output (e.g. `K7x9...==`). This is your **CRON_SECRET_TOKEN**.

**Option B – Node one-liner**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the printed value.

**Where to paste it**

- **Amplify:** App → **Environment variables** → Add `CRON_SECRET_TOKEN` = (paste value).
- **Lambda:** In each Lambda’s **Configuration → Environment variables** → Add `CRON_SECRET_TOKEN` = (same value).

Use the **same** token in Amplify and in both Lambdas.

---

## (iii) Lambda: full code (you need real functions)

EventBridge only **triggers** the Lambda; the Lambda must **call your API**. So you create two Lambda functions and paste the code below into each.

---

### Lambda 1: Sync Mortech catalog (daily)

**1. Open AWS Console**

- Go to: https://console.aws.amazon.com/
- Sign in.

**2. Go to Lambda**

- Top search: type **Lambda** → open **Lambda**.

**3. Create function**

- Click **Create function**.
- **Author from scratch**.
- **Function name:** `mortech-sync-catalog`.
- **Runtime:** **Node.js 18.x**.
- Leave architecture default.
- Click **Create function**.

**4. Paste the handler code**

- In the **Code** tab, open **index.mjs** (or create it if you see only `index.js`).
- **Delete** any default code.
- Paste this exactly:

```javascript
export const handler = async () => {
  const APP_URL = process.env.APP_URL;
  const CRON_SECRET_TOKEN = process.env.CRON_SECRET_TOKEN;

  if (!APP_URL || !CRON_SECRET_TOKEN) {
    throw new Error('Missing APP_URL or CRON_SECRET_TOKEN in Lambda env');
  }

  const url = `${APP_URL}/api/cron/mortech/sync-catalog`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CRON_SECRET_TOKEN}`,
    },
  });

  const text = await res.text();
  console.log('sync-catalog status:', res.status, 'body:', text);

  if (!res.ok) {
    throw new Error(`sync-catalog failed: ${res.status} ${text}`);
  }

  return { statusCode: res.status, body: text };
};
```

- Click **Deploy**.

**5. Set environment variables**

- **Configuration** tab → **Environment variables** → **Edit**.
- **Add:**
  - **APP_URL** = `https://<your-amplify-app-url>` (e.g. `https://main.xxxx.amplifyapp.com` – no trailing slash).
  - **CRON_SECRET_TOKEN** = (the same secret you put in Amplify).
- **Save**.

**6. Add EventBridge schedule**

- **Configuration** → **Triggers** → **Add trigger**.
- **Source:** **EventBridge (CloudWatch Events)**.
- **Create new rule:** e.g. `sync-catalog-daily`.
- **Rule type:** **Schedule expression**.
- **Schedule expression:** `cron(0 6 * * ? *)` (daily at 06:00 UTC).
- **Enable trigger** → **Add**.

---

### Lambda 2: Refresh selected rates (3× daily)

**1. Lambda list**

- In Lambda console, click **Functions** in the left sidebar.

**2. Create function**

- **Create function**.
- **Author from scratch**.
- **Function name:** `mortech-refresh-selected-rates`.
- **Runtime:** **Node.js 18.x**.
- **Create function**.

**3. Paste the handler code**

- **Code** tab → open **index.mjs** (or `index.js`).
- Replace contents with:

```javascript
export const handler = async () => {
  const APP_URL = process.env.APP_URL;
  const CRON_SECRET_TOKEN = process.env.CRON_SECRET_TOKEN;

  if (!APP_URL || !CRON_SECRET_TOKEN) {
    throw new Error('Missing APP_URL or CRON_SECRET_TOKEN in Lambda env');
  }

  const url = `${APP_URL}/api/cron/mortech/refresh-selected-rates`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CRON_SECRET_TOKEN}`,
    },
  });

  const text = await res.text();
  console.log('refresh-selected-rates status:', res.status, 'body:', text);

  if (!res.ok) {
    throw new Error(`refresh-selected-rates failed: ${res.status} ${text}`);
  }

  return { statusCode: res.status, body: text };
};
```

- **Deploy**.

**4. Environment variables**

- **Configuration** → **Environment variables** → **Edit**.
- **APP_URL** = same Amplify URL as above.
- **CRON_SECRET_TOKEN** = same secret.
- **Save**.

**5. Add trigger**

- **Configuration** → **Triggers** → **Add trigger**.
- **Source:** **EventBridge (CloudWatch Events)**.
- **New rule:** `refresh-selected-rates-3x-daily`.
- **Schedule expression:** `cron(0 3,11,19 * * ? *)` (03:00, 11:00, 19:00 UTC).
- **Add**.

---

## Quick reference

| Item | Value |
|------|--------|
| Catalog sync | **TRUNCATE** then **INSERT** (full replace, no upsert by ID). |
| Secret | `openssl rand -base64 32` → paste in Amplify + both Lambdas as `CRON_SECRET_TOKEN`. |
| Lambda 1 | `mortech-sync-catalog` → calls `POST .../api/cron/mortech/sync-catalog` daily. |
| Lambda 2 | `mortech-refresh-selected-rates` → calls `POST .../api/cron/mortech/refresh-selected-rates` 3× daily. |
| Env in both Lambdas | `APP_URL`, `CRON_SECRET_TOKEN`. |

---

## Optional: test from console

- In each Lambda, **Test** tab → **Create new event** (empty event `{}`) → **Test**.
- Check **Execution results** and CloudWatch logs for status and body.
