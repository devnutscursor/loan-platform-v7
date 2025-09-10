'use client';

import React, { useState, useEffect } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/hooks/use-auth';
import { colors, spacing, borderRadius, shadows, typography, getTemplateStyles } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface Rate {
  id: string;
  loanType: string;
  rate: number;
  apr: number;
  points: number;
  monthlyPayment: number;
  lastUpdated: string;
  category: 'featured' | '30yr-fixed' | '20yr-fixed' | '15yr-fixed' | 'arm';
}

interface TodaysRatesPageProps {
  template?: 'template1' | 'template2';
}

export default function TodaysRatesPage({ template = 'template1' }: TodaysRatesPageProps) {
  const { user } = useAuth();
  const templateStyles = getTemplateStyles(template);
  
  // State for left sidebar
  const [loanType, setLoanType] = useState<'purchase' | 'refinance'>('purchase');
  const [zipCode, setZipCode] = useState('75024');
  const [creditScore, setCreditScore] = useState('740-759');
  const [homeValue, setHomeValue] = useState('400000');
  const [subscribeToRates, setSubscribeToRates] = useState(false);
  
  // State for right section
  const [activeCategory, setActiveCategory] = useState<'featured' | '30yr-fixed' | '20yr-fixed' | '15yr-fixed' | 'arm'>('featured');
  const [rates, setRates] = useState<Rate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample rates data - in real implementation, this would come from API
  const sampleRates: Rate[] = [
    {
      id: '1',
      loanType: '30-Year Fixed',
      rate: 6.875,
      apr: 6.925,
      points: 0,
      monthlyPayment: 2103,
      lastUpdated: new Date().toISOString(),
      category: 'featured'
    },
    {
      id: '2',
      loanType: '30-Year Fixed',
      rate: 6.750,
      apr: 6.800,
      points: 0.5,
      monthlyPayment: 2074,
      lastUpdated: new Date().toISOString(),
      category: '30yr-fixed'
    },
    {
      id: '3',
      loanType: '20-Year Fixed',
      rate: 6.625,
      apr: 6.675,
      points: 0,
      monthlyPayment: 2305,
      lastUpdated: new Date().toISOString(),
      category: '20yr-fixed'
    },
    {
      id: '4',
      loanType: '15-Year Fixed',
      rate: 6.375,
      apr: 6.425,
      points: 0,
      monthlyPayment: 2768,
      lastUpdated: new Date().toISOString(),
      category: '15yr-fixed'
    },
    {
      id: '5',
      loanType: '5/1 ARM',
      rate: 6.250,
      apr: 6.300,
      points: 0,
      monthlyPayment: 1970,
      lastUpdated: new Date().toISOString(),
      category: 'arm'
    }
  ];

  useEffect(() => {
    // Filter rates based on active category
    const filteredRates = sampleRates.filter(rate => {
      if (activeCategory === 'featured') {
        return rate.category === 'featured';
      }
      return rate.category === activeCategory;
    });
    setRates(filteredRates);
  }, [activeCategory]);

  const handleGetStarted = (rate: Rate) => {
    console.log('Get started with rate:', rate);
    // TODO: Implement get started flow
  };

  const handleSubscribeToRates = () => {
    console.log('Subscribe to rate tracking');
    // TODO: Implement subscription flow
  };

  const rateCategories = [
    { id: 'featured', label: 'Featured', count: 1 },
    { id: '30yr-fixed', label: '30yr Fixed', count: 1 },
    { id: '20yr-fixed', label: '20yr Fixed', count: 1 },
    { id: '15yr-fixed', label: '15yr Fixed', count: 1 },
    { id: 'arm', label: 'ARM Options', count: 1 }
  ] as const;

  return (
    <RouteGuard allowedRoles={['employee', 'company_admin']}>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: colors.background 
      }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: colors.white, 
          borderBottom: `1px solid ${colors.gray[200]}`,
          padding: `${spacing.lg} 0`
        }}>
          <div style={{ 
            maxWidth: '1280px', 
            margin: '0 auto', 
            padding: `0 ${spacing.lg}` 
          }}>
            <h1 style={{ 
              fontSize: typography.fontSize['3xl'], 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text.primary,
              margin: 0
            }}>
              Today's Rates
            </h1>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.text.secondary, 
              marginTop: spacing.sm,
              margin: 0
            }}>
              Current mortgage rates as of {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: `${spacing.lg}`,
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: spacing.lg
        }}>
          {/* Left Sidebar - Mortgage Details */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: spacing.lg 
          }}>
            {/* Rating Display */}
            <Card>
              <CardBody>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  marginBottom: spacing.md
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: spacing.xs 
                  }}>
                    {[...Array(5)].map((_, i) => (
                      <icons.star 
                        key={i} 
                        size={20} 
                        style={{ color: colors.yellow[400] }} 
                      />
                    ))}
                  </div>
                  <span style={{ 
                    fontSize: typography.fontSize.lg, 
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary
                  }}>
                    4.9
                  </span>
                  <span style={{ 
                    fontSize: typography.fontSize.sm, 
                    color: colors.text.secondary 
                  }}>
                    (2,847 reviews)
                  </span>
                </div>
                <p style={{ 
                  fontSize: typography.fontSize.sm, 
                  color: colors.text.secondary,
                  margin: 0
                }}>
                  "Excellent service and competitive rates. Highly recommended!"
                </p>
              </CardBody>
            </Card>

            {/* Loan Type Toggle */}
            <Card>
              <CardBody>
                <h3 style={{ 
                  fontSize: typography.fontSize.lg, 
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                  margin: 0
                }}>
                  Loan Type
                </h3>
                <div style={{ 
                  display: 'flex', 
                  backgroundColor: colors.gray[100], 
                  borderRadius: borderRadius.md,
                  padding: spacing.xs
                }}>
                  <button
                    onClick={() => setLoanType('purchase')}
                    style={{
                      flex: 1,
                      padding: `${spacing.sm} ${spacing.md}`,
                      borderRadius: borderRadius.sm,
                      border: 'none',
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      cursor: 'pointer',
                      backgroundColor: loanType === 'purchase' ? templateStyles.primary.color : 'transparent',
                      color: loanType === 'purchase' ? colors.white : colors.text.secondary,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Purchase
                  </button>
                  <button
                    onClick={() => setLoanType('refinance')}
                    style={{
                      flex: 1,
                      padding: `${spacing.sm} ${spacing.md}`,
                      borderRadius: borderRadius.sm,
                      border: 'none',
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      cursor: 'pointer',
                      backgroundColor: loanType === 'refinance' ? templateStyles.primary.color : 'transparent',
                      color: loanType === 'refinance' ? colors.white : colors.text.secondary,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Refinance
                  </button>
                </div>
              </CardBody>
            </Card>

            {/* Input Fields */}
            <Card>
              <CardBody>
                <h3 style={{ 
                  fontSize: typography.fontSize.lg, 
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                  margin: 0
                }}>
                  Get Personalized Rates
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: typography.fontSize.sm, 
                      fontWeight: typography.fontWeight.medium, 
                      color: colors.text.secondary, 
                      marginBottom: spacing.xs 
                    }}>
                      Zip Code
                    </label>
                    <Input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="Enter zip code"
                    />
                  </div>
                  
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: typography.fontSize.sm, 
                      fontWeight: typography.fontWeight.medium, 
                      color: colors.text.secondary, 
                      marginBottom: spacing.xs 
                    }}>
                      Credit Score Range
                    </label>
                    <select
                      value={creditScore}
                      onChange={(e) => setCreditScore(e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: `${spacing.sm} ${spacing.md}`,
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: borderRadius.md,
                        outline: 'none',
                        fontSize: typography.fontSize.sm,
                        color: colors.text.primary,
                        backgroundColor: colors.white
                      }}
                    >
                      <option value="500-579">500-579 (Poor)</option>
                      <option value="580-619">580-619 (Fair)</option>
                      <option value="620-659">620-659 (Fair)</option>
                      <option value="660-719">660-719 (Good)</option>
                      <option value="720-759">720-759 (Good)</option>
                      <option value="760-850">760-850 (Excellent)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: typography.fontSize.sm, 
                      fontWeight: typography.fontWeight.medium, 
                      color: colors.text.secondary, 
                      marginBottom: spacing.xs 
                    }}>
                      Home Value
                    </label>
                    <Input
                      type="number"
                      value={homeValue}
                      onChange={(e) => setHomeValue(e.target.value)}
                      placeholder="Enter home value"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Rate Tracking Subscription */}
            <Card>
              <CardBody>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  marginBottom: spacing.md
                }}>
                  <input
                    type="checkbox"
                    id="subscribeToRates"
                    checked={subscribeToRates}
                    onChange={(e) => setSubscribeToRates(e.target.checked)}
                    style={{ 
                      height: '1rem',
                      width: '1rem',
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: borderRadius.sm,
                      color: templateStyles.primary.color,
                      accentColor: templateStyles.primary.color
                    }}
                  />
                  <label htmlFor="subscribeToRates" style={{ 
                    fontSize: typography.fontSize.sm, 
                    color: colors.text.secondary,
                    cursor: 'pointer'
                  }}>
                    Subscribe to rate tracking
                  </label>
                </div>
                <p style={{ 
                  fontSize: typography.fontSize.xs, 
                  color: colors.text.muted,
                  margin: 0
                }}>
                  Get notified when rates change for your area and credit profile.
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Right Section - Rate Display */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: spacing.lg 
          }}>
            {/* Rate Category Tabs */}
            <Card>
              <CardBody>
                <div style={{ 
                  display: 'flex', 
                  gap: spacing.sm,
                  borderBottom: `1px solid ${colors.gray[200]}`,
                  marginBottom: spacing.lg
                }}>
                  {rateCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      style={{
                        padding: `${spacing.sm} ${spacing.md}`,
                        border: 'none',
                        borderBottom: `2px solid ${activeCategory === category.id ? templateStyles.primary.color : 'transparent'}`,
                        backgroundColor: 'transparent',
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        color: activeCategory === category.id ? templateStyles.primary.color : colors.text.secondary,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {category.label}
                      <span style={{ 
                        marginLeft: spacing.xs,
                        fontSize: typography.fontSize.xs,
                        color: colors.text.muted
                      }}>
                        ({category.count})
                      </span>
                    </button>
                  ))}
                </div>

                {/* Rate Listings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                  {rates.map((rate) => (
                    <div
                      key={rate.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: spacing.lg,
                        border: `1px solid ${colors.gray[200]}`,
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.white
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: spacing.md,
                          marginBottom: spacing.sm
                        }}>
                          <div>
                            <h4 style={{ 
                              fontSize: typography.fontSize.lg, 
                              fontWeight: typography.fontWeight.semibold,
                              color: colors.text.primary,
                              margin: 0
                            }}>
                              {rate.loanType}
                            </h4>
                            <p style={{ 
                              fontSize: typography.fontSize.sm, 
                              color: colors.text.secondary,
                              margin: 0
                            }}>
                              {rate.points === 0 ? 'No points' : `${rate.points} points`}
                            </p>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: spacing.xs
                          }}>
                            <span style={{ 
                              fontSize: typography.fontSize['2xl'], 
                              fontWeight: typography.fontWeight.bold,
                              color: templateStyles.primary.color
                            }}>
                              {rate.rate.toFixed(3)}%
                            </span>
                            <span style={{ 
                              fontSize: typography.fontSize.sm, 
                              color: colors.text.muted
                            }}>
                              APR: {rate.apr.toFixed(3)}%
                            </span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: spacing.xs
                          }}>
                            <span style={{ 
                              fontSize: typography.fontSize.base, 
                              fontWeight: typography.fontWeight.medium,
                              color: colors.text.primary
                            }}>
                              ${rate.monthlyPayment.toLocaleString()}/mo
                            </span>
                            <span style={{ 
                              fontSize: typography.fontSize.xs, 
                              color: colors.text.muted
                            }}>
                              Principal & Interest
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleGetStarted(rate)}
                        style={{
                          backgroundColor: templateStyles.primary.color,
                          color: colors.white,
                          border: 'none',
                          padding: `${spacing.sm} ${spacing.lg}`,
                          borderRadius: borderRadius.md,
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Get Started
                      </Button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Personalized Rates CTA */}
            <Card>
              <CardBody>
                <div style={{ 
                  textAlign: 'center',
                  padding: spacing.lg
                }}>
                  <h3 style={{ 
                    fontSize: typography.fontSize.xl, 
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    marginBottom: spacing.sm,
                    margin: 0
                  }}>
                    Get Your Personalized Rates
                  </h3>
                  <p style={{ 
                    fontSize: typography.fontSize.base, 
                    color: colors.text.secondary,
                    marginBottom: spacing.lg,
                    margin: 0
                  }}>
                    See rates tailored to your specific situation and credit profile.
                  </p>
                  <Button
                    onClick={handleSubscribeToRates}
                    style={{
                      backgroundColor: templateStyles.primary.color,
                      color: colors.white,
                      border: 'none',
                      padding: `${spacing.md} ${spacing.lg}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Get My Rates
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
