/**
 * Production-safe HTML for GHL OAuth browser redirect (no tokens/IDs in page).
 */

const BRAND = '#01bcc6';
const BRAND_DARK = '#005b7c';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function oauthCallbackShell(opts: {
  title: string;
  heading: string;
  message: string;
  variant: 'success' | 'error';
  /** Primary CTA */
  primaryHref?: string;
  primaryLabel?: string;
  /** Optional secondary link */
  secondaryHref?: string;
  secondaryLabel?: string;
}): string {
  const { title, heading, message, variant, primaryHref, primaryLabel, secondaryHref, secondaryLabel } = opts;
  const accent = variant === 'success' ? '#10b981' : '#dc2626';

  const primaryBlock =
    primaryHref && primaryLabel
      ? `<a href="${escapeHtml(primaryHref)}" class="btn">${escapeHtml(primaryLabel)}</a>`
      : '';

  const secondaryBlock =
    secondaryHref && secondaryLabel
      ? `<p class="secondary"><a href="${escapeHtml(secondaryHref)}">${escapeHtml(secondaryLabel)}</a></p>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} — RateCaddy</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: linear-gradient(160deg, #f0fdfa 0%, #ecfeff 40%, #f8fafc 100%);
      color: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      max-width: 420px;
      width: 100%;
      background: #fff;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 10px 40px rgba(0, 91, 124, 0.12);
      border: 1px solid rgba(1, 188, 198, 0.2);
      text-align: center;
    }
    .icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 1.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      background: ${variant === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(220, 38, 38, 0.1)'};
      color: ${accent};
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 700;
      color: ${BRAND_DARK};
      margin: 0 0 0.75rem;
    }
    p {
      margin: 0 0 1.5rem;
      line-height: 1.55;
      color: #64748b;
      font-size: 0.95rem;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, ${BRAND} 0%, #008eab 100%);
      color: #fff !important;
      text-decoration: none;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-size: 0.95rem;
      box-shadow: 0 4px 14px rgba(1, 188, 198, 0.35);
    }
    .btn:hover { opacity: 0.95; }
    .secondary { margin: 1rem 0 0; font-size: 0.875rem; }
    .secondary a { color: ${BRAND}; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${variant === 'success' ? '✓' : '!'}</div>
    <h1>${escapeHtml(heading)}</h1>
    <p>${escapeHtml(message)}</p>
    ${primaryBlock}
    ${secondaryBlock}
  </div>
</body>
</html>`;
}
