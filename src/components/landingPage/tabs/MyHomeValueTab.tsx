'use client';

import React, { useState } from 'react';
import { typography } from '@/theme/theme';
import Icon from '@/components/ui/Icon';

interface MyHomeValueTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
}

export default function MyHomeValueTab({
  selectedTemplate,
  className = ''
}: MyHomeValueTabProps) {
  const [address, setAddress] = useState('');
  const [showIframe, setShowIframe] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);

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

  const handleGetEstimate = () => {
    // Simulate getting an estimate
    setEstimatedValue(450000);
    setShowIframe(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h2 className={typography.headings.h4}>
          My Home Value
        </h2>
        <p className={`${typography.body.base} text-gray-600 mt-2`}>
          Get an instant estimate of your property's current market value
        </p>
      </div>

      {!showIframe ? (
        <>
          {/* Address Input */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-8">
            <h3 className={`${typography.headings.h5} mb-6`}>
              Enter Your Property Address
            </h3>
            
            <div className="max-w-2xl">
              <div className="mb-4">
                <label htmlFor="address" className={`block ${typography.body.small} font-medium text-gray-700 mb-2`}>
                  Property Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full address..."
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent`}
                />
              </div>
              
              <button
                onClick={handleGetEstimate}
                disabled={!address.trim()}
                className={`${theme.primaryButton} text-white py-3 px-6 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Icon name="search" size={20} />
                <span>Get Home Value Estimate</span>
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 ${theme.primaryBg} rounded-full flex items-center justify-center`}>
                  <Icon name="zap" size={24} className={theme.primaryText} />
                </div>
                <div>
                  <h3 className={`${typography.body.small} font-semibold text-gray-900`}>
                    Instant Results
                  </h3>
                  <p className={`${typography.body.xs} text-gray-600`}>
                    Get your estimate in seconds
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="map" size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className={`${typography.body.small} font-semibold text-gray-900`}>
                    Local Market Data
                  </h3>
                  <p className={`${typography.body.xs} text-gray-600`}>
                    Based on recent sales in your area
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="shield" size={24} className="text-green-600" />
                </div>
                <div>
                  <h3 className={`${typography.body.small} font-semibold text-gray-900`}>
                    No Obligation
                  </h3>
                  <p className={`${typography.body.xs} text-gray-600`}>
                    Free estimate with no strings attached
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            <h3 className={`${typography.headings.h5} mb-6`}>
              How Our Home Value Tool Works
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className={`${typography.headings.h5} text-gray-600`}>1</span>
                </div>
                <h4 className={`${typography.body.small} font-semibold text-gray-900 mb-2`}>
                  Enter Address
                </h4>
                <p className={`${typography.body.xs} text-gray-600`}>
                  Provide your property's full address
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className={`${typography.headings.h5} text-gray-600`}>2</span>
                </div>
                <h4 className={`${typography.body.small} font-semibold text-gray-900 mb-2`}>
                  Analyze Data
                </h4>
                <p className={`${typography.body.xs} text-gray-600`}>
                  We analyze recent sales and market trends
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className={`${typography.headings.h5} text-gray-600`}>3</span>
                </div>
                <h4 className={`${typography.body.small} font-semibold text-gray-900 mb-2`}>
                  Generate Estimate
                </h4>
                <p className={`${typography.body.xs} text-gray-600`}>
                  Our algorithm calculates your home's value
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className={`${typography.headings.h5} text-gray-600`}>4</span>
                </div>
                <h4 className={`${typography.body.small} font-semibold text-gray-900 mb-2`}>
                  View Results
                </h4>
                <p className={`${typography.body.xs} text-gray-600`}>
                  See detailed valuation and market insights
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 bg-yellow-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Icon name="alert-triangle" size={24} className="text-yellow-600 mt-1" />
              <div>
                <h3 className={`${typography.body.small} font-semibold text-yellow-900 mb-2`}>
                  Important Disclaimer
                </h3>
                <p className={`${typography.body.small} text-yellow-800`}>
                  This is an automated estimate based on publicly available data and recent sales in your area. 
                  For an accurate valuation, we recommend a professional appraisal or consultation with a real estate agent.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Iframe Home Value Tool */
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className={`${typography.headings.h6}`}>
                Home Value Estimate
              </h3>
              <p className={`${typography.body.xs} text-gray-600`}>
                {address}
              </p>
            </div>
            <button
              onClick={() => setShowIframe(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Icon name="x" size={24} />
            </button>
          </div>
          
          <div className="p-6">
            {/* Estimated Value Display */}
            {estimatedValue && (
              <div className="bg-green-50 rounded-lg p-6 mb-6 text-center">
                <h4 className={`${typography.headings.h4} text-green-800 mb-2`}>
                  Estimated Value
                </h4>
                <p className={`${typography.headings.h3} text-green-900 font-bold`}>
                  {formatCurrency(estimatedValue)}
                </p>
                <p className={`${typography.body.xs} text-green-700 mt-2`}>
                  Based on recent sales and market data in your area
                </p>
              </div>
            )}

            {/* Iframe Placeholder */}
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <Icon name="home" size={48} className="text-gray-400 mx-auto mb-4" />
              <h4 className={`${typography.headings.h6} text-gray-600 mb-2`}>
                Home Value Tool
              </h4>
              <p className={`${typography.body.small} text-gray-500 mb-4`}>
                In a real implementation, this would show an iframe with the home value estimation tool
              </p>
              <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
                <p className={`${typography.body.xs} text-gray-500`}>
                  iframe src="https://home-value-tool.com/estimate" width="100%" height="500px"
                </p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className={`${typography.body.small} font-semibold text-blue-900 mb-2`}>
                  Market Trends
                </h5>
                <p className={`${typography.body.xs} text-blue-800`}>
                  Home values in your area have increased by 5.2% over the past year.
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h5 className={`${typography.body.small} font-semibold text-purple-900 mb-2`}>
                  Comparable Sales
                </h5>
                <p className={`${typography.body.xs} text-purple-800`}>
                  Based on 12 similar properties sold in the last 6 months.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
