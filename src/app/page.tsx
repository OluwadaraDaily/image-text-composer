'use client';

import { EmptyState } from '@/components/empty-state';
import { ImageEditor } from '@/components/image-editor';
import { useState, useCallback, useEffect } from 'react';
import { processImageFile, cleanupImageUrl } from '@/lib/image-utils';
import type { ImageAsset, CanvasMeta } from '@/types';
import { toast } from 'sonner';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<ImageAsset | null>(null);
  const [canvasMeta, setCanvasMeta] = useState<CanvasMeta | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      const { asset } = await processImageFile(file);
      setSelectedFile(file);
      setProcessedImage(asset);
      toast.success(`Image processed successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process image';
      toast.error(`Image processing error: ${message}`);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleCanvasMetaUpdate = useCallback((meta: CanvasMeta) => {
    setCanvasMeta(meta);
  }, []);

  const handleReset = useCallback(() => {
    if (processedImage) {
      cleanupImageUrl(processedImage.src);
    }
    setSelectedFile(null);
    setProcessedImage(null);
    setCanvasMeta(null);
  }, [processedImage]);

  const handleError = useCallback((error: string) => {
    console.error('Image upload error:', error);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processedImage) {
        cleanupImageUrl(processedImage.src);
      }
    };
  }, [processedImage]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Image Text Composer
          </h1>
          <p className="text-gray-600">
            Upload a PNG image to start adding text overlays
          </p>
        </div>

        {!processedImage ? (
          <EmptyState 
            onImageSelect={handleImageSelect}
            onError={handleError}
            isProcessing={isProcessing}
          />
        ) : (
          <ImageEditor 
            image={processedImage}
            canvasMeta={canvasMeta}
            onCanvasMetaUpdate={handleCanvasMetaUpdate}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
