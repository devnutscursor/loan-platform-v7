'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { typography, colors, spacing, borderRadius, shadows } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanProduct: {
    id: string;
    lenderName: string;
    loanProgram: string;
    loanType: string;
    loanTerm: number;
    interestRate: number;
    apr: number;
    monthlyPayment: number;
    fees: number;
    points: number;
    credits: number;
    lockPeriod: number;
  };
  onSubmit: (leadData: LeadData) => Promise<void>;
}

export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  creditScore: string;
  loanDetails: {
    productId: string;
    lenderName: string;
    loanProgram: string;
    loanType: string;
    loanTerm: number;
    interestRate: number;
    apr: number;
    monthlyPayment: number;
    fees: number;
    points: number;
    credits: number;
    lockPeriod: number;
  };
}

export default function LeadCaptureModal({ 
  isOpen, 
  onClose, 
  loanProduct, 
  onSubmit 
}: LeadCaptureModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    creditScore: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
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
    
    try {
      console.log('🔍 LeadCaptureModal - loanProduct:', loanProduct);
      
      const leadData: LeadData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        creditScore: formData.creditScore.trim(),
        loanDetails: {
          productId: loanProduct.id,
          lenderName: loanProduct.lenderName,
          loanProgram: loanProduct.loanProgram,
          loanType: loanProduct.loanType,
          loanTerm: loanProduct.loanTerm,
          interestRate: loanProduct.interestRate,
          apr: loanProduct.apr,
          monthlyPayment: loanProduct.monthlyPayment,
          fees: loanProduct.fees,
          points: loanProduct.points,
          credits: loanProduct.credits,
          lockPeriod: loanProduct.lockPeriod,
        }
      };
      
      console.log('🔍 LeadCaptureModal - leadData:', leadData);
      
      await onSubmit(leadData);
      
      // Reset form and close modal on success
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        creditScore: '',
      });
      onClose();
      
    } catch (error) {
      console.error('Error submitting lead:', error);
      setErrors({ submit: 'Failed to submit your information. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        creditScore: '',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: spacing[4]
        }}>
          <div style={{
            backgroundColor: colors.white,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.xl,
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{
              padding: spacing[6],
              borderBottom: `1px solid ${colors.gray[200]}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h2 style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.gray[900],
                    marginBottom: spacing[1]
                  }}>
                    Get Started
                  </h2>
                  <p style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.gray[600]
                  }}>
                    Complete your information to get started with this loan
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    padding: spacing[2],
                    borderRadius: borderRadius.md,
                    color: colors.gray[400],
                    fontSize: '20px'
                  }}
                >
                  {React.createElement(icons.close, { size: 20 })}
                </button>
              </div>
            </div>

            {/* Loan Product Summary */}
            <div style={{
              padding: spacing[4],
              backgroundColor: colors.blue[50],
              borderBottom: `1px solid ${colors.gray[200]}`
            }}>
              <h3 style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[900],
                marginBottom: spacing[2]
              }}>
                Selected Loan Product
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: spacing[2],
                fontSize: typography.fontSize.sm
              }}>
                <div>
                  <span style={{ color: colors.gray[600] }}>Lender:</span>
                  <span style={{ color: colors.gray[900], fontWeight: typography.fontWeight.medium, marginLeft: spacing[1] }}>
                    {loanProduct.lenderName}
                  </span>
                </div>
                <div>
                  <span style={{ color: colors.gray[600] }}>Program:</span>
                  <span style={{ color: colors.gray[900], fontWeight: typography.fontWeight.medium, marginLeft: spacing[1] }}>
                    {loanProduct.loanProgram}
                  </span>
                </div>
                <div>
                  <span style={{ color: colors.gray[600] }}>Rate:</span>
                  <span style={{ color: colors.gray[900], fontWeight: typography.fontWeight.medium, marginLeft: spacing[1] }}>
                    {loanProduct.interestRate.toFixed(3)}%
                  </span>
                </div>
                <div>
                  <span style={{ color: colors.gray[600] }}>Monthly Payment:</span>
                  <span style={{ color: colors.gray[900], fontWeight: typography.fontWeight.medium, marginLeft: spacing[1] }}>
                    ${loanProduct.monthlyPayment.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: spacing[6] }}>
              <div style={{ marginBottom: spacing[6] }}>
                <h3 style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.gray[900],
                  marginBottom: spacing[4]
                }}>
                  Your Information
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: spacing[4],
                  marginBottom: spacing[4]
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.gray[700],
                      marginBottom: spacing[1]
                    }}>
                      First Name *
                    </label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      error={errors.firstName || undefined}
                      disabled={isSubmitting}
                    />
                    {errors.firstName && (
                      <p style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.red[600],
                        marginTop: spacing[1]
                      }}>
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.gray[700],
                      marginBottom: spacing[1]
                    }}>
                      Last Name *
                    </label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      error={errors.lastName || undefined}
                      disabled={isSubmitting}
                    />
                    {errors.lastName && (
                      <p style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.red[600],
                        marginTop: spacing[1]
                      }}>
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
                
                <div style={{ marginBottom: spacing[4] }}>
                  <label style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.gray[700],
                    marginBottom: spacing[1]
                  }}>
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    error={errors.email || undefined}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.red[600],
                      marginTop: spacing[1]
                    }}>
                      {errors.email}
                    </p>
                  )}
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.gray[700],
                    marginBottom: spacing[1]
                  }}>
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    error={errors.phone || undefined}
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.red[600],
                      marginTop: spacing[1]
                    }}>
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.gray[700],
                  marginBottom: spacing[1]
                }}>
                  Credit Score (Optional)
                </label>
                <Input
                  type="text"
                  name="creditScore"
                  value={formData.creditScore}
                  onChange={handleInputChange}
                  placeholder="e.g., 750 or 700-750"
                  error={errors.creditScore || undefined}
                  disabled={isSubmitting}
                />
                {errors.creditScore && (
                  <p style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.red[600],
                    marginTop: spacing[1]
                  }}>
                    {errors.creditScore}
                  </p>
                )}
              </div>

              {errors.submit && (
                <div style={{
                  padding: spacing[3],
                  backgroundColor: colors.red[50],
                  border: `1px solid ${colors.red[200]}`,
                  borderRadius: borderRadius.md,
                  marginBottom: spacing[4]
                }}>
                  <p style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.red[600]
                  }}>
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: spacing[3]
              }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Get Started'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
