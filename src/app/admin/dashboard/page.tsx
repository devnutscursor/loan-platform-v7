'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { DashboardLoadingState } from '@/components/ui/LoadingState';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { QuickActions } from '@/components/dashboard/QuickActions';

// Interfaces for Company Admin data
interface CompanyStats {
  totalOfficers: number;
  totalLeads: number;
  conversionRate: number;
  thisWeekLeads: number;
  thisMonthLeads: number;
  activeOfficers: number;
  topPerformingOfficer: string;
  averageResponseTime: number;
}

interface Officer {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  is_active: boolean;
  lead_count: number;
  conversion_count: number;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  officer_id: string;
}

export default function AdminDashboardPage() {
  const { user, userRole, companyId, loading: authLoading } = useAuth();
  const router = useRouter();

  // State for dashboard data
  const [companyStats, setCompanyStats] = useState<CompanyStats>({
    totalOfficers: 0,
    totalLeads: 0,
    conversionRate: 0,
    thisWeekLeads: 0,
    thisMonthLeads: 0,
    activeOfficers: 0,
    topPerformingOfficer: 'N/A',
    averageResponseTime: 0
  });
  const [recentOfficers, setRecentOfficers] = useState<Officer[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading || !user?.id || !companyId) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🚀 Company Admin Dashboard: Starting data fetch for company:', companyId);
        console.log('🔍 Company Admin Dashboard: User object:', { id: user.id, email: user.email });
        console.log('🔍 Company Admin Dashboard: Company ID type:', typeof companyId, 'value:', companyId);

        // Fetch officers data - need to join with user_companies table
        console.log('🔍 Company Admin Dashboard: Fetching officers...');
        const { data: officersData, error: officersError } = await supabase
          .from('user_companies')
          .select(`
            user_id,
            role,
            users!inner(
              id,
              email,
              first_name,
              last_name,
              created_at,
              is_active
            )
          `)
          .eq('company_id', companyId)
          .eq('role', 'employee');

        if (officersError) {
          console.error('❌ Company Admin: Officers fetch error:', {
            message: officersError.message,
            details: officersError.details,
            hint: officersError.hint,
            code: officersError.code,
            fullError: officersError
          });
          throw officersError;
        }

        console.log('✅ Company Admin Dashboard: Fetched officers:', officersData?.length || 0);

        // Fetch leads data
        console.log('🔍 Company Admin Dashboard: Fetching leads...');
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (leadsError) {
          console.error('❌ Company Admin: Leads fetch error:', {
            message: leadsError.message,
            details: leadsError.details,
            hint: leadsError.hint,
            code: leadsError.code,
            fullError: leadsError
          });
          throw leadsError;
        }

        console.log('✅ Company Admin Dashboard: Fetched leads:', leadsData?.length || 0);

        // Process officers data and calculate their lead counts
        const processedOfficers: Officer[] = (officersData || []).map(officerCompany => {
          const officer = Array.isArray(officerCompany.users) ? officerCompany.users[0] : officerCompany.users;
          const officerLeads = leadsData?.filter(lead => lead.officer_id === officer.id) || [];
          const conversions = officerLeads.filter(lead => lead.status === 'converted');
          
          return {
            id: officer.id,
            email: officer.email,
            full_name: officer.first_name && officer.last_name 
              ? `${officer.first_name} ${officer.last_name}` 
              : officer.email.split('@')[0],
            created_at: officer.created_at,
            is_active: officer.is_active,
            lead_count: officerLeads.length,
            conversion_count: conversions.length
          };
        });

        // Calculate statistics
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const totalLeads = leadsData?.length || 0;
        const convertedLeads = leadsData?.filter(lead => lead.status === 'converted').length || 0;
        const thisWeekLeads = leadsData?.filter(lead => new Date(lead.created_at) >= oneWeekAgo).length || 0;
        const thisMonthLeads = leadsData?.filter(lead => new Date(lead.created_at) >= oneMonthAgo).length || 0;
        const activeOfficers = processedOfficers.filter(officer => officer.is_active).length;
        const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

        // Find top performing officer
        const topOfficer = processedOfficers.reduce((top, current) => 
          current.conversion_count > top.conversion_count ? current : top, 
          processedOfficers[0] || { full_name: 'N/A', conversion_count: 0 }
        );

        setCompanyStats({
          totalOfficers: processedOfficers.length,
          totalLeads,
          conversionRate,
          thisWeekLeads,
          thisMonthLeads,
          activeOfficers,
          topPerformingOfficer: topOfficer.full_name,
          averageResponseTime: 2.5 // Mock data - would calculate from actual response times
        });

        setRecentOfficers(processedOfficers.slice(0, 3));
        setRecentLeads((leadsData || []).slice(0, 3));

        console.log('✅ Company Admin Dashboard: Data loaded successfully');
        console.log('📊 Company Admin Dashboard: Stats:', {
          totalOfficers: processedOfficers.length,
          totalLeads: leadsData?.length || 0,
          conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0
        });

      } catch (err) {
        console.error('❌ Company Admin Dashboard data fetch error:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          name: err instanceof Error ? err.name : 'Unknown',
          stack: err instanceof Error ? err.stack : undefined,
          fullError: err
        });
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id, companyId, authLoading]);

  // Show loading state
  if (authLoading || loading) {
    return (
      <RouteGuard allowedRoles={['company_admin']}>
        <DashboardLayout 
        >
          <DashboardLoadingState 
            text={authLoading ? 'Loading user data...' : 'Loading dashboard data...'} 
          />
        </DashboardLayout>
      </RouteGuard>
    );
  }

  // Show error state
  if (error) {
    return (
      <RouteGuard allowedRoles={['company_admin']}>
        <DashboardLayout 
        >
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
              backgroundColor: '#EBDBC7',
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
    <RouteGuard allowedRoles={['company_admin']}>
      <DashboardLayout 
        showBreadcrumb={true}
        breadcrumbVariant="default"
        breadcrumbSize="md"
        customBreadcrumbItems={[
          {
            label: 'Dashboard',
            href: '/admin/dashboard',
            icon: 'home' as keyof typeof icons
          }
        ]}
      >
        <div className="flex flex-col gap-4 sm:gap-6">
          

          {/* Company Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-5 animate-card-stagger-1" style={{ background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: 'rgba(235, 219, 199, 0.2)'
                  }}>
                    {React.createElement(icons.profile, { 
                      size: 20, 
                      style: { color: 'white' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={{ ...dashboard.statsCardLabel, color: 'white' }}>Loan Officers</p>
                  <p style={{ ...dashboard.statsCardValue, color: 'white' }}>{companyStats.totalOfficers}</p>
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
                    {React.createElement(icons.document, { 
                      size: 20, 
                      style: { color: 'white' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={{ ...dashboard.statsCardLabel, color: 'white' }}>Total Leads</p>
                  <p style={{ ...dashboard.statsCardValue, color: 'white' }}>{companyStats.totalLeads}</p>
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
                  <p style={{ ...dashboard.statsCardLabel, color: 'white' }}>Conversion Rate</p>
                  <p style={{ ...dashboard.statsCardValue, color: 'white' }}>{companyStats.conversionRate}%</p>
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
                    {React.createElement(icons.clock, { 
                      size: 20, 
                      style: { color: 'white' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={{ ...dashboard.statsCardLabel, color: 'white' }}>Avg Response</p>
                  <p style={{ ...dashboard.statsCardValue, color: 'white' }}>{companyStats.averageResponseTime}h</p>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-5 animate-card-stagger-1" style={{ background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: 'rgba(235, 219, 199, 0.2)'
                  }}>
                    {React.createElement(icons.star, { 
                      size: 20, 
                      style: { color: 'white' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={{ ...dashboard.statsCardLabel, color: 'white' }}>Top Performer</p>
                  <p style={{ ...dashboard.statsCardValue, color: 'white' }}>{companyStats.topPerformingOfficer}</p>
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
                  <p style={{ ...dashboard.statsCardLabel, color: 'white' }}>Active Officers</p>
                  <p style={{ ...dashboard.statsCardValue, color: 'white' }}>{companyStats.activeOfficers}</p>
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
                    {React.createElement(icons.calendar, { 
                      size: 20, 
                      style: { color: 'white' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={{ ...dashboard.statsCardLabel, color: 'white' }}>This Week</p>
                  <p style={{ ...dashboard.statsCardValue, color: 'white' }}>{companyStats.thisWeekLeads}</p>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Quick Actions */}
          <QuickActions
            actions={[
              { label: 'Loan Officers', icon: 'profile', href: '/admin/loanofficers' },
              { label: 'Leads Insights', icon: 'trendingUp', href: '/admin/insights' },
              { label: 'Conversion Stats', icon: 'calculator', href: '/admin/stats' },
              { label: 'Settings', icon: 'settings', href: '/admin/settings' },
              { label: 'Activities', icon: 'activity', href: '/admin/activities' },
            ]}
          />

          {/* Team Management & Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Recent Officers */}
            <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-6 animate-card-stagger-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-[#005b7c]">
                  Recent Officers
                </h3>
                <Button
                  variant="primary"
                  onClick={() => router.push('/admin/loanofficers')}
                  className="bg-[#01bcc6] hover:bg-[#008eab] text-white btn-view-all w-full sm:w-auto text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
                >
                  View All
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {recentOfficers.length > 0 ? (
                  recentOfficers.map((officer, index) => (
                    <div
                      key={`officer-${officer.id}-${officer.created_at}-${index}`}
                      className="flex items-center p-3 sm:p-4 bg-white rounded-2xl border border-[#01bcc6]/20"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#01bcc6]/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-[#008eab]">
                          {officer.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {officer.full_name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {officer.lead_count} leads • {officer.conversion_count} conversions
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-5 text-sm sm:text-base">
                    No officers yet
                  </p>
                )}
              </div>
            </SpotlightCard>

            {/* Recent Leads */}
            <SpotlightCard variant="default" className="dashboard-card p-4 sm:p-6 animate-card-stagger-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-[#005b7c]">
                  Recent Leads
                </h3>
                <Button
                  variant="primary"
                  onClick={() => router.push('/admin/insights')}
                  className="bg-[#01bcc6] hover:bg-[#008eab] text-white btn-view-all w-full sm:w-auto text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
                >
                  View All
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead, index) => (
                    <div
                      key={`lead-${lead.id}-${lead.created_at}-${index}`}
                      className="flex items-center p-3 sm:p-4 bg-white rounded-2xl border border-[#01bcc6]/20"
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
          </div>

        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
