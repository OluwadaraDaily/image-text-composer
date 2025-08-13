'use client';

import { useState, useMemo, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTextLayers } from '@/contexts/text-layers-context';
import { Type } from 'lucide-react';
import { useGoogleFonts, useInfiniteGoogleFonts } from '@/hooks/useGoogleFonts';
import { FontFamilySelector } from '@/components/text-controls/font-family-selector';
import { FontWeightSelector } from '@/components/text-controls/font-weight-selector';
import { FontSizeControl } from '@/components/text-controls/font-size-control';
import { TextAlignmentControl } from '@/components/text-controls/text-alignment-control';
import { ColorPicker } from '@/components/text-controls/color-picker';
import { OpacitySlider } from '@/components/text-controls/opacity-slider';



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
  
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set(['Arial']));
  const [fontLoadingStates, setFontLoadingStates] = useState<Set<string>>(new Set());
  const [preloadedFonts, setPreloadedFonts] = useState<Set<string>>(new Set());
  
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

  const loadGoogleFont = async (fontFamily: string, weights?: string[], isPreload = false) => {
    if (loadedFonts.has(fontFamily) || fontFamily === 'Arial') {
      return;
    }

    if (!isPreload) {
      setFontLoadingStates(prev => new Set([...prev, fontFamily]));
    }

    try {
      const fontName = fontFamily.replace(/\s+/g, '+');
      const weightParam = weights ? `:wght@${weights.join(';')}` : ':wght@300;400;500;600;700;800';
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}${weightParam}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      // Wait for font to load with better timing
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 3000); // Extended to 3 seconds
        if (document.fonts) {
          // Use FontFace API for better detection
          const fontFace = new FontFace(fontFamily, `url(https://fonts.gstatic.com/s/${fontName.toLowerCase()}/v1/${fontName}-Regular.woff2)`);
          fontFace.load().then(() => {
            clearTimeout(timeout);
            resolve(undefined);
          }).catch(() => {
            // Fallback to document.fonts.ready
            document.fonts.ready.then(() => {
              clearTimeout(timeout);
              resolve(undefined);
            });
          });
        } else {
          setTimeout(resolve, 1500); // Longer fallback for older browsers
        }
      });
      
      setLoadedFonts(prev => new Set([...prev, fontFamily]));
      if (isPreload) {
        setPreloadedFonts(prev => new Set([...prev, fontFamily]));
      }
    } catch (error) {
      console.error('Failed to load font:', fontFamily, error);
    } finally {
      if (!isPreload) {
        setFontLoadingStates(prev => {
          const newSet = new Set(prev);
          newSet.delete(fontFamily);
          return newSet;
        });
      }
    }
  };

  // Preload popular fonts when component mounts
  useEffect(() => {
    const popularFonts = ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald'];
    const preloadPopularFonts = async () => {
      for (const fontFamily of popularFonts) {
        if (availableFonts.some(f => f.family === fontFamily)) {
          await loadGoogleFont(fontFamily, ['400', '700'], true);
        }
      }
    };
    preloadPopularFonts();
  }, [availableFonts]);



  const handleFontFamilyChange = (fontFamily: string) => {
    if (!selectedLayer) return;
    handleLayerUpdate(selectedLayer.id, { fontFamily });
  };

  const handleFontWeightChange = (weight: string) => {
    if (!selectedLayer) return;
    handleLayerUpdate(selectedLayer.id, { fontWeight: parseInt(weight) });
  };

  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedLayer) return;
    handleLayerUpdate(selectedLayer.id, { alignment });
  };

  const handleColorChange = (color: { r: number; g: number; b: number; a: number }) => {
    if (!selectedLayer) return;
    handleLayerUpdate(selectedLayer.id, { color });
  };

  const handleOpacityChange = (opacity: number) => {
    if (!selectedLayer) return;
    handleLayerUpdate(selectedLayer.id, { opacity });
  };

  const handleFontSizeChange = (fontSize: number) => {
    if (!selectedLayer) return;
    handleLayerUpdate(selectedLayer.id, { fontSize });
  };

  if (!selectedLayer) {
    return (
      <div className="w-64 bg-red-500 border-r p-4 flex items-center justify-center text-gray-500">
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
        <FontFamilySelector
          value={selectedLayer.fontFamily}
          fonts={availableFonts}
          loadedFonts={loadedFonts}
          fontLoadingStates={fontLoadingStates}
          isLoading={fontsLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onChange={handleFontFamilyChange}
          onLoadFont={loadGoogleFont}
          onFetchNextPage={fetchNextPage}
        />

        <FontWeightSelector
          value={selectedLayer.fontWeight}
          availableWeights={availableWeights}
          onChange={handleFontWeightChange}
        />

        <FontSizeControl
          value={selectedLayer.fontSize}
          onChange={handleFontSizeChange}
        />

        <Separator />

        <TextAlignmentControl
          value={selectedLayer.alignment}
          onChange={handleAlignmentChange}
        />

        <Separator />

        <ColorPicker
          value={selectedLayer.color}
          onChange={handleColorChange}
        />

        <OpacitySlider
          value={selectedLayer.opacity}
          onChange={handleOpacityChange}
        />
      </div>
    </div>
  );
}