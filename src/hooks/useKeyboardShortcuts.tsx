'use client';

import { useEffect } from 'react';
import { useEditorHistory } from '@/contexts/editor-history-context';

export function useKeyboardShortcuts() {
  const { handleUndo, handleRedo, historyStats } = useEditorHistory();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for platform-specific modifier keys
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      // Ignore if typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true'
      ) {
        return;
      }

      // Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if (isCtrlOrCmd && event.key === 'z' && !event.shiftKey) {
        if (historyStats.canUndo) {
          event.preventDefault();
          handleUndo();
        }
        return;
      }

      // Redo: Ctrl+Shift+Z (Windows/Linux) or Cmd+Shift+Z (Mac)
      // Also support Ctrl+Y (Windows alternative)
      if (
        (isCtrlOrCmd && event.key === 'z' && event.shiftKey) ||
        (event.ctrlKey && event.key === 'y' && !event.metaKey)
      ) {
        if (historyStats.canRedo) {
          event.preventDefault();
          handleRedo();
        }
        return;
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo, historyStats.canUndo, historyStats.canRedo]);
}