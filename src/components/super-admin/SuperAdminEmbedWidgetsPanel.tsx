'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotification } from '@/components/ui/Notification';
import {
  buildTodaysRatesIframeSnippet,
  getTodaysRatesEmbedUrl,
} from '@/lib/embed/baseUrl';
import { EMBED_RATE_MARKUP } from '@/lib/embed/constants';
import type { OfficerEmbedAdminRow } from '@/lib/embed/officerEmbedWidget';
import { Copy, Check, Save, User } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';

type FormState = {
  displayName: string;
  nmlsNumber: string;
  avatarUrl: string;
};

function defaultFormFromOfficer(officer: OfficerEmbedAdminRow): FormState {
  const fallbackName = `${officer.firstName} ${officer.lastName}`.trim();
  return {
    displayName: officer.embed?.displayName?.trim() || fallbackName,
    nmlsNumber: officer.embed?.nmlsNumber?.trim() || officer.profileNmls?.trim() || '',
    avatarUrl: officer.embed?.avatarUrl?.trim() || officer.profileAvatar?.trim() || '',
  };
}

/** Super Admin: per-loan-officer Today's Rates embed (name, NMLS, photo + unique code). */
export default function SuperAdminEmbedWidgetsPanel() {
  const { showNotification } = useNotification();
  const [officers, setOfficers] = useState<OfficerEmbedAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [form, setForm] = useState<FormState>({ displayName: '', nmlsNumber: '', avatarUrl: '' });
  const [copied, setCopied] = useState(false);

  const selectedOfficer = useMemo(
    () => officers.find((o) => o.officerId === selectedOfficerId) ?? null,
    [officers, selectedOfficerId],
  );

  const embedSlug = selectedOfficer?.embed?.embedSlug ?? null;
  const embedUrl = embedSlug ? getTodaysRatesEmbedUrl(embedSlug) : null;
  const iframeSnippet = embedSlug ? buildTodaysRatesIframeSnippet(embedSlug) : '';

  const fetchOfficers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/super-admin/embed-widgets');
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load officers');
      }
      setOfficers(result.officers);
    } catch (error) {
      console.error('[embed-widgets]', error);
      showNotification({
        title: 'Error',
        message: 'Could not load loan officers for embed widgets',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchOfficers();
  }, [fetchOfficers]);

  useEffect(() => {
    if (!selectedOfficer) return;
    setForm(defaultFormFromOfficer(selectedOfficer));
  }, [selectedOfficer]);

  const handleSave = async () => {
    if (!selectedOfficerId) return;
    try {
      setSaving(true);
      const response = await fetch(`/api/super-admin/embed-widgets/${selectedOfficerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.displayName.trim() || null,
          nmlsNumber: form.nmlsNumber.trim() || null,
          avatarUrl: form.avatarUrl.trim() || null,
          isEnabled: true,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to save');
      }

      if (result.officer) {
        setOfficers((prev) =>
          prev.map((o) => (o.officerId === selectedOfficerId ? result.officer : o)),
        );
      } else {
        await fetchOfficers();
      }

      showNotification({
        title: 'Saved',
        message: 'Officer embed widget updated — unique embed code is ready',
        type: 'success',
      });
    } catch (error) {
      console.error('[embed-widgets] save', error);
      showNotification({
        title: 'Save failed',
        message: error instanceof Error ? error.message : 'Could not save embed widget',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!iframeSnippet) return;
    try {
      await navigator.clipboard.writeText(iframeSnippet);
      setCopied(true);
      showNotification({
        title: 'Copied',
        message: 'Embed code copied — give this to the loan officer for their website',
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
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-1" style={{ color: '#005b7c' }}>
          Today&apos;s Rates — Per Loan Officer Embed
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Each loan officer gets a unique embed URL with their name, NMLS#, and photo above the rates
          table. Rates come from your database snapshot (+{EMBED_RATE_MARKUP} markup). Sell this code
          separately to each officer.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-600 text-sm">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#01bcc6] mr-2" />
            Loading loan officers…
          </div>
        ) : officers.length === 0 ? (
          <p className="text-sm text-gray-600 py-6">No loan officers found.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="embed-officer-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select loan officer
              </label>
              <select
                id="embed-officer-select"
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm h-10 focus:outline-none focus:ring-1 focus:border-[#01bcc6] focus:ring-[#01bcc6]"
              >
                <option value="">Choose an officer…</option>
                {officers.map((o) => (
                  <option key={o.officerId} value={o.officerId}>
                    {o.firstName} {o.lastName} ({o.email})
                    {o.embed ? ' — embed active' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedOfficer && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50/80">
                  <Input
                    label="Display name"
                    value={form.displayName}
                    onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                    placeholder={`${selectedOfficer.firstName} ${selectedOfficer.lastName}`}
                  />
                  <Input
                    label="NMLS ID"
                    value={form.nmlsNumber}
                    onChange={(e) => setForm((f) => ({ ...f, nmlsNumber: e.target.value }))}
                    placeholder="e.g. 123456"
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Photo URL"
                      type="url"
                      value={form.avatarUrl}
                      onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                      placeholder="https://…"
                      description="Direct image URL (profile photo). Shown at the top of the embed."
                    />
                  </div>
                  {form.avatarUrl && (
                    <div className="md:col-span-2 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.avatarUrl}
                        alt="Preview"
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="text-xs text-gray-500">Photo preview</span>
                    </div>
                  )}
                  <div className="md:col-span-2 flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-[#01bcc6] hover:bg-[#008eab]"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving…' : embedSlug ? 'Update embed' : 'Create embed code'}
                    </Button>
                    {!embedSlug && (
                      <p className="text-xs text-gray-500 self-center flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        Save once to generate a unique URL for this officer
                      </p>
                    )}
                  </div>
                </div>

                {embedUrl && (
                  <>
                    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                      <iframe
                        src={embedUrl}
                        title={`${form.displayName || 'Officer'} — Today's Rates preview`}
                        className="w-full border-0"
                        height={580}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Unique embed URL:</span>{' '}
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">{embedUrl}</code>
                      </p>
                      <Button
                        variant="primary"
                        onClick={handleCopy}
                        className="shrink-0 bg-[#01bcc6] hover:bg-[#008eab]"
                      >
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? 'Copied!' : 'Copy embed code'}
                      </Button>
                    </div>

                    <Card>
                      <CardHeader>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Iframe code for {form.displayName || `${selectedOfficer.firstName} ${selectedOfficer.lastName}`}
                        </h3>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <pre className="overflow-x-auto rounded-lg bg-gray-900 text-gray-100 p-3 sm:p-4 text-xs leading-relaxed whitespace-pre-wrap break-all">
                          {iframeSnippet}
                        </pre>
                      </CardBody>
                    </Card>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </SpotlightCard>

      <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Generic platform embed (no officer)</h3>
        <p className="text-xs text-gray-600 mb-2">
          Optional: rates only, no officer header —{' '}
          <code className="bg-gray-100 px-1 rounded">{getTodaysRatesEmbedUrl()}</code>
        </p>
      </SpotlightCard>
    </div>
  );
}
