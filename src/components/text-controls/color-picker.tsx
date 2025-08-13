'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Palette } from 'lucide-react';

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface ColorPickerProps {
  value: Color;
  onChange: (color: Color) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const rgbaToHex = (color: Color) => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  };

  const hexToRgba = (hex: string): Color => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    return { r, g, b, a: value.a };
  };

  const handleColorChange = (color: string) => {
    onChange(hexToRgba(color));
  };

  return (
    <div>
      <Label className="text-sm font-medium">Text Color</Label>
      <div className="mt-1">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => setShowPicker(!showPicker)}
        >
          <div
            className="w-4 h-4 rounded border"
            style={{ backgroundColor: rgbaToHex(value) }}
          />
          <Palette className="w-4 h-4" />
          Color
        </Button>
        {showPicker && (
          <div className="mt-2 p-2 border rounded-lg bg-white">
            <HexColorPicker
              color={rgbaToHex(value)}
              onChange={handleColorChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}