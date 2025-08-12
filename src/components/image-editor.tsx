import { ImageCanvas } from '@/components/canvas/image-canvas';
import type { ImageAsset, CanvasMeta } from '@/types';

interface ImageEditorProps {
  image: ImageAsset;
  canvasMeta: CanvasMeta | null;
  onCanvasMetaUpdate: (meta: CanvasMeta) => void;
  onReset: () => void;
}

export function ImageEditor({ 
  image, 
  canvasMeta, 
  onCanvasMetaUpdate, 
  onReset 
}: ImageEditorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <button 
          onClick={onReset}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors hover:cursor-pointer"
        >
          Upload a different image
        </button>
      </div>
      
      <div className="flex justify-center">
        <ImageCanvas 
          image={image}
          onCanvasMetaUpdate={onCanvasMetaUpdate}
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
  );
}