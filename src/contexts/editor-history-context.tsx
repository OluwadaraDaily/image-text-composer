'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { EditorHistory, DocumentState, HistoryStats, HistoryAction } from '@/types/history';
import type { TextLayer, CanvasMeta, ImageAsset } from '@/types';
import { createHistory, pushHistoryWithAction, undoHistory, redoHistory, getHistoryStats } from '@/helpers/history';

interface EditorHistoryContextType {
  history: EditorHistory;
  historyStats: HistoryStats;
  currentState: DocumentState;
  pushHistoryAction: (newState: DocumentState, action: HistoryAction) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  updateCanvas: (canvas: CanvasMeta) => void;
  updateImage: (image: ImageAsset | null) => void;
  updateLayers: (layers: TextLayer[]) => void;
}

const EditorHistoryContext = createContext<EditorHistoryContextType | undefined>(undefined);

interface EditorHistoryProviderProps {
  children: ReactNode;
}

export function EditorHistoryProvider({ children }: EditorHistoryProviderProps) {
  // Initialize history with empty state
  const initialState: DocumentState = {
    canvas: { width: 800, height: 600, scale: 1, rotation: 0 },
    image: null,
    layers: [],
  };
  
  const [history, setHistory] = useState<EditorHistory>(() => createHistory(initialState));
  const historyStats = getHistoryStats(history);
  const currentState = history.present;

  useEffect(() => {
    console.log("History Updated =>", history)
  }, [history])

  const pushHistoryAction = useCallback((newState: DocumentState, action: HistoryAction) => {
    console.log("pushHistoryAction")
    console.log("newState [pushHistoryAction] =>", newState)
    console.log("action [pushHistoryAction] =>", action)
    setHistory(prev => pushHistoryWithAction(prev, newState, action));
  }, []);

  const handleUndo = useCallback(() => {
    console.log("Handle Undo 0")
    const newHistory = undoHistory(history);
    console.log("NEW HISTORY =>", newHistory)
    if (newHistory) {
      setHistory(newHistory);
    }
  }, [history]);
  
  const handleRedo = useCallback(() => {
    const newHistory = redoHistory(history);
    if (newHistory) {
      setHistory(newHistory);
    }
  }, [history]);

  // Helper methods to update specific parts of the state
  const updateCanvas = useCallback((canvas: CanvasMeta) => {
    setHistory(prev => ({
      ...prev,
      present: {
        ...prev.present,
        canvas,
      },
    }));
  }, []);

  const updateImage = useCallback((image: ImageAsset | null) => {
    setHistory(prev => ({
      ...prev,
      present: {
        ...prev.present,
        image,
      },
    }));
  }, []);

  const updateLayers = useCallback((layers: TextLayer[]) => {
    setHistory(prev => ({
      ...prev,
      present: {
        ...prev.present,
        layers,
      },
    }));
  }, []);

  const value = {
    history,
    historyStats,
    currentState,
    pushHistoryAction,
    handleUndo,
    handleRedo,
    updateCanvas,
    updateImage,
    updateLayers,
  };

  return (
    <EditorHistoryContext.Provider value={value}>
      {children}
    </EditorHistoryContext.Provider>
  );
}

export function useEditorHistory() {
  const context = useContext(EditorHistoryContext);
  if (context === undefined) {
    throw new Error('useEditorHistory must be used within an EditorHistoryProvider');
  }
  return context;
}