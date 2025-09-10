'use client';

import React, { useState } from 'react';
import { typography } from '@/theme/theme';
import Icon from '@/components/ui/Icon';

interface FindMyHomeTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
}

export default function FindMyHomeTab({
  selectedTemplate,
  className = ''
}: FindMyHomeTabProps) {
  const [searchCriteria, setSearchCriteria] = useState({
    location: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: 'all'
  });
  const [showIframe, setShowIframe] = useState(false);

  const getThemeColors = () => {
    return selectedTemplate === 'template1' 
      ? {
          primary: 'pink',
          primaryBg: 'bg-pink-50',
          primaryText: 'text-pink-600',
          primaryBorder: 'border-pink-200',
          primaryHover: 'hover:bg-pink-100',
          primaryButton: 'bg-pink-600 hover:bg-pink-700'
        }
      : {
          primary: 'purple',
          primaryBg: 'bg-purple-50',
          primaryText: 'text-purple-600',
          primaryBorder: 'border-purple-200',
          primaryHover: 'hover:bg-purple-100',
          primaryButton: 'bg-purple-600 hover:bg-purple-700'
        };
  };

  const theme = getThemeColors();

  const handleSearch = () => {
    setShowIframe(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const propertyTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'single-family', label: 'Single Family' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'multi-family', label: 'Multi-Family' }
  ];

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h2 className={typography.headings.h4}>
          Find My Home
        </h2>
        <p className={`${typography.body.base} text-gray-600 mt-2`}>
          Search for your perfect home with our comprehensive property search tool
        </p>
      </div>

      {!showIframe ? (
        <>
          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-8">
            <h3 className={`${typography.headings.h5} mb-6`}>
              Search Criteria
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="location" className={`block ${typography.body.small} font-medium text-gray-700 mb-2`}>
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={searchCriteria.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State or ZIP"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label htmlFor="priceMin" className={`block ${typography.body.small} font-medium text-gray-700 mb-2`}>
                  Min Price
                </label>
                <input
                  type="number"
                  id="priceMin"
                  value={searchCriteria.priceMin}
                  onChange={(e) => handleInputChange('priceMin', e.target.value)}
                  placeholder="$0"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label htmlFor="priceMax" className={`block ${typography.body.small} font-medium text-gray-700 mb-2`}>
                  Max Price
                </label>
                <input
                  type="number"
                  id="priceMax"
                  value={searchCriteria.priceMax}
                  onChange={(e) => handleInputChange('priceMax', e.target.value)}
                  placeholder="No limit"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label htmlFor="bedrooms" className={`block ${typography.body.small} font-medium text-gray-700 mb-2`}>
                  Bedrooms
                </label>
                <select
                  id="bedrooms"
                  value={searchCriteria.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent`}
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              <div>
                <label htmlFor="bathrooms" className={`block ${typography.body.small} font-medium text-gray-700 mb-2`}>
                  Bathrooms
                </label>
                <select
                  id="bathrooms"
                  value={searchCriteria.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent`}
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="1.5">1.5+</option>
                  <option value="2">2+</option>
                  <option value="2.5">2.5+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label htmlFor="propertyType" className={`block ${typography.body.small} font-medium text-gray-700 mb-2`}>
                  Property Type
                </label>
                <select
                  id="propertyType"
                  value={searchCriteria.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent`}
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSearch}
                className={`${theme.primaryButton} text-white py-3 px-8 rounded-lg transition-colors flex items-center space-x-2`}
              >
                <Icon name="search" size={20} />
                <span>Search Properties</span>
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 ${theme.primaryBg} rounded-full flex items-center justify-center`}>
                  <Icon name="map" size={24} className={theme.primaryText} />
                </div>
                <div>
                  <h3 className={`${typography.body.small} font-semibold text-gray-900`}>
                    MLS Integration
                  </h3>
                  <p className={`${typography.body.xs} text-gray-600`}>
                    Access to all MLS listings
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="camera" size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className={`${typography.body.small} font-semibold text-gray-900`}>
                    Virtual Tours
                  </h3>
                  <p className={`${typography.body.xs} text-gray-600`}>
                    360° photos and virtual walkthroughs
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="bell" size={24} className="text-green-600" />
                </div>
                <div>
                  <h3 className={`${typography.body.small} font-semibold text-gray-900`}>
                    Alerts
                  </h3>
                  <p className={`${typography.body.xs} text-gray-600`}>
                    Get notified of new listings
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Tips */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            <h3 className={`${typography.headings.h5} mb-6`}>
              Search Tips
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Icon name="lightbulb" size={20} className="text-yellow-500 mt-1" />
                  <div>
                    <h4 className={`${typography.body.small} font-semibold text-gray-900`}>
                      Start Broad
                    </h4>
                    <p className={`${typography.body.xs} text-gray-600`}>
                      Begin with a general location and narrow down as you explore
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Icon name="lightbulb" size={20} className="text-yellow-500 mt-1" />
                  <div>
                    <h4 className={`${typography.body.small} font-semibold text-gray-900`}>
                      Set Price Range
                    </h4>
                    <p className={`${typography.body.xs} text-gray-600`}>
                      Include a buffer above your budget to see all options
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Icon name="lightbulb" size={20} className="text-yellow-500 mt-1" />
                  <div>
                    <h4 className={`${typography.body.small} font-semibold text-gray-900`}>
                      Save Favorites
                    </h4>
                    <p className={`${typography.body.xs} text-gray-600`}>
                      Create a favorites list to compare properties easily
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Icon name="lightbulb" size={20} className="text-yellow-500 mt-1" />
                  <div>
                    <h4 className={`${typography.body.small} font-semibold text-gray-900`}>
                      Schedule Tours
                    </h4>
                    <p className={`${typography.body.xs} text-gray-600`}>
                      Contact agents directly to schedule property viewings
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Iframe Property Search */
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className={`${typography.headings.h6}`}>
                Property Search Results
              </h3>
              <p className={`${typography.body.xs} text-gray-600`}>
                {searchCriteria.location || 'All locations'}
              </p>
            </div>
            <button
              onClick={() => setShowIframe(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Icon name="x" size={24} />
            </button>
          </div>
          
          <div className="p-6">
            {/* Search Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className={`${typography.body.small} font-semibold text-gray-900 mb-2`}>
                Search Criteria
              </h4>
              <div className="flex flex-wrap gap-2">
                {searchCriteria.location && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Location: {searchCriteria.location}
                  </span>
                )}
                {searchCriteria.priceMin && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Min: ${parseInt(searchCriteria.priceMin).toLocaleString()}
                  </span>
                )}
                {searchCriteria.priceMax && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Max: ${parseInt(searchCriteria.priceMax).toLocaleString()}
                  </span>
                )}
                {searchCriteria.bedrooms && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    {searchCriteria.bedrooms}+ Bedrooms
                  </span>
                )}
                {searchCriteria.bathrooms && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    {searchCriteria.bathrooms}+ Bathrooms
                  </span>
                )}
                {searchCriteria.propertyType !== 'all' && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                    {propertyTypes.find(t => t.value === searchCriteria.propertyType)?.label}
                  </span>
                )}
              </div>
            </div>

            {/* Iframe Placeholder */}
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <Icon name="home" size={48} className="text-gray-400 mx-auto mb-4" />
              <h4 className={`${typography.headings.h6} text-gray-600 mb-2`}>
                IDX Property Search
              </h4>
              <p className={`${typography.body.small} text-gray-500 mb-4`}>
                In a real implementation, this would show an iframe with the IDX property search tool
              </p>
              <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
                <p className={`${typography.body.xs} text-gray-500`}>
                  iframe src="https://idx-property-search.com/search" width="100%" height="600px"
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <h5 className={`${typography.body.small} font-semibold text-blue-900`}>
                  Properties Found
                </h5>
                <p className={`${typography.headings.h5} text-blue-600`}>
                  247
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <h5 className={`${typography.body.small} font-semibold text-green-900`}>
                  Average Price
                </h5>
                <p className={`${typography.headings.h5} text-green-600`}>
                  $425,000
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <h5 className={`${typography.body.small} font-semibold text-purple-900`}>
                  New This Week
                </h5>
                <p className={`${typography.headings.h5} text-purple-600`}>
                  23
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
