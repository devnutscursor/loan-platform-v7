'use client';

import React, { useState, useEffect } from 'react';
import { typography, colors, spacing, borderRadius } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';

interface Rate {
  id: string;
  loanType: string;
  rate: number;
  apr: number;
  points: number;
  monthlyPayment: number;
  lastUpdated: string;
  category?: 'featured' | '30yr-fixed' | '20yr-fixed' | '15yr-fixed' | 'arm';
}

interface ApiProduct {
  productId?: string;
  productName?: string;
  rate?: number;
  apr?: number;
  principalAndInterest?: number;
  totalPayment?: number;
  closingCost?: number;
  discount?: number;
  points?: number;
  lockPeriod?: number;
  priceStatus?: string;
  lastUpdate?: string;
}

interface TodaysRatesTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
}

// Default search parameters for today's rates
const defaultSearchParams = {
  // Borrower Information
  firstName: 'Market',
  lastName: 'Rates',
  vaFirstTimeUse: true,
  firstTimeHomeBuyer: false,
  monthsReserves: 6,
  selfEmployed: false,
  waiveEscrows: false,
  
  // Property Information
  county: 'Collin',
  state: 'TX',
  zipCode: '75024',
  numberOfStories: 1,
  numberOfUnits: '1',
  
  // Loan Information
  salesPrice: 400000,
  downPayment: 80000,
  downPaymentPercent: 20,
  baseLoanAmount: 320000,
  loanLevelDebtToIncomeRatio: 28,
  totalMonthlyQualifyingIncome: 11428,
  
  // Loan Details
  loanPurpose: 'Purchase',
  occupancy: 'PrimaryResidence',
  propertyType: 'SingleFamily',
  loanType: 'Conforming',
  creditScore: '740-759',
  loanTerm: 'ThirtyYear'
};

