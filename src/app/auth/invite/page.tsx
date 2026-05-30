'use client'

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { LiquidChromeBackground } from '@/components/ui/LiquidChromeBackground';

type PageState = 'loading' | 'setup' | 'no-token' | 'no-company' | 'already-accepted' | 'expired';

function InviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#005b7c] via-[#008eab] to-[#01bcc6]">
      <LiquidChromeBackground />
      <header className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-[#F7F1E9]/30 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Image src="/logonobg.png" alt="RateCaddy" width={180} height={48} className="h-8 w-auto" priority />
            <button
              onClick={() => (window.location.href = '/auth')}
              className="text-[#005b7c] hover:text-[#01bcc6] font-medium transition-colors duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </header>
      <main className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function InvitePageContent() {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [companyInfo, setCompanyInfo] = useState<{ name: string; email: string } | null>(null);
  const [authedUser, setAuthedUser] = useState<any>(null);

  const sessionHydratedRef = useRef(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const companyId = searchParams.get('company');
  const isOfficerInvite = searchParams.get('officer') === 'true';

  useEffect(() => {
    if (!companyId) {
      setPageState('no-company');
      return;
    }

    const run = async () => {
      // 1. Hydrate session from invite URL tokens (hash or query params)
      if (!sessionHydratedRef.current) {
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
        const accessToken = hashParams.get('access_token') ?? searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') ?? searchParams.get('refresh_token');

        if (accessToken && refreshToken) {
          sessionHydratedRef.current = true;
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!sessionError) {
            // Strip tokens from the URL immediately after hydration
            try {
              window.history.replaceState(
                {},
                document.title,
                `${window.location.pathname}${window.location.search}`,
              );
            } catch {}
          }
        }
      }

      // 2. Verify we have a valid Supabase auth session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPageState('no-token');
        return;
      }
      setAuthedUser(user);

      // 3. Fetch company info via public server API (not direct Supabase — RLS blocks it here)
      const res = await fetch(`/api/public/invite-info?companyId=${encodeURIComponent(companyId)}`);
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        setError(json.error ?? 'Company not found or invite is invalid.');
        setPageState('setup');
        return;
      }

      const company = json.data;

      if (!isOfficerInvite) {
        if (company.inviteStatus === 'accepted') {
          setPageState('already-accepted');
          setTimeout(() => router.push('/auth'), 3000);
          return;
        }
        if (
          company.inviteStatus === 'expired' ||
          (company.inviteExpiresAt && new Date() > new Date(company.inviteExpiresAt))
        ) {
          setPageState('expired');
          return;
        }
      }

      setCompanyInfo({ name: company.name, email: company.adminEmail });
      setPageState('setup');
    };

    run().catch((e) => {
      console.error('[invite] init error:', e);
      setError('Failed to load invite. Please try again.');
      setPageState('setup');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!companyId) {
      setError('Missing company ID.');
      return;
    }

    setSubmitting(true);
    try {
      // Ensure we still have a valid session (tokens may have expired or the user
      // navigated away and back). Re-fetch the current user.
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Your session has expired. Please click the invite link again.');
        return;
      }

      // Set the password via Supabase Auth (server-side, no RLS issue)
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      // Get the current access token to authenticate the finalize-invite call
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      // All DB writes (public.users, user_companies, companies) happen server-side
      // via the finalize-invite API which uses the service role key to bypass RLS.
      const finalizeRes = await fetch('/api/auth/finalize-invite', {
        method: 'POST',
        headers,
        body: JSON.stringify({ companyId, isOfficerInvite }),
      });
      const finalizeJson = await finalizeRes.json().catch(() => ({}));
      if (!finalizeRes.ok || !finalizeJson.success) {
        throw new Error(finalizeJson?.error ?? 'Failed to finalize invite');
      }

      // Fire-and-forget: create personal templates for loan officers
      if (isOfficerInvite) {
        void (async () => {
          try {
            const authHeaders = {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };
            const tplRes = await fetch('/api/templates/create-personal', {
              method: 'POST',
              headers: authHeaders,
              body: JSON.stringify({
                userId: user.id,
                firstName: user.user_metadata?.first_name ?? '',
                lastName: user.user_metadata?.last_name ?? '',
              }),
            });
            if (!tplRes.ok) console.warn('[invite] template creation failed:', await tplRes.text());
          } catch (err) {
            console.warn('[invite] template creation error:', err);
          }

          try {
            const ghlRes = await fetch('/api/ghl/users/create-officer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ officerId: user.id, companyId }),
            });
            if (!ghlRes.ok) {
              const ghlErr = await ghlRes.json().catch(() => ({}));
              console.warn('[invite] GHL create-officer failed:', ghlErr);
            }
          } catch (ghlError) {
            console.warn('[invite] GHL create-officer error:', ghlError);
          }
        })();
      }

      setSuccess('🎉 Welcome! Your account has been set up successfully. Redirecting to your dashboard…');
      setTimeout(() => {
        router.push(isOfficerInvite ? '/officers/dashboard' : '/admin/dashboard');
      }, 2000);
    } catch (err) {
      console.error('[invite] handleSubmit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to accept invite. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- loading ----------
  if (pageState === 'loading') {
    return (
      <InviteLayout>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white" />
          <p className="text-white font-medium text-lg">Loading your invite…</p>
        </div>
      </InviteLayout>
    );
  }

  // ---------- no token in URL / session ----------
  if (pageState === 'no-token') {
    return (
      <InviteLayout>
        <div className="max-w-md w-full">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#01bcc6] to-[#008eab] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#005b7c] mb-4">Check Your Email</h2>
            <p className="text-[#005b7c]/80 text-lg mb-4">
              Please click the invite link in your email to continue setup.
            </p>
            <p className="text-sm text-[#005b7c]/60">If you don't see the email, check your spam folder.</p>
          </div>
        </div>
      </InviteLayout>
    );
  }

  // ---------- missing company ID ----------
  if (pageState === 'no-company') {
    return (
      <InviteLayout>
        <div className="max-w-md w-full">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#005b7c] mb-4">Invalid Invite Link</h2>
            <p className="text-[#005b7c]/80">This invite link is missing required information.</p>
          </div>
        </div>
      </InviteLayout>
    );
  }

  // ---------- already accepted ----------
  if (pageState === 'already-accepted') {
    return (
      <InviteLayout>
        <div className="max-w-md w-full">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#005b7c] mb-4">Already Accepted</h2>
            <p className="text-[#005b7c]/80">This invite has already been accepted. Redirecting to login…</p>
          </div>
        </div>
      </InviteLayout>
    );
  }

  // ---------- expired ----------
  if (pageState === 'expired') {
    return (
      <InviteLayout>
        <div className="max-w-md w-full">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#005b7c] mb-4">Invite Expired</h2>
            <p className="text-[#005b7c]/80">This invite has expired. Please contact your administrator for a new invite.</p>
          </div>
        </div>
      </InviteLayout>
    );
  }

  // ---------- setup form ----------
  return (
    <InviteLayout>
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#F7F1E9]/40">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#01bcc6] to-[#008eab] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-[#005b7c] mb-4 drop-shadow-lg">Complete Your Setup</h2>
            <p className="text-[#005b7c]/80 text-lg">
              {isOfficerInvite
                ? 'Create a password to access your loan officer dashboard.'
                : 'Create a password to access your company dashboard.'}
            </p>
            {companyInfo && (
              <div className="mt-6 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-[#01bcc6]/20">
                <p className="text-[#005b7c] font-medium">
                  <strong>Company:</strong> {companyInfo.name}
                  <br />
                  <strong>Email:</strong> {companyInfo.email}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 p-4 rounded-xl">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 p-4 rounded-xl">
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-[#005b7c] mb-3">
                Create Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <svg className="w-5 h-5 text-[#008eab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-[#01bcc6]/20 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[#01bcc6]/20 focus:border-[#01bcc6] transition-all duration-300 bg-white/50 backdrop-blur-sm text-[#005b7c] font-medium placeholder-[#005b7c]/50"
                  placeholder="Enter your password"
                  required
                  minLength={8}
                  disabled={submitting}
                />
              </div>
              <p className="text-xs text-[#005b7c]/60 mt-2">Password must be at least 8 characters long</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#005b7c] mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <svg className="w-5 h-5 text-[#008eab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-[#01bcc6]/20 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[#01bcc6]/20 focus:border-[#01bcc6] transition-all duration-300 bg-white/50 backdrop-blur-sm text-[#005b7c] font-medium placeholder-[#005b7c]/50"
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                  disabled={submitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#01bcc6] to-[#008eab] hover:from-[#008eab] hover:to-[#005b7c] text-white py-4 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? 'Setting up account…' : 'Complete Setup & Go to Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#005b7c]/70">
              Need help?{' '}
              <a href="mailto:support@syncly360.com" className="text-[#01bcc6] hover:text-[#008eab] font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </InviteLayout>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#005b7c] via-[#008eab] to-[#01bcc6]">
          <LiquidChromeBackground />
          <div className="relative z-10 min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white" />
          </div>
        </div>
      }
    >
      <InvitePageContent />
    </Suspense>
  );
}
