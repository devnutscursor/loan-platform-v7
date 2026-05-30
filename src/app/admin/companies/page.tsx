'use client';

import React, { useEffect, useState } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/components/ui/Notification';
import { Button } from '@/components/ui/Button';

interface CompanyGhlDetails {
  id: string;
  name: string;
  ghl_connected_at?: string | null;
  isConnected: boolean;
}

export default function AdminCompaniesPage() {
  const { user, companyId, accessToken, loading: authLoading, roleLoading } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyGhlDetails | null>(null);

  useEffect(() => {
    const loadCompany = async () => {
      if (!user?.id || !companyId || !accessToken) return;
      try {
        setLoading(true);
        const res = await fetch('/api/companies/ghl-status', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to load company GHL details');
        }

        setCompany(json.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to load company GHL details:', message);
        showNotification({
          type: 'error',
          title: 'Load Failed',
          message: 'Unable to load company GHL details.',
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && !roleLoading) {
      loadCompany();
    }
  }, [user?.id, companyId, accessToken, authLoading, roleLoading, showNotification]);

  const handleReconnectGhl = () => {
    if (!company?.id || typeof window === 'undefined') return;
    const url = `${window.location.origin}/api/oauth/choose-location?company=${encodeURIComponent(company.id)}&returnTo=admin`;
    window.location.href = url;
  };

  const isConnected = Boolean(company?.isConnected);

  return (
    <RouteGuard allowedRoles={['company_admin']}>
      <DashboardLayout 
        showBreadcrumb={true}
        breadcrumbVariant="default"
        breadcrumbSize="md"
      >
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Access</h2>
            <p className="text-gray-600">
              As a company administrator, you can manage your company's loan officers and leads. 
              Company creation and management is handled by the super administrator.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> To create new companies or manage other companies, 
                you need super administrator privileges.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">GoHighLevel Connection</h2>
            {loading ? (
              <p className="text-gray-600">Loading company connection status...</p>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  {isConnected
                    ? 'GHL is connected. If token scopes changed (for example opportunities scopes), use reconnect.'
                    : 'GHL is not connected yet. First-time connect is done by Super Admin from Super Admin Companies page.'}
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                  {company?.ghl_connected_at && (
                    <span className="text-xs text-gray-500">
                      Connected at: {new Date(company.ghl_connected_at).toLocaleString()}
                    </span>
                  )}
                </div>
                {isConnected ? (
                  <Button
                    type="button"
                    onClick={handleReconnectGhl}
                    className="bg-[#01bcc6] hover:bg-[#008eab] text-white"
                  >
                    Reconnect with GHL
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
