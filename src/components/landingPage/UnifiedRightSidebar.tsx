'use client';

import React, { useEffect } from 'react';
import { useEfficientTemplates } from '@/hooks/use-efficient-templates';
import { useAuth } from '@/hooks/use-auth';
import { icons } from '@/components/ui/Icon';

interface UnifiedRightSidebarProps {
  template?: 'template1' | 'template2';
  className?: string;
}

export default function UnifiedRightSidebar({
  template = 'template1',
  className = ""
}: UnifiedRightSidebarProps) {
  const { user } = useAuth();
  const { getTemplateSync, fetchTemplate } = useEfficientTemplates();
  const templateData = getTemplateSync(template);

  // Fetch template data when component mounts (same as TemplateSelector)
  useEffect(() => {
    if (user && template) {
      console.log('🔄 UnifiedRightSidebar: Fetching template data for:', template);
      fetchTemplate(template).then(() => {
        console.log('✅ UnifiedRightSidebar: Template data fetched successfully for:', template);
      }).catch(error => {
        console.error('❌ UnifiedRightSidebar: Error fetching template:', error);
      });
    }
  }, [user, template, fetchTemplate]);
  
  // Comprehensive template data usage
  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#3b82f6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  
  const typography = templateData?.template?.typography || {
    fontFamily: 'Inter',
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24
    },
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
  
  // Helper function to get font size
  const getFontSize = (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl') => {
    if (typeof typography.fontSize === 'object') {
      return typography.fontSize[size];
    }
    // Fallback sizes if fontSize is a number
    const fallbackSizes = {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24
    };
    return fallbackSizes[size];
  };
  
  const classes = templateData?.template?.classes || {
    heading: {
      h1: 'text-3xl font-bold text-gray-900 mb-4',
      h2: 'text-2xl font-bold text-gray-900 mb-3',
      h3: 'text-xl font-semibold text-gray-900 mb-2',
      h4: 'text-lg font-semibold text-gray-900 mb-2',
      h5: 'text-base font-semibold text-gray-900 mb-2',
      h6: 'text-sm font-semibold text-gray-900 mb-1'
    },
    body: {
      large: 'text-lg text-gray-700 leading-relaxed',
      base: 'text-base text-gray-700 leading-relaxed',
      small: 'text-sm text-gray-600 leading-relaxed',
      xs: 'text-xs text-gray-500 leading-normal'
    }
  };

  return (
    <div 
      className={`rounded-lg border shadow-sm ${className}`}
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        padding: `${layout.padding.large}px`,
        fontFamily: typography.fontFamily
      }}
    >
      {/* Brand Logo */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: `${layout.spacing}px`,
        marginBottom: `${layout.padding.large}px`
      }}>
        <div 
          style={{ 
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${colors.primary}20`
          }}
        >
        <span 
          style={{ 
            color: colors.primary,
            fontSize: getFontSize('lg'),
            fontWeight: typography.fontWeight.bold
          }}
        >
          YB
        </span>
        </div>
        <h3 style={{ 
          color: colors.text,
          fontSize: getFontSize('lg'),
          fontWeight: typography.fontWeight.semibold
        }}>
          Your Brand™
        </h3>
      </div>

      {/* Customer Reviews */}
      <div style={{ marginBottom: `${layout.padding.large}px` }}>
        <h4 style={{ 
          color: colors.text,
          fontSize: getFontSize('base'),
          fontWeight: typography.fontWeight.semibold,
          marginBottom: `${layout.padding.medium}px`
        }}>
          Customer Reviews
        </h4>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: `${layout.spacing}px`
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <span style={{ 
              color: colors.text,
              fontSize: getFontSize('sm'),
              fontWeight: typography.fontWeight.medium
            }}>Google</span>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: `${layout.spacing}px`
            }}>
              <span style={{ color: colors.secondary }}>★★★★★</span>
              <span style={{ 
                color: colors.textSecondary,
                fontSize: getFontSize('xs'),
                fontWeight: typography.fontWeight.normal
              }}>1030 reviews</span>
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <span style={{ 
              color: colors.text,
              fontSize: getFontSize('sm'),
              fontWeight: typography.fontWeight.medium
            }}>Zillow</span>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: `${layout.spacing}px`
            }}>
              <span style={{ color: colors.secondary }}>★★★★★</span>
              <span style={{ 
                color: colors.textSecondary,
                fontSize: getFontSize('xs'),
                fontWeight: typography.fontWeight.normal
              }}>1030 reviews</span>
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <span style={{ 
              color: colors.text,
              fontSize: getFontSize('sm'),
              fontWeight: typography.fontWeight.medium
            }}>X Platform</span>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: `${layout.spacing}px`
            }}>
              <span style={{ color: colors.secondary }}>★★★★★</span>
              <span style={{ 
                color: colors.textSecondary,
                fontSize: getFontSize('xs'),
                fontWeight: typography.fontWeight.normal
              }}>1030 reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div style={{ marginBottom: `${layout.padding.large}px` }}>
        <h4 style={{ 
          color: colors.text,
          fontSize: getFontSize('base'),
          fontWeight: typography.fontWeight.semibold,
          marginBottom: `${layout.padding.medium}px`
        }}>
          Contact Information
        </h4>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: `${layout.spacing}px`
        }}>
          <p style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: `${layout.spacing}px`,
            color: colors.text,
            fontSize: getFontSize('sm'),
            fontWeight: typography.fontWeight.normal
          }}>
            {React.createElement(icons.phone, { size: 16, color: colors.textSecondary })}
            <span>(555) 123-4567</span>
          </p>
          <p style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: `${layout.spacing}px`,
            color: colors.text,
            fontSize: getFontSize('sm'),
            fontWeight: typography.fontWeight.normal
          }}>
            {React.createElement(icons.email, { size: 16, color: colors.textSecondary })}
            <span>info@yourbrand.com</span>
          </p>
          <p style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: `${layout.spacing}px`,
            color: colors.text,
            fontSize: getFontSize('sm'),
            fontWeight: typography.fontWeight.normal
          }}>
            {React.createElement(icons.location, { size: 16, color: colors.textSecondary })}
            <span>123 Main St, City, State 12345</span>
          </p>
        </div>
      </div>

      {/* Follow Us */}
      <div>
        <h4 style={{ 
          color: colors.text,
          fontSize: getFontSize('base'),
          fontWeight: typography.fontWeight.semibold,
          marginBottom: `${layout.padding.medium}px`
        }}>
          Follow Us
        </h4>
        <div style={{ 
          display: 'flex', 
          gap: `${layout.spacing}px`
        }}>
          <div 
            style={{ 
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary,
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {React.createElement(icons.facebook, { size: 16, color: colors.background })}
          </div>
          <div 
            style={{ 
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary,
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {React.createElement(icons.twitter, { size: 16, color: colors.background })}
          </div>
          <div 
            style={{ 
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary,
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {React.createElement(icons.linkedin, { size: 16, color: colors.background })}
          </div>
          <div 
            style={{ 
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary,
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {React.createElement(icons.instagram, { size: 16, color: colors.background })}
          </div>
        </div>
      </div>
    </div>
  );
}
