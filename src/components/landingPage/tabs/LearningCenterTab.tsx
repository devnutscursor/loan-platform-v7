'use client';

import React, { useState, useEffect } from 'react';
import { typography } from '@/theme/theme';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import Icon from '@/components/ui/Icon';
import { supabase } from '@/lib/supabase/client';

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  category: string;
  // Optional fields for external videos (e.g. Loom)
  externalUrl?: string;
  embedUrl?: string;
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
  // NEW: Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
  userId?: string; // For fetching content
}

export default function LearningCenterTab({
  selectedTemplate,
  className = '',
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData,
  userId
}: LearningCenterTabProps) {
  const { user } = useAuth();
  const { getTemplateSync } = useEfficientTemplates();
  
  // Template data fetching - support both public and auth modes
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(selectedTemplate);

  
  // Comprehensive template data usage
  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  
  const typography = templateData?.template?.typography || {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  };
  
  const content = templateData?.template?.content || {
    headline: 'Learning Center',
    subheadline: 'Educational resources to help you navigate the home buying process',
    ctaText: 'Watch Video',
    ctaSecondary: 'Download Guide'
  };
  
  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
  };
  
  const defaultClasses = {
    button: {
      primary: 'px-6 py-3 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 font-medium transition-all duration-200 border border-gray-300',
      outline: 'border-2 px-6 py-3 font-medium transition-all duration-200',
      ghost: 'px-4 py-2 font-medium transition-all duration-200'
    },
    card: {
      container: 'bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200',
      header: 'px-6 py-4 border-b border-gray-200',
      body: 'px-6 py-4',
      footer: 'px-6 py-4 border-t border-gray-200 bg-gray-50'
    },
    heading: {
      h1: 'text-3xl font-bold text-gray-900 mb-4',
      h2: 'text-2xl font-bold text-gray-900 mb-3',
      h3: 'text-xl font-semibold text-gray-900 mb-2',
      h4: 'text-lg font-semibold text-gray-900 mb-2',
      h5: 'text-base font-semibold text-gray-900 mb-2',
      h6: 'text-sm font-semibold text-gray-900 mb-1'
    },
    body: {
      large: 'text-lg text-gray-700 leading-relaxed',
      base: 'text-base text-gray-700 leading-relaxed',
      small: 'text-sm text-gray-600 leading-relaxed',
      xs: 'text-xs text-gray-500 leading-normal'
    },
    icon: {
      primary: selectedTemplate === 'template2' 
        ? 'w-12 h-12 flex items-center justify-center mb-4'
        : 'w-12 h-12 flex items-center justify-center mb-4',
      secondary: 'w-10 h-10 bg-gray-100 flex items-center justify-center mb-3',
      small: selectedTemplate === 'template2'
        ? 'w-8 h-8 flex items-center justify-center'
        : 'w-8 h-8 flex items-center justify-center'
    },
    status: {
      success: 'text-green-600 bg-green-50 px-2 py-1 text-sm',
      warning: 'text-yellow-600 bg-yellow-50 px-2 py-1 text-sm',
      error: 'text-red-600 bg-red-50 px-2 py-1 text-sm',
      info: 'text-[#01bcc6] bg-[#01bcc6]/10 px-2 py-1 text-sm'
    }
  };
  const templateClasses = templateData?.template?.classes;
  const safeTemplateClasses = templateClasses && typeof templateClasses === 'object' ? templateClasses : {};
  const classes = {
    ...defaultClasses,
    ...safeTemplateClasses,
button: { 
      ...defaultClasses.button, 
      ...(safeTemplateClasses?.button || {}) 
    },
    card: { 
      ...defaultClasses.card, 
      ...(safeTemplateClasses?.card || {}) 
    },
    heading: { 
      ...defaultClasses.heading, 
      ...(safeTemplateClasses?.heading || {}) 
    },
    body: { 
      ...defaultClasses.body, 
      ...(safeTemplateClasses?.body || {}) 
    },
    icon: { 
      ...defaultClasses.icon, 
      ...(safeTemplateClasses?.icon || {}) 
    },
    status: { 
      ...defaultClasses.status, 
      ...(safeTemplateClasses?.status || {}) 
    }
  };
  const [activeSection, setActiveSection] = useState<'videos' | 'faq' | 'guides'>('videos');
  const [selectedCategory, setSelectedCategory] = useState<string>('all'); // For FAQs and Guides
  const [selectedVideoTab, setSelectedVideoTab] = useState<string>('all');
  const [selectedVideoSubCategory, setSelectedVideoSubCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  
  // State for fetched content
  const [videos, setVideos] = useState<Video[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [videoDataMap, setVideoDataMap] = useState<Map<string, any>>(new Map()); // Store full video data with URLs / embeds
  const [loadingContent, setLoadingContent] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Mock data as fallback (global Learning Center defaults)
  const mockVideos: Video[] = [
    {
      id: 'heloc',
      title: 'HELOC',
      description: 'Overview of Home Equity Line of Credit (HELOC).',
      duration: '',
      thumbnail: '',
      category: 'heloc',
      externalUrl: 'https://www.loom.com/share/cf22106d15254413aed16821beb45633',
      embedUrl: 'https://www.loom.com/embed/cf22106d15254413aed16821beb45633'
    },
    {
      id: 'fha',
      title: 'FHA Loans',
      description: 'Learn about FHA loan requirements and benefits.',
      duration: '',
      thumbnail: '',
      category: 'fha-loan',
      externalUrl: 'https://www.loom.com/share/30d9765a7e4b49a69fd158f74c48b6b0',
      embedUrl: 'https://www.loom.com/embed/30d9765a7e4b49a69fd158f74c48b6b0'
    },
    {
      id: 'va-loan',
      title: 'Loan Type - VA',
      description: 'VA loan overview for eligible veterans and service members.',
      duration: '',
      thumbnail: '',
      category: 'va-loan',
      externalUrl: 'https://www.loom.com/share/ea6f48ee50f64fd1a0c8d3bab60358c5',
      embedUrl: 'https://www.loom.com/embed/ea6f48ee50f64fd1a0c8d3bab60358c5'
    },
    {
      id: 'bank-statement',
      title: 'Loan Type – Bank Statement',
      description: 'Bank statement loans for self-employed borrowers.',
      duration: '',
      thumbnail: '',
      category: 'bank-statement',
      externalUrl: 'https://www.loom.com/share/d0b9c15f012447d782cf40746b12d712',
      embedUrl: 'https://www.loom.com/embed/d0b9c15f012447d782cf40746b12d712'
    },
    {
      id: 'usda',
      title: 'Loan Type - USDA',
      description: 'USDA loans for eligible rural and suburban homebuyers.',
      duration: '',
      thumbnail: '',
      category: 'usda-loan',
      externalUrl: 'https://www.loom.com/share/5ee2eefdd5ae4ad0bf6b0e762dd6789e',
      embedUrl: 'https://www.loom.com/embed/5ee2eefdd5ae4ad0bf6b0e762dd6789e'
    },
    {
      id: '1099',
      title: 'Loan Type - 1099',
      description: '1099 income loans for independent contractors.',
      duration: '',
      thumbnail: '',
      category: '1099-loans',
      externalUrl: 'https://www.loom.com/share/08a55a3508ae443b894a82a30bdf42ee',
      embedUrl: 'https://www.loom.com/embed/08a55a3508ae443b894a82a30bdf42ee'
    },
    {
      id: 'jumbo',
      title: 'Loan Type - Jumbo',
      description: 'Jumbo loans for high-value properties.',
      duration: '',
      thumbnail: '',
      category: 'jumbo-loan',
      externalUrl: 'https://www.loom.com/share/3bdd22dd54464ca98f63d03d009c5f3d',
      embedUrl: 'https://www.loom.com/embed/3bdd22dd54464ca98f63d03d009c5f3d'
    },
    {
      id: 'down-payment-assistance',
      title: 'Loan Type – Down Payment Assistance',
      description: 'Down payment assistance programs overview.',
      duration: '',
      thumbnail: '',
      category: 'down-payment-assistance-loan',
      externalUrl: 'https://www.loom.com/share/fa264d056bdf47a3ac907614610fd62a',
      embedUrl: 'https://www.loom.com/embed/fa264d056bdf47a3ac907614610fd62a'
    },
    {
      id: 'conventional',
      title: 'Loan Type - Conventional',
      description: 'Standard conventional loan programs.',
      duration: '',
      thumbnail: '',
      category: 'conventional',
      externalUrl: 'https://www.loom.com/share/21d5ba0ba49741ae8b221d3c19c9b50d',
      embedUrl: 'https://www.loom.com/embed/21d5ba0ba49741ae8b221d3c19c9b50d'
    },
    {
      id: 'construction',
      title: 'Loan Type - Construction',
      description: 'Construction loans for building your home.',
      duration: '',
      thumbnail: '',
      category: 'construction-loan',
      externalUrl: 'https://www.loom.com/share/e6b0868ead5444edbdc7d0ea38ff05e4',
      embedUrl: 'https://www.loom.com/embed/e6b0868ead5444edbdc7d0ea38ff05e4'
    },
    {
      id: 'va-irrrl',
      title: 'Loan Type – VA IRRRL',
      description: 'VA Interest Rate Reduction Refinance Loan (IRRRL).',
      duration: '',
      thumbnail: '',
      category: 'va-irrrl',
      externalUrl: 'https://www.loom.com/share/191300ee926143308fbb7cb2919ac31d',
      embedUrl: 'https://www.loom.com/embed/191300ee926143308fbb7cb2919ac31d'
    },
    {
      id: 'dscr',
      title: 'Loan Type - DSCR',
      description: 'Debt Service Coverage Ratio (DSCR) investment loans.',
      duration: '',
      thumbnail: '',
      category: 'dscr-loans',
      externalUrl: 'https://www.loom.com/share/7764ef7a4d974ae3b27ae80af37505f0',
      embedUrl: 'https://www.loom.com/embed/7764ef7a4d974ae3b27ae80af37505f0'
    },
    {
      id: 'bridge',
      title: 'Loan Type – Bridge Loans',
      description: 'Bridge loans to help you buy before you sell.',
      duration: '',
      thumbnail: '',
      category: 'bridge-loans',
      externalUrl: 'https://www.loom.com/share/f2065c9905064f38af80924aca8eea67',
      embedUrl: 'https://www.loom.com/embed/f2065c9905064f38af80924aca8eea67'
    },
    {
      id: 'rate-term-refinance',
      title: 'Loan Type – Rate and Term Refinance',
      description: 'Refinancing to adjust rate and term only.',
      duration: '',
      thumbnail: '',
      category: 'rate-term-refinance',
      externalUrl: 'https://www.loom.com/share/54e9e9e8ed1e4c67a0f83bb56581cdaa',
      embedUrl: 'https://www.loom.com/embed/54e9e9e8ed1e4c67a0f83bb56581cdaa'
    },
    {
      id: 'cashout-refinance',
      title: 'Loan Type – Cashout Refinance',
      description: 'Using home equity with a cash-out refinance.',
      duration: '',
      thumbnail: '',
      category: 'cash-out',
      externalUrl: 'https://www.loom.com/share/598ef4cb6e6940d48a5fd90b5ccec886',
      embedUrl: 'https://www.loom.com/embed/598ef4cb6e6940d48a5fd90b5ccec886'
    },
    {
      id: 'asset-depletion',
      title: 'Loan Type – Asset Depletion Loan',
      description: 'Loans qualified based on assets instead of income.',
      duration: '',
      thumbnail: '',
      category: 'asset-depletion-loans',
      externalUrl: 'https://www.loom.com/share/88e7b080348e49bba7e3ae00284c30e5',
      embedUrl: 'https://www.loom.com/embed/88e7b080348e49bba7e3ae00284c30e5'
    },
    {
      id: 'fha-streamline',
      title: 'Loan Type – FHA Streamline Refinance',
      description: 'Streamlined refinancing options for FHA loans.',
      duration: '',
      thumbnail: '',
      category: 'streamline',
      externalUrl: 'https://www.loom.com/share/d2c45e8eabe84dcfaa0674673d67cfef',
      embedUrl: 'https://www.loom.com/embed/d2c45e8eabe84dcfaa0674673d67cfef'
    },
    {
      id: 'pre-approval',
      title: 'Loan Type – Pre-Approval',
      description: 'Understanding the mortgage pre-approval process.',
      duration: '',
      thumbnail: '',
      category: 'pre-approval',
      externalUrl: 'https://www.loom.com/share/ff5dd539dd324998a8ecceb7c6869340',
      embedUrl: 'https://www.loom.com/embed/ff5dd539dd324998a8ecceb7c6869340'
    }
  ];

  const mockFAQs: FAQ[] = [
    {
      id: '1',
      question: 'What is a good credit score for a mortgage?',
      answer: 'A credit score of 620 or higher is generally considered good for conventional loans, while FHA loans may accept scores as low as 580.',
      category: 'credit'
    },
    {
      id: '2',
      question: 'How much down payment do I need?',
      answer: 'Conventional loans typically require 5-20% down, while FHA loans can go as low as 3.5% down payment.',
      category: 'financing'
    },
    {
      id: '3',
      question: 'What documents do I need for pre-approval?',
      answer: 'You\'ll need pay stubs, tax returns, bank statements, and employment verification documents.',
      category: 'application'
    },
    {
      id: '4',
      question: 'How long does the mortgage process take?',
      answer: 'The typical mortgage process takes 30-45 days from application to closing.',
      category: 'process'
    }
  ];

  // Categories for FAQs and Guides (keep existing)
  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'mortgage-basics', name: 'Mortgage Basics' },
    { id: 'first-time-buyer', name: 'First-Time Buyer' },
    { id: 'credit', name: 'Credit & Scores' },
    { id: 'financing', name: 'Financing' },
    { id: 'application', name: 'Application Process' },
    { id: 'process', name: 'Closing Process' }
  ];

  // Video loan categories structure with 3 main tabs
  const videoLoanCategories = {
    'purchase-loans': {
      id: 'purchase-loans',
      name: 'Purchase Loans',
      subCategories: [
        { id: 'all', name: 'All Purchase Loans' },
        { id: 'conventional', name: 'Conventional' },
        { id: 'va-loan', name: 'VA Loan' },
        { id: 'fha-loan', name: 'FHA Loan' },
        { id: 'jumbo-loan', name: 'Jumbo Loan' },
        { id: 'usda-loan', name: 'USDA Loan' },
        { id: '2nd-mortgage', name: '2nd Mortgage' },
        { id: 'construction-loan', name: 'Construction Loan' },
        { id: 'down-payment-assistance-loan', name: 'Down Payment Assistance Loan' },
        { id: 'pre-approval', name: 'Pre-Approval' }
      ]
    },
    'refinance-loans': {
      id: 'refinance-loans',
      name: 'Refinance Loans',
      subCategories: [
        { id: 'all', name: 'All Refinance Loans' },
        { id: 'streamline', name: 'Streamline' },
        { id: 'va-irrrl', name: 'VA IRRRL' },
        { id: 'heloc', name: 'HELOC' },
        { id: 'cash-out', name: 'Cash-Out' },
        { id: 'rate-term-refinance', name: 'Rate & Term Refinance' }
      ]
    },
    'non-qm-loans': {
      id: 'non-qm-loans',
      name: 'Non-QM Loans',
      subCategories: [
        { id: 'all', name: 'All Non-QM Loans' },
        { id: '1099-loans', name: '1099 Loans' },
        { id: 'dscr-loans', name: 'DSCR Loans' },
        { id: 'bank-statement', name: 'Bank Statement' },
        { id: 'asset-depletion-loans', name: 'Asset Depletion Loans' },
        { id: 'bridge-loans', name: 'Bridge Loans' }
      ]
    }
  };

  // Fetch content from API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoadingContent(true);
        const officerId = userId || (isPublic ? (publicTemplateData?.profileData?.user?.id) : user?.id);
        
        if (!officerId) {
          // Use mock data if no officer ID
          setVideos(mockVideos);
          setFaqs(mockFAQs);
          const mockMap = new Map();
          mockVideos.forEach((v) => mockMap.set(v.id, v));
          setVideoDataMap(mockMap);
          setLoadingContent(false);
          return;
        }

        if (isPublic) {
          // Fetch from public API
          const response = await fetch(`/api/public/content/${officerId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              // Transform officer-specific API data to component format
              const officerVideosRaw = data.data.videos || [];
              const officerVideosList = officerVideosRaw.map((v: any) => ({
                id: v.id,
                title: v.title,
                description: v.description || '',
                duration: v.duration || '',
                thumbnail: v.thumbnailUrl || '',
                category: v.category
              }));

              // Combine officer videos with global Learning Center videos (Loom list)
              const combinedVideos = [...officerVideosList, ...mockVideos];
              setVideos(combinedVideos);

              // Store full video data for URL / embed access
              const videoMap = new Map();
              officerVideosRaw.forEach((v: any) => {
                videoMap.set(v.id, v);
              });
              mockVideos.forEach((v) => {
                videoMap.set(v.id, v);
              });
              setVideoDataMap(videoMap);
              setFaqs((data.data.faqs || []).map((f: any) => ({
                id: f.id,
                question: f.question,
                answer: f.answer,
                category: f.category
              })));
              setGuides(data.data.guides || []);
            }
          }
        } else {
          // Fetch from authenticated API
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            // Use mock data if no auth token
            setVideos(mockVideos);
            setFaqs(mockFAQs);
            const mockMap = new Map();
            mockVideos.forEach((v) => mockMap.set(v.id, v));
            setVideoDataMap(mockMap);
            setLoadingContent(false);
            return;
          }

          const [faqsRes, videosRes, guidesRes] = await Promise.all([
            fetch('/api/officers/content/faqs', {
              headers: { 'Authorization': `Bearer ${session.access_token}` }
            }),
            fetch('/api/officers/content/videos', {
              headers: { 'Authorization': `Bearer ${session.access_token}` }
            }),
            fetch('/api/officers/content/guides', {
              headers: { 'Authorization': `Bearer ${session.access_token}` }
            })
          ]);

          if (videosRes.ok) {
            const videosData = await videosRes.json();
            if (videosData.success) {
              const officerVideosRaw = videosData.data || [];
              const officerVideosList = officerVideosRaw.map((v: any) => ({
                id: v.id,
                title: v.title,
                description: v.description || '',
                duration: v.duration || '',
                thumbnail: v.thumbnailUrl || '',
                category: v.category
              }));

              // Combine officer videos with global Learning Center videos (Loom list)
              const combinedVideos = [...officerVideosList, ...mockVideos];
              setVideos(combinedVideos);

              // Store full video data for URL / embed access
              const videoMap = new Map();
              officerVideosRaw.forEach((v: any) => {
                videoMap.set(v.id, v);
              });
              mockVideos.forEach((v) => {
                videoMap.set(v.id, v);
              });
              setVideoDataMap(videoMap);
            }
          }

          if (faqsRes.ok) {
            const faqsData = await faqsRes.json();
            if (faqsData.success) {
              setFaqs((faqsData.data || []).map((f: any) => ({
                id: f.id,
                question: f.question,
                answer: f.answer,
                category: f.category
              })));
            }
          }

          if (guidesRes.ok) {
            const guidesData = await guidesRes.json();
            if (guidesData.success) {
              setGuides(guidesData.data || []);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        // Fallback to mock data on error
      setVideos(mockVideos);
      setFaqs(mockFAQs);
      const mockMap = new Map();
      mockVideos.forEach((v) => mockMap.set(v.id, v));
      setVideoDataMap(mockMap);
      } finally {
        setLoadingContent(false);
      }
    };

    fetchContent();
  }, [user, userId, isPublic, publicTemplateData]);

  // Reset sub-category when switching video tabs or when switching to videos section
  useEffect(() => {
    if (activeSection === 'videos') {
      setSelectedVideoSubCategory('all');
    }
  }, [selectedVideoTab, activeSection]);

  // Filter videos by tab and sub-category
  const filteredVideos = activeSection === 'videos' 
    ? (() => {
        // If "All" is selected, show all videos
        if (selectedVideoTab === 'all') {
          return videos;
        }
        
        const currentTab = videoLoanCategories[selectedVideoTab as keyof typeof videoLoanCategories];
        if (!currentTab) return videos;
        
        // Get all sub-category IDs for the current tab (excluding 'all')
        const tabSubCategoryIds = currentTab.subCategories
          .filter(sub => sub.id !== 'all')
          .map(sub => sub.id);
        
        // Filter by tab sub-categories
        let filtered = videos.filter(video => tabSubCategoryIds.includes(video.category));
        
        // Further filter by selected sub-category if not 'all'
        if (selectedVideoSubCategory !== 'all') {
          filtered = filtered.filter(video => video.category === selectedVideoSubCategory);
        }
        
        return filtered;
      })()
    : (selectedCategory === 'all' 
        ? videos 
        : videos.filter(video => video.category === selectedCategory));

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);
  
  const filteredGuides = selectedCategory === 'all'
    ? guides
    : guides.filter((guide: any) => guide.category === selectedCategory);

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className={`${classes.card.header}`}>
        <div>
          <h2 className={`${classes.heading.h2}`}>
            Learning Center
          </h2>
          <p className={`${classes.body.base}`}>
            Educational resources to help you navigate the home buying process
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8 mt-8">
        <div className="flex space-x-1 bg-gray-100 p-1" style={{ borderRadius: `${layout.borderRadius}px` }}>
          {[
            { id: 'videos', label: 'Videos', icon: 'play' },
            { id: 'faq', label: 'FAQ', icon: 'help-circle' },
            { id: 'guides', label: 'Guides', icon: 'book' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 font-medium transition-all duration-200 ${
                activeSection === section.id
                  ? 'shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white'
              }`}
              style={activeSection === section.id ? {
                backgroundColor: colors.primary,
                color: colors.background,
                borderRadius: `${layout.borderRadius}px`
              } : {
                borderRadius: `${layout.borderRadius}px`
              }}
            >
              <Icon name={section.icon as any} size={20} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter - Conditional Rendering */}
      {activeSection === 'videos' ? (
        <div className="mb-6">
          {/* Main Video Tabs - Styled as sub-navigation */}
          <div className="mb-4 pl-2" style={{ borderColor: colors.primary }}>
            <div className="flex flex-col sm:flex-row gap-2">
              {/* All Videos Tab */}
              <button
                onClick={() => setSelectedVideoTab('all')}
                className={`px-3 sm:px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedVideoTab === 'all'
                    ? 'shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={selectedVideoTab === 'all' ? {
                  backgroundColor: `${colors.primary}15`,
                  color: colors.primary,
                  borderBottom: `3px solid ${colors.primary}`,
                  borderRadius: `${layout.borderRadius}px`
                } : {
                  backgroundColor: 'transparent',
                  borderRadius: `${layout.borderRadius}px`
                }}
              >
                All
              </button>
              {/* Category Tabs */}
              {Object.values(videoLoanCategories).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedVideoTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    selectedVideoTab === tab.id
                      ? 'shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={selectedVideoTab === tab.id ? {
                    backgroundColor: `${colors.primary}15`,
                    color: colors.primary,
                    borderBottom: `3px solid ${colors.primary}`,
                    borderRadius: `${layout.borderRadius}px`
                  } : {
                    backgroundColor: 'transparent',
                    borderRadius: `${layout.borderRadius}px`
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Sub-Category Filter - Only show when a specific tab is selected (not "All") */}
          {selectedVideoTab !== 'all' && videoLoanCategories[selectedVideoTab as keyof typeof videoLoanCategories] && (
            <div 
              className="flex flex-nowrap gap-2 overflow-x-auto pb-2"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {videoLoanCategories[selectedVideoTab as keyof typeof videoLoanCategories].subCategories.map((subCategory) => (
                <button
                  key={subCategory.id}
                  onClick={() => setSelectedVideoSubCategory(subCategory.id)}
                  className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                    selectedVideoSubCategory === subCategory.id
                      ? 'border-2'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={selectedVideoSubCategory === subCategory.id ? {
                    backgroundColor: `${colors.primary}20`,
                    color: colors.primary,
                    borderColor: colors.primary,
                    borderRadius: `${layout.borderRadius}px`
                  } : {
                    borderRadius: `${layout.borderRadius}px`
                  }}
                >
                  {subCategory.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6">
          <div 
            className="flex flex-nowrap gap-2 overflow-x-auto pb-2"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'border'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={selectedCategory === category.id ? {
                  backgroundColor: `${colors.primary}20`,
                  color: colors.primary,
                  borderColor: colors.primary,
                  borderRadius: `${layout.borderRadius}px`
                } : {
                  borderRadius: `${layout.borderRadius}px`
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Sections */}
      {activeSection === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div key={video.id} className={`${classes.card.container}`} style={{ borderRadius: `${layout.borderRadius}px` }}>
              <div className={`${classes.card.body}`}>
                <div className="relative mb-4">
                  {video.thumbnail ? (
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full aspect-video object-cover"
                      style={{ borderRadius: `${layout.borderRadius}px` }}
                    />
                  ) : (
                    <div className="aspect-video bg-gray-200 flex items-center justify-center" style={{ borderRadius: `${layout.borderRadius}px` }}>
                      <Icon name="play" size={48} color={colors.textSecondary} />
                    </div>
                  )}
                  {video.duration && (
                    <div className={`absolute bottom-2 right-2 ${classes.status.info}`} style={{ borderRadius: `${layout.borderRadius}px` }}>
                      {video.duration}
                    </div>
                  )}
                </div>
                <h3 className={`${classes.heading.h5} mb-2`}>
                  {video.title}
                </h3>
                <p className={`${classes.body.small} mb-4`}>
                  {video.description}
                </p>
                <button 
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 font-medium transition-colors"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                    borderColor: colors.primary,
                    borderRadius: `${layout.borderRadius}px`,
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary;
                  }}
                  onClick={() => {
                    setSelectedVideo(video);
                  }}
                >
                  <Icon name="play" size={16} color={colors.background} />
                  <span>Watch Video</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'faq' && (
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className={`${classes.card.container}`} style={{ borderRadius: `${layout.borderRadius}px` }}>
              <div className={`${classes.card.body}`} style={{ padding: 0 }}>
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full text-left flex items-center justify-between py-3 px-6 hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                    borderRadius: `${layout.borderRadius}px ${layout.borderRadius}px 0 0`
                  }}
                >
                  <h3 
                    className="text-base font-semibold leading-snug pr-4"
                  >
                    {faq.question}
                  </h3>
                  <Icon 
                    name={expandedFAQ === faq.id ? 'chevronUp' : 'chevronDown'} 
                    size={20} 
                    color={colors.background}
                    className="flex-shrink-0"
                  />
                </button>
                {expandedFAQ === faq.id && (
                  <div 
                    className="px-6 py-4"
                    style={{ 
                      backgroundColor: colors.background,
                      borderRadius: `0 0 ${layout.borderRadius}px ${layout.borderRadius}px`
                    }}
                  >
                    <p 
                      className="text-base leading-relaxed"
                      style={{ color: colors.text }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'guides' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGuides.length === 0 ? (
            <div className={`${classes.card.container} col-span-2`} style={{ borderRadius: `${layout.borderRadius}px` }}>
              <div className={`${classes.card.body} text-center`}>
                <p className={classes.body.base}>No guides available yet.</p>
              </div>
            </div>
          ) : (
            filteredGuides.map((guide: any) => (
              <div key={guide.id} className={`${classes.card.container}`} style={{ borderRadius: `${layout.borderRadius}px` }}>
                <div className={`${classes.card.body}`}>
                  <div className={`${classes.icon.primary}`}>
                    <Icon name="book" size={24} color={colors.primary} />
                  </div>
                  <h3 className={`${classes.heading.h5}`}>
                    {guide.name}
                  </h3>
                  <p className={`${classes.body.small} mb-4`}>
                    {guide.file_name}
                  </p>
                  <a
                    href={guide.funnelUrl || guide.funnel_url || guide.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 font-medium transition-colors border-2"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.primary,
                      color: colors.primary,
                      borderRadius: `${layout.borderRadius}px`,
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary + '10';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.background;
                    }}
                  >
                    Download Guide
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Call to Action */}
      <div className={`${classes.card.container} mt-6`} style={{ borderRadius: `${layout.borderRadius}px` }}>
        <div className={`${classes.card.body} text-center`}>
          <h3 className={`${classes.heading.h4} mb-2`}>
            Need Personalized Help?
          </h3>
          <p className={`${classes.body.base} mb-6`}>
            Our loan officers are here to answer your questions and guide you through the process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="flex items-center justify-center gap-2 px-6 py-3 font-medium transition-colors"
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
                borderColor: colors.primary,
                borderRadius: `${layout.borderRadius}px`,
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
              }}
            >
              <Icon name="phone" size={20} color={colors.background} />
              <span>Call Now</span>
            </button>
            <button 
              className="flex items-center justify-center gap-2 px-6 py-3 font-medium transition-colors border-2"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.primary,
                color: colors.primary,
                borderRadius: `${layout.borderRadius}px`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary + '10';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background;
              }}
            >
              <Icon name="mail" size={20} color={colors.primary} />
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="relative bg-black rounded-lg w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ borderRadius: `${layout.borderRadius}px` }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className={`${classes.heading.h5}`} style={{ color: colors.background }}>
                {selectedVideo.title}
              </h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>
            
            {/* Video Player */}
            <div className="relative flex-1 flex items-center justify-center p-4">
              {(() => {
                const videoData = videoDataMap.get(selectedVideo.id);
                const videoUrl = videoData?.videoUrl || videoData?.video_url;
                const embedUrl = videoData?.embedUrl || selectedVideo.embedUrl;

                // Prefer HTML5 video when we have a direct URL (Cloudinary / uploaded videos)
                if (videoUrl) {
                  return (
                    <video
                      controls
                      autoPlay
                      className="w-full h-full max-h-[70vh]"
                      style={{ borderRadius: `${layout.borderRadius}px` }}
                    >
                      <source src={videoUrl} type="video/mp4" />
                      <source src={videoUrl} type="video/webm" />
                      <source src={videoUrl} type="video/quicktime" />
                      Your browser does not support the video tag.
                    </video>
                  );
                }

                // Fallback for external videos (e.g. Loom) using iframe embed
                if (embedUrl) {
                  return (
                    <div className="w-full h-full max-h-[70vh]" style={{ position: 'relative', paddingBottom: '56.25%' }}>
                      <iframe
                        src={embedUrl}
                        frameBorder="0"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full rounded-lg"
                      />
                    </div>
                  );
                }

                return (
                  <p className="text-white">Video URL not available</p>
                );
              })()}
            </div>
            
            {/* Video Description */}
            {selectedVideo.description && (
              <div className="p-4 border-t border-gray-700">
                <p className={`${classes.body.small}`} style={{ color: colors.textSecondary }}>
                  {selectedVideo.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}