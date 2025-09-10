'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/use-auth';
import { typography, colors, spacing, borderRadius } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  source: string;
  loanAmount?: number;
  downPayment?: number;
  creditScore?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  loanDetails?: {
    productId: string;
    lenderName: string;
    loanProgram: string;
    loanType: string;
    loanTerm: number;
    interestRate: number;
    apr: number;
    monthlyPayment: number;
    fees: number;
    points: number;
    credits: number;
    lockPeriod: number;
  };
}

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/leads');
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }

      // Update local state
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (err) {
      console.error('Error updating lead status:', err);
      alert('Failed to update lead status. Please try again.');
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return 'blue';
      case 'contacted':
        return 'yellow';
      case 'qualified':
        return 'green';
      case 'converted':
        return 'purple';
      case 'closed':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Borrower',
      render: (value: any, lead: Lead) => (
        <div>
          <div style={{ fontWeight: typography.fontWeight.medium }}>
            {lead.firstName} {lead.lastName}
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>
            {lead.email}
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value: any, lead: Lead) => (
        <div style={{ fontSize: typography.fontSize.sm }}>
          {lead.phone}
        </div>
      ),
    },
    {
      key: 'loanDetails',
      label: 'Loan Details',
      render: (value: any, lead: Lead) => (
        <div style={{ fontSize: typography.fontSize.sm }}>
          {lead.loanDetails ? (
            <div>
              <div style={{ fontWeight: typography.fontWeight.medium }}>
                {lead.loanDetails.loanProgram}
              </div>
              <div style={{ color: colors.gray[600] }}>
                {lead.loanDetails.lenderName}
              </div>
              <div style={{ color: colors.gray[600] }}>
                {lead.loanDetails.interestRate.toFixed(3)}% • {formatCurrency(lead.loanDetails.monthlyPayment)}/mo
              </div>
            </div>
          ) : (
            <span style={{ color: colors.gray[500] }}>No details</span>
          )}
        </div>
      ),
    },
    {
      key: 'loanAmount',
      label: 'Loan Amount',
      render: (value: any, lead: Lead) => (
        <div style={{ fontSize: typography.fontSize.sm }}>
          {formatCurrency(lead.loanAmount)}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, lead: Lead) => (
        <StatusBadge 
          status={lead.status} 
          color={getStatusColor(lead.status)}
        />
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (value: any, lead: Lead) => (
        <div style={{ fontSize: typography.fontSize.sm }}>
          {lead.source}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: any, lead: Lead) => (
        <div style={{ fontSize: typography.fontSize.sm }}>
          {formatDate(lead.createdAt)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, lead: Lead) => (
        <div style={{ display: 'flex', gap: spacing[2] }}>
          <select
            value={lead.status}
            onChange={(e) => handleStatusUpdate(lead.id, e.target.value as Lead['status'])}
            style={{
              padding: `${spacing[1]} ${spacing[2]}`,
              borderRadius: borderRadius.sm,
              border: `1px solid ${colors.gray[300]}`,
              fontSize: typography.fontSize.sm,
              backgroundColor: colors.white,
            }}
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Leads" subtitle="Manage your leads">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          fontSize: typography.fontSize.lg,
          color: colors.gray[600]
        }}>
          Loading leads...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Leads" subtitle="Manage your leads">
        <div style={{
          padding: spacing[6],
          backgroundColor: colors.red[50],
          border: `1px solid ${colors.red[200]}`,
          borderRadius: borderRadius.md,
          color: colors.red[600]
        }}>
          <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
            Error Loading Leads
          </h3>
          <p style={{ marginBottom: spacing[4] }}>{error}</p>
          <Button onClick={fetchLeads} variant="primary">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Leads" subtitle="Manage your leads">
      <div style={{ padding: spacing[6] }}>
        {/* Header with stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing[4],
          marginBottom: spacing[6]
        }}>
          <div style={{
            padding: spacing[4],
            backgroundColor: colors.blue[50],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.blue[200]}`
          }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.blue[600] }}>
              {leads.length}
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: colors.blue[600] }}>
              Total Leads
            </div>
          </div>
          
          <div style={{
            padding: spacing[4],
            backgroundColor: colors.green[50],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.green[200]}`
          }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.green[600] }}>
              {leads.filter(lead => lead.status === 'new').length}
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: colors.green[600] }}>
              New Leads
            </div>
          </div>
          
          <div style={{
            padding: spacing[4],
            backgroundColor: colors.darkPurple[50],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.darkPurple[200]}`
          }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.darkPurple[600] }}>
              {leads.filter(lead => lead.status === 'converted').length}
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: colors.darkPurple[600] }}>
              Converted
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div style={{
          backgroundColor: colors.white,
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.gray[200]}`,
          overflow: 'hidden'
        }}>
          <DataTable
            data={leads}
            columns={columns}
            loading={loading}
            emptyMessage="No leads found. Leads will appear here when borrowers submit information through the rate table."
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
