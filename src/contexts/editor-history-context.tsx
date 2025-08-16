'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { EditorHistory, DocumentState, HistoryStats, HistoryAction } from '@/types/history';
import type { TextLayer, CanvasMeta, ImageAsset } from '@/types';
import { createHistory, pushHistoryWithAction, undoHistory, redoHistory, getHistoryStats } from '@/helpers/history';
import { STORAGE_KEY, safelyStorageSet, loadHistoryFromStorage, restoreImageUrls } from '@/helpers/history-storage';

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
  const initialState: DocumentState = {
    canvas: { width: 800, height: 600, scale: 1, rotation: 0 },
    image: null,
    layers: [],
  };

  const [history, setHistory] = useState<EditorHistory>(() => createHistory(initialState));
  const [hasPageLoaded, setHasPageLoaded] = useState(false);
  const historyStats = getHistoryStats(history);
  const currentState = history.present;

  // Load from IndexedDB after component mounts (client-side only)
  useEffect(() => {
    if (!hasPageLoaded) {
      const loadHistory = async () => {
        try {
          const savedHistory = await loadHistoryFromStorage();
          if (savedHistory) {
            // Restore image URLs for the present state
            const restoredPresent = await restoreImageUrls(savedHistory.present);

            setHistory({
              ...savedHistory,
              present: restoredPresent,
            });
          }
        } catch (error) {
          console.warn('Failed to load editor history from IndexedDB:', error);
        } finally {
          setHasPageLoaded(true);
        }
      };
      
      loadHistory();
    }
  }, [hasPageLoaded]);

  useEffect(() => {
    if (hasPageLoaded) {
      const saveHistory = async () => {
        const success = await safelyStorageSet(STORAGE_KEY, history);
        if (!success) {
          console.warn('Failed to save editor history to IndexedDB');
        }
      };
      saveHistory();
    }
  }, [history, hasPageLoaded])

  const pushHistoryAction = useCallback((newState: DocumentState, action: HistoryAction) => {
    setHistory(prev => pushHistoryWithAction(prev, newState, action));
  }, []);

  const handleUndo = useCallback(async () => {
    const newHistory = undoHistory(history);
    if (newHistory) {
      // Restore image URLs for the new present state
      const restoredPresent = await restoreImageUrls(newHistory.present);
      setHistory({
        ...newHistory,
        present: restoredPresent,
      });
    }
  }, [history]);
  
  const handleRedo = useCallback(async () => {
    const newHistory = redoHistory(history);
    if (newHistory) {
      // Restore image URLs for the new present state
      const restoredPresent = await restoreImageUrls(newHistory.present);
      setHistory({
        ...newHistory,
        present: restoredPresent,
      });
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