'use client';

import { useEffect } from 'react';

export default function MortgageCalculatorPage() {
  useEffect(() => {
    const baseUrl = '/calculators/';
    const version = new Date().toISOString().slice(0, 10);

    // Load CSS files
    const loadCSS = (href: string) => {
      if (document.querySelector(`link[href="${href}"]`)) return; // Already loaded
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    // Load JS files sequentially
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.body.appendChild(script);
      });
    };

    // Load CSS
    loadCSS(`${baseUrl}css/jquery-ui.css?ver=12`);
    loadCSS(`${baseUrl}css/mortagage-calculator-chart.css?ver=${version}`);
    loadCSS(`${baseUrl}css/mCustomScrollbar.css?ver=12`);
    loadCSS(`${baseUrl}css/calculator-main.css?ver=${version}`);
    loadCSS(`${baseUrl}css/custom-style.css?ver=${version}`);

    // Load scripts in correct order
    const loadAllScripts = async () => {
      try {
        // First load loan-calculator.js to generate HTML structure
        await loadScript(`${baseUrl}js/loan-calculator.js?ver=${version}`);
        
        // Then load jQuery and dependencies
        await loadScript(`${baseUrl}js/jquery.min.js?ver=112`);
        await loadScript(`${baseUrl}js/jquery-migrate.js?ver=112`);
        await loadScript(`${baseUrl}js/jquery-core.js?ver=112`);
        await loadScript(`${baseUrl}js/jquery-datepicker.js`);
        await loadScript(`${baseUrl}js/mortgage-calculator-chart.js?ver=${version}`);
        await loadScript(`${baseUrl}js/mortgage-calculator-waypoints.js`);
        await loadScript(`${baseUrl}js/mortgage-calculator-counterup.js`);
        await loadScript(`${baseUrl}js/mortgage-calculator-counto.js`);
        await loadScript(`${baseUrl}js/mortgage-calculator-oundedBarCharts.js`);
        await loadScript(`${baseUrl}js/mortgage-calculator-touch-punch.js`);
        await loadScript(`${baseUrl}js/jquery-mouse.js`);
        await loadScript(`${baseUrl}js/jquery-slider.js`);
        await loadScript(`${baseUrl}js/mortgage-calculator-draggable.js`);
        await loadScript(`${baseUrl}js/jquery-mCustomScrollbar.js`);
        await loadScript(`${baseUrl}js/custom-script.js?ver=${version}`);
        await loadScript(`${baseUrl}js/mortgage-calculator-main.js?ver=${version}`);
      } catch (error) {
        console.error('Error loading calculator scripts:', error);
      }
    };

    loadAllScripts();

    // Auto-height snippet for iframe communication
    const postHeight = () => {
      try {
        const h = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
          document.documentElement.offsetHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight
        );
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'SYNC_MCALC_HEIGHT', height: h }, '*');
        }
      } catch (e) {
        // Cross-origin or other error, ignore
      }
    };

    // Set up height posting
    const handleLoad = () => {
      postHeight();
      setTimeout(postHeight, 200);
      setTimeout(postHeight, 800);
    };

    window.addEventListener('load', handleLoad);
    window.addEventListener('resize', postHeight);
    document.addEventListener('DOMContentLoaded', postHeight);

    // Use ResizeObserver if available
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(postHeight);
      ro.observe(document.body);
      ro.observe(document.documentElement);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('resize', postHeight);
      document.removeEventListener('DOMContentLoaded', postHeight);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <div id="loan-calculator"></div>
    </div>
  );
}

