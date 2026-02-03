'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLoadingState } from '@/components/ui/LoadingState';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { QuickActions } from '@/components/dashboard/QuickActions';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  loan_amount?: number;
  credit_score?: number;
  created_at: string;
  updated_at: string;
  company_id: string;
  officer_id: string;
}

interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
  highPriority: number;
  urgentPriority: number;
  thisWeek: number;
  thisMonth: number;
}

interface PublicLink {
  id: string;
  user_id: string;
  company_id: string;
  public_slug: string;
  is_active: boolean;
  expires_at?: string;
  max_uses?: number;
  current_uses: number;
  created_at: string;
  updated_at: string;
}

type DashboardFetchResult = {
  leads: Lead[];
  publicLink: PublicLink | null;
  publicProfileTemplate: string;
};

const DASHBOARD_FETCH_TTL_MS = 10000;
let dashboardFetchCache: { key: string; result: DashboardFetchResult; fetchedAt: number } | null = null;
let dashboardFetchPromise: Promise<DashboardFetchResult> | null = null;
let dashboardFetchKey: string | null = null;

export default function OfficersDashboardPage() {
  const { user, userRole, companyId, accessToken, loading: authLoading } = useAuth();
  const router = useRouter();

  // State for dashboard data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadStats, setLeadStats] = useState<LeadStats>({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
    highPriority: 0,
    urgentPriority: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [publicLink, setPublicLink] = useState<PublicLink | null>(null);
  const [publicProfileTemplate, setPublicProfileTemplate] = useState<string>('template1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateLeadStats = useCallback((leadsData: Lead[]): LeadStats => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats: LeadStats = {
      total: leadsData.length,
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      lost: 0,
      highPriority: 0,
      urgentPriority: 0,
      thisWeek: 0,
      thisMonth: 0
    };

    leadsData.forEach(lead => {
      // Count by status
      if (lead.status === 'new') stats.new++;
      else if (lead.status === 'contacted') stats.contacted++;
      else if (lead.status === 'qualified') stats.qualified++;
      else if (lead.status === 'converted') stats.converted++;
      else if (lead.status === 'lost') stats.lost++;

      // Count by priority
      if (lead.priority === 'high') stats.highPriority++;
      else if (lead.priority === 'urgent') stats.urgentPriority++;

      // Count by date
      const leadDate = new Date(lead.created_at);
      if (leadDate >= oneWeekAgo) stats.thisWeek++;
      if (leadDate >= oneMonthAgo) stats.thisMonth++;
    });

    return stats;
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Wait for auth to complete and ensure we have required data
      if (authLoading || !user?.id || !companyId) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchKey = `${user.id}:${companyId}`;
        const now = Date.now();

        if (dashboardFetchCache && dashboardFetchCache.key === fetchKey &&
          (now - dashboardFetchCache.fetchedAt) < DASHBOARD_FETCH_TTL_MS) {
          setLeads(dashboardFetchCache.result.leads);
          setLeadStats(calculateLeadStats(dashboardFetchCache.result.leads));
          setPublicLink(dashboardFetchCache.result.publicLink);
          setPublicProfileTemplate(dashboardFetchCache.result.publicProfileTemplate);
          return;
        }

        if (dashboardFetchPromise && dashboardFetchKey === fetchKey) {
          const result = await dashboardFetchPromise;
          setLeads(result.leads);
          setLeadStats(calculateLeadStats(result.leads));
          setPublicLink(result.publicLink);
          setPublicProfileTemplate(result.publicProfileTemplate);
          return;
        }

        // Load dashboard data from a single server endpoint
        dashboardFetchKey = fetchKey;
        dashboardFetchPromise = (async () => {
          const response = await fetch(`/api/officers/dashboard?companyId=${encodeURIComponent(companyId)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
          }

          const result = await response.json();
          if (!result.success) {
            throw new Error(result.error || 'Dashboard data fetch failed');
          }

          return {
            leads: result.leads || [],
            publicLink: result.publicLink || null,
            publicProfileTemplate: result.publicProfileTemplate || 'template1'
          };
        })();

        const result = await dashboardFetchPromise;
        dashboardFetchCache = { key: fetchKey, result, fetchedAt: Date.now() };

        // Handle leads result
        setLeads(result.leads);
        setLeadStats(calculateLeadStats(result.leads));

        // Handle public link result
        setPublicLink(result.publicLink);

        // Handle template result
        setPublicProfileTemplate(result.publicProfileTemplate);

      } catch (err) {
        console.error('❌ Dashboard data fetch error:', err instanceof Error ? err.message : 'Unknown error');
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        dashboardFetchPromise = null;
        dashboardFetchKey = null;
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id, companyId, authLoading, accessToken]);

  // Get recent leads (last 3) - memoized
  const recentLeads = useMemo(() => leads.slice(0, 3), [leads]);

  // Get priority leads (last 3) - memoized
  const priorityLeads = useMemo(() => 
    leads.filter(lead => lead.priority === 'high' || lead.priority === 'urgent').slice(0, 3),
    [leads]
  );

  // Get public profile template name
  const getPublicProfileTemplateName = (templateSlug: string) => {
    switch (templateSlug) {
      case 'template1':
        return 'Template1';
      case 'template2':
        return 'Template2';
      default:
        return 'Default Template';
    }
  };

  // Show loading state while auth is loading or data is being fetched
  if (authLoading || loading) {
    return (
      <RouteGuard allowedRoles={['employee']}>
        <DashboardLayout>
          <DashboardLoadingState />
        </DashboardLayout>
      </RouteGuard>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <RouteGuard allowedRoles={['employee']}>
        <DashboardLayout>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'rgba(1, 188, 198, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {React.createElement(icons.alertCircle, { 
                size: 24, 
                style: { color: '#dc2626' } 
              })}
            </div>
            <p style={{ color: '#dc2626', fontSize: '16px', fontWeight: 'medium' }}>
              Error loading dashboard
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['employee']}>
      <DashboardLayout 
        showBreadcrumb={true}
        breadcrumbVariant="default"
        breadcrumbSize="md"
        customBreadcrumbItems={[
          {
            label: 'Dashboard',
            href: '/officers/dashboard',
            icon: 'home' as keyof typeof icons
          }
        ]}
      >
        <div className="flex flex-col gap-4 sm:gap-6">
          

          {/* Lead Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-5 animate-card-stagger-1" style={{ background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: 'rgba(235, 219, 199, 0.2)'
                  }}>
                    {React.createElement(icons.document, { 
                      size: 20, 
                      style: { color: 'white' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={{ ...dashboard.statsCardLabel, color: 'white' }}>Total Leads</p>
                  <p style={{ ...dashboard.statsCardValue, color: 'white' }}>{leadStats.total}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-5 animate-card-stagger-1" style={{ background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: 'rgba(235, 219, 199, 0.2)'
                  }}>
                    {React.createElement(icons.checkCircle, { 
                      size: 20, 
                      style: { color: 'white' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={{ ...dashboard.statsCardLabel, color: 'white' }}>Converted</p>
                  <p style={{ ...dashboard.statsCardValue, color: 'white' }}>{leadStats.converted}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-5 animate-card-stagger-1" style={{ background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: 'rgba(235, 219, 199, 0.2)'
                  }}>
                    {React.createElement(icons.alertTriangle, { 
                      size: 20, 
                      style: { color: 'white' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={{ ...dashboard.statsCardLabel, color: 'white' }}>High Priority</p>
                  <p style={{ ...dashboard.statsCardValue, color: 'white' }}>{leadStats.highPriority + leadStats.urgentPriority}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-5 animate-card-stagger-1" style={{ background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: 'rgba(235, 219, 199, 0.2)'
                  }}>
                    {React.createElement(icons.trendingUp, { 
                      size: 20, 
                      style: { color: 'white' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={{ ...dashboard.statsCardLabel, color: 'white' }}>This Week</p>
                  <p style={{ ...dashboard.statsCardValue, color: 'white' }}>{leadStats.thisWeek}</p>
              </div>
            </div>
            </SpotlightCard>
          </div>

          {/* Quick Actions */}
          <QuickActions
            wrapper="card"
            gap={16}
            actions={[
              { label: 'Leads', icon: 'document', href: '/officers/leads', minWidth: 120 },
              { label: 'Profile', icon: 'profile', href: '/officers/profile', minWidth: 120 },
              { label: 'Customizer', icon: 'edit', href: '/officers/customizer', minWidth: 120 },
              { label: "Today's Rates", icon: 'trendingUp', href: '/officers/todays-rates', minWidth: 140 },
              { label: 'Content Management', icon: 'book', href: '/officers/content-management', minWidth: 160 },
              { label: 'Settings', icon: 'settings', href: '/officers/settings', minWidth: 120 },
              { label: 'Activities', icon: 'activity', href: '/officers/activities', minWidth: 120 },
            ]}
          />

          {/* Working Cards Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Recent Leads Card */}
            <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-6 animate-card-stagger-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-[#005b7c]">
                  Recent Leads
                </h3>
                <Button
                  variant="primary"
                  onClick={() => router.push('/officers/leads')}
                  className="bg-[#01bcc6] hover:bg-[#008eab] text-white btn-view-all w-full sm:w-auto text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
                >
                  View All
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead: Lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center p-3 sm:p-4 bg-white rounded-2xl border border-[#01bcc6]/20 cursor-pointer hover:border-[#01bcc6]/40 transition-colors"
                      onClick={() => {
                        const leadSlug = `${lead.first_name.toLowerCase()}-${lead.last_name.toLowerCase()}-${lead.id.slice(-8)}`;
                        router.push(`/officers/leads/${leadSlug}`);
                      }}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#01bcc6]/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-[#008eab]">
                          {lead.first_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {lead.first_name} {lead.last_name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {lead.status} • {lead.priority} priority
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-5 text-sm sm:text-base">
                    No leads yet
                  </p>
                )}
              </div>
            </SpotlightCard>

            {/* Priority Leads Card */}
            <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-6 animate-card-stagger-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-[#005b7c]">
                  Priority Leads
                </h3>
                <Button
                  variant="primary"
                  onClick={() => router.push('/officers/leads?priority=high')}
                  className="bg-[#01bcc6] hover:bg-[#008eab] text-white btn-view-all w-full sm:w-auto text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
                >
                  View All
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {priorityLeads.length > 0 ? (
                  priorityLeads.map((lead: Lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center p-3 sm:p-4 bg-white rounded-2xl border border-[#01bcc6]/20 cursor-pointer hover:border-[#01bcc6]/40 transition-colors"
                      onClick={() => {
                        const leadSlug = `${lead.first_name.toLowerCase()}-${lead.last_name.toLowerCase()}-${lead.id.slice(-8)}`;
                        router.push(`/officers/leads/${leadSlug}`);
                      }}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#01bcc6]/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-[#008eab]">
                          {lead.first_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {lead.first_name} {lead.last_name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {lead.status} • {lead.priority} priority
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-5 text-sm sm:text-base">
                    No priority leads
                  </p>
                )}
              </div>
            </SpotlightCard>
          </div>

          {/* Public Profile Information */}
          <SpotlightCard variant="default" className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-[#005b7c] mb-4">
              Public Profile
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Template Selection */}
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#005b7c] mb-3">
                  Selected Template
                </h4>
                <SpotlightCard variant="default" className="dashboard-card p-3 sm:p-4 animate-card-stagger-3 bg-gray-50 border border-[#01bcc6]/20">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#01bcc6]/10 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                      {React.createElement(icons.palette, { 
                        size: 16, 
                        style: { color: '#008eab' } 
                      })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {getPublicProfileTemplateName(publicProfileTemplate)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        Public Profile Template
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => router.push('/officers/customizer')}
                    className="btn-primary-solid w-full sm:w-auto min-w-[120px] sm:min-w-[140px] px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
                  >
                    Customize Template
                  </Button>
                </SpotlightCard>
              </div>

              {/* Public Link */}
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#005b7c] mb-3">
                  Public Link
                </h4>
                <SpotlightCard variant="default" className="dashboard-card p-3 sm:p-4 animate-card-stagger-3 bg-gray-50 border border-[#01bcc6]/20">
                  {publicLink ? (
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#01bcc6]/10 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                          {React.createElement(icons.link, { 
                            size: 16, 
                            style: { color: '#008eab' } 
                          })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            Active Public Link
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 break-all">
                            {typeof window !== 'undefined' ? `${window.location.origin}/public/profile/${publicLink.public_slug}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                        <Button
                          variant="primary"
                          onClick={() => router.push('/officers/profile')}
                          className="btn-primary-solid w-full sm:w-auto min-w-[100px] sm:min-w-[120px] px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-[#005b7c]"
                        >
                          Manage Profile
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => typeof window !== 'undefined' && window.open(`${window.location.origin}/public/profile/${publicLink.public_slug}`, '_blank')}
                          className="btn-primary-solid w-full sm:w-auto min-w-[80px] sm:min-w-[100px] px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-[#10b981] to-[#059669]"
                        >
                          Open Link
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#01bcc6]/10 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                          {React.createElement(icons.alertCircle, { 
                            size: 16, 
                            style: { color: '#008eab' } 
                          })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            No Public Link
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Create your public profile
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => router.push('/officers/profile')}
                        className="btn-primary-solid w-full sm:w-auto min-w-[120px] sm:min-w-[140px] px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md"
                      >
                        Create Profile
                      </Button>
                    </div>
                  )}
                </SpotlightCard>
              </div>
            </div>
            </SpotlightCard>

        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}