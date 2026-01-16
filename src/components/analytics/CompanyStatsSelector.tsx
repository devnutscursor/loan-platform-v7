'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { Building2, TrendingUp, Users, DollarSign } from 'lucide-react';
import Loader from '@/components/ui/Loader';

interface Company {
  id: string;
  name: string;
  totalOfficers: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalRevenue: number;
  avgLoanAmount: number;
}

interface CompanyStatsSelectorProps {
  onCompanySelect: (companyId: string, companyName: string) => void;
}

const CompanyStatsSelector: React.FC<CompanyStatsSelectorProps> = ({ onCompanySelect }) => {
  const { accessToken } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'conversionRate' | 'totalLeads' | 'totalRevenue'>('conversionRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const itemsPerPage = 10;

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);


      if (!accessToken) {
        throw new Error('No access token available');
      }

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await fetch(`/api/analytics/companies-simple?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new Error('Failed to fetch companies data');
      }

      const result = await response.json();
      setCompanies(result.companies || []);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchCompanies();
    }
  }, [accessToken, currentPage, searchQuery, sortBy, sortOrder]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSort = (field: 'name' | 'conversionRate' | 'totalLeads' | 'totalRevenue') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const columns = [
    {
      key: 'name',
      title: 'Company Name',
      render: (value: any, record: Company) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#01bcc6]/10 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#01bcc6]" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.name}</div>
            <div className="text-sm text-gray-500">{record.totalOfficers} officers</div>
          </div>
        </div>
      ),
    },
    {
      key: 'totalLeads',
      title: 'Total Leads',
      render: (value: any, record: Company) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{record.totalLeads}</div>
          <div className="text-sm text-gray-500">leads</div>
        </div>
      ),
    },
    {
      key: 'conversionRate',
      title: 'Conversion Rate',
      render: (value: any, record: Company) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{(record.conversionRate || 0).toFixed(1)}%</div>
          <div className="text-sm text-gray-500">{record.convertedLeads} converted</div>
        </div>
      ),
    },
    {
      key: 'totalRevenue',
      title: 'Total Revenue',
      render: (value: any, record: Company) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">${(record.totalRevenue || 0).toLocaleString()}</div>
          <div className="text-sm text-gray-500">${(record.avgLoanAmount || 0).toLocaleString()} avg</div>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, record: Company) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => onCompanySelect(record.id, record.name)}
          className="bg-[#005b7c] hover:bg-[#01bcc6] text-white"
        >
          View Stats
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <Button
          onClick={fetchCompanies}
          variant="outline-white"
          size="sm"
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg shadow-sm border border-gray-200" style={{ background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)' }}>
          <div className="flex items-center">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(235, 219, 199, 0.2)' }}>
              <Building2 className="w-6 h-6" style={{ color: 'white' }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white">Total Companies</p>
              <p className="text-2xl font-bold text-white">{companies.length}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-sm border border-gray-200" style={{ background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)' }}>
          <div className="flex items-center">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(235, 219, 199, 0.2)' }}>
              <TrendingUp className="w-6 h-6" style={{ color: 'white' }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white">Avg Conversion</p>
              <p className="text-2xl font-bold text-white">
                {companies.length > 0 
                  ? (companies.reduce((sum, c) => sum + (c.conversionRate || 0), 0) / companies.length).toFixed(1)
                  : '0.0'
                }%
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-sm border border-gray-200" style={{ background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)' }}>
          <div className="flex items-center">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(235, 219, 199, 0.2)' }}>
              <Users className="w-6 h-6" style={{ color: 'white' }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white">Total Officers</p>
              <p className="text-2xl font-bold text-white">
                {companies.reduce((sum, c) => sum + c.totalOfficers, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-sm border border-gray-200" style={{ background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)' }}>
          <div className="flex items-center">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(235, 219, 199, 0.2)' }}>
              <DollarSign className="w-6 h-6" style={{ color: 'white' }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white">Total Revenue</p>
              <p className="text-2xl font-bold text-white">
                ${companies.reduce((sum, c) => sum + (c.totalRevenue || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Mobile Card View */}
        <div className="block md:hidden p-4 space-y-4">
          {companies.length > 0 ? (
            companies.map((company) => (
              <div
                key={company.id}
                className="bg-white border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow"
              >
                {/* Card Header - Company Info (Centered) */}
                <div className="flex flex-col items-center mb-3">
                  <div className="h-12 w-12 flex-shrink-0 mb-2">
                    <div className="h-12 w-12 rounded-lg bg-[#01bcc6]/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[#01bcc6]" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-md font-medium text-gray-900">
                      {company.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {company.totalOfficers} officers
                    </div>
                  </div>
                </div>

                {/* Card Body - Stats in 2 columns */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Total Leads */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Total Leads</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {company.totalLeads}
                    </span>
                  </div>

                  {/* Conversion Rate */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Conversion Rate</span>
                    <span className="text-sm font-semibold text-green-600">
                      {(company.conversionRate || 0).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {company.convertedLeads} converted
                    </span>
                  </div>

                  {/* Total Revenue */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Total Revenue</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${(company.totalRevenue || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Avg Loan Amount */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Avg Loan</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${(company.avgLoanAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="pt-3 border-t border-gray-100">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onCompanySelect(company.id, company.name)}
                    className="w-full bg-[#005b7c] hover:bg-[#01bcc6] text-white"
                  >
                    View Stats
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No companies found.</div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <DataTable
            data={companies}
            columns={columns}
          />
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={companies.length}
            pageSize={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyStatsSelector;
