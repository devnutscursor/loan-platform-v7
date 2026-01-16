'use client';

import React, { memo, useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import { supabase } from '@/lib/supabase/client';

// No props interface needed - component gets data from useAuth

const StaticHeader = memo(function StaticHeader() {
  const { user, signOut, userRole, loading: authLoading, roleLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Stable state that only updates when user actually changes
  const [stableUserData, setStableUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    fullName: '',
    initial: 'U',
    role: 'employee',
    avatar: null as string | null
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch user profile data from users table
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name, avatar')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to email-based data
          setStableUserData(prev => ({
            ...prev,
            email: user.email || '',
            initial: user.email?.charAt(0).toUpperCase() || 'U',
            role: userRole?.role || 'employee'
          }));
          return;
        }

        const firstName = data.first_name || '';
        const lastName = data.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || user.email || '';
        const initial = firstName ? firstName.charAt(0).toUpperCase() : 
                       lastName ? lastName.charAt(0).toUpperCase() : 
                       user.email?.charAt(0).toUpperCase() || 'U';

        setStableUserData({
          email: user.email || '',
          firstName,
          lastName,
          fullName,
          initial,
          role: userRole?.role || 'employee',
          avatar: data.avatar
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to email-based data
        setStableUserData(prev => ({
          ...prev,
          email: user.email || '',
          initial: user.email?.charAt(0).toUpperCase() || 'U',
          role: userRole?.role || 'employee'
        }));
      } finally {
        setProfileLoading(false);
      }
    };

    if (user?.id && userRole?.role) {
      fetchUserProfile();
    }
  }, [user?.id, user?.email, userRole?.role]);

  // Memoize role display name based on stable data
  const roleDisplayName = useMemo(() => {
    switch (stableUserData.role) {
      case 'super_admin':
        return 'Super Admin';
      case 'company_admin':
        return 'Company Admin';
      case 'employee':
        return 'Loan Officer';
      default:
        return 'User';
    }
  }, [stableUserData.role]);

  // Get dashboard URL based on user role
  const getDashboardUrl = useMemo(() => {
    switch (stableUserData.role) {
      case 'super_admin':
        return '/super-admin/dashboard';
      case 'company_admin':
        return '/admin/dashboard';
      case 'employee':
        return '/officers/dashboard';
      default:
        return '/officers/dashboard';
    }
  }, [stableUserData.role]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Don't render if auth is still loading OR if user role is not yet determined
  if (authLoading || roleLoading || profileLoading || !user || !userRole) {
    return (
      <nav style={dashboard.nav}>
        <div style={dashboard.navContent}>
          <div style={dashboard.navInner}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <Image
                  src="/images/logos/LoanOffW.png"
                  alt="Loan Officer Platform"
                  width={100}
                  height={20}
                  style={{
                    height: 'auto',
                    maxHeight: '20px',
                    width: 'auto'
                  }}
                />
              </div>
            </div>
            <div style={dashboard.userInfo}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                opacity: 0.5 
              }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  backgroundColor: '#e5e7eb',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '50%', 
                    backgroundColor: '#01bcc6' 
                  }}></div>
                </div>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                  <span style={{ 
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    border: '2px solid #e5e7eb',
                    borderTop: '2px solid #01bcc6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}></span>
                  Loading...
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  const handleProfileClick = () => {
    // Navigate to settings page based on user role
    if (userRole?.role === 'super_admin') {
      router.push('/super-admin/settings');
    } else if (userRole?.role === 'company_admin') {
      router.push('/admin/settings');
    } else {
      router.push('/officers/settings');
    }
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  const handleSignOutClick = async () => {
    setIsMobileMenuOpen(false);
    await handleSignOut();
  };

  return (
    <>
      <nav style={dashboard.nav}>
        <div style={dashboard.navContent}>
          <div style={dashboard.navInner}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              {/* Logo Section */}
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <button
                  onClick={() => router.push(getDashboardUrl)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    transition: 'opacity 0.2s ease-in-out',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <Image
                    src="/images/logos/LoanOffW.png"
                    alt="Loan Officer Platform"
                    width={100}
                    height={20}
                    style={{
                      height: 'auto',
                      maxHeight: '20px',
                      width: 'auto'
                    }}
                  />
                </button>
              </div>
              
              {/* Desktop User Info - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-3" style={{ alignItems: dashboard.userInfo.alignItems, gap: dashboard.userInfo.gap }}>
                <button
                  onClick={handleProfileClick}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.75rem',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0177a385';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={dashboard.userDetails}>
                    <p style={dashboard.userEmail}>
                      {stableUserData.fullName || stableUserData.email}
                    </p>
                    <p style={dashboard.userRole}>{roleDisplayName}</p>
                  </div>
                  <div style={dashboard.userAvatar}>
                    {stableUserData.avatar ? (
                      <Image
                        src={stableUserData.avatar}
                        alt={stableUserData.fullName || stableUserData.email}
                        width={32}
                        height={32}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <span style={dashboard.userAvatarText}>
                        {stableUserData.initial}
                      </span>
                    )}
                  </div>
                </button>
                
                <button
                  onClick={handleSignOut}
                  style={{
                    background: 'linear-gradient(135deg, #01bcc6 0%, #008eab 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(1, 188, 198, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(1, 188, 198, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(1, 188, 198, 0.3)';
                  }}
                >
                  Sign Out
                </button>
              </div>

              {/* Mobile Hamburger Button - Visible only on mobile */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="md:hidden flex items-center justify-center"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  color: 'white',
                  transition: 'opacity 0.2s ease'
                }}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  React.createElement(icons.close, { size: 24 })
                ) : (
                  React.createElement(icons.menu, { size: 24 })
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl"
            style={{
              animation: 'slideIn 0.3s ease-out',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.5rem' }}>
              {/* Mobile Menu Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h2 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#111827' 
                }}>
                  Menu
                </h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#6b7280'
                  }}
                  aria-label="Close menu"
                >
                  {React.createElement(icons.close, { size: 20 })}
                </button>
              </div>

              {/* User Profile Section */}
              <button
                onClick={handleProfileClick}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#01bcc6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={dashboard.userAvatar}>
                  {stableUserData.avatar ? (
                    <Image
                      src={stableUserData.avatar}
                      alt={stableUserData.fullName || stableUserData.email}
                      width={40}
                      height={40}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <span style={{
                      ...dashboard.userAvatarText,
                      width: '40px',
                      height: '40px',
                      fontSize: '1rem'
                    }}>
                      {stableUserData.initial}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ 
                    ...dashboard.userEmail,
                    color: '#111827',
                    marginBottom: '0.25rem'
                  }}>
                    {stableUserData.fullName || stableUserData.email}
                  </p>
                  <p style={{ 
                    ...dashboard.userRole,
                    color: '#6b7280',
                    fontSize: '0.875rem'
                  }}>
                    {roleDisplayName}
                  </p>
                </div>
                {React.createElement(icons.chevronRight, { 
                  size: 20, 
                  style: { color: '#9ca3af' } 
                })}
              </button>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOutClick}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #01bcc6 0%, #008eab 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(1, 188, 198, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(1, 188, 198, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(1, 188, 198, 0.3)';
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add animations to globals.css via style tag */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
});

export default StaticHeader;
