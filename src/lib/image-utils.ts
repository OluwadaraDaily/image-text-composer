import type { ImageAsset } from '@/types';

export interface ProcessedImage {
  bitmap: ImageBitmap;
  asset: ImageAsset;
}

export async function processImageFile(file: File): Promise<ProcessedImage> {
  try {
    // Use createImageBitmap to decode the image
    const bitmap = await createImageBitmap(file);

    // Create object URL for the canvas to use
    const objectUrl = URL.createObjectURL(file);
    
    // Create ImageAsset with original dimensions
    const asset: ImageAsset = {
      src: objectUrl,
      width: bitmap.width,
      height: bitmap.height,
    };
    
    return { bitmap, asset };
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? `Failed to process image: ${error.message}` 
        : 'Failed to process image'
    );
  }
}

export function calculateDisplaySize(
  imageWidth: number,
  imageHeight: number,
  maxCanvasWidth: number,
  maxCanvasHeight: number
): { width: number; height: number; scale: number } {
  const scaleX = maxCanvasWidth / imageWidth;
  const scaleY = maxCanvasHeight / imageHeight;
  const scale = Math.min(scaleX, scaleY, 1);
  
  return {
    width: imageWidth * scale,
    height: imageHeight * scale,
    scale
  };
}

export function cleanupImageUrl(url: string) {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}