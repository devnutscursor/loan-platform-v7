const IDX_WIDGET_URL_PATTERN =
  /^https?:\/\/([a-z0-9.-]+\.)?idxbroker\.com\/idx\/widgets\/\d+/i;

export function parseIdxWidgetId(widgetUrl: string): string | null {
  const match = widgetUrl.match(/\/idx\/widgets\/([^/?]+)/i);
  return match ? match[1] : null;
}

export function isIdxWidgetScriptUrl(widgetUrl: string): boolean {
  return parseIdxWidgetId(widgetUrl) !== null;
}

export function normalizeIdxWidgetScriptUrl(widgetUrl: string): string {
  const trimmed = widgetUrl.trim();
  return trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
}

export function isAllowedIdxWidgetUrl(url: string): boolean {
  return IDX_WIDGET_URL_PATTERN.test(normalizeIdxWidgetScriptUrl(url));
}

/** Same-origin iframe page — we control CSS/JS inside; parent page cannot touch IDX shadow DOM. */
export function buildIdxWidgetIframeSrc(widgetId: string, widgetScriptUrl: string): string {
  const normalized = normalizeIdxWidgetScriptUrl(widgetScriptUrl);
  const params = new URLSearchParams({
    id: widgetId,
    url: normalized,
  });
  return `/api/widgets/idx?${params.toString()}`;
}
