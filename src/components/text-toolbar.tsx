'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useTextLayers } from '@/contexts/text-layers-context';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette,
  Type,
  Minus,
  Plus,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { useGoogleFonts, useInfiniteGoogleFonts } from '@/hooks/useGoogleFonts';


const getWeightLabel = (weight: string) => {
  const weightMap: Record<string, string> = {
    '100': 'Thin',
    '200': 'Extra Light',
    '300': 'Light',
    '400': 'Regular',
    '500': 'Medium',
    '600': 'Semi Bold',
    '700': 'Bold',
    '800': 'Extra Bold',
    '900': 'Black'
  };
  return weightMap[weight] || weight;
};

export function TextToolbar() {
  const { textLayers, selectedLayerId, handleLayerUpdate } = useTextLayers();
  const { data: googleFonts, isLoading: fontsLoading } = useGoogleFonts();
  const { 
    data: infiniteFonts, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    error: infiniteError
  } = useInfiniteGoogleFonts();

  console.log("infiniteFonts =>", infiniteFonts)
  console.log("hasNextPage =>", hasNextPage)
  console.log("isFetchingNextPage =>", isFetchingNextPage)
  console.log("infiniteError =>", infiniteError)
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set(['Arial']));
  const [fontLoadingStates, setFontLoadingStates] = useState<Set<string>>(new Set());
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const fontListRef = useRef<HTMLDivElement>(null);
  
  const selectedLayer = textLayers.find(layer => layer.id === selectedLayerId) || null;
  
  // Combine initial fonts with infinite fonts
  const availableFonts = useMemo(() => {
    const initialFonts = googleFonts?.items || [];
    const additionalFonts = infiniteFonts?.pages?.flatMap(page => page.fonts) || [];
    return [...initialFonts, ...additionalFonts];
  }, [googleFonts?.items, infiniteFonts?.pages]);
  
  const selectedFont = useMemo(() => 
    availableFonts.find(font => font.family === selectedLayer?.fontFamily),
    [availableFonts, selectedLayer?.fontFamily]
  );
  
  const availableWeights = useMemo(() => {
    if (!selectedFont?.variants) return ['400'];
    
    const weights = selectedFont.variants
      .filter(variant => 
        // Only include pure numeric weights (100-900) or 'regular'
        /^\d+$/.test(variant) || variant === 'regular'
      )
      .map(variant => variant === 'regular' ? '400' : variant)
      // Remove duplicates by converting to Set and back to array
      .filter((weight, index, array) => array.indexOf(weight) === index)
      // Sort numerically
      .sort((a, b) => parseInt(a) - parseInt(b));
    
    // Ensure we always have at least '400' (Regular)
    return weights.length > 0 ? weights : ['400'];
  }, [selectedFont?.variants]);

  const loadGoogleFont = async (fontFamily: string, weights?: string[]) => {
    if (loadedFonts.has(fontFamily) || fontFamily === 'Arial') {
      return;
    }

    setFontLoadingStates(prev => new Set([...prev, fontFamily]));

    try {
      const fontName = fontFamily.replace(/\s+/g, '+');
      const weightParam = weights ? `:wght@${weights.join(';')}` : ':wght@300;400;500;600;700;800';
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}${weightParam}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      // Wait for font to load
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 1000); // Max 1 second wait
        if (document.fonts) {
          document.fonts.ready.then(() => {
            clearTimeout(timeout);
            resolve(undefined);
          });
        } else {
          setTimeout(resolve, 500); // Fallback for older browsers
        }
      });
      
      setLoadedFonts(prev => new Set([...prev, fontFamily]));
    } catch (error) {
      console.error('Failed to load font:', fontFamily, error);
    } finally {
      setFontLoadingStates(prev => {
        const newSet = new Set(prev);
        newSet.delete(fontFamily);
        return newSet;
      });
    }
  };

  // Remove aggressive font preloading - only load fonts when needed

  const handleColorChange = (color: string) => {
    if (!selectedLayer) return;
    
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    handleLayerUpdate(selectedLayer.id, {
      color: { r, g, b, a: selectedLayer.color.a }
    });
  };

  const handleFontSizeChange = (direction: 'up' | 'down') => {
    if (!selectedLayer) return;
    
    const change = direction === 'up' ? 2 : -2;
    const newSize = Math.max(8, Math.min(200, selectedLayer.fontSize + change));
    
    handleLayerUpdate(selectedLayer.id, { fontSize: newSize });
  };

  // Scroll detection for infinite loading - only when dropdown is open
  useEffect(() => {
    if (!showFontDropdown) return;

    const handleScroll = (e: Event) => {
      console.log('Scroll event triggered!', e.target);
      
      if (!fontListRef.current) {
        console.log('No fontListRef.current');
        return;
      }
      
      const { scrollTop, scrollHeight, clientHeight } = fontListRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      
      console.log('Scroll debug:', {
        scrollTop,
        scrollHeight,
        clientHeight,
        isNearBottom,
        hasNextPage,
        isFetchingNextPage,
        availableFontsLength: availableFonts.length,
        calculation: `${scrollTop} + ${clientHeight} >= ${scrollHeight} - 100 = ${scrollTop + clientHeight >= scrollHeight - 100}`
      });
      
      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        console.log('Fetching next page...');
        fetchNextPage();
      }
    };

    // Small delay to ensure the DOM is rendered
    const timeoutId = setTimeout(() => {
      const fontList = fontListRef.current;
      console.log('Setting up scroll listener on:', fontList);
      
      if (fontList) {
        fontList.addEventListener('scroll', handleScroll);
      }
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      const fontList = fontListRef.current;
      if (fontList) {
        console.log('Removing scroll listener');
        fontList.removeEventListener('scroll', handleScroll);
      }
    };
  }, [showFontDropdown, hasNextPage, isFetchingNextPage, fetchNextPage, availableFonts.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setShowFontDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFontFamilyChange = (fontFamily: string) => {
    if (!selectedLayer) return;
    
    const font = availableFonts.find(f => f.family === fontFamily);
    loadGoogleFont(fontFamily, font?.variants);
    handleLayerUpdate(selectedLayer.id, { fontFamily });
    setShowFontDropdown(false);
  };

  const handleFontWeightChange = (weight: string) => {
    if (!selectedLayer) return;
    handleLayerUpdate(selectedLayer.id, { fontWeight: parseInt(weight) });
  };

  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedLayer) return;
    handleLayerUpdate(selectedLayer.id, { alignment });
  };

  const handleOpacityChange = (value: number[]) => {
    if (!selectedLayer) return;
    handleLayerUpdate(selectedLayer.id, { opacity: value[0] / 100 });
  };

  const rgbaToHex = (color: { r: number; g: number; b: number; a: number }) => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  };

  if (!selectedLayer) {
    return (
      <div className="w-64 bg-gray-50 border-r p-4 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a text layer to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-50 border-r p-4 space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Font Family</Label>
          <div className="relative" ref={fontDropdownRef}>
            <button
              onClick={() => setShowFontDropdown(!showFontDropdown)}
              className="w-full mt-1 px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
            >
              <span className="truncate" style={{ fontFamily: loadedFonts.has(selectedLayer.fontFamily) ? selectedLayer.fontFamily : 'inherit' }}>
                {selectedLayer.fontFamily}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {showFontDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                {fontsLoading ? (
                  <div className="p-4 flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading fonts...
                  </div>
                ) : (
                  <div 
                    ref={fontListRef}
                    className="max-h-60 overflow-y-auto"
                  >
                    {availableFonts.map((font, index) => (
                      <button
                        key={font.family + `${index}`}
                        onClick={() => handleFontFamilyChange(font.family)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center gap-2"
                        style={{ fontFamily: loadedFonts.has(font.family) ? font.family : 'inherit' }}
                      >
                        <span className="flex-1">{font.family}</span>
                        {fontLoadingStates.has(font.family) && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                      </button>
                    ))}
                    
                    {isFetchingNextPage && (
                      <div className="p-3 text-center text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        <div className="text-xs mt-1">Loading more fonts...</div>
                      </div>
                    )}
                    
                    {!hasNextPage && availableFonts.length > 15 && (
                      <div className="p-3 text-center text-gray-400 text-xs border-t">
                        All fonts loaded ({availableFonts.length} total)
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Font Weight</Label>
          <Select value={selectedLayer.fontWeight.toString()} onValueChange={handleFontWeightChange}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableWeights.map((weight) => (
                <SelectItem key={weight} value={weight}>
                  {getWeightLabel(weight)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Font Size</Label>
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFontSizeChange('down')}
              disabled={selectedLayer.fontSize <= 8}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Input
              type="number"
              value={selectedLayer.fontSize}
              onChange={(e) => {
                const size = parseInt(e.target.value) || 18;
                handleLayerUpdate(selectedLayer.id, { fontSize: Math.max(8, Math.min(200, size)) });
              }}
              className="text-center"
              min="8"
              max="200"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFontSizeChange('up')}
              disabled={selectedLayer.fontSize >= 200}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium">Text Alignment</Label>
          <div className="flex gap-1 mt-1">
            <Button
              variant={selectedLayer.alignment === 'left' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleAlignmentChange('left')}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant={selectedLayer.alignment === 'center' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleAlignmentChange('center')}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant={selectedLayer.alignment === 'right' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleAlignmentChange('right')}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium">Text Color</Label>
          <div className="mt-1">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: rgbaToHex(selectedLayer.color) }}
              />
              <Palette className="w-4 h-4" />
              Color
            </Button>
            {showColorPicker && (
              <div className="mt-2 p-2 border rounded-lg bg-white">
                <HexColorPicker
                  color={rgbaToHex(selectedLayer.color)}
                  onChange={handleColorChange}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Opacity</Label>
          <div className="mt-2 px-1">
            <Slider
              value={[selectedLayer.opacity * 100]}
              onValueChange={handleOpacityChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{Math.round(selectedLayer.opacity * 100)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}