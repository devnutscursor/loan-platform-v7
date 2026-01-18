'use client';

import React from 'react';
import Icon from './Icon';

interface SynclyFooterProps {
  className?: string;
}

export default function SynclyFooter({ className = '' }: SynclyFooterProps) {
  // Social media URLs - can be customized via props if needed
  const socialLinks = {
    instagram: 'https://instagram.com/syncly360',
    twitter: 'https://twitter.com/syncly360',
    tiktok: 'https://tiktok.com/@syncly360',
  };

  // Customer care links - can be customized
  const customerCareLinks = {
    contact: 'mailto:support@syncly360.com',
    support: 'mailto:support@syncly360.com',
  };

  // Legal links
  const legalLinks = {
    privacyPolicy: 'https://syncly360.com/privacypolicy',
    termsOfService: 'https://syncly360.com/termsofservice',
    warranty: 'https://syncly360.com/warranty',
  };

  return (
    <footer 
      className={`bg-[#101628] text-white py-8 px-4 @sm:px-6 @lg:px-8 ${className}`}
      style={{ backgroundColor: '#1e3a5f' }}
    >
      <div className="max-w-7xl mx-auto" style={{ containerType: 'inline-size' }}>
        <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-4 gap-8 mb-8">
          {/* Company Branding */}
          <div className="@lg:col-span-1">
            <h2 className="text-2xl font-bold text-[#70a3f3] mb-4">RateCaddy</h2>
            
            {/* Follow Us Section */}
            <div className="mt-6">
              <h3 className="text-sm text-[#70a3f3] font-semibold mb-3 uppercase tracking-wide">Follow Us</h3>
              <div className="flex gap-3">
                {/* Instagram */}
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Instagram"
                >
                  <Icon name="instagram" size={20} color="#ffffff" />
                </a>
                
                {/* X (Twitter) */}
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="X (Twitter)"
                >
                  <Icon name="twitter" size={20} color="#ffffff" />
                </a>
                
                
                {/* TikTok */}
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="TikTok"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white"
                  >
                    <path
                      d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Customer Care Section */}
          <div>
            <h3 className="text-sm text-[#70a3f3] font-semibold mb-3 uppercase tracking-wide">Customer Care</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={customerCareLinks.contact}
                  className="text-white hover:opacity-80 transition-opacity text-sm"
                >
                  CONTACT US
                </a>
              </li>
              <li>
                <a
                  href={customerCareLinks.support}
                  className="text-white hover:opacity-80 transition-opacity text-sm"
                >
                  SUPPORT
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-sm text-[#70a3f3] font-semibold mb-3 uppercase tracking-wide">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={legalLinks.privacyPolicy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-80 transition-opacity text-sm"
                >
                  PRIVACY POLICY
                </a>
              </li>
              <li>
                <a
                  href={legalLinks.termsOfService}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-80 transition-opacity text-sm"
                >
                  TERMS OF SERVICE
                </a>
              </li>
              <li>
                <a
                  href={legalLinks.warranty}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-80 transition-opacity text-sm"
                >
                  WARRANTY
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-6 mt-6">
          <p className="text-sm text-center text-white/90">
            © RateCaddy 2026, All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}

