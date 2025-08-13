'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface OpacitySliderProps {
  value: number; // Value between 0 and 1
  onChange: (opacity: number) => void;
}

export function OpacitySlider({ value, onChange }: OpacitySliderProps) {
  const handleValueChange = (values: number[]) => {
    onChange(values[0] / 100);
  };

  const percentage = Math.round(value * 100);

  return (
    <div>
      <Label className="text-sm font-medium">Opacity</Label>
      <div className="mt-2 px-1">
        <Slider
          value={[percentage]}
          onValueChange={handleValueChange}
          max={100}
          min={0}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>{percentage}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}