'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotification } from '@/components/ui/Notification';
import {
  buildTodaysRatesIframeSnippet,
  getTodaysRatesEmbedUrl,
} from '@/lib/embed/baseUrl';
import { DEFAULT_EMBED_ACCENT_COLOR, EMBED_RATE_MARKUP } from '@/lib/embed/constants';
import { EMBED_RESIZE_MESSAGE_TYPE } from '@/components/embed/EmbedAutoHeight';
import type { ExternalEmbedAdminRow, OfficerEmbedAdminRow } from '@/lib/embed/officerEmbedWidget';
import { supabase } from '@/lib/supabase/client';
import { Copy, Check, Save, Upload, User, UserPlus } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';

type EmbedMode = 'existing' | 'external';

type FormState = {
  displayName: string;
  nmlsNumber: string;
  avatarUrl: string;
  accentColor: string;
  contactEmail: string;
};

const EMPTY_FORM: FormState = {
  displayName: '',
  nmlsNumber: '',
  avatarUrl: '',
  accentColor: DEFAULT_EMBED_ACCENT_COLOR,
  contactEmail: '',
};

/** Match Embed Widgets / primary button teal accent */
const EMBED_SELECT_CLASS =
  'block w-full rounded-md border-2 border-[#01bcc6] bg-white px-3 py-2 text-sm h-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#01bcc6] focus:border-[#008eab]';

function defaultFormFromOfficer(officer: OfficerEmbedAdminRow): FormState {
  const fallbackName = `${officer.firstName} ${officer.lastName}`.trim();
  return {
    displayName: officer.embed?.displayName?.trim() || fallbackName,
    nmlsNumber: officer.embed?.nmlsNumber?.trim() || officer.profileNmls?.trim() || '',
    avatarUrl: officer.embed?.avatarUrl?.trim() || officer.profileAvatar?.trim() || '',
    accentColor: officer.embed?.accentColor?.trim() || DEFAULT_EMBED_ACCENT_COLOR,
    contactEmail: officer.email,
  };
}

function defaultFormFromExternal(widget: ExternalEmbedAdminRow): FormState {
  return {
    displayName: widget.displayName,
    nmlsNumber: widget.nmlsNumber?.trim() || '',
    avatarUrl: widget.avatarUrl?.trim() || '',
    accentColor: widget.accentColor?.trim() || DEFAULT_EMBED_ACCENT_COLOR,
    contactEmail: widget.contactEmail?.trim() || '',
  };
};

function EmbedPreviewBlock({
  embedSlug,
  displayLabel,
  form,
  copied,
  onCopy,
  previewNonce,
}: {
  embedSlug: string;
  displayLabel: string;
  form: FormState;
  copied: boolean;
  onCopy: () => void;
  /** Bumps after save so iframe reloads immediately (no stale cache). */
  previewNonce: number;
}) {
  const embedUrl = getTodaysRatesEmbedUrl(embedSlug);
  const iframeSnippet = buildTodaysRatesIframeSnippet(embedSlug);
  const previewSrc = `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}v=${previewNonce}`;
  const [previewHeight, setPreviewHeight] = useState(780);

  useEffect(() => {
    setPreviewHeight(780);
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== EMBED_RESIZE_MESSAGE_TYPE || !data.height) return;
      const next = Math.ceil(Number(data.height));
      if (Number.isFinite(next) && next > 100) setPreviewHeight(next);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [embedSlug, previewNonce]);

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-[#070707]">
        <iframe
          key={`${embedSlug}-${previewNonce}`}
          src={previewSrc}
          title={`${form.displayName || displayLabel} — Today's Rates preview`}
          className="w-full border-0 block bg-[#070707]"
          style={{ height: previewHeight, overflow: 'hidden' }}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Unique embed URL:</span>{' '}
          <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">{embedUrl}</code>
        </p>
        <Button variant="primary" onClick={onCopy} className="shrink-0 bg-[#01bcc6] hover:bg-[#008eab]">
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copied!' : 'Copy embed code'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-gray-900">Iframe code for {displayLabel}</h3>
        </CardHeader>
        <CardBody className="pt-0">
          <pre className="overflow-x-auto rounded-lg bg-gray-900 text-gray-100 p-3 sm:p-4 text-xs leading-relaxed whitespace-pre-wrap break-all">
            {iframeSnippet}
          </pre>
        </CardBody>
      </Card>
    </>
  );
}

