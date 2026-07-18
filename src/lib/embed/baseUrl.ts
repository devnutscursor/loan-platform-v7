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

export function getTodaysRatesEmbedPath(embedSlug?: string): string {
  if (embedSlug?.trim()) {
    return `/embed/todays-rates/${encodeURIComponent(embedSlug.trim())}`;
  }
  return '/embed/todays-rates';
}

export function getTodaysRatesEmbedUrl(embedSlug?: string): string {
  return `${getEmbedBaseUrl()}${getTodaysRatesEmbedPath(embedSlug)}`;
}

/**
 * Copy-paste embed: iframe + resize script.
 * Parent listens for postMessage and sets iframe height to content height.
 */
export function buildTodaysRatesIframeSnippet(embedSlug?: string): string {
  const url = getTodaysRatesEmbedUrl(embedSlug);
  const iframeId = `ratecaddy-embed-${(embedSlug || 'rates').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'rates'}`;

  return `<!-- RateCaddy Today's Rates (auto-height) -->
<iframe
  id="${iframeId}"
  src="${url}"
  width="100%"
  height="780"
  loading="lazy"
  frameborder="0"
  scrolling="no"
  style="border:0;width:100%;max-width:100%;display:block;overflow:hidden;background:#070707;"
  title="Today's Mortgage Rates"
></iframe>
<script>
(function () {
  var id = ${JSON.stringify(iframeId)};
  function apply(h) {
    var el = document.getElementById(id);
    if (!el || !h) return;
    el.style.height = Math.ceil(h) + 'px';
  }
  window.addEventListener('message', function (e) {
    var d = e && e.data;
    if (!d || d.type !== 'ratecaddy-embed-resize' || !d.height) return;
    apply(d.height);
  });
})();
</script>`;
}

export function buildTodaysRatesScriptSnippet(embedSlug?: string): string {
  const url = getTodaysRatesEmbedUrl(embedSlug);
  return `<div id="ratecaddy-todays-rates"></div>
<script>
(function () {
  var el = document.getElementById('ratecaddy-todays-rates');
  if (!el) return;
  var iframe = document.createElement('iframe');
  iframe.src = ${JSON.stringify(url)};
  iframe.title = "Today's Mortgage Rates";
  iframe.width = '100%';
  iframe.height = '700';
  iframe.frameBorder = '0';
  iframe.scrolling = 'no';
  iframe.style.cssText = 'border:0;width:100%;max-width:100%;display:block;overflow:hidden;';
  window.addEventListener('message', function (e) {
    var d = e && e.data;
    if (!d || d.type !== 'ratecaddy-embed-resize' || !d.height) return;
    if (e.source !== iframe.contentWindow) return;
    iframe.style.height = Math.ceil(d.height) + 'px';
  });
  el.appendChild(iframe);
})();
</script>`;
}
