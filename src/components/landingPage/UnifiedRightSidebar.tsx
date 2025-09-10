'use client';

import React from 'react';
import { typography } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';

interface UnifiedRightSidebarProps {
  template?: 'template1' | 'template2';
  className?: string;
}

export default function UnifiedRightSidebar({
  template = 'template1',
  className = ""
}: UnifiedRightSidebarProps) {
  return (
    <div className={`bg-white border-2 border-pink-200 rounded-lg p-6 ${className}`}>
      {/* Brand Logo */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">YB</span>
        </div>
        <h3 className={`${typography.headings.h4} text-gray-900`}>
          Your Brand™
        </h3>
      </div>

      {/* Customer Reviews */}
      <div className="mb-6">
        <h4 className={`${typography.headings.h5} text-gray-900 mb-4`}>
          Customer Reviews
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Google</span>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">★★★★★</span>
              <span className="text-sm text-gray-600">1030 reviews</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Zillow</span>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">★★★★★</span>
              <span className="text-sm text-gray-600">1030 reviews</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">X Platform</span>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">★★★★★</span>
              <span className="text-sm text-gray-600">1030 reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-6">
        <h4 className={`${typography.headings.h5} text-gray-900 mb-4`}>
          Contact Information
        </h4>
        <div className="space-y-2 text-gray-700">
          <p className="flex items-center space-x-2">
            {React.createElement(icons.phone, { size: 16, className: "text-gray-500" })}
            <span>(555) 123-4567</span>
          </p>
          <p className="flex items-center space-x-2">
            {React.createElement(icons.email, { size: 16, className: "text-gray-500" })}
            <span>info@yourbrand.com</span>
          </p>
          <p className="flex items-center space-x-2">
            {React.createElement(icons.location, { size: 16, className: "text-gray-500" })}
            <span>123 Main St, City, State 12345</span>
          </p>
        </div>
      </div>

      {/* Follow Us */}
      <div>
        <h4 className={`${typography.headings.h5} text-gray-900 mb-4`}>
          Follow Us
        </h4>
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            {React.createElement(icons.facebook, { size: 16, className: "text-white" })}
          </div>
          <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
            {React.createElement(icons.twitter, { size: 16, className: "text-white" })}
          </div>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            {React.createElement(icons.linkedin, { size: 16, className: "text-white" })}
          </div>
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
            {React.createElement(icons.instagram, { size: 16, className: "text-white" })}
          </div>
        </div>
      </div>
    </div>
  );
}
