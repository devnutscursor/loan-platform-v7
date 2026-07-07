'use client';

import { useCallback, useMemo, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNotification } from '@/components/ui/Notification';
import {
  buildTodaysRatesIframeSnippet,
  getTodaysRatesEmbedUrl,
} from '@/lib/embed/baseUrl';
import { EMBED_RATE_MARKUP } from '@/lib/embed/constants';
import { Copy, Check } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';

/** Super Admin: copy Today's Rates iframe for external websites. */
export default function SuperAdminEmbedWidgetsPanel() {
  const { showNotification } = useNotification();
  const [copied, setCopied] = useState(false);

  const embedUrl = useMemo(() => getTodaysRatesEmbedUrl(), []);
  const iframeSnippet = useMemo(() => buildTodaysRatesIframeSnippet(), []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(iframeSnippet);
      setCopied(true);
      showNotification({
        title: 'Copied',
        message: 'Embed code copied — paste on any website',
        type: 'success',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showNotification({
        title: 'Copy failed',
        message: 'Select the code below and copy manually (Ctrl+C)',
        type: 'error',
      });
    }
  }, [iframeSnippet, showNotification]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-1" style={{ color: '#005b7c' }}>
          Today&apos;s Rates — Embed for other websites
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          8 rates from your database (cron snapshot). Display adds <strong>+{EMBED_RATE_MARKUP}</strong> to rate &amp; APR.
          No new env needed if <code className="text-xs bg-gray-100 px-1 rounded">NEXT_PUBLIC_SITE_URL</code> is set.
        </p>

        <div className="rounded-lg border border-gray-200 overflow-hidden bg-white mb-4">
          <iframe
            src={embedUrl}
            title="Today's Rates preview"
            className="w-full border-0"
            height={480}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Embed URL:</span>{' '}
            <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">{embedUrl}</code>
          </p>
          <Button variant="primary" onClick={handleCopy} className="shrink-0 bg-[#01bcc6] hover:bg-[#008eab]">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy embed code'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-gray-900">Iframe code (paste on client site)</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <pre className="overflow-x-auto rounded-lg bg-gray-900 text-gray-100 p-3 sm:p-4 text-xs leading-relaxed whitespace-pre-wrap break-all">
              {iframeSnippet}
            </pre>
          </CardBody>
        </Card>
      </SpotlightCard>
    </div>
  );
}
