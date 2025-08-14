'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Undo2, Redo2 } from 'lucide-react';
import type { HistoryStats } from '@/types/history';

interface HistoryControlsProps {
  historyStats: HistoryStats;
  onUndo: () => void;
  onRedo: () => void;
}

export function HistoryControls({ historyStats, onUndo, onRedo }: HistoryControlsProps) {
  const { canUndo, canRedo, lastAction } = historyStats;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={!canUndo}
          onClick={onUndo}
          className="flex-1"
        >
          <Undo2 className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={!canRedo}
          onClick={onRedo}
          className="flex-1"
        >
          <Redo2 className="h-4 w-4 mr-1" />
          Redo
        </Button>
      </div>
      
      {lastAction && (
        <div className="text-xs text-muted-foreground px-1 truncate">
          Last: {lastAction.label}
        </div>
      )}
      
      <Separator />
    </div>
  );
}