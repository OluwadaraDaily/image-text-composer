'use client';

import { useEffect } from 'react';
import { useEditorHistory } from '@/contexts/editor-history-context';
import type { CanvasMeta, TextLayer } from '@/types';

interface KeyboardShortcutsConfig {
  // Text layer management
  onAddText?: (canvasMeta: CanvasMeta) => void;
  canvasMeta?: CanvasMeta | null;
  
  // Layer operations
  selectedLayerId?: string | null;
  textLayers?: TextLayer[];
  onDeleteLayer?: (layerId: string) => void;
  onLayerUpdate?: (layerId: string, updates: Partial<TextLayer>) => void;
  onSetSelectedLayerId?: (layerId: string | null) => void;
  onCycleLayers?: (direction: 'forward' | 'backward') => void;
  
  // Text editing
  isEditing?: boolean;
  onCancelEditing?: () => void;
  onFinishEditing?: () => void;
  
  // Modifier keys tracking
  onModifierKeysChange?: (keys: { shift: boolean; alt: boolean }) => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig = {}) {
  const { handleUndo, handleRedo, historyStats } = useEditorHistory();
  
  const {
    onAddText,
    canvasMeta,
    selectedLayerId,
    textLayers = [],
    onDeleteLayer,
    onLayerUpdate,
    onSetSelectedLayerId,
    onCycleLayers,
    isEditing = false,
    onCancelEditing,
    onFinishEditing,
    onModifierKeysChange
  } = config;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for platform-specific modifier keys
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      // Track modifier keys
      if (onModifierKeysChange) {
        onModifierKeysChange({
          shift: event.shiftKey,
          alt: event.altKey
        });
      }
      
      // Check if we're in a text input/textarea to avoid interfering with typing
      const target = event.target as HTMLElement;
      const isInTextInput = target.tagName === 'INPUT' || 
                           target.tagName === 'TEXTAREA' || 
                           target.contentEditable === 'true';

      // Handle Escape key
      if (event.key === 'Escape') {
        if (isEditing && onCancelEditing) {
          onCancelEditing();
        } else if (selectedLayerId && onSetSelectedLayerId) {
          onSetSelectedLayerId(null);
        }
        return;
      }

      // Handle Enter key for text editing
      if (event.key === 'Enter' && !event.shiftKey && isEditing && onFinishEditing) {
        event.preventDefault();
        onFinishEditing();
        return;
      }

      // Skip other shortcuts if typing in input fields
      if (isInTextInput) {
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

      // Add text: T key (with or without Ctrl/Cmd)
      if ((event.key === 't' || event.key === 'T') && onAddText && canvasMeta) {
        event.preventDefault();
        onAddText(canvasMeta);
        return;
      }

      // Delete layer: Backspace key (only when not editing)
      if (event.key === 'Backspace' && !isEditing && selectedLayerId && onDeleteLayer) {
        event.preventDefault();
        onDeleteLayer(selectedLayerId);
        return;
      }

      // Arrow key nudging (only when not editing and layer is selected)
      if (!isEditing && selectedLayerId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        
        const layer = textLayers.find(l => l.id === selectedLayerId);
        if (!layer || !onLayerUpdate) return;
        
        const nudgeDistance = event.shiftKey ? 10 : 1;
        let deltaX = 0, deltaY = 0;
        
        switch (event.key) {
          case 'ArrowLeft': deltaX = -nudgeDistance; break;
          case 'ArrowRight': deltaX = nudgeDistance; break;
          case 'ArrowUp': deltaY = -nudgeDistance; break;
          case 'ArrowDown': deltaY = nudgeDistance; break;
        }
        
        // Apply canvas bounds clamping if canvasMeta is available
        let newX = layer.x + deltaX;
        let newY = layer.y + deltaY;
        
        if (canvasMeta) {
          newX = Math.max(0, Math.min(newX, canvasMeta.width - layer.width));
          newY = Math.max(0, Math.min(newY, canvasMeta.height - layer.height));
        }
        
        onLayerUpdate(selectedLayerId, { x: newX, y: newY });
        return;
      }

      // Tab navigation (only when not in text inputs and not editing)
      if (event.key === 'Tab' && !isEditing && onCycleLayers) {
        event.preventDefault();
        
        if (event.shiftKey) {
          onCycleLayers('backward');
        } else {
          onCycleLayers('forward');
        }
        return;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Update modifier keys on release
      if (onModifierKeysChange) {
        onModifierKeysChange({
          shift: event.shiftKey,
          alt: event.altKey
        });
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    handleUndo, 
    handleRedo, 
    historyStats.canUndo, 
    historyStats.canRedo,
    onAddText,
    canvasMeta,
    selectedLayerId,
    textLayers,
    onDeleteLayer,
    onLayerUpdate,
    onSetSelectedLayerId,
    onCycleLayers,
    isEditing,
    onCancelEditing,
    onFinishEditing,
    onModifierKeysChange
  ]);
}