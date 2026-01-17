(function () {
  // Locate the current <script> element
  var s = document.currentScript || (function(){var a=document.getElementsByTagName('script');return a[a.length-1];})();
  if (!s) return;

  // Read data-* attributes
  var url   = s.getAttribute('data-url');
  var h     = s.getAttribute('data-height') || '900';
  var allow = s.getAttribute('data-allow') || '';
  var klass = s.getAttribute('data-class') || '';
  var ar    = parseFloat(s.getAttribute('data-aspect-ratio') || '1.2');

  if (!url) return;

  // Wrapper
  var wrap = document.createElement('div');
  wrap.className = ('syncly-mc-embed ' + klass).trim();
  wrap.style.width = '100%';

  // Iframe
  var iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.title = 'Mortgage Calculator';
  iframe.loading = 'lazy';
  iframe.style.width = '100%';
  iframe.style.border = '0';
  iframe.style.display = 'block';

  // Fixed height by default
  if (h && h !== 'auto' && h !== '0') {
    iframe.style.height = parseInt(h, 10) + 'px';
  }

  if (allow) iframe.setAttribute('allow', allow);

  wrap.appendChild(iframe);
  s.parentNode.insertBefore(wrap, s);

  // Aspect-ratio fallback if height is auto/0
  function maintainAspect() {
    if (h === 'auto' || h === '0') {
      var w = wrap.clientWidth || wrap.offsetWidth || 0;
      if (w > 0 && ar > 0) {
        iframe.style.height = Math.round(w * ar) + 'px';
      }
    }
  }
  maintainAspect();
  window.addEventListener('resize', maintainAspect);

  // Auto-resize if the calculator page posts height
  // parent.postMessage({ type: 'SYNC_MCALC_HEIGHT', height: <number> }, '*')
  window.addEventListener('message', function (e) {
    try {
      var d = e.data;
      if (!d || typeof d !== 'object') return;
      if (d.type === 'SYNC_MCALC_HEIGHT' && e.source === iframe.contentWindow) {
        var newH = parseInt(d.height, 10);
        if (newH && newH > 0) iframe.style.height = newH + 'px';
      }
    } catch (err) {}
  });
})();
