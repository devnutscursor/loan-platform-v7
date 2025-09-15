'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TemplateSelectionContextType {
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  isLoading: boolean;
}

const TemplateSelectionContext = createContext<TemplateSelectionContextType | undefined>(undefined);

export function TemplateSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedTemplate, setSelectedTemplateState] = useState<string>('template1');
  const [isLoading, setIsLoading] = useState(false); // Start as false to avoid blocking

  // Load selected template from localStorage on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const savedTemplate = localStorage.getItem('selectedTemplate');
      if (savedTemplate && ['template1', 'template2'].includes(savedTemplate)) {
        setSelectedTemplateState(savedTemplate);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever template changes
  const setSelectedTemplate = (template: string) => {
    if (['template1', 'template2'].includes(template)) {
      setSelectedTemplateState(template);
      // Only save to localStorage on client side
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedTemplate', template);
      }
    }
  };

  return (
    <TemplateSelectionContext.Provider value={{
      selectedTemplate,
      setSelectedTemplate,
      isLoading
    }}>
      {children}
    </TemplateSelectionContext.Provider>
  );
}

export function useTemplateSelection() {
  const context = useContext(TemplateSelectionContext);
  if (context === undefined) {
    throw new Error('useTemplateSelection must be used within a TemplateSelectionProvider');
  }
  return context;
}
