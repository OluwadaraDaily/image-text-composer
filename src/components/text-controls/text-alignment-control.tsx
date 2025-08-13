'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

type Alignment = 'left' | 'center' | 'right';

interface TextAlignmentControlProps {
  value: Alignment;
  onChange: (alignment: Alignment) => void;
}

export function TextAlignmentControl({ value, onChange }: TextAlignmentControlProps) {
  return (
    <div>
      <Label className="text-sm font-medium">Text Alignment</Label>
      <div className="flex gap-1 mt-1">
        <Button
          variant={value === 'left' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange('left')}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          variant={value === 'center' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange('center')}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          variant={value === 'right' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange('right')}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}