export default function TodaysRatesTab({
  selectedTemplate,
  className = ''
}: TodaysRatesTabProps) {
  const [rates, setRates] = useState<Rate[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rate' | 'payment'>('rate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // New state for enhanced features
  const [loanType, setLoanType] = useState<'purchase' | 'refinance'>('purchase');
  const [zipCode, setZipCode] = useState('75024');
  const [creditScore, setCreditScore] = useState('740-759');
  const [homeValue, setHomeValue] = useState('400000');
  const [subscribeToRates, setSubscribeToRates] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'featured' | '30yr-fixed' | '20yr-fixed' | '15yr-fixed' | 'arm'>('featured');

  const loanTypes = ['all', '30-Year Fixed', '15-Year Fixed', '5/1 ARM', '7/1 ARM', '10/1 ARM', 'FHA Loan', 'VA Loan'];

  // Transform API data to our Rate format
  const transformApiData = (apiProducts: any[]): Rate[] => {
    console.log('=== TRANSFORMING API DATA ===');
    console.log('Raw API products:', apiProducts);
    
    const transformedRates = apiProducts
      .filter(product => product.rate && product.apr && product.principalAndInterest)
      .map((product, index) => ({
        id: `${product.productId || product.productCode || 'rate'}-${index}-${product.rate}-${product.apr}`,
        loanType: getLoanTypeFromProduct(product.productName || ''),
        rate: product.rate,
        apr: product.apr,
        points: product.discount || 0, // Using discount as points
        monthlyPayment: Math.round(product.principalAndInterest),
        lastUpdated: product.lastUpdate || new Date().toISOString()
      }));
    
    console.log('Transformed rates:', transformedRates);
    
    // Filter to only show today's rates
    const todaysRates = transformedRates.filter(rate => {
      const isTodayRate = isToday(rate.lastUpdated);
      if (!isTodayRate) {
        console.log(`Filtering out rate from ${rate.lastUpdated} (not today)`);
      }
      return isTodayRate;
    });
    
    console.log(`Filtered to ${todaysRates.length} rates from today out of ${transformedRates.length} total rates`);
    return todaysRates;
  };

  // Check if a date is today
  const isToday = (dateString: string): boolean => {
    if (!dateString) return false;
    
    try {
      const date = new Date(dateString);
      const today = new Date();
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.log(`Invalid date format: ${dateString}`);
        return false;
      }
      
      // Compare dates (ignore time)
      const isTodayDate = date.toDateString() === today.toDateString();
      
      if (!isTodayDate) {
        console.log(`Date ${dateString} (${date.toDateString()}) is not today (${today.toDateString()})`);
      }
      
      return isTodayDate;
    } catch (error) {
      console.log(`Error parsing date ${dateString}:`, error);
      return false;
    }
  };

  // Get loan type from product name
  const getLoanTypeFromProduct = (productName: string): string => {
    const name = productName.toLowerCase();
    if (name.includes('30') || name.includes('thirty')) return '30-Year Fixed';
    if (name.includes('15') || name.includes('fifteen')) return '15-Year Fixed';
    if (name.includes('5/1') || name.includes('5-1')) return '5/1 ARM';
    if (name.includes('7/1') || name.includes('7-1')) return '7/1 ARM';
    if (name.includes('10/1') || name.includes('10-1')) return '10/1 ARM';
    if (name.includes('fha')) return 'FHA Loan';
    if (name.includes('va')) return 'VA Loan';
    if (name.includes('conventional')) return '30-Year Fixed'; // Default for conventional
    return '30-Year Fixed'; // Default
  };

  // Cache management functions
  const CACHE_KEY = 'todays_rates_cache';
  const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
  
  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const isExpired = (now - timestamp) > CACHE_DURATION;
      
      console.log('Cache check:', {
        cached: !!cached,
        timestamp: new Date(timestamp).toLocaleString(),
        age: Math.round((now - timestamp) / (1000 * 60 * 60)), // hours
        expired: isExpired
      });
      
      return isExpired ? null : data;
    } catch (error) {
      console.log('Error reading cache:', error);
      return null;
    }
  };
  
  const setCachedData = (data: any) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('Data cached successfully');
    } catch (error) {
      console.log('Error caching data:', error);
    }
  };

  // Fetch rates from API
  const fetchTodaysRates = async (forceRefresh = false) => {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedData();
      if (cachedData) {
        console.log('✅ Using cached data for today\'s rates');
        setRates(cachedData.rates || []);
        setLastUpdated(cachedData.lastUpdated || 'Cached');
        setIsLoading(false);
        return;
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('=== FETCHING TODAY\'S RATES FROM API ===');
      console.log('Force refresh:', forceRefresh);
      console.log('Search params:', defaultSearchParams);
      
      const response = await fetch('/api/ob/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultSearchParams),
      });

      const result = await response.json();
      console.log('TodaysRatesTab API Response:', result);
      console.log('Is mock data:', result.isMockData);
      console.log('Data source:', result.source);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch rates');
      }

      // Access the products from the correct path in the response
      const products = result.data?.products || result.products || [];
      console.log('Products from API:', products);
      
      const transformedRates = transformApiData(products);
      console.log('Final rates to display:', transformedRates);
      
      // Show warning if using mock data
      if (result.isMockData) {
        console.warn('⚠️ TodaysRatesTab: Using mock data due to API authentication failure');
        console.warn('⚠️ Data source:', result.source);
      } else {
        console.log('✅ TodaysRatesTab: Using real API data from:', result.source);
      }
      
      // Check if we have any rates for today
      if (transformedRates.length === 0) {
        console.log('⚠️ No rates available for today. This could mean:');
        console.log('  1. API returned no data for today');
        console.log('  2. All rates have dates that are not today');
        console.log('  3. Date format from API is not recognized');
        console.log('  4. API is returning mock data with old timestamps');
      } else {
        console.log(`✅ Found ${transformedRates.length} rates for today`);
      }
      
      // Cache the data for future use
      const cacheData = {
        rates: transformedRates,
        lastUpdated: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        dataSource: result.source,
        isMockData: result.isMockData,
        timestamp: new Date().toISOString()
      };
      setCachedData(cacheData);
      
      setRates(transformedRates);
      setLastUpdated(cacheData.lastUpdated);
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
      
      // Fallback to sample data if API fails
      console.log('Using fallback sample data...');
      const fallbackRates: Rate[] = [
        {
          id: 'fallback-1',
          loanType: '30-Year Fixed',
          rate: 6.875,
          apr: 6.925,
          points: 0,
          monthlyPayment: 2627,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'fallback-2',
          loanType: '15-Year Fixed',
          rate: 6.375,
          apr: 6.425,
          points: 0,
          monthlyPayment: 3456,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'fallback-3',
          loanType: '5/1 ARM',
          rate: 6.125,
          apr: 6.175,
          points: 0,
          monthlyPayment: 2434,
          lastUpdated: new Date().toISOString()
        }
      ];
      setRates(fallbackRates);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch rates on component mount
  useEffect(() => {
    fetchTodaysRates();
  }, []);

  const filteredRates = rates.filter(rate => 
    filter === 'all' || rate.loanType === filter
  ).sort((a, b) => {
    if (sortBy === 'rate') {
      return a.rate - b.rate;
    } else {
      return a.monthlyPayment - b.monthlyPayment;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRate = (rate: number) => {
    return `${rate.toFixed(3)}%`;
  };

  const getThemeColors = () => {
    return selectedTemplate === 'template1' 
      ? {
          primary: 'pink',
          primaryBg: 'bg-pink-50',
          primaryText: 'text-pink-600',
          primaryBorder: 'border-pink-200',
          primaryHover: 'hover:bg-pink-100'
        }
      : {
          primary: 'purple',
          primaryBg: 'bg-purple-50',
          primaryText: 'text-purple-600',
          primaryBorder: 'border-purple-200',
          primaryHover: 'hover:bg-purple-100'
        };
  };

  const theme = getThemeColors();

  return (
    <div style={{ width: '100%', ...(className ? { className } : {}) }}>
      {/* Header */}
      <div style={{ marginBottom: spacing.lg }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: spacing.md 
        }}>
          <div>
            <h2 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text.primary 
            }}>
              Today's Mortgage Rates
            </h2>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.text.secondary, 
              marginTop: spacing.sm 
            }}>
              Current rates as of {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: spacing.xs,
              marginTop: spacing.xs,
              padding: `${spacing.xs} ${spacing.sm}`,
              backgroundColor: colors.blue[50],
              borderRadius: borderRadius.md,
              border: `1px solid ${colors.blue[200]}`
            }}>
              {React.createElement(icons.calendar, { size: 16, color: colors.blue[600] })}
              <span style={{
                fontSize: typography.fontSize.sm,
                color: colors.blue[700],
                fontWeight: typography.fontWeight.medium
              }}>
                Showing only today's rates
              </span>
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: spacing.sm 
          }}>
            {React.createElement(icons.refresh, { size: 20, style: { color: colors.text.muted } })}
            <span style={{ 
              fontSize: typography.fontSize.sm, 
              color: colors.text.muted 
            }}>
              {lastUpdated ? `Updated ${lastUpdated}` : 'Loading...'}
            </span>
            {lastUpdated && lastUpdated !== 'Cached' && (
              <span style={{
                fontSize: typography.fontSize.xs,
                color: colors.green[600],
                backgroundColor: colors.green[50],
                padding: `${spacing.xs} ${spacing.sm}`,
                borderRadius: borderRadius.sm,
                fontWeight: typography.fontWeight.medium
              }}>
                Live Data
              </span>
            )}
            {lastUpdated === 'Cached' && (
              <span style={{
                fontSize: typography.fontSize.xs,
                color: colors.blue[600],
                backgroundColor: colors.blue[50],
                padding: `${spacing.xs} ${spacing.sm}`,
                borderRadius: borderRadius.sm,
                fontWeight: typography.fontWeight.medium
              }}>
                Cached Data
              </span>
            )}
          </div>
        </div>

        {/* Filters and Controls */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          gap: spacing.md, 
          marginBottom: spacing.lg 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: spacing.sm 
          }}>
            <label style={{ 
              fontSize: typography.fontSize.sm, 
              fontWeight: typography.fontWeight.medium, 
              color: colors.text.secondary 
            }}>
              Loan Type:
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ 
                padding: `${spacing.xs} ${spacing.md}`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: borderRadius.md,
                outline: 'none',
                fontSize: typography.fontSize.sm,
                color: colors.text.primary,
                backgroundColor: colors.white
              }}
            >
              {loanTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: spacing.sm 
          }}>
            <label style={{ 
              fontSize: typography.fontSize.sm, 
              fontWeight: typography.fontWeight.medium, 
              color: colors.text.secondary 
            }}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rate' | 'payment')}
              style={{ 
                padding: `${spacing.xs} ${spacing.md}`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: borderRadius.md,
                outline: 'none',
                fontSize: typography.fontSize.sm,
                color: colors.text.primary,
                backgroundColor: colors.white
              }}
            >
              <option value="rate">Interest Rate</option>
              <option value="payment">Monthly Payment</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
            <button
              onClick={() => fetchTodaysRates(false)}
              disabled={isLoading}
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                backgroundColor: colors.gray[100],
                color: colors.text.primary,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: borderRadius.md,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium
              }}
            >
              {React.createElement(icons.refresh, { size: 16 })}
              <span>{isLoading ? 'Updating...' : 'Refresh Rates'}</span>
            </button>
            
            <button
              onClick={() => fetchTodaysRates(true)}
              disabled={isLoading}
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                backgroundColor: colors.blue[600],
                color: colors.white,
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium
              }}
            >
              {React.createElement(icons.refresh, { size: 16 })}
              <span>Force Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            {React.createElement(icons.error, { size: 20, className: "text-red-500 mr-2" })}
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Rates Table */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              {React.createElement(icons.refresh, { size: 20, className: "animate-spin text-gray-500" })}
              <span className="text-gray-600">Loading today's rates...</span>
            </div>
          </div>
        ) : filteredRates.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              {React.createElement(icons.error, { size: 20, className: "text-gray-500" })}
              <span className="text-gray-600">No rates available for today</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className={`${theme.primaryBg} border-b border-gray-200`}>
              <tr>
                <th className={`px-6 py-4 text-left ${typography.body.small} font-semibold ${theme.primaryText}`}>
                  Loan Type
                </th>
                <th className={`px-6 py-4 text-left ${typography.body.small} font-semibold ${theme.primaryText}`}>
                  Interest Rate
                </th>
                <th className={`px-6 py-4 text-left ${typography.body.small} font-semibold ${theme.primaryText}`}>
                  APR
                </th>
                <th className={`px-6 py-4 text-left ${typography.body.small} font-semibold ${theme.primaryText}`}>
                  Points
                </th>
                <th className={`px-6 py-4 text-left ${typography.body.small} font-semibold ${theme.primaryText}`}>
                  Monthly Payment*
                </th>
                <th className={`px-6 py-4 text-left ${typography.body.small} font-semibold ${theme.primaryText}`}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRates.map((rate, index) => (
                <tr key={`${rate.id}-${index}-${rate.loanType}-${rate.rate}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {React.createElement(icons.document, { size: 16, className: "text-gray-500" })}
                      <span className={`${typography.body.small} font-medium text-gray-900`}>
                        {rate.loanType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`${typography.body.small} font-semibold text-gray-900`}>
                      {formatRate(rate.rate)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`${typography.body.small} text-gray-700`}>
                      {formatRate(rate.apr)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`${typography.body.small} text-gray-700`}>
                      {rate.points}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`${typography.body.small} font-semibold text-gray-900`}>
                      {formatCurrency(rate.monthlyPayment)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className={`px-4 py-2 ${theme.primaryBg} ${theme.primaryText} rounded-md ${theme.primaryHover} transition-colors flex items-center space-x-2`}
                    >
                      {React.createElement(icons.arrowRight, { size: 16 })}
                      <span>Get Quote</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Footer Note */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className={`${typography.body.xs} text-gray-600`}>
            * Monthly payment based on $400,000 loan amount. Rates are subject to change without notice. 
            Actual rates may vary based on credit score, loan amount, and other factors.
          </p>
        </div>
      </div>

      {/* Market Trends */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-10 h-10 ${theme.primaryBg} rounded-full flex items-center justify-center`}>
              {React.createElement(icons.trendingUp, { size: 20, className: theme.primaryText })}
            </div>
            <div>
              <h3 className={`${typography.body.small} font-semibold text-gray-900`}>
                Rate Trend
              </h3>
              <p className={`${typography.body.xs} text-gray-600`}>
                Last 30 days
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {React.createElement(icons.arrowUp, { size: 16, className: "text-green-500" })}
            <span className={`${typography.body.small} font-semibold text-green-600`}>
              +0.125%
            </span>
            <span className={`${typography.body.xs} text-gray-600`}>
              vs last month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-10 h-10 ${theme.primaryBg} rounded-full flex items-center justify-center`}>
              {React.createElement(icons.clock, { size: 20, className: theme.primaryText })}
            </div>
            <div>
              <h3 className={`${typography.body.small} font-semibold text-gray-900`}>
                Best Time
              </h3>
              <p className={`${typography.body.xs} text-gray-600`}>
                To lock rates
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {React.createElement(icons.calendar, { size: 16, className: "text-blue-500" })}
            <span className={`${typography.body.small} font-semibold text-blue-600`}>
              Tuesday-Thursday
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-10 h-10 ${theme.primaryBg} rounded-full flex items-center justify-center`}>
              {React.createElement(icons.shield, { size: 20, className: theme.primaryText })}
            </div>
            <div>
              <h3 className={`${typography.body.small} font-semibold text-gray-900`}>
                Rate Lock
              </h3>
              <p className={`${typography.body.xs} text-gray-600`}>
                Protection period
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {React.createElement(icons.clock, { size: 16, className: "text-orange-500" })}
            <span className={`${typography.body.small} font-semibold text-orange-600`}>
              30-60 days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
