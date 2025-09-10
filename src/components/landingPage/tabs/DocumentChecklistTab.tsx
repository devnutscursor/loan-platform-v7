'use client';

import React, { useState, useEffect } from 'react';
import { typography, colors, spacing, borderRadius } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';

interface DocumentChecklistTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
}

interface FormData {
  bankruptcy: string;
  employment: string;
  missingTaxReturn: string;
  ownHome: string;
  payingRent: string;
  secondHome: string;
  rentalIncome: string;
  useForLoan: string;
  giftFunds: string;
  divorced: string;
  childSupport: string;
  irsRepay: string;
}

const slides = [
  { id: 0, title: 'Identification & Bankruptcy' },
  { id: 1, title: 'Asset Documentation' },
  { id: 2, title: 'Employment Type' },
  { id: 3, title: 'Home Ownership' },
  { id: 4, title: 'Rental Status' },
  { id: 5, title: 'Second Home' },
  { id: 6, title: 'Rental Income' },
  { id: 7, title: 'Loan Qualification' },
  { id: 8, title: 'Gift Funds' },
  { id: 9, title: 'Divorce Status' },
  { id: 10, title: 'Child Support' },
  { id: 11, title: 'IRS Repayment' },
  { id: 12, title: 'Summary' }
];

export default function DocumentChecklistTab({
  selectedTemplate,
  className = ''
}: DocumentChecklistTabProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    bankruptcy: '',
    employment: '',
    missingTaxReturn: '',
    ownHome: '',
    payingRent: '',
    secondHome: '',
    rentalIncome: '',
    useForLoan: '',
    giftFunds: '',
    divorced: '',
    childSupport: '',
    irsRepay: ''
  });
  const [summary, setSummary] = useState<string>('');

  const getTemplateColors = () => {
    return selectedTemplate === 'template1' 
      ? {
          primary: colors.primary[600],
          primaryBg: colors.primary[50],
          primaryText: colors.primary[600],
          primaryBorder: colors.primary[200],
          primaryHover: colors.primary[100],
          primaryButton: colors.primary[600],
          primaryButtonHover: colors.primary[700]
        }
      : {
          primary: colors.darkPurple[600],
          primaryBg: colors.darkPurple[50],
          primaryText: colors.darkPurple[600],
          primaryBorder: colors.darkPurple[200],
          primaryHover: colors.darkPurple[100],
          primaryButton: colors.darkPurple[600],
          primaryButtonHover: colors.darkPurple[700]
        };
  };

  const theme = getTemplateColors();

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateSlide = (slideIndex: number): boolean => {
    const slide = slides[slideIndex];
    
    switch (slideIndex) {
      case 0: // Identification & Bankruptcy
        return formData.bankruptcy !== '';
      case 1: // Asset Documentation
        return true; // No required fields
      case 2: // Employment Type
        if (formData.employment === '') return false;
        if (formData.employment === 'Self Employed / 1099 Contractor' && formData.missingTaxReturn === '') {
          return false;
        }
        return true;
      case 3: // Home Ownership
        return formData.ownHome !== '';
      case 4: // Rental Status
        return formData.payingRent !== '';
      case 5: // Second Home
        return formData.secondHome !== '';
      case 6: // Rental Income
        return formData.rentalIncome !== '';
      case 7: // Loan Qualification
        return formData.useForLoan !== '';
      case 8: // Gift Funds
        return true; // Optional field
      case 9: // Divorce Status
        return formData.divorced !== '';
      case 10: // Child Support
        return formData.childSupport !== '';
      case 11: // IRS Repayment
        return formData.irsRepay !== '';
      default:
        return true;
    }
  };

  const generateSummary = () => {
    const baseDocs = [
      '2 Bank Statements (2 most recent)',
      '401k & Stock Accounts (2 most recent)',
      "Unexpired Driver's License",
      "Unexpired Passport",
      "Copy of Social Security Card"
    ];

    const conditionalDocs = [];

    if (formData.bankruptcy === 'Yes') {
      conditionalDocs.push('Bankruptcy Docs Showing Discharge Date');
    }

    if (formData.employment === 'Wage Earner') {
      conditionalDocs.push('30 Days Pay Stubs (Most Recent)', '2 Years W-2s (Most Recent)');
    } else if (formData.employment === 'Self Employed / 1099 Contractor') {
      conditionalDocs.push(
        '2 Years Personal Tax Returns (Most Recent)',
        '2 Years Corporate Tax Returns (Most Recent)',
        '2 Years 1099s (Most Recent)',
        'Business License or Corp Filing'
      );
      if (formData.missingTaxReturn === 'Yes') {
        conditionalDocs.push('Audited Profit & Loss Statement', 'Proof of YTD Income', 'CPA or Accountant Letter');
      }
    }

    if (formData.ownHome === 'Yes') {
      conditionalDocs.push('Mortgage Statement', 'Home Insurance w/Declarations and RCE');
    }

    if (formData.payingRent === 'Yes') {
      conditionalDocs.push('Copy of Lease Agreement', '12 Months Rent Receipts / Checks or Bank Statements');
    } else if (formData.payingRent === 'No') {
      conditionalDocs.push('Letter from Borrower Living Rent-Free', 'Letter from Person You\'re Living With');
    }

    if (formData.secondHome === 'Yes') {
      conditionalDocs.push('2nd Home Mortgage Statement', '2nd Home Insurance Docs');
    }

    if (formData.rentalIncome === 'Yes') {
      conditionalDocs.push('Lease Agreements', '12 Months Rent Income Proof');
    }

    if (formData.useForLoan === 'Yes') {
      conditionalDocs.push('Lease Agreements', '12 Months Rent Income Proof');
    }

    if (formData.giftFunds === 'Yes') {
      conditionalDocs.push('Gift Letter', 'Donor Bank Statements Showing Funds');
    }

    if (formData.divorced === 'Yes') {
      conditionalDocs.push('Complete and Final Divorce Decree (all pages)');
    }

    if (formData.childSupport === 'Yes') {
      conditionalDocs.push('Child Support Agreement (all pages)');
    }

    if (formData.irsRepay === 'Yes') {
      conditionalDocs.push('IRS Repayment Agreement or IRS Payoff (all pages)');
    }

    const docs = [...baseDocs, ...conditionalDocs];

    return docs.join('\n• ');
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 2) {
      if (!validateSlide(currentSlide)) {
        alert('Please answer all required questions.');
        return;
      }
      setCurrentSlide(currentSlide + 1);
    } else if (currentSlide === slides.length - 2) {
      if (!validateSlide(currentSlide)) {
        alert('Please answer all required questions.');
        return;
      }
      setSummary(generateSummary());
      setCurrentSlide(currentSlide + 1);
    } else {
      // Reset form
      setFormData({
        bankruptcy: '',
        employment: '',
        missingTaxReturn: '',
        ownHome: '',
        payingRent: '',
        secondHome: '',
        rentalIncome: '',
        useForLoan: '',
        giftFunds: '',
        divorced: '',
        childSupport: '',
        irsRepay: ''
      });
      setSummary('');
      setCurrentSlide(0);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSlide = (slideIndex: number) => {
    switch (slideIndex) {
      case 0: // Identification & Bankruptcy
        return (
          <div style={{ animation: 'fadein 0.2s' }}>
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ 
                fontSize: '1.07em', 
                color: colors.text.primary, 
                display: 'block', 
                marginBottom: spacing.sm,
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                fontWeight: 500
              }}>
                Identification <span style={{ color: colors.red[500] }}>*</span>
              </label>
              <div style={{ marginBottom: spacing.sm }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm, 
                  fontSize: '1.09em', 
                  color: colors.text.primary, 
                  marginBottom: spacing.xs,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility',
                  fontWeight: 400
                }}>
                  <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                  Unexpired Driver's License
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm, 
                  fontSize: '1.09em', 
                  color: colors.text.primary, 
                  marginBottom: spacing.xs,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility',
                  fontWeight: 400
                }}>
                  <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                  Unexpired Passport
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm, 
                  fontSize: '1.09em', 
                  color: colors.text.primary, 
                  marginBottom: spacing.xs,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility',
                  fontWeight: 400
                }}>
                  <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                  Copy of Social Security Card
                </label>
              </div>
              <div style={{ color: '#888', fontSize: '0.96em', paddingLeft: '1.7em', marginBottom: spacing.sm }}>
                Must have two verified forms of ID
              </div>
            </div>
            
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ 
                fontSize: '1.07em', 
                color: colors.text.primary, 
                display: 'block', 
                marginBottom: spacing.sm,
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                fontWeight: 500
              }}>
                Have you filed for Bankruptcy? <span style={{ color: colors.red[500] }}>*</span>
              </label>
              <div>
                <label style={{ display: 'block', fontSize: '1.06em', margin: '4px 0' }}>
                  <input 
                    type="radio" 
                    name="bankruptcy" 
                    value="Yes" 
                    checked={formData.bankruptcy === 'Yes'}
                    onChange={(e) => updateFormData('bankruptcy', e.target.value)}
                    style={{ marginRight: spacing.sm }}
                  />
                  Yes
                </label>
                <label style={{ display: 'block', fontSize: '1.06em', margin: '4px 0' }}>
                  <input 
                    type="radio" 
                    name="bankruptcy" 
                    value="No" 
                    checked={formData.bankruptcy === 'No'}
                    onChange={(e) => updateFormData('bankruptcy', e.target.value)}
                    style={{ marginRight: spacing.sm }}
                  />
                  No
                </label>
              </div>
            </div>
            
            {formData.bankruptcy === 'Yes' && (
              <div style={{ marginTop: spacing.sm, marginBottom: spacing.md, backgroundColor: '#f7f8fa', borderRadius: '6px', padding: `${spacing.md} ${spacing.lg} ${spacing.sm} ${spacing.sm}` }}>
                <label style={{ fontWeight: 500, fontSize: '1.07em', color: colors.text.primary, marginBottom: spacing.sm }}>
                  Please attach the following bankruptcy documents:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: '1.09em', color: colors.text.primary, marginBottom: spacing.xs, opacity: 0.6 }}>
                  <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                  Bankruptcy Docs Showing Discharge Date
                </div>
              </div>
            )}
          </div>
        );

      case 1: // Asset Documentation
        return (
          <div style={{ animation: 'fadein 0.2s' }}>
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ 
                fontSize: '1.07em', 
                color: colors.text.primary, 
                display: 'block', 
                marginBottom: spacing.sm,
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                fontWeight: 500
              }}>
                Asset Documentation (required) <span style={{ color: colors.red[500] }}>*</span>
              </label>
              <div style={{ marginBottom: spacing.sm }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm, 
                  fontSize: '1.09em', 
                  color: colors.text.primary, 
                  marginBottom: spacing.xs,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility',
                  fontWeight: 400
                }}>
                  <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                  2 Bank Statements (2 most recent)
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm, 
                  fontSize: '1.09em', 
                  color: colors.text.primary, 
                  marginBottom: spacing.xs,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility',
                  fontWeight: 400
                }}>
                  <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                  401k & Stock Accounts (2 most recent)
                </label>
              </div>
              <div style={{ color: '#666', fontSize: '0.97em', paddingLeft: '1.6em', marginTop: '2px' }}>
                Please attach all of the above. Must cover most recent 60 days
              </div>
            </div>
          </div>
        );

      case 2: // Employment Type
        return (
          <div style={{ animation: 'fadein 0.2s' }}>
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ 
                fontSize: '1.07em', 
                color: colors.text.primary, 
                display: 'block', 
                marginBottom: spacing.sm,
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                fontWeight: 500
              }}>
                What Best Describes Your Employment? <span style={{ color: colors.red[500] }}>*</span>
              </label>
              <div>
                <label style={{ display: 'block', fontSize: '1.06em', margin: '4px 0' }}>
                  <input 
                    type="radio" 
                    name="employment" 
                    value="Wage Earner" 
                    checked={formData.employment === 'Wage Earner'}
                    onChange={(e) => updateFormData('employment', e.target.value)}
                    style={{ marginRight: spacing.sm }}
                  />
                  Wage Earner
                </label>
                <label style={{ display: 'block', fontSize: '1.06em', margin: '4px 0' }}>
                  <input 
                    type="radio" 
                    name="employment" 
                    value="Self Employed / 1099 Contractor" 
                    checked={formData.employment === 'Self Employed / 1099 Contractor'}
                    onChange={(e) => updateFormData('employment', e.target.value)}
                    style={{ marginRight: spacing.sm }}
                  />
                  Self Employed / 1099 Contractor
                </label>
              </div>
            </div>

            {formData.employment === 'Wage Earner' && (
              <div style={{ marginTop: spacing.sm, marginBottom: spacing.md, backgroundColor: '#f7f8fa', borderRadius: '6px', padding: `${spacing.md} ${spacing.lg} ${spacing.sm} ${spacing.sm}` }}>
                <label style={{ fontWeight: 500, fontSize: '1.07em', color: colors.text.primary, marginBottom: spacing.sm }}>
                  Please provide ALL of the following:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: '1.09em', color: colors.text.primary, marginBottom: spacing.xs, opacity: 0.6 }}>
                  <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                  30 Days Pay Stubs (Most Recent)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: '1.09em', color: colors.text.primary, marginBottom: spacing.xs, opacity: 0.6 }}>
                  <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                  2 Years W-2s (Most Recent)
                </div>
              </div>
            )}

            {formData.employment === 'Self Employed / 1099 Contractor' && (
              <>
                <div style={{ marginTop: spacing.sm, marginBottom: spacing.md, backgroundColor: '#f7f8fa', borderRadius: '6px', padding: `${spacing.md} ${spacing.lg} ${spacing.sm} ${spacing.sm}` }}>
                  <label style={{ fontWeight: 500, fontSize: '1.07em', color: colors.text.primary, marginBottom: spacing.sm }}>
                    Please provide ALL of the following:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: '1.09em', color: colors.text.primary, marginBottom: spacing.xs, opacity: 0.6 }}>
                    <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                    2 Years Personal Tax Returns (Most Recent)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: '1.09em', color: colors.text.primary, marginBottom: spacing.xs, opacity: 0.6 }}>
                    <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                    2 Years Corporate Tax Returns (Most Recent)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: '1.09em', color: colors.text.primary, marginBottom: spacing.xs, opacity: 0.6 }}>
                    <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                    2 Years 1099s (Most Recent)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: '1.09em', color: colors.text.primary, marginBottom: spacing.xs, opacity: 0.6 }}>
                    <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                    Business License or Corp Filing
                  </div>
                </div>

                <div style={{ marginBottom: spacing.lg }}>
                  <label style={{ 
                fontSize: '1.07em', 
                color: colors.text.primary, 
                display: 'block', 
                marginBottom: spacing.sm,
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                fontWeight: 500
              }}>
                    Are you missing any business tax returns? <span style={{ color: colors.red[500] }}>*</span>
                  </label>
                  <select 
                    value={formData.missingTaxReturn}
                    onChange={(e) => updateFormData('missingTaxReturn', e.target.value)}
                    style={{ width: '100%', padding: spacing.sm, borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em', marginBottom: spacing.sm, background: '#fcfcfd' }}
                  >
                    <option value="" disabled>Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {formData.missingTaxReturn === 'Yes' && (
                  <div style={{ marginTop: spacing.sm, marginBottom: spacing.md, backgroundColor: '#f7f8fa', borderRadius: '6px', padding: `${spacing.md} ${spacing.lg} ${spacing.sm} ${spacing.sm}` }}>
                    <label style={{ fontWeight: 500, fontSize: '1.07em', color: colors.text.primary, marginBottom: spacing.sm }}>
                      Please provide ALL of the following:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: '1.09em', color: colors.text.primary, marginBottom: spacing.xs, opacity: 0.6 }}>
                      <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                      Audited Profit & Loss Statement
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: '1.09em', color: colors.text.primary, marginBottom: spacing.xs, opacity: 0.6 }}>
                      <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                      Proof of YTD Income
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: '1.09em', color: colors.text.primary, marginBottom: spacing.xs, opacity: 0.6 }}>
                      <input type="checkbox" checked disabled style={{ accentColor: '#1976d2', width: '20px', height: '20px', marginRight: spacing.sm, cursor: 'not-allowed', pointerEvents: 'none' }} />
                      CPA or Accountant Letter
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 12: // Summary
        return (
          <div style={{ animation: 'fadein 0.2s' }}>
            <div style={{ backgroundColor: '#fafeff', marginTop: spacing.lg, padding: `${spacing.lg} ${spacing.lg} ${spacing.xl} ${spacing.lg}`, borderRadius: '8px', border: '1px solid #e3eaf2', fontSize: '1.04em', position: 'relative' }}>
              <h3 style={{ fontSize: '1.2em', fontWeight: 600, marginBottom: spacing.md, color: colors.text.primary }}>
                Your Required Documents:
              </h3>
              <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6', color: colors.text.primary }}>
                • {summary}
              </div>
            </div>
            <button 
              type="button" 
              onClick={handlePrint}
              style={{ 
                background: '#0082e5', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '5px', 
                fontSize: '1.06em', 
                fontWeight: 600, 
                padding: `${spacing.sm} ${spacing.lg}`, 
                cursor: 'pointer', 
                marginLeft: 'auto', 
                marginRight: 0, 
                marginTop: spacing.lg, 
                display: 'block',
                transition: 'background 0.18s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#0360ad'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#0082e5'}
            >
              Print / Save Checklist
            </button>
          </div>
        );

      default:
        return (
          <div style={{ animation: 'fadein 0.2s' }}>
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ 
                fontSize: '1.07em', 
                color: colors.text.primary, 
                display: 'block', 
                marginBottom: spacing.sm,
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                fontWeight: 500
              }}>
                {slides[slideIndex]?.title} <span style={{ color: colors.red[500] }}>*</span>
              </label>
              <select 
                value={formData[slides[slideIndex]?.title.toLowerCase().replace(/\s+/g, '') as keyof FormData] || ''}
                onChange={(e) => updateFormData(slides[slideIndex]?.title.toLowerCase().replace(/\s+/g, '') as keyof FormData, e.target.value)}
                style={{ width: '100%', padding: spacing.sm, borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em', marginBottom: spacing.sm, background: '#fcfcfd' }}
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`w-full ${className}`} style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', padding: spacing.lg }}>
      <div style={{ 
        background: '#fff', 
        maxWidth: '600px', 
        margin: '20px auto', 
        borderRadius: '13px', 
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.14)', 
        padding: `${spacing.xl} ${spacing.xl} ${spacing.lg} ${spacing.xl}`, 
        minHeight: '400px', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <h2 style={{ 
          color: colors.text.primary, 
          fontWeight: 600, 
          marginBottom: spacing.lg, 
          fontSize: '1.5em',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility'
        }}>
          Loan Document Checklist
        </h2>
        
        <div style={{ flexGrow: 1 }}>
          {renderSlide(currentSlide)}
        </div>
      </div>

      {/* Footer Navigation */}
      <div style={{ 
        background: '#0082e5', 
        height: '56px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'stretch', 
        boxShadow: '0 -2px 10px rgba(34, 34, 120, 0.13)', 
        marginTop: 'auto', 
        borderRadius: '0 0 13px 13px', 
        userSelect: 'none', 
        maxWidth: '600px', 
        marginLeft: 'auto', 
        marginRight: 'auto', 
        position: 'relative', 
        bottom: 0, 
        width: '100%' 
      }}>
        <button 
          type="button" 
          onClick={handlePrev}
          disabled={currentSlide === 0}
          style={{ 
            flex: 1, 
            border: 'none', 
            background: 'none', 
            fontSize: '1.06em', 
            fontWeight: 600, 
            color: currentSlide === 0 ? '#bbd7f7' : '#fff', 
            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer', 
            transition: 'background 0.14s',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            if (currentSlide !== 0) {
              e.currentTarget.style.background = '#0360ad';
            }
          }}
          onMouseLeave={(e) => {
            if (currentSlide !== 0) {
              e.currentTarget.style.background = 'none';
            }
          }}
        >
          ← PREV
        </button>
        <button 
          type="button" 
          onClick={handleNext}
          style={{ 
            flex: 1, 
            border: 'none', 
            background: 'none', 
            fontSize: '1.06em', 
            fontWeight: 600, 
            color: '#fff', 
            cursor: 'pointer', 
            transition: 'background 0.14s',
            outline: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#0360ad'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          {currentSlide < slides.length - 2 ? 'NEXT →' : currentSlide === slides.length - 2 ? 'SUBMIT →' : '← START OVER'}
        </button>
      </div>

      <style jsx>{`
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media print {
          body, html {
            background: #fff !important;
          }
          .footer, .footer-btn, #footerNav {
            display: none !important;
          }
          #summary {
            border: none;
            margin: 0;
            box-shadow: none;
            background: #fff !important;
            padding: 0;
          }
          .container {
            box-shadow: none;
            border-radius: 0;
            padding: 0;
          }
          .print-btn {
            display: none !important;
          }
        }
        @media (max-width: 600px) {
          .container {
            padding: 22px 2vw 28px 2vw;
            max-width: 100vw;
            border-radius: 0;
            box-shadow: none;
          }
          .footer {
            height: 50px;
            max-width: 100vw;
            border-radius: 0;
          }
          .footer-btn {
            font-size: 0.95em;
          }
          #summary {
            padding: 14px 5px 28px 5px;
          }
        }
      `}</style>
    </div>
  );
}
