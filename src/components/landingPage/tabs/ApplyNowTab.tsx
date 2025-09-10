'use client';

import React, { useState } from 'react';
import { typography } from '@/theme/theme';
import Icon from '@/components/ui/Icon';

interface ApplyNowTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
}

export default function ApplyNowTab({
  selectedTemplate,
  className = ''
}: ApplyNowTabProps) {
  const [applicationType, setApplicationType] = useState<'new' | 'existing'>('new');
  const [showIframe, setShowIframe] = useState(false);

  const getThemeColors = () => {
    return selectedTemplate === 'template1' 
      ? {
          primary: 'pink',
          primaryBg: 'bg-pink-50',
          primaryText: 'text-pink-600',
          primaryBorder: 'border-pink-200',
          primaryHover: 'hover:bg-pink-100',
          primaryButton: 'bg-pink-600 hover:bg-pink-700'
        }
      : {
          primary: 'purple',
          primaryBg: 'bg-purple-50',
          primaryText: 'text-purple-600',
          primaryBorder: 'border-purple-200',
          primaryHover: 'hover:bg-purple-100',
          primaryButton: 'bg-purple-600 hover:bg-purple-700'
        };
  };

  const theme = getThemeColors();

  const handleStartApplication = () => {
    setShowIframe(true);
  };

  const handleExternalRedirect = () => {
    // In a real application, this would redirect to the external loan software
    window.open('https://example-loan-software.com/apply', '_blank');
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h2 className={typography.headings.h4}>
          Apply for Your Loan
        </h2>
        <p className={`${typography.body.base} text-gray-600 mt-2`}>
          Start your loan application process with our secure online platform
        </p>
      </div>

      {!showIframe ? (
        <>
          {/* Application Type Selection */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-8">
            <h3 className={`${typography.headings.h5} mb-6`}>
              Choose Your Application Type
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  applicationType === 'new'
                    ? `${theme.primaryBorder} ${theme.primaryBg}`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setApplicationType('new')}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${theme.primaryBg} rounded-full flex items-center justify-center`}>
                    <Icon name="plus" size={24} className={theme.primaryText} />
                  </div>
                  <div>
                    <h4 className={`${typography.body.small} font-semibold text-gray-900`}>
                      New Application
                    </h4>
                    <p className={`${typography.body.xs} text-gray-600`}>
                      Start a fresh loan application
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  applicationType === 'existing'
                    ? `${theme.primaryBorder} ${theme.primaryBg}`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setApplicationType('existing')}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${theme.primaryBg} rounded-full flex items-center justify-center`}>
                    <Icon name="file-text" size={24} className={theme.primaryText} />
                  </div>
                  <div>
                    <h4 className={`${typography.body.small} font-semibold text-gray-900`}>
                      Continue Application
                    </h4>
                    <p className={`${typography.body.xs} text-gray-600`}>
                      Resume your existing application
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Online Application */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 ${theme.primaryBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon name="laptop" size={32} className={theme.primaryText} />
                </div>
                <h3 className={`${typography.headings.h5} mb-2`}>
                  Online Application
                </h3>
                <p className={`${typography.body.small} text-gray-600`}>
                  Complete your application securely online
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Icon name="check" size={20} className="text-green-500" />
                  <span className={`${typography.body.small} text-gray-700`}>
                    Secure 256-bit SSL encryption
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="check" size={20} className="text-green-500" />
                  <span className={`${typography.body.small} text-gray-700`}>
                    Save and resume anytime
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="check" size={20} className="text-green-500" />
                  <span className={`${typography.body.small} text-gray-700`}>
                    Instant pre-approval
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="check" size={20} className="text-green-500" />
                  <span className={`${typography.body.small} text-gray-700`}>
                    Document upload support
                  </span>
                </div>
              </div>

              <button
                onClick={handleStartApplication}
                className={`w-full ${theme.primaryButton} text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2`}
              >
                <Icon name="arrow-right" size={20} />
                <span>Start Online Application</span>
              </button>
            </div>

            {/* External Application */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="external-link" size={32} className="text-blue-600" />
                </div>
                <h3 className={`${typography.headings.h5} mb-2`}>
                  External Platform
                </h3>
                <p className={`${typography.body.small} text-gray-600`}>
                  Apply through our partner platform
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Icon name="check" size={20} className="text-green-500" />
                  <span className={`${typography.body.small} text-gray-700`}>
                    Advanced loan software
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="check" size={20} className="text-green-500" />
                  <span className={`${typography.body.small} text-gray-700`}>
                    Real-time rate updates
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="check" size={20} className="text-green-500" />
                  <span className={`${typography.body.small} text-gray-700`}>
                    Automated underwriting
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="check" size={20} className="text-green-500" />
                  <span className={`${typography.body.small} text-gray-700`}>
                    Integrated document management
                  </span>
                </div>
              </div>

              <button
                onClick={handleExternalRedirect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="external-link" size={20} />
                <span>Apply on External Platform</span>
              </button>
            </div>
          </div>

          {/* Application Requirements */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            <h3 className={`${typography.headings.h5} mb-6`}>
              What You'll Need
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="user" size={24} className="text-green-600" />
                </div>
                <h4 className={`${typography.body.small} font-semibold text-gray-900 mb-2`}>
                  Personal Info
                </h4>
                <p className={`${typography.body.xs} text-gray-600`}>
                  Name, address, SSN, contact details
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="dollar-sign" size={24} className="text-blue-600" />
                </div>
                <h4 className={`${typography.body.small} font-semibold text-gray-900 mb-2`}>
                  Income Details
                </h4>
                <p className={`${typography.body.xs} text-gray-600`}>
                  Employment, salary, other income sources
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="home" size={24} className="text-purple-600" />
                </div>
                <h4 className={`${typography.body.small} font-semibold text-gray-900 mb-2`}>
                  Property Info
                </h4>
                <p className={`${typography.body.xs} text-gray-600`}>
                  Address, purchase price, down payment
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="file-text" size={24} className="text-orange-600" />
                </div>
                <h4 className={`${typography.body.small} font-semibold text-gray-900 mb-2`}>
                  Documents
                </h4>
                <p className={`${typography.body.xs} text-gray-600`}>
                  ID, pay stubs, bank statements
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 bg-green-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Icon name="shield" size={24} className="text-green-600 mt-1" />
              <div>
                <h3 className={`${typography.body.small} font-semibold text-green-900 mb-2`}>
                  Your Information is Secure
                </h3>
                <p className={`${typography.body.small} text-green-800`}>
                  We use bank-level security to protect your personal and financial information. 
                  All data is encrypted and transmitted securely.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Iframe Application */
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className={`${typography.headings.h6}`}>
              Loan Application
            </h3>
            <button
              onClick={() => setShowIframe(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Icon name="x" size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <Icon name="laptop" size={48} className="text-gray-400 mx-auto mb-4" />
              <h4 className={`${typography.headings.h6} text-gray-600 mb-2`}>
                Application Platform
              </h4>
              <p className={`${typography.body.small} text-gray-500 mb-4`}>
                In a real implementation, this would show an iframe with the loan application software
              </p>
              <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
                <p className={`${typography.body.xs} text-gray-500`}>
                  iframe src="https://loan-application-platform.com/apply" width="100%" height="600px"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
