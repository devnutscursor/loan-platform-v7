/**
 * Generates a URL-safe public profile slug from officer name: firstname-lastname.
 * Example: "Rabi" + "Uddin" -> "rabi-uddin", "John" + "Doe" -> "john-doe".
 * Uniqueness: first gets "rabi-uddin", duplicates get "rabi-uddin-2", "rabi-uddin-3".
 */

const SLUG_MIN_LENGTH = 2;
const SLUG_MAX_LENGTH = 50;
// 2–50 chars: lowercase letters, numbers; hyphens allowed
const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/**
 * Sanitize a string to a URL-safe slug segment (lowercase, alphanumeric only, no spaces).
 */
export function sanitizeSlugPart(value: string): string {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, SLUG_MAX_LENGTH);
}

/**
 * Generate base slug from first and last name: firstname-lastname.
 * Example: Rabi + Uddin -> "rabi-uddin". If result is empty, returns fallback (profile + short id).
 */
export function generateBaseSlug(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallbackId?: string
): string {
  const first = sanitizeSlugPart(firstName || '');
  const last = sanitizeSlugPart(lastName || '');
  let base: string;
  if (first && last) {
    base = `${first}-${last}`;
  } else if (first || last) {
    base = first || last;
  } else {
    base = 'profile' + (fallbackId ? sanitizeSlugPart(fallbackId).slice(0, 8) : '');
  }
  return base.slice(0, SLUG_MAX_LENGTH);
}

/**
 * Validate slug format (editable slugs): 2–50 chars, lowercase alphanumeric, optional hyphen in the middle.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  const trimmed = slug.trim().toLowerCase();
  if (trimmed.length < SLUG_MIN_LENGTH || trimmed.length > SLUG_MAX_LENGTH) return false;
  return SLUG_REGEX.test(trimmed);
}

/**
 * Normalize user-entered slug for storage (lowercase, trim).
 */
export function normalizeSlug(slug: string): string {
  return (slug || '').trim().toLowerCase();
}
