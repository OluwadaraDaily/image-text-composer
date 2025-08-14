'use client';

import { EditorLayout } from '@/components/editor/editor-layout';
import { TextToolbar } from '@/components/text-toolbar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTextLayersWithHistory } from '@/hooks/useTextLayersWithHistory';
import { useEditorHistory } from '@/contexts/editor-history-context';

function TestContent() {
  const { textLayers, handleAddText, handleLayerUpdate } = useTextLayersWithHistory();
  const { currentState } = useEditorHistory();

  const mockCanvasMeta = {
    width: 800,
    height: 600,
    scale: 1,
    rotation: 0,
  };

  const handleAddTestText = () => {
    handleAddText(mockCanvasMeta);
  };

  const handleUpdateFirstLayer = () => {
    if (textLayers.length > 0) {
      handleLayerUpdate(textLayers[0].id, {
        fontSize: Math.floor(Math.random() * 30) + 12,
        text: `Updated text ${Math.floor(Math.random() * 100)}`,
      });
    }
  };

  return (
    <div className="flex">
      <TextToolbar />
      
      <div className="flex-1 p-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">History Test Page</h2>
          
          <div className="flex gap-4">
            <Button onClick={handleAddTestText}>
              <Plus className="h-4 w-4 mr-2" />
              Add Text Layer
            </Button>
            <Button onClick={handleUpdateFirstLayer} disabled={textLayers.length === 0}>
              Update First Layer
            </Button>
          </div>

          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Current State:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(currentState, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Text Layers ({textLayers.length}):</h3>
            {textLayers.length === 0 ? (
              <p className="text-gray-500">No text layers</p>
            ) : (
              <ul className="space-y-2">
                {textLayers.map((layer) => (
                  <li key={layer.id} className="text-sm bg-gray-50 p-2 rounded">
                    <strong>{layer.text}</strong> - Size: {layer.fontSize}px, 
                    Family: {layer.fontFamily}, Z-Index: {layer.zIndex}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <h3 className="font-semibold mb-2 text-blue-800">Test Instructions:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Click "Add Text Layer" to create layers</li>
              <li>2. Use the text toolbar to modify selected layers</li>
              <li>3. Click "Update First Layer" to randomly modify the first layer</li>
              <li>4. Use Ctrl+Z / Cmd+Z to undo actions</li>
              <li>5. Use Ctrl+Shift+Z / Cmd+Shift+Z to redo actions</li>
              <li>6. Check the "Last: ..." indicator in the header</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryTestPage() {
  return (
    <EditorLayout>
      <TestContent />
    </EditorLayout>
  );
}