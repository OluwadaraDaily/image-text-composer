'use client';

import { useCallback, useEffect } from 'react';
import { useTextLayers } from '@/contexts/text-layers-context';
import { useEditorHistory } from '@/contexts/editor-history-context';
import { HISTORY_ACTION_TYPES, createHistoryAction, getActionLabel } from '@/constants/history-actions';
import type { TextLayer, CanvasMeta } from '@/types';

export function useTextLayersWithHistory() {
  const textLayersContext = useTextLayers();
  const { pushHistoryAction, currentState } = useEditorHistory();
  
  const {
    textLayers,
    selectedLayerId,
    setSelectedLayerId,
    handleBringForward: originalBringForward,
    handleBringBackward: originalBringBackward,
    handleBringToFront: originalBringToFront,
    handleBringToBack: originalBringToBack,
    handleAddText: originalAddText,
    handleLayerUpdate: originalLayerUpdate,
    setTextLayers,
  } = textLayersContext;

  // Sync textLayers with history state when undo/redo happens
  useEffect(() => {
    const historyLayers = currentState.layers || [];
    setTextLayers(historyLayers);
  }, [currentState.layers, setTextLayers]);

  const handleLayerUpdate = useCallback((layerId: string, updates: Partial<TextLayer>) => {
    originalLayerUpdate(layerId, updates);
    
    const newLayers = textLayers.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    );
    
    let actionType: string = HISTORY_ACTION_TYPES.UPDATE_TEXT_CONTENT;
    let actionDetails = updates;
    
    if (updates.fontFamily) actionType = HISTORY_ACTION_TYPES.UPDATE_FONT_FAMILY;
    else if (updates.fontSize) actionType = HISTORY_ACTION_TYPES.UPDATE_FONT_SIZE;
    else if (updates.fontWeight) actionType = HISTORY_ACTION_TYPES.UPDATE_FONT_WEIGHT;
    else if (updates.alignment) actionType = HISTORY_ACTION_TYPES.UPDATE_TEXT_ALIGNMENT;
    else if (updates.color) actionType = HISTORY_ACTION_TYPES.UPDATE_TEXT_COLOR;
    else if (updates.opacity !== undefined) actionType = HISTORY_ACTION_TYPES.UPDATE_TEXT_OPACITY;
    else if (updates.x !== undefined || updates.y !== undefined) actionType = HISTORY_ACTION_TYPES.MOVE_LAYER;
    else if (updates.width !== undefined || updates.height !== undefined) actionType = HISTORY_ACTION_TYPES.RESIZE_LAYER;
    else if (updates.rotation !== undefined) actionType = HISTORY_ACTION_TYPES.ROTATE_LAYER;
    
    const action = createHistoryAction(
      actionType,
      getActionLabel(actionType, actionDetails)
    );
    
    const newState = {
      ...currentState,
      layers: newLayers,
    };
    
    pushHistoryAction(newState, action);
  }, [originalLayerUpdate, textLayers, currentState, pushHistoryAction]);

  const handleAddText = useCallback((canvasMeta: CanvasMeta) => {
    // Create the new layer manually to ensure we have it for history
    // Use a more unique ID to avoid collisions
    const newLayerId = `text-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newLayer: TextLayer = {
      id: newLayerId,
      text: 'New Text',
      x: canvasMeta.width / 2 - 50,
      y: canvasMeta.height / 2 - 12,
      rotation: 0,
      width: 100,
      height: 24,
      fontFamily: 'Arial',
      fontWeight: 400,
      fontSize: 18,
      color: { r: 0, g: 0, b: 0, a: 1 },
      opacity: 1,
      alignment: 'center',
      locked: false,
      zIndex: textLayers.length > 0 ? Math.max(...textLayers.map(l => l.zIndex)) + 1 : 0,
      selected: true,
    };

    // Update the layers state directly
    const newLayers = [...textLayers, newLayer].sort((a, b) => a.zIndex - b.zIndex);
    
    // Update local state via context
    setTextLayers(newLayers);
    setSelectedLayerId(newLayerId);
    
    // Create history action
    const action = createHistoryAction(
      HISTORY_ACTION_TYPES.ADD_TEXT_LAYER,
      getActionLabel(HISTORY_ACTION_TYPES.ADD_TEXT_LAYER)
    );
    
    const newState = {
      ...currentState,
      layers: newLayers,
    };
    
    pushHistoryAction(newState, action);
  }, [textLayers, currentState, pushHistoryAction, setTextLayers, setSelectedLayerId]);

  const handleBringForward = useCallback((layerId: string) => {
    originalBringForward(layerId);
    
    const action = createHistoryAction(
      HISTORY_ACTION_TYPES.REORDER_LAYERS,
      getActionLabel(HISTORY_ACTION_TYPES.REORDER_LAYERS)
    );
    
    setTimeout(() => {
      const newState = {
        ...currentState,
        layers: textLayers,
      };
      
      pushHistoryAction(newState, action);
    }, 0);
  }, [originalBringForward, textLayers, currentState, pushHistoryAction]);

  const handleBringBackward = useCallback((layerId: string) => {
    originalBringBackward(layerId);
    
    const action = createHistoryAction(
      HISTORY_ACTION_TYPES.REORDER_LAYERS,
      getActionLabel(HISTORY_ACTION_TYPES.REORDER_LAYERS)
    );
    
    setTimeout(() => {
      const newState = {
        ...currentState,
        layers: textLayers,
      };
      
      pushHistoryAction(newState, action);
    }, 0);
  }, [originalBringBackward, textLayers, currentState, pushHistoryAction]);

  const handleBringToFront = useCallback((layerId: string) => {
    originalBringToFront(layerId);
    
    const action = createHistoryAction(
      HISTORY_ACTION_TYPES.REORDER_LAYERS,
      getActionLabel(HISTORY_ACTION_TYPES.REORDER_LAYERS)
    );
    
    setTimeout(() => {
      const newState = {
        ...currentState,
        layers: textLayers,
      };
      
      pushHistoryAction(newState, action);
    }, 0);
  }, [originalBringToFront, textLayers, currentState, pushHistoryAction]);

  const handleBringToBack = useCallback((layerId: string) => {
    originalBringToBack(layerId);
    
    const action = createHistoryAction(
      HISTORY_ACTION_TYPES.REORDER_LAYERS,
      getActionLabel(HISTORY_ACTION_TYPES.REORDER_LAYERS)
    );
    
    setTimeout(() => {
      const newState = {
        ...currentState,
        layers: textLayers,
      };
      
      pushHistoryAction(newState, action);
    }, 0);
  }, [originalBringToBack, textLayers, currentState, pushHistoryAction]);

  const handleDeleteLayer = useCallback((layerId: string) => {
    const newLayers = textLayers.filter(l => l.id !== layerId);
    
    const action = createHistoryAction(
      HISTORY_ACTION_TYPES.DELETE_LAYER,
      getActionLabel(HISTORY_ACTION_TYPES.DELETE_LAYER)
    );
    
    const newState = {
      ...currentState,
      layers: newLayers,
    };
    
    pushHistoryAction(newState, action);
    setTextLayers(newLayers);
    setSelectedLayerId(null);
  }, [textLayers, currentState, pushHistoryAction, setTextLayers, setSelectedLayerId]);

  return {
    textLayers,
    selectedLayerId,
    setSelectedLayerId,
    handleLayerUpdate,
    handleBringForward,
    handleBringBackward,
    handleBringToFront,
    handleBringToBack,
    handleAddText,
    handleDeleteLayer,
    setTextLayers,
  };
}