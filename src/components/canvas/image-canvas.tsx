'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ImageAsset, CanvasMeta, TextLayer } from '@/types';
import { calculateDisplaySize } from '@/lib/image-utils';
import { toast } from 'sonner';

// Create a wrapper component that will be dynamically imported
const KonvaCanvas = dynamic(() => import('./konva-canvas-wrapper'), { ssr: false });

interface ImageCanvasProps {
  image: ImageAsset;
  onCanvasMetaUpdate?: (meta: CanvasMeta) => void;
  maxCanvasWidth?: number;
  maxCanvasHeight?: number;
  textLayers?: TextLayer[];
  selectedLayerId?: string | null;
  onTextLayersChange?: (layers: TextLayer[]) => void;
  onSelectedLayerChange?: (layerId: string | null) => void;
}

export function ImageCanvas({ 
  image, 
  onCanvasMetaUpdate,
  maxCanvasWidth = 800,
  maxCanvasHeight = 600,
  textLayers = [],
  selectedLayerId,
  onTextLayersChange,
  onSelectedLayerChange
}: ImageCanvasProps) {
  const [imageObject, setImageObject] = useState<HTMLImageElement | null>(null);
  const [canvasMeta, setCanvasMeta] = useState<CanvasMeta>({
    width: 0,
    height: 0,
    scale: 1,
    rotation: 0
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!image.src) return;
    
    // Reset states when new image is loaded
    setIsLoaded(false);
    setImageObject(null);

    const imageElement = new window.Image();
    imageElement.crossOrigin = 'anonymous';
    
    imageElement.onload = () => {
      // Calculate display size while maintaining aspect ratio
      const displaySize = calculateDisplaySize(
        image.width,
        image.height,
        maxCanvasWidth,
        maxCanvasHeight
      );
      
      const meta: CanvasMeta = {
        width: displaySize.width,
        height: displaySize.height,
        scale: displaySize.scale,
        rotation: 0
      };
      
      setImageObject(imageElement);
      setCanvasMeta(meta);
      onCanvasMetaUpdate?.(meta);
      
      // Artificial delay to show loading state, then fade in
      setTimeout(() => {
        setIsLoaded(true);
      }, 1500);
    };
    
    imageElement.onerror = () => {
      toast.error('Failed to load image');
      setImageObject(null);
    };
    
    imageElement.src = image.src;
    
    return () => {
      imageElement.onload = null;
      imageElement.onerror = null;
    };
  }, [image.src, image.width, image.height, maxCanvasWidth, maxCanvasHeight, onCanvasMetaUpdate]);

  const containerStyle = canvasMeta.width && canvasMeta.height ? {
    width: canvasMeta.width,
    height: canvasMeta.height
  } : {
    width: maxCanvasWidth,
    height: maxCanvasHeight
  };

  const renderSkeleton = () => (
    <div className={`absolute inset-0 transition-opacity duration-500 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="w-full h-full bg-gray-200 animate-pulse flex flex-col">
        <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-300 animate-pulse"></div>
      </div>
    </div>
  );

  const renderCanvas = () => {
    if (!imageObject || !canvasMeta.width || !canvasMeta.height) return null;
    
    return (
      <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <KonvaCanvas
          imageObject={imageObject}
          canvasMeta={canvasMeta}
          textLayers={textLayers}
          selectedLayerId={selectedLayerId}
          onTextLayersChange={onTextLayersChange}
          onSelectedLayerChange={onSelectedLayerChange}
        />
      </div>
    );
  };

  const renderInfo = () => (
    <div className="mt-2 text-sm text-gray-600 text-center">
      {canvasMeta.width && canvasMeta.height ? (
        <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          Display: {Math.round(canvasMeta.width)} × {Math.round(canvasMeta.height)}px
          <span className="mx-2">•</span>
          Original: {image.width} × {image.height}px
          <span className="mx-2">•</span>
          Scale: {Math.round(canvasMeta.scale * 100)}%
        </div>
      ) : (
        <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}>
          <div className="h-4 bg-gray-300 rounded animate-pulse mb-1"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      <div 
        className="border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white relative transition-all duration-300"
        style={containerStyle}
      >
        {renderSkeleton()}
        {renderCanvas()}
      </div>
      {renderInfo()}
    </div>
  );
}