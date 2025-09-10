'use client';

import React, { useState } from 'react';
import { typography } from '@/theme/theme';
import Icon from '@/components/ui/Icon';

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  category: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface LearningCenterTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
}

export default function LearningCenterTab({
  selectedTemplate,
  className = ''
}: LearningCenterTabProps) {
  const [activeSection, setActiveSection] = useState<'videos' | 'faq' | 'guides'>('videos');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

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

  const mockVideos: Video[] = [
    {
      id: '1',
      title: 'Understanding Mortgage Rates',
      description: 'Learn how mortgage rates are determined and what factors affect them.',
      duration: '5:30',
      thumbnail: '/api/placeholder/300/200',
      category: 'mortgage-basics'
    },
    {
      id: '2',
      title: 'First-Time Home Buyer Guide',
      description: 'Complete guide for first-time home buyers covering the entire process.',
      duration: '12:45',
      thumbnail: '/api/placeholder/300/200',
      category: 'home-buying'
    },
    {
      id: '3',
      title: 'Credit Score Improvement Tips',
      description: 'Practical strategies to improve your credit score before applying for a loan.',
      duration: '8:15',
      thumbnail: '/api/placeholder/300/200',
      category: 'credit'
    },
    {
      id: '4',
      title: 'Down Payment Options',
      description: 'Explore different down payment programs and assistance options.',
      duration: '6:20',
      thumbnail: '/api/placeholder/300/200',
      category: 'financing'
    },
    {
      id: '5',
      title: 'Home Inspection Process',
      description: 'What to expect during a home inspection and how to prepare.',
      duration: '7:10',
      thumbnail: '/api/placeholder/300/200',
      category: 'home-buying'
    },
    {
      id: '6',
      title: 'Refinancing Your Mortgage',
      description: 'When and how to refinance your existing mortgage.',
      duration: '9:30',
      thumbnail: '/api/placeholder/300/200',
      category: 'refinancing'
    }
  ];

  const mockFAQ: FAQ[] = [
    {
      id: '1',
      question: 'What is the minimum credit score needed for a mortgage?',
      answer: 'The minimum credit score varies by loan type. For conventional loans, you typically need a score of 620 or higher. FHA loans may accept scores as low as 580 with a 3.5% down payment, or 500 with a 10% down payment. VA loans often have more flexible requirements.',
      category: 'credit'
    },
    {
      id: '2',
      question: 'How much down payment do I need?',
      answer: 'Down payment requirements vary by loan type. Conventional loans typically require 5-20%, FHA loans require 3.5% with good credit, VA loans offer 0% down for eligible veterans, and USDA loans offer 0% down for rural properties.',
      category: 'financing'
    },
    {
      id: '3',
      question: 'How long does the mortgage process take?',
      answer: 'The typical mortgage process takes 30-45 days from application to closing. However, this can vary based on loan type, property type, and market conditions. Pre-approval can be obtained in 1-3 days.',
      category: 'process'
    },
    {
      id: '4',
      question: 'What documents do I need for a mortgage application?',
      answer: 'You\'ll need pay stubs, W-2s, tax returns, bank statements, employment verification, and identification. Additional documents may be required based on your specific situation.',
      category: 'documents'
    },
    {
      id: '5',
      question: 'Can I get a mortgage with student loan debt?',
      answer: 'Yes, you can still qualify for a mortgage with student loan debt. Lenders will consider your debt-to-income ratio, which includes your student loan payments. There are also programs specifically designed for borrowers with student debt.',
      category: 'debt'
    },
    {
      id: '6',
      question: 'What is PMI and when is it required?',
      answer: 'Private Mortgage Insurance (PMI) is required when you put down less than 20% on a conventional loan. It protects the lender if you default. PMI can be removed once you reach 20% equity in your home.',
      category: 'insurance'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: 'grid' as const },
    { id: 'mortgage-basics', name: 'Mortgage Basics', icon: 'book' as const },
    { id: 'home-buying', name: 'Home Buying', icon: 'home' as const },
    { id: 'credit', name: 'Credit', icon: 'credit-card' as const },
    { id: 'financing', name: 'Financing', icon: 'dollar-sign' as const },
    { id: 'refinancing', name: 'Refinancing', icon: 'refresh' as const },
    { id: 'process', name: 'Process', icon: 'clock' as const },
    { id: 'documents', name: 'Documents', icon: 'file-text' as const },
    { id: 'debt', name: 'Debt', icon: 'alert-circle' as const },
    { id: 'insurance', name: 'Insurance', icon: 'shield' as const }
  ];

  const filteredVideos = selectedCategory === 'all' 
    ? mockVideos 
    : mockVideos.filter(video => video.category === selectedCategory);

  const filteredFAQ = selectedCategory === 'all' 
    ? mockFAQ 
    : mockFAQ.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h2 className={typography.headings.h4}>
          Learning Center
        </h2>
        <p className={`${typography.body.base} text-gray-600 mt-2`}>
          Educational resources to help you make informed decisions about your mortgage
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'videos', label: 'Videos', icon: 'play' as const },
              { id: 'faq', label: 'FAQ', icon: 'help-circle' as const },
              { id: 'guides', label: 'Guides', icon: 'book-open' as const }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as 'videos' | 'faq' | 'guides')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeSection === section.id
                    ? `border-${theme.primary}-600 text-${theme.primary}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon name={section.icon} size={16} />
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                selectedCategory === category.id
                  ? `${theme.primaryBg} ${theme.primaryText}`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon name={category.icon} size={16} />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeSection === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Icon name="play" size={48} className="text-gray-400" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  {video.duration}
                </div>
              </div>
              <div className="p-6">
                <h3 className={`${typography.body.small} font-semibold text-gray-900 mb-2`}>
                  {video.title}
                </h3>
                <p className={`${typography.body.xs} text-gray-600 mb-4`}>
                  {video.description}
                </p>
                <button className={`w-full ${theme.primaryButton} text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2`}>
                  <Icon name="play" size={16} />
                  <span>Watch Video</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'faq' && (
        <div className="space-y-4">
          {filteredFAQ.map((faq) => (
            <div key={faq.id} className="bg-white rounded-lg shadow-lg border border-gray-200">
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className={`${typography.body.small} font-semibold text-gray-900`}>
                  {faq.question}
                </h3>
                <Icon 
                  name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  className="text-gray-500" 
                />
              </button>
              {expandedFAQ === faq.id && (
                <div className="px-6 pb-4">
                  <p className={`${typography.body.small} text-gray-700`}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSection === 'guides' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'First-Time Home Buyer Checklist',
              description: 'Complete step-by-step guide for first-time home buyers',
              icon: 'checklist' as const,
              pages: 12
            },
            {
              title: 'Mortgage Pre-Approval Guide',
              description: 'Everything you need to know about getting pre-approved',
              icon: 'file-check' as const,
              pages: 8
            },
            {
              title: 'Understanding Closing Costs',
              description: 'Breakdown of all costs associated with closing on a home',
              icon: 'calculator' as const,
              pages: 6
            },
            {
              title: 'Home Inspection Guide',
              description: 'What to look for during a home inspection',
              icon: 'search' as const,
              pages: 10
            }
          ].map((guide, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${theme.primaryBg} rounded-lg flex items-center justify-center`}>
                  <Icon name={guide.icon} size={24} className={theme.primaryText} />
                </div>
                <div className="flex-1">
                  <h3 className={`${typography.body.small} font-semibold text-gray-900 mb-2`}>
                    {guide.title}
                  </h3>
                  <p className={`${typography.body.xs} text-gray-600 mb-4`}>
                    {guide.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`${typography.body.xs} text-gray-500`}>
                      {guide.pages} pages
                    </span>
                    <button className={`${theme.primaryButton} text-white py-2 px-4 rounded-lg transition-colors flex items-center space-x-2`}>
                      <Icon name="download" size={16} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Icon name="help-circle" size={24} className="text-blue-600 mt-1" />
          <div>
            <h3 className={`${typography.body.small} font-semibold text-blue-900 mb-2`}>
              Still Have Questions?
            </h3>
            <p className={`${typography.body.small} text-blue-800 mb-4`}>
              Our team of mortgage experts is here to help you understand the process and answer any questions you may have.
            </p>
            <button className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2`}>
              <Icon name="phone" size={16} />
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
