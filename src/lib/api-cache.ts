/** Short-lived in-memory cache for hot API routes (per server instance). */
const store = new Map<string, { data: unknown; expires: number }>();

export function getApiCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry || Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setApiCache(key: string, data: unknown, ttlSeconds = 30): void {
  store.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
}

export function apiCacheHeaders(ttlSeconds = 30): Record<string, string> {
  return { 'Cache-Control': `private, max-age=${ttlSeconds}` };
}
