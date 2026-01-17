(function(){
  // Auto-height via postMessage; responsive fallback via aspect ratio
  function onMessage(e){
    var data = e && e.data;
    if(!data || data.type !== 'SYNC_MCALC_HEIGHT') return;
    // Update all visible iframes (supports multiple on page)
    document.querySelectorAll('.syncly-mc-iframe').forEach(function(iframe){
      try {
        // Only set height for the iframe that sent the message (best effort by same-origin check skips)
        // If cross-origin, we can't reliably match, so we set the tallest received value.
        var newH = parseInt(data.height, 10);
        if(!isNaN(newH) && newH > 100){
          // Cap to something reasonable to prevent runaway
          if(newH > 4000) newH = 4000;
          iframe.style.height = newH + 'px';
        }
      } catch(err){}
    });
  }

  window.addEventListener('message', onMessage, false);

  // Responsive fallback (aspect-ratio wrapper), if no postMessage arrives
  function applyFallback(){
    document.querySelectorAll('[data-syncly-mc]').forEach(function(wrap){
      var ratio = parseFloat(wrap.getAttribute('data-aspect-ratio') || '1.2');
      var iframe = wrap.querySelector('iframe.syncly-mc-iframe');
      if(!iframe) return;
      // If we haven't received postMessage yet, ensure at least a proportional height
      if(!iframe.dataset.synced){
        var w = wrap.clientWidth || iframe.clientWidth;
        if(w && ratio > 0){
          var h = Math.round(w * ratio);
          if(h > 0) iframe.style.height = h + 'px';
        }
      }
    });
  }

  // Periodically apply fallback (lightweight)
  var fallbackInterval = setInterval(applyFallback, 500);
  window.addEventListener('load', function(){
    applyFallback();
    setTimeout(applyFallback, 300);
    setTimeout(applyFallback, 1200);
  });
  window.addEventListener('resize', applyFallback);
})();
