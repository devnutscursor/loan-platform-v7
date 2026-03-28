/**
 * Shared password rules for reset / change flows.
 * Complexity is intentionally minimal; server still uses parameterized APIs (no raw SQL from user input).
 */

export const PASSWORD_REQUIREMENTS_SUMMARY = 'Use at least 8 characters.';

export function validatePasswordStrength(password: string): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }

  return { ok: errors.length === 0, errors };
}
