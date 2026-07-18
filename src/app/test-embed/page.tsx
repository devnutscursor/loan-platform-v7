'use client';

import { useEffect, useState } from 'react';
import { EMBED_RESIZE_MESSAGE_TYPE } from '@/components/embed/EmbedAutoHeight';

/**
 * Local third-party embed test — open via http://localhost:3000/test-embed
 * (Do NOT use file:///test-embed.html — browsers block file → http iframes.)
 */
export default function TestEmbedPage() {
  const [height, setHeight] = useState(720);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== EMBED_RESIZE_MESSAGE_TYPE || !data.height) return;
      setHeight(Math.ceil(Number(data.height)));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div style={{ margin: 0, padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
        Third-party site test
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 16 }}>
        This page simulates a client website embedding Today&apos;s Rates via iframe (auto-height).
      </p>
      <iframe
        src="/embed/todays-rates"
        width="100%"
        style={{
          border: '1px solid #cbd5e1',
          maxWidth: '100%',
          height,
          display: 'block',
          overflow: 'hidden',
        }}
        title="Today's Mortgage Rates"
      />
    </div>
  );
}