function EmbedFormFields({
  form,
  setForm,
  showContactEmail,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  showContactEmail?: boolean;
}) {
  const { showNotification } = useNotification();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showNotification({
        title: 'Invalid file',
        message: 'Please choose an image file (JPG, PNG, WebP)',
        type: 'error',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification({
        title: 'File too large',
        message: 'Max photo size is 5MB',
        type: 'error',
      });
      return;
    }

    try {
      setUploading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('Not signed in — refresh and try again');
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `embed-${session.user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(fileName, file, { upsert: true, cacheControl: '3600' });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('user-avatars').getPublicUrl(fileName);
      if (!publicUrl) throw new Error('Failed to get photo URL');

      setForm((f) => ({ ...f, avatarUrl: publicUrl }));
      showNotification({
        title: 'Photo uploaded',
        message: 'Photo URL filled automatically — save embed to apply',
        type: 'success',
      });
    } catch (error) {
      console.error('[embed-widgets] photo upload', error);
      showNotification({
        title: 'Upload failed',
        message: error instanceof Error ? error.message : 'Could not upload photo',
        type: 'error',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Display name"
        value={form.displayName}
        onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
        placeholder="Loan officer name"
        required
      />
      <Input
        label="NMLS ID"
        value={form.nmlsNumber}
        onChange={(e) => setForm((f) => ({ ...f, nmlsNumber: e.target.value }))}
        placeholder="e.g. 123456"
      />
      {showContactEmail && (
        <Input
          label="Contact email (optional)"
          type="email"
          value={form.contactEmail}
          onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
          placeholder="officer@example.com"
          description="For your records only — not shown on the embed."
        />
      )}

      <div className="md:col-span-2 space-y-3">
        <Input
          label="Photo URL"
          type="url"
          value={form.avatarUrl}
          onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
          placeholder="https://…"
          description="Paste a direct image link, or upload a photo below."
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload photo</label>
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handlePhotoUpload(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading…' : 'Upload photo'}
            </Button>
            <span className="text-xs text-gray-500">JPG, PNG, WebP — max 5MB</span>
          </div>
        </div>

        {form.avatarUrl && (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.avatarUrl}
              alt="Preview"
              className="w-14 h-14 rounded-full object-cover border-2"
              style={{ borderColor: form.accentColor }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="text-xs text-gray-500">Photo preview</span>
          </div>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Accent color (profile ring &amp; rates)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={form.accentColor}
            onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))}
            className="h-10 w-14 rounded border border-gray-300 cursor-pointer p-0.5"
            aria-label="Accent color picker"
          />
          <Input
            value={form.accentColor}
            onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))}
            placeholder={DEFAULT_EMBED_ACCENT_COLOR}
            className="max-w-[140px]"
          />
        </div>
      </div>
    </div>
  );
}

/** Super Admin: per-loan-officer or external standalone Today's Rates embed. */
export default function SuperAdminEmbedWidgetsPanel() {
  const { showNotification } = useNotification();
  const [mode, setMode] = useState<EmbedMode>('existing');
  const [officers, setOfficers] = useState<OfficerEmbedAdminRow[]>([]);
  const [externalWidgets, setExternalWidgets] = useState<ExternalEmbedAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [externalWidgetId, setExternalWidgetId] = useState('');
  const [externalEmbedSlug, setExternalEmbedSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [copied, setCopied] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(() => Date.now());

  const bumpPreview = () => setPreviewNonce(Date.now());

  const selectedOfficer = useMemo(
    () => officers.find((o) => o.officerId === selectedOfficerId) ?? null,
    [officers, selectedOfficerId],
  );

  const selectedExternal = useMemo(
    () => externalWidgets.find((w) => w.widgetId === externalWidgetId) ?? null,
    [externalWidgets, externalWidgetId],
  );

  const embedSlug =
    mode === 'existing'
      ? selectedOfficer?.embed?.embedSlug ?? null
      : externalEmbedSlug;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/super-admin/embed-widgets');
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load embed widgets');
      }
      setOfficers(result.officers);
      setExternalWidgets(result.externalWidgets ?? []);
    } catch (error) {
      console.error('[embed-widgets]', error);
      showNotification({
        title: 'Error',
        message: 'Could not load embed widgets',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (mode === 'existing' && selectedOfficer) {
      setForm(defaultFormFromOfficer(selectedOfficer));
    }
  }, [mode, selectedOfficer]);

  const resetExternalNew = () => {
    setExternalWidgetId('');
    setExternalEmbedSlug(null);
    setForm(EMPTY_FORM);
  };

  const selectExternalWidget = (widgetId: string) => {
    if (!widgetId) {
      resetExternalNew();
      return;
    }
    const widget = externalWidgets.find((w) => w.widgetId === widgetId);
    if (!widget) return;
    setExternalWidgetId(widget.widgetId);
    setExternalEmbedSlug(widget.embedSlug);
    setForm(defaultFormFromExternal(widget));
  };

  useEffect(() => {
    if (mode === 'external') {
      resetExternalNew();
    }
    // Only reset when switching into external mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleSaveExisting = async () => {
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
          accentColor: form.accentColor.trim() || null,
          isEnabled: true,
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to save');

      if (result.officer) {
        setOfficers((prev) =>
          prev.map((o) => (o.officerId === selectedOfficerId ? result.officer : o)),
        );
        if (result.officer.embed?.displayName != null) {
          setForm((f) => ({
            ...f,
            displayName: result.officer.embed.displayName || f.displayName,
            nmlsNumber: result.officer.embed.nmlsNumber || f.nmlsNumber,
            avatarUrl: result.officer.embed.avatarUrl || f.avatarUrl,
            accentColor: result.officer.embed.accentColor || f.accentColor,
          }));
        }
      } else {
        await fetchData();
      }

      bumpPreview();
      showNotification({
        title: 'Saved',
        message: 'Platform officer embed updated',
        type: 'success',
      });
    } catch (error) {
      showNotification({
        title: 'Save failed',
        message: error instanceof Error ? error.message : 'Could not save',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveExternal = async () => {
    if (!form.displayName.trim()) {
      showNotification({ title: 'Name required', message: 'Enter a display name', type: 'error' });
      return;
    }
    try {
      setSaving(true);
      const payload = {
        displayName: form.displayName.trim(),
        nmlsNumber: form.nmlsNumber.trim() || null,
        avatarUrl: form.avatarUrl.trim() || null,
        accentColor: form.accentColor.trim() || null,
        contactEmail: form.contactEmail.trim() || null,
        isEnabled: true,
      };

      if (!externalWidgetId) {
        const response = await fetch('/api/super-admin/embed-widgets/external', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to create');

        setExternalWidgetId(result.widgetId);
        setExternalEmbedSlug(result.embedSlug ?? result.widget?.embedSlug ?? null);
        if (result.widget) {
          setForm(defaultFormFromExternal(result.widget as ExternalEmbedAdminRow));
          setExternalWidgets((prev) => {
            const row = result.widget as ExternalEmbedAdminRow;
            const exists = prev.some((w) => w.widgetId === row.widgetId);
            return exists
              ? prev.map((w) => (w.widgetId === row.widgetId ? row : w))
              : [row, ...prev];
          });
        } else {
          await fetchData();
        }

        bumpPreview();
        showNotification({
          title: 'Created',
          message: 'External embed code generated — copy and send to the officer',
          type: 'success',
        });
      } else {
        const response = await fetch(
          `/api/super-admin/embed-widgets/external/${externalWidgetId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to update');

        const nextSlug = result.embedSlug ?? result.widget?.embedSlug ?? null;
        if (nextSlug) setExternalEmbedSlug(nextSlug);
        if (result.widget) {
          const row = result.widget as ExternalEmbedAdminRow;
          setForm(defaultFormFromExternal(row));
          setExternalWidgets((prev) =>
            prev.map((w) => (w.widgetId === externalWidgetId ? row : w)),
          );
        }

        bumpPreview();
        showNotification({ title: 'Saved', message: 'External embed updated', type: 'success' });
      }
    } catch (error) {
      showNotification({
        title: 'Save failed',
        message: error instanceof Error ? error.message : 'Could not save',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!embedSlug) return;
    const snippet = buildTodaysRatesIframeSnippet(embedSlug);
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      showNotification({
        title: 'Copied',
        message: 'Embed code copied',
        type: 'success',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showNotification({
        title: 'Copy failed',
        message: 'Select the code and copy manually',
        type: 'error',
      });
    }
  };

  const displayLabel =
    mode === 'existing'
      ? form.displayName ||
        (selectedOfficer ? `${selectedOfficer.firstName} ${selectedOfficer.lastName}` : 'Officer')
      : form.displayName || 'External officer';

  return (
    <div className="space-y-4 sm:space-y-6">
      <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-1" style={{ color: '#005b7c' }}>
          Today&apos;s Rates — Embed Widget
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Sell embed codes separately. Platform users: pick from dropdown. External buyers: enter
          details manually. Rates from DB snapshot (+{EMBED_RATE_MARKUP} markup). Dark card design
          with customizable accent color.
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          <Button
            type="button"
            variant={mode === 'existing' ? 'primary' : 'secondary'}
            onClick={() => setMode('existing')}
            className={mode === 'existing' ? 'bg-[#01bcc6] hover:bg-[#008eab]' : ''}
          >
            <User className="w-4 h-4 mr-2" />
            Platform loan officer
          </Button>
          <Button
            type="button"
            variant={mode === 'external' ? 'primary' : 'secondary'}
            onClick={() => setMode('external')}
            className={mode === 'external' ? 'bg-[#01bcc6] hover:bg-[#008eab]' : ''}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            External / standalone
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-600 text-sm">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#01bcc6] mr-2" />
            Loading…
          </div>
        ) : mode === 'existing' ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="embed-officer-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select loan officer (uses your platform)
              </label>
              <select
                id="embed-officer-select"
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                className={EMBED_SELECT_CLASS}
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
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/80 space-y-4">
                  <EmbedFormFields form={form} setForm={setForm} />
                  <Button
                    variant="primary"
                    onClick={handleSaveExisting}
                    disabled={saving}
                    className="bg-[#01bcc6] hover:bg-[#008eab]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving…' : embedSlug ? 'Update embed' : 'Create embed code'}
                  </Button>
                </div>
                {embedSlug && (
                  <EmbedPreviewBlock
                    embedSlug={embedSlug}
                    displayLabel={displayLabel}
                    form={form}
                    copied={copied}
                    onCopy={handleCopy}
                    previewNonce={previewNonce}
                  />
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              For officers who only buy the embed — they don&apos;t need a RateCaddy account.
            </p>

            <div>
              <label
                htmlFor="embed-external-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Already added (external)
              </label>
              <select
                id="embed-external-select"
                value={externalWidgetId}
                onChange={(e) => selectExternalWidget(e.target.value)}
                className={EMBED_SELECT_CLASS}
              >
                <option value="">+ Add new external officer…</option>
                {externalWidgets.map((w) => (
                  <option key={w.widgetId} value={w.widgetId}>
                    {w.displayName}
                    {w.nmlsNumber ? ` — NMLS# ${w.nmlsNumber}` : ''}
                    {w.contactEmail ? ` (${w.contactEmail})` : ''}
                  </option>
                ))}
              </select>
              {externalWidgets.length === 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  No external embeds yet — fill the form below to create one.
                </p>
              )}
              {selectedExternal && (
                <p className="mt-1 text-xs text-[#008eab]">
                  Editing existing embed — update fields and save.
                </p>
              )}
            </div>

            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/80 space-y-4">
              <EmbedFormFields form={form} setForm={setForm} showContactEmail />
              <Button
                variant="primary"
                onClick={handleSaveExternal}
                disabled={saving}
                className="bg-[#01bcc6] hover:bg-[#008eab]"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving
                  ? 'Saving…'
                  : externalWidgetId
                    ? 'Update embed'
                    : 'Create embed code'}
              </Button>
            </div>

            {embedSlug && (
              <EmbedPreviewBlock
                embedSlug={embedSlug}
                displayLabel={displayLabel}
                form={form}
                copied={copied}
                onCopy={handleCopy}
                previewNonce={previewNonce}
              />
            )}
          </div>
        )}
      </SpotlightCard>

      <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Generic platform embed (no officer)</h3>
        <p className="text-xs text-gray-600">
          Rates only, no profile —{' '}
          <code className="bg-gray-100 px-1 rounded">{getTodaysRatesEmbedUrl()}</code>
        </p>
      </SpotlightCard>
    </div>
  );
}
