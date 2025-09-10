'use client';

import React from 'react';
import { typography } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';

interface UnifiedHeaderProps {
  websiteName?: string;
  navigationItems?: string[];
  template?: 'template1' | 'template2';
  className?: string;
}

export default function UnifiedHeader({ 
  websiteName = "YOUR WEBSITE",
  navigationItems = ["Home", "About", "Contact"],
  template = 'template1',
  className = ""
}: UnifiedHeaderProps) {
  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              {/* Pink Asterisk Logo */}
              <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                {React.createElement(icons.asterisk, { 
                  size: 20, 
                  className: "text-white" 
                })}
              </div>
              
              {/* Website Name */}
              <h1 className={typography.headings.h5}>
                {websiteName}
              </h1>
            </div>
          </div>

          {/* Navigation Menu - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 p-2 rounded-md"
              aria-label="Open menu"
            >
              {React.createElement(icons.menu, { 
                size: 24, 
                className: "text-gray-600" 
              })}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
