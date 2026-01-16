'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotification } from '@/components/ui/Notification';
import Modal from '@/components/ui/Modal';
import { icons } from '@/components/ui/Icon';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (email: string) => void;
  template?: 'template1' | 'template2';
}

export default function EmailVerificationModal({
  isOpen,
  onClose,
  onVerified,
  template = 'template1',
}: EmailVerificationModalProps) {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errors, setErrors] = useState<{ email?: string; code?: string }>({});

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendCode = async () => {
    setErrors({});
    
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/mortech/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStep('verify');
        setResendCooldown(60); // 60 second cooldown
        showNotification({
          type: 'success',
          title: 'Code Sent',
          message: 'Verification code sent to your email. Please check your inbox.',
        });
      } else {
        setErrors({ email: result.message || 'Failed to send verification code' });
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to send verification code',
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrors({ email: 'Network error. Please try again.' });
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    setErrors({});
    
    if (!code.trim()) {
      setErrors({ code: 'Verification code is required' });
      return;
    }

    if (code.trim().length !== 6) {
      setErrors({ code: 'Verification code must be 6 digits' });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/mortech/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          code: code.trim() 
        }),
      });

      const result = await response.json();

      if (response.ok && result.success && result.verified) {
        showNotification({
          type: 'success',
          title: 'Email Verified',
          message: 'Your email has been verified successfully.',
        });
        onVerified(email.trim());
        handleClose();
      } else {
        setErrors({ code: result.message || 'Invalid verification code' });
        showNotification({
          type: 'error',
          title: 'Verification Failed',
          message: result.message || 'Invalid verification code',
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrors({ code: 'Network error. Please try again.' });
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    await handleSendCode();
  };

  const handleClose = () => {
    setEmail('');
    setCode('');
    setStep('email');
    setErrors({});
    setResendCooldown(0);
    onClose();
  };

  const handleCodeChange = (value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'email' ? 'Verify Your Email' : 'Enter Verification Code'}
    >
      <div className="space-y-4">
        {step === 'email' ? (
          <>
            <div>
              <p className="text-sm text-gray-600 mb-4">
                To search for mortgage rates, please verify your email address. We'll send you a 6-digit verification code.
              </p>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="your.email@example.com"
                  disabled={isSending}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                variant="primary"
                onClick={handleSendCode}
                disabled={isSending || !email.trim()}
                className="flex-1"
              >
                {isSending ? 'Sending...' : 'Send Verification Code'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSending}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-sm text-gray-600 mb-4">
                We've sent a 6-digit verification code to <strong>{email}</strong>. Please enter it below.
              </p>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => {
                    handleCodeChange(e.target.value);
                    setErrors({ ...errors, code: undefined });
                  }}
                  placeholder="000000"
                  disabled={isVerifying}
                  className={`text-center text-2xl tracking-widest font-mono ${errors.code ? 'border-red-500' : ''}`}
                  maxLength={6}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                )}
              </div>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isVerifying}
                  className="text-sm text-[#01bcc6] hover:text-[#005b7c] disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : 'Resend verification code'}
                </button>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                variant="primary"
                onClick={handleVerifyCode}
                disabled={isVerifying || code.length !== 6}
                className="flex-1"
              >
                {isVerifying ? 'Verifying...' : 'Verify Code'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setStep('email');
                  setCode('');
                  setErrors({});
                }}
                disabled={isVerifying}
                className="flex-1"
              >
                Change Email
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

