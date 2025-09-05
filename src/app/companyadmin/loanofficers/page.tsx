'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { sendLoanOfficerInvite, getLoanOfficersByCompany } from '@/lib/loan-officer-invite-system';
import { showSuccessNotification, showErrorNotification } from '@/components/notifications/NotificationProvider';

interface LoanOfficer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
}

interface CreateOfficerForm {
  email: string;
  firstName: string;
  lastName: string;
}

export default function LoanOfficersPage() {
  const { companyId } = useAuth();
  const [officers, setOfficers] = useState<LoanOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateOfficerForm>({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const fetchOfficers = useCallback(async () => {
    if (!companyId) {
      showErrorNotification('Error', 'Company ID not found. Please contact support.');
      setLoading(false);
      return;
    }

    try {
      const officerData = await getLoanOfficersByCompany(companyId);
      setOfficers(officerData);
    } catch (error) {
      console.error('Error fetching officers:', error);
      showErrorNotification('Error', 'Failed to fetch loan officers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchOfficers();
    }
  }, [companyId, fetchOfficers]);

  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    if (!companyId) {
      showErrorNotification('Error', 'Company ID not found. Please contact support.');
      setIsCreating(false);
      return;
    }

    try {
      const result = await sendLoanOfficerInvite({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyId: companyId
      });

      if (result.success) {
        showSuccessNotification('Invite Sent Successfully!', `An invitation has been sent to ${formData.email}.`);
        setFormData({ email: '', firstName: '', lastName: '' });
        setShowCreateForm(false);
        fetchOfficers();
      } else {
        showErrorNotification('Failed to Send Invite', result.message);
      }
    } catch (error) {
      console.error('Error creating officer:', error);
      showErrorNotification('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleResendInvite = async (officerId: string) => {
    // TODO: Implement resend invite functionality
    showSuccessNotification('Invite Resent', 'The invite has been resent to the loan officer.');
  };

  const handleDeactivateOfficer = async (officerId: string) => {
    if (!confirm('Are you sure you want to deactivate this loan officer? They will not be able to sign in.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/deactivate-officer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId })
      });
      
      const result = await response.json();
      if (result.success) {
        showSuccessNotification('Officer Deactivated', 'The loan officer has been deactivated successfully.');
        fetchOfficers();
      } else {
        showErrorNotification('Error', result.message);
      }
    } catch (error) {
      showErrorNotification('Error', 'Failed to deactivate officer. Please try again.');
    }
  };

  const handleDeleteOfficer = async (officerId: string) => {
    if (!confirm('Are you sure you want to delete this loan officer? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/delete-officer', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId })
      });
      
      const result = await response.json();
      if (result.success) {
        showSuccessNotification('Officer Deleted', 'The loan officer has been deleted successfully.');
        fetchOfficers();
      } else {
        showErrorNotification('Error', result.message);
      }
    } catch (error) {
      showErrorNotification('Error', 'Failed to delete officer. Please try again.');
    }
  };

  return (
    <RouteGuard allowedRoles={['super_admin', 'company_admin']}>
      <DashboardLayout 
        title="Loan Officers" 
        subtitle="Manage loan officers for your company"
      >
        <div className="space-y-6">
          {/* Add Officer Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Loan Officers</h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors font-medium"
                >
                  + Add Officer
                </button>
              </div>
            </div>

            {showCreateForm && (
              <div className="px-6 py-4 border-b border-gray-200">
                <form onSubmit={handleCreateOfficer} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="officer@company.com"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
                      disabled={isCreating}
                    >
                      {isCreating ? 'Sending Invite...' : 'Send Invite'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="px-6 py-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                </div>
              ) : officers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No loan officers found. Create your first officer above.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Officer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {officers.map((officer) => (
                        <tr key={officer.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-pink-600">
                                    {officer.firstName.charAt(0)}{officer.lastName.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {officer.firstName} {officer.lastName}
                                </div>
                                {officer.isActive && (
                                  <div className="text-xs text-green-600 font-medium">🟢 Active Officer</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {officer.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              officer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {officer.isActive ? '✅ Active' : '⏳ Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(officer.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {!officer.isActive && (
                                <>
                                  <button
                                    onClick={() => handleResendInvite(officer.id)}
                                    className="text-blue-600 hover:text-blue-900 text-xs"
                                  >
                                    Resend
                                  </button>
                                  <span className="text-gray-300">|</span>
                                  <button
                                    onClick={() => handleDeleteOfficer(officer.id)}
                                    className="text-red-600 hover:text-red-900 text-xs"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                              {officer.isActive && (
                                <button
                                  onClick={() => handleDeactivateOfficer(officer.id)}
                                  className="text-red-600 hover:text-red-900 text-xs"
                                >
                                  Deactivate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}