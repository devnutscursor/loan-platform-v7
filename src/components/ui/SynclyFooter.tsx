'use client';

import React from 'react';
import Icon from './Icon';

interface SynclyFooterProps {
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  companyName?: string;
  tagline?: string;
  copyrightText?: string;
}

export default function SynclyFooter({ 
  className = '',
  backgroundColor = '#005b7c',
  textColor = '#ffffff',
  companyName = 'RateCaddy',
  tagline = 'By Syncly360 CRM',
  copyrightText = '© RateCaddy, Powered by Syncly360 2026, All Rights Reserved'
}: SynclyFooterProps) {
  // Social media URLs - can be customized via props if needed
  const socialLinks = {
    instagram: 'https://www.instagram.com/syncly360?igsh=MXZvbXE2dTZtOTJ5bQ',
    twitter: 'https://x.com/syncly360',
    tiktok: 'https://www.tiktok.com/@syncly360?_t=ZP-90E6r4YzcAZ&_r=1',
    youtube: 'http://www.youtube.com/@Syncly_360',
    facebook: 'https://www.facebook.com/profile.php?id=61578692132756&mibextid=wwXIfr&mibextid=wwXIfr',
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
      className={`py-8 px-4 @sm:px-6 @lg:px-8 ${className}`}
      style={{ backgroundColor }}
    >
      <div className="max-w-7xl mx-auto" style={{ containerType: 'inline-size' }}>
        <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-4 gap-8 mb-8">
          {/* Company Branding */}
          <div className="@lg:col-span-1">
            <h2 className="text-2xl font-bold mb-0" style={{ color: textColor }}>{companyName}</h2>
            <p className="text-sm" style={{ color: textColor }}>{tagline}</p>
            
            {/* Follow Us Section */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: textColor }}>Follow Us</h3>
              <div className="flex gap-3">
                {/* Instagram */}
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Instagram"
                >
                  <Icon name="instagram" size={20} color={textColor} />
                </a>
                
                {/* X (formerly Twitter) */}
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="X"
                >
                  <Icon name="twitter" size={20} color={textColor} />
                </a>
                
                {/* YouTube */}
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="YouTube"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: textColor }}
                  >
                    <path
                      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
                
                {/* Facebook */}
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Facebook"
                >
                  <Icon name="facebook" size={20} color={textColor} />
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
                    style={{ color: textColor }}
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
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: textColor }}>Customer Care</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={customerCareLinks.contact}
                  className="hover:opacity-80 transition-opacity text-sm"
                  style={{ color: textColor }}
                >
                  CONTACT US
                </a>
              </li>
              <li>
                <a
                  href={customerCareLinks.support}
                  className="hover:opacity-80 transition-opacity text-sm"
                  style={{ color: textColor }}
                >
                  SUPPORT
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: textColor }}>Legal</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={legalLinks.privacyPolicy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity text-sm"
                  style={{ color: textColor }}
                >
                  PRIVACY POLICY
                </a>
              </li>
              <li>
                <a
                  href={legalLinks.termsOfService}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity text-sm"
                  style={{ color: textColor }}
                >
                  TERMS OF SERVICE
                </a>
              </li>
              <li>
                <a
                  href={legalLinks.warranty}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity text-sm"
                  style={{ color: textColor }}
                >
                  WARRANTY
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-6 mt-6" style={{ borderColor: `${textColor}33` }}>
          <p className="text-sm text-center" style={{ color: textColor }}>
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}

