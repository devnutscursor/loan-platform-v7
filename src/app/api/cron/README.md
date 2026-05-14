# Cron API routes (Lambda / EventBridge)

These routes are intended to be invoked by **AWS Lambda** on a schedule (EventBridge), not by users.

## Environment

- **CRON_SECRET_TOKEN** – Set in Amplify (and in Lambda env). All cron routes require `Authorization: Bearer <CRON_SECRET_TOKEN>`.

## Endpoints

### 1. Sync Mortech catalog (daily)

- **POST** `/api/cron/mortech/sync-catalog`
- Fetches investors + products from Mortech and writes to `mortech_investors` / `mortech_products` (dropdown data).
- **EventBridge:** e.g. `cron(0 6 * * ? *)` (daily 06:00 UTC).

### 2. Refresh Today's Rates snapshot (3× daily)

- **POST** `/api/cron/mortech/refresh-selected-rates`
- Refreshes the global Mortech PAR snapshot in `mortech_todays_rates_snapshot` (one Mortech pricing request per program bucket, ~8 calls per run). Officer UIs read this table plus any officer-specific extras in `selected_rates`.
- **EventBridge:** e.g. `cron(0 3,11,19 * * ? *)` (03:00, 11:00, 19:00 UTC).

**Note:** Legacy Lambdas that called `GET .../officers-with-selected-rates` and fanned out to `POST .../refresh-selected-rates/officer` should be retired; only the single POST above is needed.

## Lambda example (Node 18)

```js
const res = await fetch(`${process.env.APP_URL}/api/cron/mortech/sync-catalog`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.CRON_SECRET_TOKEN}` },
});
if (!res.ok) throw new Error(await res.text());
```

Set Lambda env: `APP_URL` (Amplify app URL), `CRON_SECRET_TOKEN` (same as Amplify).
