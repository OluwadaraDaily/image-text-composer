'use client';

import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { TextLayer } from '@/types/layers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette,
  Type,
  Minus,
  Plus
} from 'lucide-react';

interface TextToolbarProps {
  selectedLayer: TextLayer | null;
  onLayerUpdate: (layerId: string, updates: Partial<TextLayer>) => void;
}

const GOOGLE_FONTS = [
  'Arial',
  'Open Sans',
  'Roboto',
  'Lato',
  'Source Sans Pro',
  'Montserrat',
  'Poppins',
  'Oswald',
  'Ubuntu',
  'Raleway',
  'Merriweather',
  'Playfair Display',
  'PT Sans',
  'Noto Sans',
  'Nunito',
  'Inter',
  'Work Sans',
  'Libre Baskerville',
  'Crimson Text',
  'Dancing Script'
];

const FONT_WEIGHTS = [
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semi Bold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra Bold' },
];

export function TextToolbar({ selectedLayer, onLayerUpdate }: TextToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set(['Arial']));

  const loadGoogleFont = async (fontFamily: string) => {
    if (loadedFonts.has(fontFamily) || fontFamily === 'Arial') {
      return;
    }

    try {
      const fontName = fontFamily.replace(/\s+/g, '+');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700;800&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      setLoadedFonts(prev => new Set([...prev, fontFamily]));
    } catch (error) {
      console.error('Failed to load font:', fontFamily, error);
    }
  };

  useEffect(() => {
    GOOGLE_FONTS.slice(0, 5).forEach(font => {
      loadGoogleFont(font);
    });
  }, []);

  const handleColorChange = (color: string) => {
    if (!selectedLayer) return;
    
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    onLayerUpdate(selectedLayer.id, {
      color: { r, g, b, a: selectedLayer.color.a }
    });
  };

  const handleFontSizeChange = (direction: 'up' | 'down') => {
    if (!selectedLayer) return;
    
    const change = direction === 'up' ? 2 : -2;
    const newSize = Math.max(8, Math.min(200, selectedLayer.fontSize + change));
    
    onLayerUpdate(selectedLayer.id, { fontSize: newSize });
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    if (!selectedLayer) return;
    
    loadGoogleFont(fontFamily);
    onLayerUpdate(selectedLayer.id, { fontFamily });
  };

  const handleFontWeightChange = (weight: string) => {
    if (!selectedLayer) return;
    onLayerUpdate(selectedLayer.id, { fontWeight: parseInt(weight) });
  };

  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedLayer) return;
    onLayerUpdate(selectedLayer.id, { alignment });
  };

  const handleOpacityChange = (value: number[]) => {
    if (!selectedLayer) return;
    onLayerUpdate(selectedLayer.id, { opacity: value[0] / 100 });
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
          <Select value={selectedLayer.fontFamily} onValueChange={handleFontFamilyChange}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GOOGLE_FONTS.map((font) => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Font Weight</Label>
          <Select value={selectedLayer.fontWeight.toString()} onValueChange={handleFontWeightChange}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_WEIGHTS.map((weight) => (
                <SelectItem key={weight.value} value={weight.value.toString()}>
                  {weight.label}
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
                onLayerUpdate(selectedLayer.id, { fontSize: Math.max(8, Math.min(200, size)) });
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