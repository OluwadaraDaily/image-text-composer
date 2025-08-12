import { useState, useCallback, useEffect } from 'react';
import { ImageCanvas } from '@/components/canvas/image-canvas';
import { TextToolbar } from '@/components/text-toolbar';
import type { ImageAsset, CanvasMeta, TextLayer } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const handleLayerUpdate = useCallback((layerId: string, updates: Partial<TextLayer>) => {
    setTextLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  }, []);

  const handleAddText = useCallback(() => {
    if (!canvasMeta) return;

    const newLayer: TextLayer = {
      id: `text-${Date.now()}`,
      text: 'New Text',
      x: canvasMeta.width / 2 - 50, // Center horizontally (rough estimate)
      y: canvasMeta.height / 2 - 12, // Center vertically (rough estimate)
      rotation: 0,
      width: 100,
      height: 24,
      fontFamily: 'Arial',
      fontWeight: 400,
      fontSize: 18,
      color: { r: 0, g: 0, b: 0, a: 1 }, // Black
      opacity: 1,
      alignment: 'center',
      locked: false,
      zIndex: textLayers.length,
      selected: true,
    };

    setTextLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  }, [canvasMeta, textLayers.length]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      
      // Check if we're in a text input/textarea to avoid interfering with typing
      const activeElement = document.activeElement;
      const isInTextInput = activeElement?.tagName === 'INPUT' || 
                           activeElement?.tagName === 'TEXTAREA' || 
                           (activeElement as HTMLElement)?.isContentEditable === true;
      
      if (isInTextInput) return;
      
      if ((event.key === 't' || event.key === 'T') && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handleAddText();
      } else if ((event.key === 't' || event.key === 'T') && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        handleAddText();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleAddText]);

  const selectedLayer = textLayers.find(layer => layer.id === selectedLayerId) || null;

  return (
    <div className="flex h-screen">
      {/* Text Toolbar */}
      <TextToolbar 
        selectedLayer={selectedLayer}
        onLayerUpdate={handleLayerUpdate}
      />
      
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
            <Button onClick={handleAddText} size="sm" className="flex items-center gap-2">
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
            textLayers={textLayers}
            selectedLayerId={selectedLayerId}
            onTextLayersChange={setTextLayers}
            onSelectedLayerChange={setSelectedLayerId}
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