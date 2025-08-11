'use client';

import { ImageUpload } from '@/components/image-upload';
import { ImageCanvas } from '@/components/canvas/image-canvas';
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
          <div className="max-w-2xl mx-auto">
            <ImageUpload 
              onImageSelect={handleImageSelect}
              onError={handleError}
            />
            {isProcessing && (
              <div className="text-center mt-4 text-gray-600">
                <div className="animate-pulse">Processing image...</div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-green-600 mb-2 font-medium">
                ✅ Image loaded: {selectedFile?.name}
              </p>
              <button 
                onClick={handleReset}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                Upload a different image
              </button>
            </div>
            
            <div className="flex justify-center">
              <ImageCanvas 
                image={processedImage}
                onCanvasMetaUpdate={handleCanvasMetaUpdate}
                maxCanvasWidth={800}
                maxCanvasHeight={600}
              />
            </div>

            {canvasMeta && (
              <div className="text-center text-sm text-gray-500">
                <div className="bg-white p-3 rounded-lg border inline-block">
                  <strong>Canvas Info:</strong> Display scale {Math.round(canvasMeta.scale * 100)}% 
                  • Ready for text layers
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
