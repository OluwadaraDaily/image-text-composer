'use client';

import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';
import { useEditorHistory } from '@/contexts/editor-history-context';
import { HistoryControls } from '@/components/history/history-controls';

interface EditorHeaderProps {
  onReset?: () => void;
  onExport?: () => void;
}

export function EditorHeader({ onReset, onExport }: EditorHeaderProps) {
  const { historyStats, handleUndo, handleRedo } = useEditorHistory();

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      {/* Left side - History controls */}
      <div className="flex items-center gap-3">
        <HistoryControls 
          historyStats={historyStats}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
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