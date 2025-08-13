'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus } from 'lucide-react';

interface FontSizeControlProps {
  value: number;
  onChange: (size: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function FontSizeControl({ 
  value, 
  onChange, 
  min = 8, 
  max = 200, 
  step = 2 
}: FontSizeControlProps) {
  const handleSizeChange = (direction: 'up' | 'down') => {
    const change = direction === 'up' ? step : -step;
    const newSize = Math.max(min, Math.min(max, value + change));
    onChange(newSize);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value) || min;
    onChange(Math.max(min, Math.min(max, size)));
  };

  return (
    <div>
      <Label className="text-sm font-medium">Font Size</Label>
      <div className="flex items-center gap-2 mt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSizeChange('down')}
          disabled={value <= min}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <Input
          type="number"
          value={value}
          onChange={handleInputChange}
          className="text-center"
          min={min}
          max={max}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSizeChange('up')}
          disabled={value >= max}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}