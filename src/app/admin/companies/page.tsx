'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface Company {
  id: string;
  name: string;
  slug: string;
  email: string;
  admin_email?: string;
  invite_status?: 'pending' | 'sent' | 'accepted' | 'expired';
  invite_sent_at?: string;
  invite_expires_at?: string;
  invite_token?: string;
  admin_user_id?: string;
  isActive?: boolean; // Optional due to schema cache issues
  created_at?: string;
  createdAt: string;
}

interface CreateCompanyForm {
  name: string;
  email: string;
  website?: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateCompanyForm>({
    name: '',
    email: '',
    website: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Simple approach: try to fetch companies to check if user is authenticated
    const checkAuth = async () => {
      try {
        // Try to fetch companies - if this works, user is authenticated
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .limit(1);

        if (error && error.message.includes('JWT')) {
          // JWT error means not authenticated
          setIsAuthenticated(false);
        } else {
          // No JWT error means authenticated
          setIsAuthenticated(true);
          fetchCompanies();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // REMOVED: onAuthStateChange listener - let useAuth hook handle this
    // Multiple listeners were causing conflicts
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Send invite using new invite system
      const response = await fetch('/api/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.name,
          adminEmail: formData.email,
          website: formData.website
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      setSuccess(`🎉 Company "${formData.name}" created successfully!

📧 Invite sent to: ${formData.email}

⏳ Next Steps:
1. The admin will receive an invite email
2. They need to click the invite link in their email
3. Create their password on the setup page
4. They'll be redirected to their company dashboard
5. They can then create loan officers

⚠️ Note: Invites expire in 24 hours. You can resend or delete from the table below.`);
      setFormData({ name: '', email: '', website: '' });
      setShowCreateForm(false);
      fetchCompanies();
    } catch (error: unknown) {
      console.error('Error creating company:', error);
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          setError('A user with this email already exists. Please use a different email or contact support.');
        } else if (error.message.includes('Invalid email')) {
          setError('Please enter a valid email address.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(error.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleResendInvite = async (companyId: string) => {
    try {
      const response = await fetch('/api/resend-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message);
        fetchCompanies(); // Refresh the list
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to resend invite. Please try again.');
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/delete-company', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message);
        fetchCompanies(); // Refresh the list
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to delete company. Please try again.');
    }
  };

  // Temporarily bypass auth check for testing
  // TODO: Fix authentication detection for free Supabase plan
  
  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  // Show authentication required if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access this page.</p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
            <p className="mt-2 text-gray-600">Manage companies and their administrators</p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Companies</h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
                >
                  {showCreateForm ? 'Cancel' : 'Create Company'}
                </button>
              </div>
            </div>

            {showCreateForm && (
              <div className="px-6 py-4 border-b border-gray-200">
                <form onSubmit={handleCreateCompany} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Website (Optional)</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}

                  {success && (
                    <div className="text-green-600 text-sm whitespace-pre-line">{success}</div>
                  )}

                  <div className="text-xs text-gray-500 mb-4">
                    💡 <strong>Tip:</strong> The admin will receive an invite email with a link to set up their account. Invites expire in 24 hours.
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
                    >
                      Send Invite
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
              ) : companies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No companies found. Create your first company above.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {companies.map((company) => (
                        <tr key={company.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{company.name}</div>
                            <div className="text-sm text-gray-500">{company.slug}</div>
                            {company.isActive && (
                              <div className="text-xs text-green-600 font-medium">🟢 Active Company</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {company.admin_email || company.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              company.invite_status === 'accepted' ? 'bg-green-100 text-green-800' :
                              company.invite_status === 'sent' ? 'bg-blue-100 text-blue-800' :
                              company.invite_status === 'expired' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {company.invite_status === 'accepted' ? '✅ Active' :
                               company.invite_status === 'sent' ? '📧 Invite Sent' :
                               company.invite_status === 'expired' ? '⏰ Expired' :
                               '⏳ Pending'}
                            </span>
                            {company.invite_status === 'sent' && company.invite_expires_at && (
                              <div className="text-xs text-gray-500 mt-1">
                                Expires: {new Date(company.invite_expires_at).toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {company.created_at ? new Date(company.created_at).toLocaleDateString() : 
                             company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {company.invite_status === 'sent' && (
                                <button
                                  onClick={() => handleResendInvite(company.id)}
                                  className="text-blue-600 hover:text-blue-900 text-xs"
                                >
                                  Resend
                                </button>
                              )}
                              {company.invite_status === 'expired' && (
                                <>
                                  <button
                                    onClick={() => handleResendInvite(company.id)}
                                    className="text-blue-600 hover:text-blue-900 text-xs"
                                  >
                                    Resend
                                  </button>
                                  <span className="text-gray-300">|</span>
                                </>
                              )}
                              {(company.invite_status === 'pending' || company.invite_status === 'expired') && (
                                <button
                                  onClick={() => handleDeleteCompany(company.id)}
                                  className="text-red-600 hover:text-red-900 text-xs"
                                >
                                  Delete
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
      </div>
  );
}
