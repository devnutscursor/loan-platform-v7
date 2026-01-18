'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';
import { X } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  officerEmail: string;
  officerName?: string;
  template?: 'template1' | 'template2';
  isPublic?: boolean;
  publicTemplateData?: any;
}

export default function ContactModal({
  isOpen,
  onClose,
  officerEmail,
  officerName,
  template = 'template1',
  isPublic = false,
  publicTemplateData
}: ContactModalProps) {
  const { getTemplateSync } = useEfficientTemplates();
  
  // Template data fetching - support both public and auth modes
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(template);
  
  // Comprehensive template data usage
  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  
  const typography = templateData?.template?.typography || {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  };
  
  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
  };
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear submit status when user starts typing
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setSubmitMessage('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');
    
    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: officerEmail,
          senderName: formData.email.split('@')[0], // Use email prefix as name if not provided
          senderEmail: formData.email.trim(),
          senderPhone: formData.phone.trim(),
          message: formData.message.trim(),
          templateColors: colors
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSubmitStatus('success');
        setSubmitMessage('Your message has been sent successfully!');
        
        // Reset form after 2 seconds and close modal after 3 seconds
        setTimeout(() => {
          setFormData({
            email: '',
            phone: '',
            message: ''
          });
          setErrors({});
        }, 2000);
        
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
          setSubmitMessage('');
        }, 3000);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending contact message:', error);
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        email: '',
        phone: '',
        message: ''
      });
      setErrors({});
      setSubmitStatus('idle');
      setSubmitMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{ fontFamily: typography.fontFamily }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-white max-w-lg w-full max-h-[90vh] flex flex-col shadow-xl"
        style={{ 
          backgroundColor: colors.background,
          borderRadius: `${layout.borderRadius}px`
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b flex-shrink-0"
          style={{ borderBottomColor: colors.border }}
        >
          <div>
            <h2 
              className="text-xl font-semibold mb-1"
              style={{ color: colors.text }}
            >
              Contact {officerName || 'Us'}
            </h2>
            <p 
              className="text-sm"
              style={{ color: colors.textSecondary }}
            >
              Send us a message and we'll get back to you soon
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 transition-colors hover:bg-gray-100 rounded-full"
            style={{ 
              color: colors.textSecondary,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form - Scrollable content */}
        <form 
          onSubmit={handleSubmit} 
          className="flex flex-col flex-1 min-h-0"
        >
          <div 
            className="p-6 flex-1 overflow-y-auto"
            style={{ padding: `${layout.padding.large}px` }}
          >
            {/* Success Message */}
            {submitStatus === 'success' && (
              <div 
                className="mb-4 p-4 rounded-lg border"
                style={{
                  backgroundColor: '#f0fdf4',
                  borderColor: '#86efac',
                  color: '#166534'
                }}
              >
                <p className="text-sm font-medium">{submitMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === 'error' && (
              <div 
                className="mb-4 p-4 rounded-lg border"
                style={{
                  backgroundColor: '#fef2f2',
                  borderColor: '#fecaca',
                  color: '#991b1b'
                }}
              >
                <p className="text-sm font-medium">{submitMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                  error={errors.email}
                  variant={errors.email ? 'error' : 'default'}
                  disabled={isSubmitting || submitStatus === 'success'}
                />
              </div>

              {/* Phone Field */}
              <div>
                <Input
                  type="tel"
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  required
                  error={errors.phone}
                  variant={errors.phone ? 'error' : 'default'}
                  disabled={isSubmitting || submitStatus === 'success'}
                />
              </div>

              {/* Message Field */}
              <div>
                <label 
                  htmlFor="message"
                  className="block text-sm font-medium mb-1"
                  style={{ color: colors.text }}
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us how we can help you..."
                  required
                  rows={6}
                  disabled={isSubmitting || submitStatus === 'success'}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors ${
                    errors.message 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-[#01bcc6] focus:ring-[#01bcc6]'
                  } disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`}
                  style={{
                    borderRadius: `${layout.borderRadius}px`
                  }}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-600">{errors.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="p-6 border-t flex-shrink-0 flex gap-3"
            style={{ 
              borderTopColor: colors.border,
              padding: `${layout.padding.large}px`
            }}
          >
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              disabled={isSubmitting || submitStatus === 'success'}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              loading={isSubmitting}
              className="flex-1"
              style={{
                backgroundColor: submitStatus === 'success' ? '#10b981' : colors.primary,
                color: '#ffffff'
              }}
            >
              {submitStatus === 'success' ? 'Sent!' : isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

