'use client';

import { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronDown } from 'lucide-react';

interface Font {
  family: string;
  variants: string[];
}

interface FontFamilySelectorProps {
  value: string;
  fonts: Font[];
  loadedFonts: Set<string>;
  fontLoadingStates: Set<string>;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onChange: (fontFamily: string) => void;
  onLoadFont: (fontFamily: string, variants?: string[]) => Promise<void>;
  onFetchNextPage: () => void;
}

export function FontFamilySelector({
  value,
  fonts,
  loadedFonts,
  fontLoadingStates,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onChange,
  onLoadFont,
  onFetchNextPage
}: FontFamilySelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll detection for infinite loading
  useEffect(() => {
    if (!showDropdown) return;

    const handleScroll = (e: Event) => {
      if (!listRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      
      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        onFetchNextPage();
      }
    };

    const timeoutId = setTimeout(() => {
      const fontList = listRef.current;
      if (fontList) {
        fontList.addEventListener('scroll', handleScroll);
      }
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      const fontList = listRef.current;
      if (fontList) {
        fontList.removeEventListener('scroll', handleScroll);
      }
    };
  }, [showDropdown, hasNextPage, isFetchingNextPage, onFetchNextPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFontChange = (fontFamily: string) => {
    const font = fonts.find(f => f.family === fontFamily);
    onLoadFont(fontFamily, font?.variants);
    onChange(fontFamily);
    setShowDropdown(false);
  };

  return (
    <div>
      <Label className="text-sm font-medium">Font Family</Label>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full mt-1 px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
        >
          <span className="truncate flex items-center gap-2" style={{ fontFamily: loadedFonts.has(value) ? value : 'inherit' }}>
            {value}
            {fontLoadingStates.has(value) && (
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            )}
            {loadedFonts.has(value) && value !== 'Arial' && (
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Font loaded" />
            )}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
        
        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            {isLoading ? (
              <div className="p-4 flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading fonts...
              </div>
            ) : (
              <div 
                ref={listRef}
                className="max-h-60 overflow-y-auto"
              >
                {fonts.map((font, index) => (
                  <button
                    key={font.family + index}
                    onClick={() => handleFontChange(font.family)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center gap-2"
                    style={{ fontFamily: loadedFonts.has(font.family) ? font.family : 'inherit' }}
                  >
                    <span className="flex-1" style={{ 
                      fontFamily: loadedFonts.has(font.family) ? font.family : 'inherit',
                      opacity: loadedFonts.has(font.family) ? 1 : 0.7
                    }}>
                      {font.family}
                    </span>
                    {fontLoadingStates.has(font.family) && (
                      <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                    )}
                    {loadedFonts.has(font.family) && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Font loaded" />
                    )}
                  </button>
                ))}
                
                {isFetchingNextPage && (
                  <div className="p-3 text-center text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    <div className="text-xs mt-1">Loading more fonts...</div>
                  </div>
                )}
                
                {!hasNextPage && fonts.length > 15 && (
                  <div className="p-3 text-center text-gray-400 text-xs border-t">
                    All fonts loaded ({fonts.length} total)
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}