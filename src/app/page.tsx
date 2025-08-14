'use client';

import { EmptyState } from '@/components/empty-state';
import { ImageEditor } from '@/components/image-editor';
import { EditorLayout } from '@/components/editor/editor-layout';
import { EditorHistoryProvider } from '@/contexts/editor-history-context';
import { useState, useCallback, useEffect } from 'react';
import { processImageFile, cleanupImageUrl } from '@/lib/image-utils';
import { useEditorHistory } from '@/contexts/editor-history-context';
import type { ImageAsset, CanvasMeta } from '@/types';
import { toast } from 'sonner';
import { createHistoryAction, getActionLabel, HISTORY_ACTION_TYPES } from '@/constants/history-actions';

function AppContent() {
  const [canvasMeta, setCanvasMeta] = useState<CanvasMeta | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const EMPTY_HISTORY_STATE = {
    canvas: { width: 800, height: 600, scale: 1, rotation: 0 },
    image: null,
    layers: [],
  }
  
  // Get the current history state to determine what to show
  const { currentState, pushHistoryAction } = useEditorHistory();

  const handleImageSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      const { asset } = await processImageFile(file);
      
      const newState = {
        canvas: { width: 800, height: 600, scale: 1, rotation: 0 },
        image: asset,
        layers: [], // Reset layers when new image is added
      };
      
      const action = {
        type: 'set_image',
        label: 'Set Background Image',
        timestamp: Date.now(),
      };
      
      pushHistoryAction(newState, action);
      toast.success(`Image processed successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process image';
      toast.error(`Image processing error: ${message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [pushHistoryAction]);

  const handleCanvasMetaUpdate = useCallback((meta: CanvasMeta) => {
    setCanvasMeta(meta);
  }, []);

  const handleReset = useCallback(() => {
    if (currentState.image) {
      cleanupImageUrl(currentState.image.src);
    }
    
    const newState = EMPTY_HISTORY_STATE;

    const action = createHistoryAction(
      HISTORY_ACTION_TYPES.CLEAR_CANVAS,
      getActionLabel(HISTORY_ACTION_TYPES.CLEAR_CANVAS)
    )
    
    pushHistoryAction(newState, action);
    setCanvasMeta(null);
  }, [currentState.image, pushHistoryAction]);

  const handleError = useCallback((error: string) => {
    toast.error(`Image upload error: ${error}`)
    console.error('Image upload error:', error);
  }, []);

  useEffect(() => {
    return () => {
      if (currentState.image) {
        cleanupImageUrl(currentState.image.src);
      }
    };
  }, [currentState.image]);

  const shouldShowEditor = currentState.image;

  if (!shouldShowEditor) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Image Text Composer
            </h1>
            <p className="text-gray-600">
              Upload a PNG image to start adding text overlays
            </p>
          </div>

          <EmptyState 
            onImageSelect={handleImageSelect}
            onError={handleError}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    );
  }

  return (
    <EditorLayout onReset={handleReset}>
      <ImageEditor 
        image={currentState.image!}
        canvasMeta={canvasMeta}
        onCanvasMetaUpdate={handleCanvasMetaUpdate}
        onReset={handleReset}
      />
    </EditorLayout>
  );
}

export default function Home() {
  return (
    <EditorHistoryProvider>
      <AppContent />
    </EditorHistoryProvider>
  );
}
