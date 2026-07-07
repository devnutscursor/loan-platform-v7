/** Public base URL used in iframe/script embed snippets (Super Admin copy). */
export function getEmbedBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_EMBED_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');

  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:3000';
}

export function getTodaysRatesEmbedPath(): string {
  return '/embed/todays-rates';
}

export function getTodaysRatesEmbedUrl(): string {
  return `${getEmbedBaseUrl()}${getTodaysRatesEmbedPath()}`;
}

export function buildTodaysRatesIframeSnippet(height = 520): string {
  const url = getTodaysRatesEmbedUrl();
  return `<iframe
  src="${url}"
  width="100%"
  height="${height}"
  frameborder="0"
  style="border:0;max-width:100%;"
  title="Today's Mortgage Rates"
></iframe>`;
}

export function buildTodaysRatesScriptSnippet(): string {
  const url = getTodaysRatesEmbedUrl();
  return `<div id="ratecaddy-todays-rates"></div>
<script>
(function () {
  var el = document.getElementById('ratecaddy-todays-rates');
  if (!el) return;
  var iframe = document.createElement('iframe');
  iframe.src = ${JSON.stringify(url)};
  iframe.title = "Today's Mortgage Rates";
  iframe.width = '100%';
  iframe.height = '520';
  iframe.frameBorder = '0';
  iframe.style.cssText = 'border:0;max-width:100%;';
  el.appendChild(iframe);
})();
</script>`;
}
