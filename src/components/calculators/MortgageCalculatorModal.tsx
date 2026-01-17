'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/Icon';

interface MortgageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MortgageCalculatorModal({
  isOpen,
  onClose
}: MortgageCalculatorModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(900);

  useEffect(() => {
    if (!isOpen) return;

    // Handle postMessage from iframe for height adjustment
    const handleMessage = (event: MessageEvent) => {
      // Verify message origin for security (adjust if needed)
      if (event.data && event.data.type === 'SYNC_MCALC_HEIGHT') {
        const newHeight = parseInt(event.data.height, 10);
        if (!isNaN(newHeight) && newHeight > 100) {
          // Cap to reasonable height
          const cappedHeight = Math.min(newHeight, 4000);
          setIframeHeight(cappedHeight);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Mortgage Calculator</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 z-20"
            aria-label="Close calculator"
            style={{ pointerEvents: 'auto' }}
          >
            <Icon name="x" size={24} />
          </button>
        </div>

        {/* Calculator Iframe */}
        <div className="flex-1 overflow-auto" style={{ pointerEvents: 'auto' }}>
          <iframe
            ref={iframeRef}
            src="/calculators/mortgage-calculator.html"
            title="Mortgage Calculator"
            className="w-full border-0"
            style={{
              height: `${iframeHeight}px`,
              minHeight: '600px',
              display: 'block',
              pointerEvents: 'auto'
            }}
            loading="lazy"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      </div>
    </div>
  );
}

