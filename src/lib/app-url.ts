import type { NextRequest } from 'next/server';

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

/**
 * Base URL for links generated during an HTTP request (e.g. password reset email).
 * Prefer explicit public site URL in env (production). Otherwise use the browser
 * `Origin` / forwarded host so local dev emails use localhost and deployed apps use the live host.
 */
export function getAppBaseUrlFromRequest(request: NextRequest): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }

  const origin = request.headers.get('origin');
  if (origin && /^https?:\/\//i.test(origin)) {
    return origin.replace(/\/$/, '');
  }

  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (host) {
    const proto =
      request.headers.get('x-forwarded-proto') ||
      (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`.replace(/\/$/, '');
  }

  return getAppBaseUrl();
}
