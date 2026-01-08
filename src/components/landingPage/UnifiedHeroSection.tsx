'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import { Phone, Mail, Check, Facebook, Instagram, Linkedin, Twitter, Calendar, ChevronRight, MessageCircle } from 'lucide-react';

interface UnifiedHeroSectionProps {
  officerName?: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  template?: 'template1' | 'template2';
  className?: string;
  // New props for customization
  applyNowLink?: string;
  applyNowText?: string;
  // Template customization data
  templateCustomization?: {
    headerModifications?: {
      officerName?: string;
      phone?: string;
      email?: string;
      avatar?: string;
      applyNowText?: string;
      applyNowLink?: string;
    };
    rightSidebarModifications?: {
      companyName?: string;
      logo?: string;
      phone?: string;
      email?: string;
      address?: string;
      website?: string;
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
  };
  // NEW: Public mode props
  isPublic?: boolean;
  publicUserData?: {
    name: string;
    email: string;
    phone?: string;
    nmlsNumber?: string;
    avatar?: string;
  };
  publicTemplateData?: any;
  // NEW: Company data props
  companyData?: {
    id: string;
    name: string;
    logo?: string;
    website?: string;
    address?: any;
    phone?: string;
    email?: string;
    license_number?: string;
    company_nmls_number?: string;
    company_social_media?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
  };
  // Force mobile view (for customizer mobile preview)
  forceMobileView?: boolean;
  onApplyNowRequest?: () => void;
  // NEW: Get Rates callback for scrolling to rates tab
  onGetRates?: () => void;
}

export default function UnifiedHeroSection({
  officerName,
  phone,
  email,
  profileImage,
  template = 'template1',
  className = "",
  applyNowText,
  templateCustomization,
  // NEW: Public mode props
  isPublic = false,
  publicUserData,
  publicTemplateData,
  // NEW: Company data props
  companyData,
  // Force mobile view
  forceMobileView = false,
  onApplyNowRequest,
  onGetRates
}: UnifiedHeroSectionProps) {
  const { user, loading: authLoading } = useAuth();

  // Helper functions to get customized values
  const getOfficerName = () => {
    if (isPublic && publicTemplateData?.template?.headerModifications?.officerName) {
      return publicTemplateData.template.headerModifications.officerName;
    }
    if (isPublic && publicUserData?.name) {
      return publicUserData.name;
    }
    if (templateCustomization?.headerModifications?.officerName) {
      return templateCustomization.headerModifications.officerName;
    }
    return officerName || user?.user_metadata?.full_name || `${user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'} ${user?.user_metadata?.last_name || 'Smith'}` || 'User';
  };

  const getPhone = () => {
    if (isPublic && publicTemplateData?.template?.headerModifications?.phone) {
      return publicTemplateData.template.headerModifications.phone;
    }
    if (isPublic && publicUserData?.phone) {
      return publicUserData.phone;
    }
    if (templateCustomization?.headerModifications?.phone) {
      return templateCustomization.headerModifications.phone;
    }
    return phone || user?.user_metadata?.phone || null;
  };

  const getEmail = () => {
    if (isPublic && publicTemplateData?.template?.headerModifications?.email) {
      return publicTemplateData.template.headerModifications.email;
    }
    if (isPublic && publicUserData?.email) {
      return publicUserData.email;
    }
    if (templateCustomization?.headerModifications?.email) {
      return templateCustomization.headerModifications.email;
    }
    return email || user?.email || 'user@example.com';
  };

  const getProfileImage = () => {
    if (isPublic && publicTemplateData?.template?.headerModifications?.avatar) {
      return publicTemplateData.template.headerModifications.avatar;
    }
    if (isPublic && publicUserData?.avatar) {
      return publicUserData.avatar;
    }
    if (templateCustomization?.headerModifications?.avatar) {
      return templateCustomization.headerModifications.avatar;
    }
    return profileImage || user?.user_metadata?.avatar_url || null;
  };

  const getNmlsNumber = () => {
    return publicUserData?.nmlsNumber || null;
  };

  const getCompanySocialMedia = () => {
    if (isPublic && publicTemplateData?.template?.rightSidebarModifications) {
      const mods = publicTemplateData.template.rightSidebarModifications;
      if (mods.facebook || mods.twitter || mods.linkedin || mods.instagram) {
        return {
          facebook: mods.facebook,
          twitter: mods.twitter,
          linkedin: mods.linkedin,
          instagram: mods.instagram
        };
      }
    }
    if (templateCustomization?.rightSidebarModifications) {
      const mods = templateCustomization.rightSidebarModifications;
      if (mods.facebook || mods.twitter || mods.linkedin || mods.instagram) {
        return {
          facebook: mods.facebook,
          twitter: mods.twitter,
          linkedin: mods.linkedin,
          instagram: mods.instagram
        };
      }
    }
    return companyData?.company_social_media || null;
  };

  const getApplyNowText = () => {
    if (applyNowText) return applyNowText;
    if (isPublic && publicTemplateData?.template?.headerModifications?.applyNowText) {
      return publicTemplateData.template.headerModifications.applyNowText;
    }
    if (templateCustomization?.headerModifications?.applyNowText) {
      return templateCustomization.headerModifications.applyNowText;
    }
    return 'Apply Now';
  };

  const handleApplyNow = () => {
    if (onApplyNowRequest) {
      onApplyNowRequest();
      return;
    }
    console.warn('UnifiedHeroSection: onApplyNowRequest not provided');
  };

  const handleGetRates = () => {
    if (onGetRates) {
      onGetRates();
      return;
    }
    // Fallback: scroll to element with id "landing-tabs"
    const tabsElement = document.getElementById('landing-tabs');
    if (tabsElement) {
      tabsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Use helper functions to get display values
  const displayName = getOfficerName();
  const displayPhone = getPhone();
  const displayEmail = getEmail();
  const displayNmls = getNmlsNumber();
  const [imageError, setImageError] = useState(false);
  const displayImage = getProfileImage();
  const hasExplicitImage = !!displayImage;
  const showInitials = imageError || !hasExplicitImage;
  const socialMedia = getCompanySocialMedia();
  const hasSocialMedia = socialMedia && (socialMedia.facebook || socialMedia.twitter || socialMedia.linkedin || socialMedia.instagram);

  // Template data fetching - support both public and auth modes
  const { getTemplateSync } = useEfficientTemplates();
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(template);

  // Comprehensive template data usage
  const colors = templateData?.template?.colors || {
    primary: '#3b82f6',
    secondary: '#6366f1',
    background: '#0f0f23',
    text: '#000000',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    heroTextColor: '#ffffff'
  };

  const typography = templateData?.template?.typography || {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  };

  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 16,
    borderRadius: 12,
    padding: 24
  };

  // Show loading state only if auth is still loading
  if (authLoading) {
    return (
      <section className={`relative overflow-hidden ${className}`}>
        <div className="min-h-[400px] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})` }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.heroTextColor || '#ffffff' }}></div>
            <p style={{ color: colors.heroTextColor || '#ffffff' }}>Loading profile...</p>
          </div>
        </div>
      </section>
    );
  }

  // Derive tertiary color for third orb (mix of primary and secondary)
  const tertiaryColor = colors.secondary || '#06b6d4';

  return (
    <section 
      className={`@container relative overflow-hidden ${className}`}
      style={{ fontFamily: typography.fontFamily }}
    >
      {/* Animated Gradient Background - Uses primary/secondary colors with rich saturation */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary || colors.primary} 50%, ${colors.primary} 100%)`
        }}
      >
        {/* Floating Gradient Orbs - More vibrant for glass effect contrast */}
        <div 
          className="hero-gradient-orb hero-gradient-orb-1 absolute"
          style={{
            width: forceMobileView ? '350px' : '800px',
            height: forceMobileView ? '350px' : '800px',
            background: `radial-gradient(circle, ${colors.secondary || colors.primary} 0%, ${colors.secondary || colors.primary}80 30%, transparent 70%)`,
            top: '-250px',
            right: '-150px',
            filter: forceMobileView ? 'blur(50px)' : 'blur(80px)',
            opacity: forceMobileView ? 0.6 : 0.7
          }}
        />
        <div 
          className="hero-gradient-orb hero-gradient-orb-2 absolute"
          style={{
            width: forceMobileView ? '300px' : '700px',
            height: forceMobileView ? '300px' : '700px',
            background: `radial-gradient(circle, ${colors.primary} 0%, ${colors.primary}80 30%, transparent 70%)`,
            bottom: '-150px',
            left: '-100px',
            filter: forceMobileView ? 'blur(50px)' : 'blur(80px)',
            opacity: forceMobileView ? 0.6 : 0.7
          }}
        />
        <div 
          className="hero-gradient-orb hero-gradient-orb-3 absolute"
          style={{
            width: forceMobileView ? '250px' : '600px',
            height: forceMobileView ? '250px' : '600px',
            background: `radial-gradient(circle, ${tertiaryColor} 0%, ${tertiaryColor}60 30%, transparent 70%)`,
            top: '30%',
            left: '25%',
            filter: forceMobileView ? 'blur(60px)' : 'blur(90px)',
            opacity: forceMobileView ? 0.5 : 0.6
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px] py-8 @[768px]:py-12 @[1024px]:py-16 px-4 @[768px]:px-6">
        {/* Profile Card */}
        <div 
          className="hero-glass-card relative w-full max-w-[900px] @[1024px]:max-w-[1000px] overflow-hidden"
          style={{ borderRadius: `${Math.max(layout.borderRadius, 20)}px` }}
        >
          {/* Decorative curved background */}
          <div className="hero-card-decoration hidden @[768px]:block">
            <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="w-full h-full">
              <path 
                d="M0,0 L180,0 Q220,150 180,300 L0,300 Z" 
                fill={`url(#heroDecorationGradient-${template})`}
              />
              <defs>
                <linearGradient id={`heroDecorationGradient-${template}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={`${colors.primary}25`} />
                  <stop offset="100%" stopColor={`${colors.secondary || colors.primary}10`} />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Glass overlay effect */}
          <div className="hero-card-glass-overlay" />

          {/* Desktop Layout - shown at container width >= 768px (unless forceMobileView) */}
          <div className={`${forceMobileView ? 'hidden' : 'hidden @[768px]:flex'} relative z-[2] p-6 @[1024px]:p-8 gap-6 @[1024px]:gap-8`}>
            {/* Left Section - Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div 
                  className="hero-avatar-ring w-[140px] h-[140px] @[1024px]:w-[160px] @[1024px]:h-[160px]"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.primary}, ${tertiaryColor})`,
                    borderRadius: `${Math.max(layout.borderRadius, 20)}px`
                  }}
                >
                  {showInitials ? (
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-bold text-3xl @[1024px]:text-4xl"
                      style={{ 
                        backgroundColor: colors.primary, 
                        borderRadius: `${Math.max(layout.borderRadius - 3, 17)}px` 
                      }}
                    >
                      {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </div>
                  ) : (
                    <div 
                      className="relative w-full h-full overflow-hidden"
                      style={{ borderRadius: `${Math.max(layout.borderRadius - 3, 17)}px` }}
                    >
                      <Image
                        src={displayImage as string}
                        alt={displayName}
                        fill
                        className="object-cover"
                        sizes="160px"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  )}
                </div>
                {/* Verified Badge */}
                <button 
                  className="absolute bottom-[-6px] right-[-6px] w-[26px] h-[26px] flex items-center justify-center rounded-full cursor-default"
                  style={{ 
                    backgroundColor: colors.primary,
                    boxShadow: `0 3px 10px ${colors.primary}60`
                  }}
                  aria-label="Verified"
                >
                  <Check size={14} strokeWidth={2.5} color={colors.heroTextColor || '#ffffff'} />
                </button>
              </div>
            </div>

            {/* Right Section - Content */}
            <div className="flex-1 flex flex-col gap-4 @[1024px]:gap-6">
              {/* Top Row - Action Buttons */}
              <div className="flex justify-end">
                <div className="flex gap-2">
                  <button
                    onClick={handleGetRates}
                    className="hero-btn hero-btn-primary px-4 py-2 text-sm"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.heroTextColor || '#ffffff',
                      borderRadius: `${layout.borderRadius}px`
                    }}
                  >
                    <Calendar size={16} />
                    <span>Get Rates</span>
                  </button>
                  <button
                    onClick={handleApplyNow}
                    className="hero-btn hero-btn-secondary px-4 py-2 text-sm"
                    style={{
                      backgroundColor: colors.secondary || colors.primary,
                      color: colors.heroTextColor || '#ffffff',
                      borderRadius: `${layout.borderRadius}px`
                    }}
                  >
                    <span>{getApplyNowText()}</span>
                  </button>
                  <a
                    href="#contact"
                    className="hero-btn hero-btn-ghost px-4 py-2 text-sm"
                    style={{
                      color: colors.heroTextColor || '#ffffff',
                      borderRadius: `${layout.borderRadius}px`
                    }}
                  >
                    <Mail size={16} />
                    <span>Contact</span>
                  </a>
                </div>
              </div>

              {/* Profile Info Section */}
              <div className="flex justify-between items-end gap-6">
                <div className="flex flex-col gap-3">
                  {/* Name */}
                  <h1 
                    className="text-2xl @[1024px]:text-3xl font-bold"
                    style={{ 
                      color: colors.heroTextColor || '#ffffff',
                      fontWeight: typography.fontWeight.bold
                    }}
                  >
                    {displayName}
                  </h1>

                  {/* Credentials */}
                  {displayNmls && (
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-sm font-medium"
                        style={{ color: colors.primary }}
                      >
                        NMLS #{displayNmls}
                      </span>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="flex flex-wrap items-center gap-4">
                    {displayPhone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} style={{ color: colors.heroTextColor || '#ffffff', opacity: 0.7 }} />
                        <span 
                          className="text-sm"
                          style={{ color: colors.heroTextColor || '#ffffff', opacity: 0.9 }}
                        >
                          {displayPhone}
                        </span>
                      </div>
                    )}
                    {displayEmail && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} style={{ color: colors.heroTextColor || '#ffffff', opacity: 0.7 }} />
                        <span 
                          className="text-sm break-all"
                          style={{ color: colors.heroTextColor || '#ffffff', opacity: 0.9 }}
                        >
                          {displayEmail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {hasSocialMedia && (
                  <div className="flex gap-2">
                    {socialMedia?.facebook && (
                      <a
                        href={socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hero-social-link w-11 h-11"
                        style={{ color: colors.heroTextColor || '#ffffff' }}
                        aria-label="Facebook"
                      >
                        <Facebook size={18} />
                      </a>
                    )}
                    {socialMedia?.instagram && (
                      <a
                        href={socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hero-social-link w-11 h-11"
                        style={{ color: colors.heroTextColor || '#ffffff' }}
                        aria-label="Instagram"
                      >
                        <Instagram size={18} />
                      </a>
                    )}
                    {socialMedia?.linkedin && (
                      <a
                        href={socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hero-social-link w-11 h-11"
                        style={{ color: colors.heroTextColor || '#ffffff' }}
                        aria-label="LinkedIn"
                      >
                        <Linkedin size={18} />
                      </a>
                    )}
                    {socialMedia?.twitter && (
                      <a
                        href={socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hero-social-link w-11 h-11"
                        style={{ color: colors.heroTextColor || '#ffffff' }}
                        aria-label="X (Twitter)"
                      >
                        <Twitter size={18} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Layout - shown at container width < 768px or when forceMobileView */}
          <div className={`${forceMobileView ? 'flex' : 'flex @[768px]:hidden'} flex-col relative z-[2] p-4 @[400px]:p-6`}>
            {/* Mobile Header - Avatar + Social Links */}
            <div className="flex justify-between items-start mb-4">
              <div className="relative">
                <div 
                  className="hero-avatar-ring w-[80px] h-[80px] @[400px]:w-[100px] @[400px]:h-[100px]"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.primary}, ${tertiaryColor})`,
                    borderRadius: `${Math.max(layout.borderRadius, 20)}px`
                  }}
                >
                  {showInitials ? (
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-bold text-xl @[400px]:text-2xl"
                      style={{ 
                        backgroundColor: colors.primary, 
                        borderRadius: `${Math.max(layout.borderRadius - 3, 17)}px` 
                      }}
                    >
                      {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </div>
                  ) : (
                    <div 
                      className="relative w-full h-full overflow-hidden"
                      style={{ borderRadius: `${Math.max(layout.borderRadius - 3, 17)}px` }}
                    >
                      <Image
                        src={displayImage as string}
                        alt={displayName}
                        fill
                        className="object-cover"
                        sizes="100px"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  )}
                </div>
                {/* Verified Badge - Mobile */}
                <button 
                  className="absolute bottom-[-4px] right-[-4px] w-[20px] h-[20px] @[400px]:w-[22px] @[400px]:h-[22px] flex items-center justify-center rounded-full cursor-default"
                  style={{ 
                    backgroundColor: colors.primary,
                    boxShadow: `0 3px 10px ${colors.primary}60`
                  }}
                  aria-label="Verified"
                >
                  <Check size={10} strokeWidth={2.5} color={colors.heroTextColor || '#ffffff'} />
                </button>
              </div>

              {/* Social Links - Mobile */}
              {hasSocialMedia && (
                <div className="flex gap-2">
                  {socialMedia?.facebook && (
                    <a
                      href={socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-social-link w-9 h-9 @[400px]:w-10 @[400px]:h-10"
                      style={{ color: colors.heroTextColor || '#ffffff' }}
                      aria-label="Facebook"
                    >
                      <Facebook size={16} />
                    </a>
                  )}
                  {socialMedia?.instagram && (
                    <a
                      href={socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-social-link w-9 h-9 @[400px]:w-10 @[400px]:h-10"
                      style={{ color: colors.heroTextColor || '#ffffff' }}
                      aria-label="Instagram"
                    >
                      <Instagram size={16} />
                    </a>
                  )}
                  {socialMedia?.linkedin && (
                    <a
                      href={socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-social-link w-9 h-9 @[400px]:w-10 @[400px]:h-10"
                      style={{ color: colors.heroTextColor || '#ffffff' }}
                      aria-label="LinkedIn"
                    >
                      <Linkedin size={16} />
                    </a>
                  )}
                  {socialMedia?.twitter && (
                    <a
                      href={socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-social-link w-9 h-9 @[400px]:w-10 @[400px]:h-10"
                      style={{ color: colors.heroTextColor || '#ffffff' }}
                      aria-label="X (Twitter)"
                    >
                      <Twitter size={16} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Profile Info - Mobile */}
            <div className="mb-3">
              <h1 
                className="text-xl @[400px]:text-2xl font-bold mb-1"
                style={{ 
                  color: colors.heroTextColor || '#ffffff',
                  fontWeight: typography.fontWeight.bold
                }}
              >
                {displayName}
              </h1>
              {displayNmls && (
                <span 
                  className="text-xs @[400px]:text-sm font-medium"
                  style={{ color: colors.primary }}
                >
                  NMLS #{displayNmls}
                </span>
              )}
            </div>

            {/* Contact Info - Mobile */}
            <div className="flex flex-col @[400px]:flex-row @[400px]:items-center gap-2 @[400px]:gap-4 mb-3">
              {displayPhone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} style={{ color: colors.heroTextColor || '#ffffff', opacity: 0.7 }} />
                  <span 
                    className="text-sm"
                    style={{ color: colors.heroTextColor || '#ffffff', opacity: 0.9 }}
                  >
                    {displayPhone}
                  </span>
                </div>
              )}
              {displayEmail && (
                <div className="flex items-center gap-2">
                  <Mail size={14} style={{ color: colors.heroTextColor || '#ffffff', opacity: 0.7 }} />
                  <span 
                    className="text-sm break-all"
                    style={{ color: colors.heroTextColor || '#ffffff', opacity: 0.9 }}
                  >
                    {displayEmail}
                  </span>
                </div>
              )}
            </div>

            {/* Get Rates Link - Mobile */}
            <button
              onClick={handleGetRates}
              className="text-left mb-4 text-sm font-medium transition-all hover:underline"
              style={{ color: colors.primary }}
            >
              Get Rates
            </button>

            {/* Action Buttons - Mobile */}
            <div className="flex gap-2">
              <button
                onClick={handleApplyNow}
                className="hero-btn flex-1 py-2 px-4 text-sm font-semibold"
                style={{
                  backgroundColor: colors.secondary || colors.primary,
                  color: colors.heroTextColor || '#ffffff',
                  borderRadius: `${layout.borderRadius}px`
                }}
              >
                {getApplyNowText()}
              </button>
              <a
                href="#contact"
                className="hero-btn hero-btn-ghost flex-1 py-2 px-4 text-sm font-semibold text-center"
                style={{
                  color: colors.heroTextColor || '#ffffff',
                  borderRadius: `${layout.borderRadius}px`
                }}
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
