'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FontWeightSelectorProps {
  value: number;
  availableWeights: string[];
  onChange: (weight: string) => void;
}

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

export function FontWeightSelector({ value, availableWeights, onChange }: FontWeightSelectorProps) {
  return (
    <div>
      <Label className="text-sm font-medium">Font Weight</Label>
      <Select value={value.toString()} onValueChange={onChange}>
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
  );
}