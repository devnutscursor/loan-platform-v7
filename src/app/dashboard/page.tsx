'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { dashboard } from '@/theme/theme';

export default function DashboardPage() {
  const { user, userRole, signOut } = useAuth();

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', backgroundColor: dashboard.colors.background }}>
        {/* Header */}
        <header style={{ backgroundColor: dashboard.colors.white, boxShadow: dashboard.shadows.sm }}>
          <div style={{ maxWidth: dashboard.layout.maxWidth, margin: '0 auto', padding: dashboard.spacing.container }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: dashboard.spacing.lg }}>
              <div>
                <h1 style={{ fontSize: dashboard.typography.h1.fontSize, fontWeight: dashboard.typography.h1.fontWeight, color: dashboard.colors.text.primary }}>Dashboard</h1>
                <p style={{ color: dashboard.colors.text.secondary }}>
                  Welcome back, {user?.email}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: dashboard.spacing.md }}>
                <span style={{ fontSize: dashboard.typography.sm.fontSize, color: dashboard.colors.text.muted }}>
                  Role: {userRole?.role?.replace('_', ' ').toUpperCase()}
                </span>
                <Button
                  onClick={signOut}
                  variant="danger"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: dashboard.layout.maxWidth, margin: '0 auto', padding: `${dashboard.spacing.lg} ${dashboard.spacing.container}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: dashboard.spacing.lg }}>
            {/* Stats Cards */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{ width: dashboard.spacing.xl, height: dashboard.spacing.xl, backgroundColor: dashboard.colors.primary[50], borderRadius: dashboard.borderRadius.md, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="trendingUp" size={20} color={dashboard.colors.primary[600]} />
                  </div>
                </div>
                <div style={{ marginLeft: dashboard.spacing.lg, flex: 1 }}>
                  <dl>
                    <dt style={{ fontSize: dashboard.typography.sm.fontSize, fontWeight: dashboard.typography.sm.fontWeight, color: dashboard.colors.text.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Total Leads</dt>
                    <dd style={{ fontSize: dashboard.typography.lg.fontSize, fontWeight: dashboard.typography.lg.fontWeight, color: dashboard.colors.text.primary }}>0</dd>
                  </dl>
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{ width: dashboard.spacing.xl, height: dashboard.spacing.xl, backgroundColor: dashboard.colors.blue[50], borderRadius: dashboard.borderRadius.md, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="home" size={20} color={dashboard.colors.blue[600]} />
                  </div>
                </div>
                <div style={{ marginLeft: dashboard.spacing.lg, flex: 1 }}>
                  <dl>
                    <dt style={{ fontSize: dashboard.typography.sm.fontSize, fontWeight: dashboard.typography.sm.fontWeight, color: dashboard.colors.text.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Landing Pages</dt>
                    <dd style={{ fontSize: dashboard.typography.lg.fontSize, fontWeight: dashboard.typography.lg.fontWeight, color: dashboard.colors.text.primary }}>0</dd>
                  </dl>
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{ width: dashboard.spacing.xl, height: dashboard.spacing.xl, backgroundColor: dashboard.colors.green[50], borderRadius: dashboard.borderRadius.md, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="trendingUp" size={20} color={dashboard.colors.green[600]} />
                  </div>
                </div>
                <div style={{ marginLeft: dashboard.spacing.lg, flex: 1 }}>
                  <dl>
                    <dt style={{ fontSize: dashboard.typography.sm.fontSize, fontWeight: dashboard.typography.sm.fontWeight, color: dashboard.colors.text.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Conversion Rate</dt>
                    <dd style={{ fontSize: dashboard.typography.lg.fontSize, fontWeight: dashboard.typography.lg.fontWeight, color: dashboard.colors.text.primary }}>0%</dd>
                  </dl>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: dashboard.spacing.xl }}>
            <h2 style={{ fontSize: dashboard.typography.h2.fontSize, fontWeight: dashboard.typography.h2.fontWeight, color: dashboard.colors.text.primary, marginBottom: dashboard.spacing.md }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: dashboard.spacing.md }}>
              <Card className="cursor-pointer transition-shadow duration-200 hover:shadow-lg">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: dashboard.spacing.xl2, height: dashboard.spacing.xl2, backgroundColor: dashboard.colors.primary[50], borderRadius: dashboard.borderRadius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="plus" size={24} color={dashboard.colors.primary[600]} />
                  </div>
                  <div style={{ marginLeft: dashboard.spacing.md }}>
                    <h3 style={{ fontSize: dashboard.typography.sm.fontSize, fontWeight: dashboard.typography.sm.fontWeight, color: dashboard.colors.text.primary }}>Create Landing Page</h3>
                    <p style={{ fontSize: dashboard.typography.sm.fontSize, color: dashboard.colors.text.muted }}>Build a new landing page</p>
                  </div>
                </div>
              </Card>

              <Card className="cursor-pointer transition-shadow duration-200 hover:shadow-lg">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: dashboard.spacing.xl2, height: dashboard.spacing.xl2, backgroundColor: dashboard.colors.blue[50], borderRadius: dashboard.borderRadius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="trendingUp" size={24} color={dashboard.colors.blue[600]} />
                  </div>
                  <div style={{ marginLeft: dashboard.spacing.md }}>
                    <h3 style={{ fontSize: dashboard.typography.sm.fontSize, fontWeight: dashboard.typography.sm.fontWeight, color: dashboard.colors.text.primary }}>View Leads</h3>
                    <p style={{ fontSize: dashboard.typography.sm.fontSize, color: dashboard.colors.text.muted }}>Manage your leads</p>
                  </div>
                </div>
              </Card>

              <Card className="cursor-pointer transition-shadow duration-200 hover:shadow-lg">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: dashboard.spacing.xl2, height: dashboard.spacing.xl2, backgroundColor: dashboard.colors.green[50], borderRadius: dashboard.borderRadius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="trendingUp" size={24} color={dashboard.colors.green[600]} />
                  </div>
                  <div style={{ marginLeft: dashboard.spacing.md }}>
                    <h3 style={{ fontSize: dashboard.typography.sm.fontSize, fontWeight: dashboard.typography.sm.fontWeight, color: dashboard.colors.text.primary }}>Analytics</h3>
                    <p style={{ fontSize: dashboard.typography.sm.fontSize, color: dashboard.colors.text.muted }}>View performance data</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}



