/**
 * Mortech Today's Rates – global snapshot refresh (Lambda: no DB, no pg).
 *
 * Calls a single POST to refresh `mortech_todays_rates_snapshot` (~8 Mortech API calls
 * per run). All Mortech-paid officers read the same rows from that table.
 *
 * Replaces the legacy flow:
 *   GET  /api/cron/mortech/officers-with-selected-rates
 *   POST /api/cron/mortech/refresh-selected-rates/officer (per officer)
 *
 * Env (Lambda configuration):
 *   CRON_SECRET_TOKEN – required, same value as Amplify / app
 *   APP_URL           – optional, e.g. https://www.ratecaddy.com (no trailing slash)
 */

export const handler = async () => {
  const baseUrl = (process.env.APP_URL || 'https://www.ratecaddy.com').replace(/\/$/, '');
  const token = process.env.CRON_SECRET_TOKEN;

  if (!token) {
    throw new Error('CRON_SECRET_TOKEN is required');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const refreshUrl = `${baseUrl}/api/cron/mortech/refresh-selected-rates`;
  const res = await fetch(refreshUrl, { method: 'POST', headers });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response ${res.status}: ${text.slice(0, 500)}`);
  }

  if (!res.ok) {
    throw new Error(`refresh-selected-rates failed ${res.status}: ${text}`);
  }

  if (!data.success) {
    throw new Error(`refresh-selected-rates success=false: ${text}`);
  }

  const r = data.result || {};

  const result = {
    success: true,
    refreshed: 1,
    total: 1,
    totalRatesUpdated: typeof r.updated === 'number' ? r.updated : 0,
    totalRatesFailed: typeof r.failed === 'number' ? r.failed : 0,
    message: 'Global mortech_todays_rates_snapshot refresh completed',
  };

  console.log('Lambda result:', JSON.stringify(result));
  return result;
};
