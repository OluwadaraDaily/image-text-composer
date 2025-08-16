import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { TextLayer, CanvasMeta } from '@/types';

interface TextLayersContextType {
  textLayers: TextLayer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  handleLayerUpdate: (layerId: string, updates: Partial<TextLayer>) => void;
  handleBringForward: (layerId: string) => void;
  handleBringBackward: (layerId: string) => void;
  handleBringToFront: (layerId: string) => void;
  handleBringToBack: (layerId: string) => void;
  handleAddText: (canvasMeta: CanvasMeta) => void;
  setTextLayers: React.Dispatch<React.SetStateAction<TextLayer[]>>;
}

const TextLayersContext = createContext<TextLayersContextType | undefined>(undefined);

interface TextLayersProviderProps {
  children: ReactNode;
}

export function TextLayersProvider({ children }: TextLayersProviderProps) {
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const handleLayerUpdate = useCallback((layerId: string, updates: Partial<TextLayer>) => {
    setTextLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  }, []);

  const handleBringForward = useCallback((layerId: string) => {
    setTextLayers(prev => {
      const layers = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const currentIndex = layers.findIndex(layer => layer.id === layerId);
      
      if (currentIndex === -1 || currentIndex === layers.length - 1) return prev;
      
      const layerToMove = layers[currentIndex];
      const nextLayer = layers[currentIndex + 1];
      
      // Swap zIndex values
      const tempZIndex = layerToMove.zIndex;
      layerToMove.zIndex = nextLayer.zIndex;
      nextLayer.zIndex = tempZIndex;
      
      return layers.sort((a, b) => a.zIndex - b.zIndex);
    });
  }, []);

  const handleBringBackward = useCallback((layerId: string) => {
    setTextLayers(prev => {
      const layers = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const currentIndex = layers.findIndex(layer => layer.id === layerId);
      
      if (currentIndex === -1 || currentIndex === 0) return prev;
      
      const layerToMove = layers[currentIndex];
      const prevLayer = layers[currentIndex - 1];
      
      // Swap zIndex values
      const tempZIndex = layerToMove.zIndex;
      layerToMove.zIndex = prevLayer.zIndex;
      prevLayer.zIndex = tempZIndex;
      
      return layers.sort((a, b) => a.zIndex - b.zIndex);
    });
  }, []);

  const handleBringToFront = useCallback((layerId: string) => {
    setTextLayers(prev => {
      const layers = [...prev];
      const currentIndex = layers.findIndex(layer => layer.id === layerId);
      
      if (currentIndex === -1) return prev;
      
      const layerToMove = layers[currentIndex];
      const maxZIndex = Math.max(...layers.map(l => l.zIndex));
      
      if (layerToMove.zIndex === maxZIndex) return prev;
      
      layerToMove.zIndex = maxZIndex + 1;
      
      return layers.sort((a, b) => a.zIndex - b.zIndex);
    });
  }, []);

  const handleBringToBack = useCallback((layerId: string) => {
    setTextLayers(prev => {
      const layers = [...prev];
      const currentIndex = layers.findIndex(layer => layer.id === layerId);
      
      if (currentIndex === -1) return prev;
      
      const layerToMove = layers[currentIndex];
      const minZIndex = Math.min(...layers.map(l => l.zIndex));
      
      if (layerToMove.zIndex === minZIndex) return prev;
      
      layerToMove.zIndex = minZIndex - 1;
      
      return layers.sort((a, b) => a.zIndex - b.zIndex);
    });
  }, []);

  const handleAddText = useCallback((canvasMeta: CanvasMeta) => {
    const newLayerId = `text-${Date.now()}`;
    
    setTextLayers(prev => {
      // Calculate initial dimensions based on font size
      const fontSize = 18;
      const initialText = 'New Text';
      const estimatedWidth = Math.max(initialText.length * fontSize * 0.6, 80); // Rough estimate
      const estimatedHeight = fontSize * 1.4; // Account for line height
      
      const newLayer: TextLayer = {
        id: newLayerId,
        text: initialText,
        x: canvasMeta.width / 2 - estimatedWidth / 2, // Center horizontally
        y: canvasMeta.height / 2 - estimatedHeight / 2, // Center vertically
        rotation: 0,
        width: estimatedWidth,
        height: estimatedHeight,
        fontFamily: 'Arial',
        fontWeight: 400,
        fontSize: fontSize,
        color: { r: 0, g: 0, b: 0, a: 1 }, // Black
        opacity: 1,
        alignment: 'center',
        locked: false,
        zIndex: prev.length > 0 ? Math.max(...prev.map(l => l.zIndex)) + 1 : 0,
        selected: true,
      };
      
      return [...prev, newLayer].sort((a, b) => a.zIndex - b.zIndex);
    });
    
    setSelectedLayerId(newLayerId);
  }, []);

  const value = {
    textLayers,
    selectedLayerId,
    setSelectedLayerId,
    handleLayerUpdate,
    handleBringForward,
    handleBringBackward,
    handleBringToFront,
    handleBringToBack,
    handleAddText,
    setTextLayers,
  };

  return (
    <TextLayersContext.Provider value={value}>
      {children}
    </TextLayersContext.Provider>
  );
}

export function useTextLayers() {
  const context = useContext(TextLayersContext);
  if (context === undefined) {
    throw new Error('useTextLayers must be used within a TextLayersProvider');
  }
  return context;
}