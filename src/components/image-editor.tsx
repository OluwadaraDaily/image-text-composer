import React from 'react';
import { ImageCanvas } from '@/components/canvas/image-canvas';
import { TextToolbar } from '@/components/text-toolbar';
import type { ImageAsset, CanvasMeta } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTextLayersWithHistory } from '@/hooks/useTextLayersWithHistory';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface ImageEditorProps {
  image: ImageAsset;
  canvasMeta: CanvasMeta | null;
  onCanvasMetaUpdate: (meta: CanvasMeta) => void;
  onReset: () => void;
}

function ImageEditorContent({ 
  image, 
  canvasMeta, 
  onCanvasMetaUpdate, 
  onReset 
}: ImageEditorProps) {
  const { 
    textLayers, 
    selectedLayerId, 
    handleAddText,
  } = useTextLayersWithHistory();

  // Use consolidated keyboard shortcuts
  useKeyboardShortcuts({
    onAddText: handleAddText,
    canvasMeta
  });

  return (
    <div className="flex h-screen">
      {/* Text Toolbar */}
      <TextToolbar />
      
      {/* Main Editor Area */}
      <div className="flex-1 space-y-6 p-6">
        <div className="flex justify-between items-center gap-4 max-w-[600px] mx-auto">
          <button 
            onClick={onReset}
            className="px-3 py-1 text-sm text-black hover:text-white hover:bg-gray-900 rounded-md transition-colors hover:cursor-pointer"
          >
            Upload a different image
          </button>

          {canvasMeta && (
            <Button onClick={() => {
              handleAddText(canvasMeta);
            }} size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Text
            </Button>
          )}
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
              • {textLayers.length} text layer{textLayers.length !== 1 ? 's' : ''}
              {selectedLayerId && ` • Selected: ${textLayers.find(l => l.id === selectedLayerId)?.text || 'Unknown'}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ImageEditor(props: ImageEditorProps) {
  return <ImageEditorContent {...props} />;
}