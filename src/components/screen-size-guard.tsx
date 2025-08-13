'use client';

import { useState, useEffect } from 'react';

interface ScreenSizeGuardProps {
  children: React.ReactNode;
}

export function ScreenSizeGuard({ children }: ScreenSizeGuardProps) {
  const [isWideScreen, setIsWideScreen] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsWideScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isWideScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <svg 
                className="mx-auto h-16 w-16 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Screen Too Small
            </h1>
            <p className="text-gray-600 mb-2">
              This application requires a wider screen to function properly.
            </p>
            <p className="text-gray-600 mb-6">
              Please use a laptop or desktop computer with a screen width of at least 1024px.
            </p>
            <div className="text-sm text-gray-500">
              Current width: {typeof window !== 'undefined' ? window.innerWidth : 0}px
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}