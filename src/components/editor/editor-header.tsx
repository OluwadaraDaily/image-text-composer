'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Undo2, Redo2, Download, RotateCcw } from 'lucide-react';
import { useEditorHistory } from '@/contexts/editor-history-context';

interface EditorHeaderProps {
  onReset?: () => void;
  onExport?: () => void;
}

export function EditorHeader({ onReset, onExport }: EditorHeaderProps) {
  const { historyStats, handleUndo, handleRedo } = useEditorHistory();
  const { canUndo, canRedo, lastAction } = historyStats;

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      {/* Left side - History controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={!canUndo}
            onClick={handleUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={!canRedo}
            onClick={handleRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-4 w-4 mr-1" />
            Redo
          </Button>
        </div>
        
        {lastAction && (
          <div className="text-sm text-muted-foreground px-2">
            Last: {lastAction.label}
          </div>
        )}
      </div>

      {/* Center - App title */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Image Text Composer</h1>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          title="Reset Canvas"
          onClick={onReset}
          disabled={!onReset}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
        <Button 
          variant="default" 
          size="sm"
          title="Export PNG"
          onClick={onExport}
          disabled={!onExport}
        >
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>
    </div>
  );
}