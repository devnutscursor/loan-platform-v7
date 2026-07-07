'use client';

import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import SuperAdminEmbedWidgetsPanel from '@/components/super-admin/SuperAdminEmbedWidgetsPanel';

export default function SuperAdminEmbedWidgetsPage() {
  return (
    <RouteGuard allowedRoles={['super_admin']}>
      <DashboardLayout showBreadcrumb breadcrumbVariant="default" breadcrumbSize="md">
        <SuperAdminEmbedWidgetsPanel />
      </DashboardLayout>
    </RouteGuard>
  );
}
