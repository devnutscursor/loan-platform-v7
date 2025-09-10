'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';

export default function OfficersDashboardPage() {
  const { user, userRole } = useAuth();
  const router = useRouter();

  return (
    <RouteGuard allowedRoles={['employee']}>
      <DashboardLayout 
        title="Loan Officer Dashboard" 
        subtitle="Welcome to your loan officer dashboard"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Welcome Card */}
          <div style={dashboard.card}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{
                  height: '48px',
                  width: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#fce7f3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 'medium',
                    color: '#db2777'
                  }}>
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div style={{ marginLeft: '16px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'medium',
                  color: '#111827'
                }}>
                  Welcome, {user?.email}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  You are logged in as a Loan Officer
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div style={dashboard.grid.cols3}>
            <div style={dashboard.statsCard}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: '#dbeafe'
                  }}>
                    {React.createElement(icons.document, { 
                      size: 20, 
                      style: { color: '#2563eb' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Active Loans</p>
                  <p style={dashboard.statsCardValue}>0</p>
                </div>
              </div>
            </div>

            <div style={dashboard.statsCard}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: '#dcfce7'
                  }}>
                    {React.createElement(icons.calculators, { 
                      size: 20, 
                      style: { color: '#16a34a' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Total Processed</p>
                  <p style={dashboard.statsCardValue}>0</p>
                </div>
              </div>
            </div>

            <div style={dashboard.statsCard}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: '#fef3c7'
                  }}>
                    {React.createElement(icons.clock, { 
                      size: 20, 
                      style: { color: '#d97706' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Pending Reviews</p>
                  <p style={dashboard.statsCardValue}>0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={dashboard.card}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'medium',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Quick Actions
            </h3>
            <div style={dashboard.grid.cols4}>
              <button style={{
                ...dashboard.quickActionCard,
                padding: '16px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, dashboard.quickActionCardHover);
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, dashboard.quickActionCard);
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}>
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: '#dbeafe',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.plus, { 
                    size: 20, 
                    style: { color: '#2563eb' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>New Loan</p>
              </button>

              <button style={{
                ...dashboard.quickActionCard,
                padding: '16px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, dashboard.quickActionCardHover);
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, dashboard.quickActionCard);
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}>
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: '#dcfce7',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.document, { 
                    size: 20, 
                    style: { color: '#16a34a' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>View Applications</p>
              </button>

              <button style={{
                ...dashboard.quickActionCard,
                padding: '16px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, dashboard.quickActionCardHover);
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, dashboard.quickActionCard);
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}>
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: '#e9d5ff',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.trendingUp, { 
                    size: 20, 
                    style: { color: '#9333ea' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>Reports</p>
              </button>

              <button 
                onClick={() => router.push('/officers/profile')}
                style={{
                  ...dashboard.quickActionCard,
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, dashboard.quickActionCardHover);
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, dashboard.quickActionCard);
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: '#fed7aa',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.profile, { 
                    size: 20, 
                    style: { color: '#ea580c' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>Profile</p>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={dashboard.card}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'medium',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Recent Activity
            </h3>
            <div style={{
              textAlign: 'center',
              padding: '32px 0',
              color: '#6b7280'
            }}>
              {React.createElement(icons.document, { 
                size: 48, 
                style: { 
                  margin: '0 auto',
                  color: '#9ca3af'
                } 
              })}
              <h3 style={{
                marginTop: '8px',
                fontSize: '14px',
                fontWeight: 'medium',
                color: '#111827'
              }}>
                No recent activity
              </h3>
              <p style={{
                marginTop: '4px',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Get started by creating your first loan application.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}