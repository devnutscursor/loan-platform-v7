import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Embed test (third-party simulation)',
  robots: 'noindex',
};

/**
 * Local third-party embed test — open via http://localhost:3000/test-embed
 * (Do NOT use file:///test-embed.html — browsers block file → http iframes.)
 */
export default function TestEmbedPage() {
  return (
    <div style={{ margin: 0, padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
        Third-party site test
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 16 }}>
        This page simulates a client website embedding Today&apos;s Rates via iframe.
      </p>
      <iframe
        src="/embed/todays-rates"
        width="100%"
        height="520"
        style={{ border: '1px solid #cbd5e1', maxWidth: '100%' }}
        title="Today's Mortgage Rates"
      />
    </div>
  );
}
