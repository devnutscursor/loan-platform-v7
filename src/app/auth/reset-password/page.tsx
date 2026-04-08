'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useNotification } from '@/components/ui/Notification';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { LiquidChromeBackground } from '@/components/ui/LiquidChromeBackground';
import { PASSWORD_REQUIREMENTS_SUMMARY, validatePasswordStrength } from '@/lib/password-policy';

const inputBaseClass =
  'w-full pl-12 pr-12 py-4 border-2 border-[#01bcc6]/20 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[#01bcc6]/20 focus:border-[#01bcc6] transition-all duration-300 bg-white text-[#005b7c] font-medium placeholder:text-[#005b7c]/40';

function FieldLockIcon() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
      <Lock className="h-5 w-5 shrink-0 text-[#005b7c]" strokeWidth={2.25} aria-hidden />
    </div>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [emailMasked, setEmailMasked] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setTokenValid(false);
        setCheckingToken(false);
        return;
      }
      try {
        const res = await fetch(`/api/auth/password-reset-token?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (data.valid) {
          setTokenValid(true);
          setEmailMasked(typeof data.emailMasked === 'string' ? data.emailMasked : null);
        } else {
          setTokenValid(false);
        }
      } catch {
        setTokenValid(false);
      } finally {
        setCheckingToken(false);
      }
    };
    run();
  }, [token]);

  const confirmMatches = confirmPassword.length === 0 || password === confirmPassword;
  const confirmDirty = confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!validatePasswordStrength(password).ok) {
      const { errors } = validatePasswordStrength(password);
      showNotification({
        type: 'error',
        title: 'Password requirements',
        message: errors[0] ?? PASSWORD_REQUIREMENTS_SUMMARY,
      });
      return;
    }

    if (password !== confirmPassword) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'New password and confirmation do not match.',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/complete-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update password.');
      }

      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Password updated! Sign in with your new password.',
      });

      setTimeout(() => {
        router.push('/auth');
      }, 1500);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update password.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01bcc6]" />
      </div>
    );
  }

  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid or expired link</h2>
          <p className="text-gray-600 mb-4">Request a new password reset from the login page.</p>
          <Button onClick={() => router.push('/auth')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#005b7c] via-[#008eab] to-[#01bcc6]">
      <LiquidChromeBackground />

      <header className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-[#F7F1E9]/30 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center">
              <Image
                src="/logonobg.png"
                alt="ratecaddy"
                unoptimized
                width={40}
                height={40}
                className="h-10 w-auto shrink-0 md:h-12"
                priority
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/auth';
                }}
                className="text-[#005b7c] hover:text-[#01bcc6] font-medium transition-colors duration-200"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#F7F1E9]/40">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#01bcc6] to-[#008eab] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-[#005b7c] mb-4 drop-shadow-lg">Reset password</h2>
              {emailMasked ? (
                <p className="text-[#005b7c]/80 text-lg">Account: {emailMasked}</p>
              ) : (
                <p className="text-[#005b7c]/80 text-lg">Choose a new password for your account</p>
              )}
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#005b7c] mb-3">New password</label>
                <div className="relative">
                  <FieldLockIcon />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputBaseClass}
                    placeholder="New password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 z-10 flex items-center pr-4 text-[#005b7c] hover:text-[#01bcc6]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 shrink-0" strokeWidth={2.25} />
                    ) : (
                      <Eye className="h-5 w-5 shrink-0" strokeWidth={2.25} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#005b7c]/60 mt-2">{PASSWORD_REQUIREMENTS_SUMMARY}</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#005b7c] mb-3">Re-type new password</label>
                <div className="relative">
                  <FieldLockIcon />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputBaseClass} ${
                      confirmDirty
                        ? confirmMatches
                          ? 'border-green-400 focus:ring-green-200 focus:border-green-500'
                          : 'border-red-400 focus:ring-red-200 focus:border-red-500'
                        : ''
                    }`}
                    placeholder="Re-type new password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 z-10 flex items-center pr-4 text-[#005b7c] hover:text-[#01bcc6]"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 shrink-0" strokeWidth={2.25} />
                    ) : (
                      <Eye className="h-5 w-5 shrink-0" strokeWidth={2.25} />
                    )}
                  </button>
                </div>
                {confirmDirty && (
                  <div
                    className={`flex items-center gap-2 text-sm mt-2 ${confirmMatches ? 'text-green-700' : 'text-red-600'}`}
                  >
                    {confirmMatches ? (
                      <>
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <span>Matches new password</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 shrink-0" />
                        <span>Does not match new password</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !password ||
                    !confirmPassword ||
                    !confirmMatches ||
                    !validatePasswordStrength(password).ok
                  }
                  className="w-full bg-gradient-to-r from-[#01bcc6] to-[#008eab] hover:from-[#008eab] hover:to-[#005b7c] text-white py-4 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  <Lock className="h-5 w-5" />
                  <span>{loading ? 'Updating…' : 'Update password'}</span>
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#005b7c]/70">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/auth')}
                  className="text-[#01bcc6] hover:text-[#008eab] font-medium transition-colors duration-200"
                >
                  Sign in instead
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01bcc6]" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
