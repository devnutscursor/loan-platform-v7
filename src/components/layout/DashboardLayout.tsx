'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = false 
}: DashboardLayoutProps) {
  const { user, signOut, userRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  const getRoleDisplayName = () => {
    switch (userRole?.role) {
      case 'super_admin':
        return 'Super Admin';
      case 'company_admin':
        return 'Company Admin';
      case 'employee':
        return 'Loan Officer';
      default:
        return 'User';
    }
  };

  const getNavigationItems = () => {
    switch (userRole?.role) {
      case 'super_admin':
        return [
          { name: 'Companies', href: '/admin/companies', current: pathname === '/admin/companies' },
        ];
      case 'company_admin':
        return [
          { name: 'Loan Officers', href: '/companyadmin/loanofficers', current: pathname === '/companyadmin/loanofficers' },
        ];
      case 'employee':
        return [
          { name: 'Dashboard', href: '/officers/dashboard', current: pathname === '/officers/dashboard' },
          { name: 'Profile', href: '/officers/profile', current: pathname === '/officers/profile' },
          { name: 'Customizer', href: '/officers/customizer', current: pathname === '/officers/customizer' },
          { name: 'Leads', href: '/officers/leads', current: pathname === '/officers/leads' },
        ];
      default:
        return [];
    }
  };

  return (
    <div style={dashboard.container}>
      {/* Navigation */}
      <nav style={dashboard.nav}>
        <div style={dashboard.navContent}>
          <div style={dashboard.navInner}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <h1 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: '#111827' 
                }}>
                  Loan Officer Platform
                </h1>
              </div>
              <div style={{ 
                marginLeft: '24px', 
                ...dashboard.navLinks 
              }}>
                {getNavigationItems().map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    style={{
                      ...dashboard.navLink,
                      ...(item.current ? dashboard.navLinkActive : {}),
                    }}
                    onMouseEnter={(e) => {
                      if (!item.current) {
                        Object.assign(e.currentTarget.style, dashboard.navLinkHover);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!item.current) {
                        Object.assign(e.currentTarget.style, dashboard.navLink);
                      }
                    }}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
            
            <div style={dashboard.userInfo}>
              <div style={dashboard.userInfo}>
                <div style={dashboard.userDetails}>
                  <p style={dashboard.userEmail}>{user?.email}</p>
                  <p style={dashboard.userRole}>{getRoleDisplayName()}</p>
                </div>
                <div style={dashboard.userAvatar}>
                  <span style={dashboard.userAvatarText}>
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                style={{
                  ...dashboard.button.primary,
                }}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, dashboard.button.primaryHover);
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, dashboard.button.primary);
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={dashboard.mainContent}>
        <div style={{ padding: '24px 0' }}>
          {showBackButton && (
            <button
              onClick={() => router.back()}
              style={{
                marginBottom: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              {React.createElement(icons.chevronLeft, { 
                size: 16, 
                style: { marginRight: '8px' } 
              })}
              Back
            </button>
          )}
          
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ 
              fontSize: '30px', 
              fontWeight: 'bold', 
              color: '#111827' 
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ 
                marginTop: '8px', 
                color: '#4b5563' 
              }}>
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
