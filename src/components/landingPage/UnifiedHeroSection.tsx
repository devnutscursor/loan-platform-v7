'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useEfficientTemplates } from '@/hooks/use-efficient-templates';
import { icons } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/use-auth';
import { useProfileCache, type LoanOfficerProfile } from '@/hooks/use-profile-cache';

interface UnifiedHeroSectionProps {
  officerName?: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  template?: 'template1' | 'template2';
  className?: string;
}

export default function UnifiedHeroSection({
  officerName,
  phone,
  email,
  profileImage,
  template = 'template1',
  className = ""
}: UnifiedHeroSectionProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading, error, getProfile } = useProfileCache();

  useEffect(() => {
    // Only fetch profile if we don't have the required props
    if (!officerName || !email) {
      console.log('🔄 UnifiedHeroSection: Fetching profile data');
      getProfile(user, authLoading);
    } else {
      console.log('✅ UnifiedHeroSection: Using provided props, skipping profile fetch');
    }
  }, [user, authLoading, getProfile, officerName, email]);

  // Use props if provided, otherwise use fetched data
  const displayName = officerName || `${profile?.firstName || 'User'} ${profile?.lastName || 'Smith'}`;
  const displayPhone = phone || profile?.phone || null; // Only show if exists in database
  const displayEmail = email || profile?.email || 'user@example.com';
  const displayImage = profileImage || profile?.avatar || 'data:image/jpeg;base64,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';

  // Debug logging
  console.log('🎨 Display values:', {
    displayName,
    displayPhone,
    displayEmail,
    profile: profile,
    user: user?.email
  });

  const { getTemplateSync, fetchTemplate } = useEfficientTemplates();
  const templateData = getTemplateSync(template);

  // Fetch template data when component mounts (same as TemplateSelector)
  useEffect(() => {
    if (user && template) {
      console.log('🔄 UnifiedHeroSection: Fetching template data for:', template);
      fetchTemplate(template).then(() => {
        console.log('✅ UnifiedHeroSection: Template data fetched successfully for:', template);
      }).catch(error => {
        console.error('❌ UnifiedHeroSection: Error fetching template:', error);
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
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48
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
  
  const classes = templateData?.template?.classes || {
    button: {
      primary: 'px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-gray-300'
    },
    hero: {
      background: 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600',
      overlay: 'bg-black/20'
    }
  };
  
  // Helper function to get font size
  const getFontSize = (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl') => {
    if (typeof typography.fontSize === 'object') {
      return typography.fontSize[size];
    }
    // Fallback sizes if fontSize is a number
    const fallbackSizes = {
      xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48
    };
    return fallbackSizes[size];
  };
  

  // Show loading state
  if (loading) {
    return (
      <section 
        className={`relative overflow-hidden ${className}`}
        style={{ fontFamily: typography.fontFamily }}
      >
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: colors.secondary }}
        />
        <div 
          className="relative"
          style={{ padding: `${layout.padding.xlarge * 2}px 0` }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className="flex flex-col lg:flex-row items-center lg:items-start"
              style={{ gap: `${layout.padding.xlarge}px` }}
            >
              <div className="flex-shrink-0">
                <div 
                  className="rounded-full animate-pulse"
                  style={{ 
                    width: '160px', 
                    height: '160px', 
                    backgroundColor: `${colors.background}30` 
                  }}
                />
              </div>
              <div 
                className="text-center lg:text-left"
                style={{ 
                  color: colors.background,
                  fontSize: getFontSize('base'),
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${layout.spacing}px`
                }}
              >
                <div 
                  className="rounded animate-pulse"
                  style={{ 
                    height: '48px', 
                    backgroundColor: `${colors.background}30` 
                  }}
                />
                <div 
                  className="rounded animate-pulse"
                  style={{ 
                    height: '24px', 
                    width: '50%',
                    backgroundColor: `${colors.background}30` 
                  }}
                />
                <div 
                  className="rounded animate-pulse"
                  style={{ 
                    height: '32px', 
                    width: '33%',
                    backgroundColor: `${colors.background}30` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={`relative overflow-hidden ${className}`}
      style={{ fontFamily: typography.fontFamily }}
    >
      {/* Enhanced Background with Database Secondary Color */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: colors.secondary }}
      />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M50 10c22.091 0 40 17.909 40 40s-17.909 40-40 40S10 72.091 10 50 27.909 10 50 10zm0 5c19.33 0 35 15.67 35 35s-15.67 35-35 35S15 69.33 15 50 30.67 15 50 15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute rounded-full animate-bounce"
          style={{ 
            top: '40px', 
            left: '40px', 
            width: '80px', 
            height: '80px', 
            backgroundColor: `${colors.background}05`,
            animationDelay: '0s', 
            animationDuration: '3s' 
          }}
        />
        <div 
          className="absolute rounded-full animate-bounce"
          style={{ 
            top: '80px', 
            right: '80px', 
            width: '64px', 
            height: '64px', 
            backgroundColor: `${colors.background}05`,
            animationDelay: '1s', 
            animationDuration: '4s' 
          }}
        />
        <div 
          className="absolute rounded-full animate-bounce"
          style={{ 
            bottom: '80px', 
            left: '80px', 
            width: '48px', 
            height: '48px', 
            backgroundColor: `${colors.background}05`,
            animationDelay: '2s', 
            animationDuration: '5s' 
          }}
        />
      </div>
      
      {/* Content Container */}
      <div 
        className="relative"
        style={{ padding: `${layout.padding.xlarge * 2}px 0` }}
      >

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="flex flex-col lg:flex-row items-center justify-between"
          style={{ gap: `${layout.padding.xlarge}px` }}
        >
          {/* Left Side - Enhanced Profile Information */}
          <div 
            className="flex flex-col lg:flex-row items-center lg:items-start"
            style={{ gap: `${layout.padding.xlarge}px` }}
          >
            {/* Enhanced Profile Photo with Glow Effect */}
            <div className="flex-shrink-0 relative group">
              <div 
                className="absolute inset-0 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"
                style={{ 
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`
                }}
              />
              <div 
                className="relative rounded-full shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                style={{ 
                  width: '160px', 
                  height: '160px', 
                  backgroundColor: colors.background, 
                  padding: `${layout.spacing}px` 
                }}
              >
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={displayName}
                    width={144}
                    height={144}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(to bottom right, ${colors.border}, ${colors.textSecondary}20)`
                    }}
                  >
                    <span 
                      style={{ 
                        color: colors.textSecondary,
                        fontSize: getFontSize('5xl'),
                        fontWeight: typography.fontWeight.bold
                      }}
                    >
                      {displayName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
              </div>
              {/* Online Status Indicator */}
              <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-400 border-4 border-white rounded-full shadow-lg" />
            </div>

            {/* Enhanced Officer Information */}
            <div 
              className="text-center lg:text-left"
              style={{ 
                color: colors.background,
                fontSize: getFontSize('base'),
                display: 'flex',
                flexDirection: 'column',
                gap: `${layout.spacing}px`
              }}
            >
              {/* Name and Title with Better Typography */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${layout.spacing}px` }}>
                <h2 
                  style={{ 
                    fontSize: getFontSize('4xl'),
                    fontWeight: typography.fontWeight.bold,
                    background: `linear-gradient(to right, ${colors.background}, ${colors.background}dd)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {displayName}
                </h2>
              </div>
              
              {/* Enhanced Contact Details with Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${layout.padding.medium}px` }}>
                {/* Contact Information Cards */}
                <div 
                  className="grid grid-cols-1 sm:grid-cols-2"
                  style={{ gap: `${layout.padding.medium}px` }}
                >
                  {/* Phone Card - Only show if phone exists */}
                  {displayPhone && (
                    <div 
                      className="flex items-center justify-center lg:justify-start backdrop-blur-sm rounded-lg border hover:bg-opacity-10 transition-all duration-300"
                      style={{ 
                        padding: `${layout.padding.medium}px`,
                        backgroundColor: `${colors.background}05`,
                        borderColor: `${colors.background}10`,
                        gap: `${layout.spacing}px`
                      }}
                    >
                      <div 
                        className="rounded-full flex items-center justify-center"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          backgroundColor: `${colors.secondary}20` 
                        }}
                      >
                        {React.createElement(icons.phone, { size: 20, color: colors.secondary })}
                      </div>
                      <div>
                        <p 
                          style={{ 
                            color: colors.secondary,
                            fontSize: getFontSize('xs'),
                            fontWeight: typography.fontWeight.medium,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}
                        >
                          Phone
                        </p>
                        <p 
                          style={{ 
                            fontSize: getFontSize('lg'),
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.background
                          }}
                        >
                          {displayPhone}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div 
                    className="flex items-center justify-center lg:justify-start backdrop-blur-sm rounded-lg border hover:bg-opacity-10 transition-all duration-300"
                    style={{ 
                      padding: `${layout.padding.medium}px`,
                      backgroundColor: `${colors.background}05`,
                      borderColor: `${colors.background}10`,
                      gap: `${layout.spacing}px`
                    }}
                  >
                    <div 
                      className="rounded-full flex items-center justify-center"
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: `${colors.primary}20` 
                      }}
                    >
                      {React.createElement(icons.email, { size: 20, color: colors.primary })}
                    </div>
                    <div>
                      <p 
                        style={{ 
                          color: colors.primary,
                          fontSize: getFontSize('xs'),
                          fontWeight: typography.fontWeight.medium,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      >
                        Email
                      </p>
                      <p 
                        style={{ 
                          fontSize: getFontSize('lg'),
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.background
                        }}
                      >
                        {displayEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Enhanced Action Buttons */}
          <div 
            className="flex flex-col mt-12 lg:mt-0"
            style={{ gap: `${layout.spacing}px` }}
          >
            {/* Primary CTA Button */}
            <div className="relative group">
              <div 
                className="absolute inset-0 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"
                style={{ 
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.primary}dd)`
                }}
              />
              <Button
                variant="primary"
                size="lg"
                className={`${classes.button.primary} relative transform group-hover:scale-105 transition-all duration-300 shadow-2xl`}
                style={{ backgroundColor: colors.primary }}
              >
                <span className="flex items-center space-x-3">
                  <span className="font-bold">Apply Now</span>
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    {React.createElement(icons.applyNow, { size: 14, className: "text-white" })}
                  </div>
                </span>
              </Button>
            </div>
            
            {/* Secondary CTA Button */}
            <div className="relative group">
              <div 
                className="absolute inset-0 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                style={{ 
                  background: `linear-gradient(to right, ${colors.secondary}, ${colors.secondary}dd)`
                }}
              />
              <Button
                variant="secondary"
                size="lg"
                className={`${classes.button.secondary} relative transform group-hover:scale-105 transition-all duration-300 shadow-xl`}
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.primary,
                  color: colors.primary
                }}
              >
                <span className="flex items-center space-x-3">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${colors.primary}20` }}
                  >
                    {React.createElement(icons.contactOfficer, { size: 14, color: colors.primary })}
                  </div>
                  <span className="font-semibold">Contact {displayName.split(' ')[0]}</span>
                </span>
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div 
              className="flex items-center justify-center lg:justify-start"
              style={{ 
                gap: `${layout.padding.large}px`,
                paddingTop: `${layout.padding.medium}px`
              }}
            >
              <div 
                className="flex items-center"
                style={{ 
                  color: colors.secondary,
                  gap: `${layout.spacing}px`
                }}
              >
                <div 
                  className="rounded-full animate-pulse"
                  style={{ 
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: '#10b981' 
                  }}
                />
                <span 
                  style={{ 
                    fontSize: getFontSize('sm'),
                    fontWeight: typography.fontWeight.medium,
                    color: colors.secondary
                  }}
                >
                  Available Now
                </span>
              </div>
              <div 
                className="flex items-center"
                style={{ 
                  color: colors.secondary,
                  gap: `${layout.spacing}px`
                }}
              >
                <div 
                  className="rounded-full animate-pulse"
                  style={{ 
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: '#f59e0b' 
                  }}
                />
                <span 
                  style={{ 
                    fontSize: getFontSize('sm'),
                    fontWeight: typography.fontWeight.medium,
                    color: colors.secondary
                  }}
                >
                  Quick Response
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
