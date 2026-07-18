'use client';

import { useEffect } from 'react';
import { EMBED_RESIZE_MESSAGE_TYPE } from '@/components/embed/EmbedAutoHeight';

/**
 * Forces embed pages to own html/body height + background.
 * - iframe: collapse to content height and postMessage resize to parent
 * - top-level: fill viewport with dark bg (no white strip under the card)
 */
export default function EmbedDocumentSync() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const inIframe = window.self !== window.top;

    root.dataset.rcEmbed = inIframe ? 'iframe' : 'page';
    root.classList.add('rc-embed');
    if (inIframe) root.classList.add('rc-embed-iframe');
    else root.classList.add('rc-embed-page');

    const prev = {
      rootBg: root.style.backgroundColor,
      bodyBg: body.style.backgroundColor,
      bodyMargin: body.style.margin,
      bodyPadding: body.style.padding,
      bodyMinHeight: body.style.minHeight,
      bodyHeight: body.style.height,
      bodyOverflow: body.style.overflow,
    };

    root.style.backgroundColor = '#070707';
    body.style.backgroundColor = '#070707';
    body.style.margin = '0';
    body.style.padding = '0';

    if (inIframe) {
      body.style.minHeight = '0';
      body.style.height = 'auto';
      body.style.overflow = 'hidden';
    } else {
      body.style.minHeight = '100vh';
      body.style.height = 'auto';
      body.style.overflow = 'auto';
    }

    const postHeight = () => {
      const shell = document.querySelector('.embed-shell') as HTMLElement | null;
      if (!shell) return;
      // Content height only — never use 100vh/document scrollHeight (causes cut-off / white strip)
      const height = Math.ceil(shell.getBoundingClientRect().height);
      if (!Number.isFinite(height) || height <= 0) return;

      if (inIframe) {
        window.parent.postMessage({ type: EMBED_RESIZE_MESSAGE_TYPE, height }, '*');
      }
    };

    postHeight();
    const t1 = window.setTimeout(postHeight, 50);
    const t2 = window.setTimeout(postHeight, 250);
    const t3 = window.setTimeout(postHeight, 800);

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => postHeight())
        : null;
    const shell = document.querySelector('.embed-shell');
    if (ro && shell) ro.observe(shell);

    window.addEventListener('resize', postHeight);
    document.fonts?.ready?.then?.(postHeight);

    Array.from(document.images).forEach((img) => {
      if (!img.complete) img.addEventListener('load', postHeight, { once: true });
    });

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener('resize', postHeight);
      ro?.disconnect();
      root.classList.remove('rc-embed', 'rc-embed-iframe', 'rc-embed-page');
      delete root.dataset.rcEmbed;
      root.style.backgroundColor = prev.rootBg;
      body.style.backgroundColor = prev.bodyBg;
      body.style.margin = prev.bodyMargin;
      body.style.padding = prev.bodyPadding;
      body.style.minHeight = prev.bodyMinHeight;
      body.style.height = prev.bodyHeight;
      body.style.overflow = prev.bodyOverflow;
    };
  }, []);

  return null;
}
