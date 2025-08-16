'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import type { EditorHistory, DocumentState, HistoryStats, HistoryAction } from '@/types/history';
import type { TextLayer, CanvasMeta, ImageAsset } from '@/types';
import type { Stage } from 'konva/lib/Stage';
import { createHistory, pushHistoryWithAction, undoHistory, redoHistory, getHistoryStats } from '@/helpers/history';
import { loadHistoryFromStorage, restoreImageUrls } from '@/helpers/history-storage';
import { toast } from 'sonner';

interface EditorHistoryContextType {
  history: EditorHistory;
  historyStats: HistoryStats;
  currentState: DocumentState;
  pushHistoryAction: (newState: DocumentState, action: HistoryAction) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  updateCanvas: (canvas: CanvasMeta) => void;
  updateImage: (image: ImageAsset | null) => Promise<void>;
  updateLayers: (layers: TextLayer[]) => void;
  exportCanvas: () => void;
  setStageRef: (stage: Stage | null) => void;
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
  const stageRef = useRef<Stage | null>(null);
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

            // If image restoration failed, provide a fallback state
            if (savedHistory.present.image && !restoredPresent.image) {
              setHistory({
                ...savedHistory,
                present: {
                  ...restoredPresent,
                  image: null, // Clear invalid image data
                },
              });
            } else {
              setHistory({
                ...savedHistory,
                present: restoredPresent,
              });
            }
          }
        } catch (error) {
          console.warn('Failed to load editor history from IndexedDB:', error);
          // Don't set corrupted state, keep initial state
        } finally {
          setHasPageLoaded(true);
        }
      };
      
      loadHistory();
    }
  }, [hasPageLoaded]);

  // Note: Autosave is now handled by useAutosave hook to provide better throttling and UI feedback
  // This effect has been removed to prevent double-saving

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

  const updateImage = useCallback(async (image: ImageAsset | null) => {
    let processedImage = image;
    
    // If image has a blob URL, immediately save it to IndexedDB
    if (image && image.src.startsWith('blob:')) {
      try {
        const { imageStorageService } = await import('@/services/image-storage');
        const imageId = await imageStorageService.saveImageFromBlobUrl(image.src);
        if (imageId) {
          processedImage = {
            ...image,
            imageId,
            src: '', // Clear blob URL since we have it in IndexedDB
          };
          console.log('Image saved to IndexedDB with ID:', imageId);
        }
      } catch (error) {
        console.warn('Failed to save image immediately:', error);
        // Keep the original image even if saving fails
      }
    }
    
    setHistory(prev => ({
      ...prev,
      present: {
        ...prev.present,
        image: processedImage,
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

  // Export functionality
  const setStageRef = useCallback((stage: Stage | null) => {
    stageRef.current = stage;
  }, []);

  const exportCanvas = useCallback(async () => {
    if (!stageRef.current) {
      toast.error('Canvas not ready for export');
      return;
    }

    if (!currentState.image) {
      toast.error('No image to export');
      return;
    }

    try {
      toast.info('Preparing export...');

      // Calculate scale factor from display canvas to original image dimensions
      const displayCanvas = currentState.canvas;
      const originalImage = currentState.image;
      const scaleX = originalImage.width / displayCanvas.width;
      const scaleY = originalImage.height / displayCanvas.height;

      // Create offscreen canvas at original dimensions
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = originalImage.width;
      offscreenCanvas.height = originalImage.height;
      const ctx = offscreenCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to create canvas context');
      }

      // Draw the original image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = originalImage.src;
      });

      ctx.drawImage(img, 0, 0, originalImage.width, originalImage.height);

      // Load all fonts used by text layers before rendering
      const fontPromises = currentState.layers.map(async (layer) => {
        if (layer.fontFamily !== 'Arial') {
          // Create a test element to trigger font loading
          const testElement = document.createElement('div');
          testElement.style.fontFamily = layer.fontFamily;
          testElement.style.fontSize = `${layer.fontSize}px`;
          testElement.style.fontWeight = layer.fontWeight.toString();
          testElement.style.position = 'absolute';
          testElement.style.left = '-9999px';
          testElement.textContent = 'Test';
          document.body.appendChild(testElement);
          
          // Wait for font to load
          await document.fonts.load(`${layer.fontWeight} ${layer.fontSize}px "${layer.fontFamily}"`);
          
          document.body.removeChild(testElement);
        }
      });

      await Promise.all(fontPromises);

      // Render text layers at original scale
      currentState.layers
        .sort((a, b) => a.zIndex - b.zIndex)
        .forEach((layer) => {
          ctx.save();
          
          // Scale coordinates to original dimensions
          const scaledX = layer.x * scaleX;
          const scaledY = layer.y * scaleY;
          const scaledWidth = layer.width * scaleX;
          const scaledHeight = layer.height * scaleY;
          const scaledFontSize = layer.fontSize * Math.min(scaleX, scaleY);
          
          // Apply transformations
          if (layer.rotation !== 0) {
            const centerX = scaledX + scaledWidth / 2;
            const centerY = scaledY + scaledHeight / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate((layer.rotation * Math.PI) / 180);
            ctx.translate(-centerX, -centerY);
          }
          
          // Set text styles
          ctx.font = `${layer.fontWeight} ${scaledFontSize}px "${layer.fontFamily}"`;
          ctx.fillStyle = `rgba(${layer.color.r}, ${layer.color.g}, ${layer.color.b}, ${layer.color.a * layer.opacity})`;
          ctx.textAlign = layer.alignment as CanvasTextAlign;
          ctx.textBaseline = 'top';
          
          // Calculate text position based on alignment
          let textX = scaledX;
          if (layer.alignment === 'center') {
            textX = scaledX + scaledWidth / 2;
          } else if (layer.alignment === 'right') {
            textX = scaledX + scaledWidth;
          }
          
          // Handle multi-line text
          const lines = layer.text.split('\n');
          const lineHeight = scaledFontSize * 1.2;
          
          lines.forEach((line, index) => {
            const lineY = scaledY + (index * lineHeight);
            ctx.fillText(line, textX, lineY);
          });
          
          ctx.restore();
        });

      // Convert to blob and download
      offscreenCanvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create image blob');
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `image-text-composition-${Date.now()}.png`;
        link.href = url;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        toast.success('Image exported successfully!');
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export image');
    }
  }, [currentState.image, currentState.canvas, currentState.layers]);

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
    exportCanvas,
    setStageRef,
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