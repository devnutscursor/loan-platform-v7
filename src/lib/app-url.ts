/**
 * Canonical base URL for the app (no trailing slash).
 * Used for invite links, redirects, and public links so they point to the
 * deployed URL in production, not localhost.
 *
 * Priority: NEXT_PUBLIC_SITE_URL | NEXT_PUBLIC_APP_URL | VERCEL_URL (https) | localhost (dev only)
 */
export function getAppBaseUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }
  // Vercel provides VERCEL_URL (e.g. my-app-xxx.vercel.app) in serverless
  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    return `https://${vercel}`;
  }
  // Development fallback
  return 'http://localhost:3000';
}
