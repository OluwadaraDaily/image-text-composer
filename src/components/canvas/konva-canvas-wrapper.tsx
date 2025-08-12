import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect, Transformer } from 'react-konva';
import type { CanvasMeta, TextLayer } from '@/types';

interface KonvaCanvasWrapperProps {
  imageObject: HTMLImageElement;
  canvasMeta: CanvasMeta;
  textLayers?: TextLayer[];
  selectedLayerId?: string | null;
  onTextLayersChange?: (layers: TextLayer[]) => void;
  onSelectedLayerChange?: (layerId: string | null) => void;
}

export default function KonvaCanvasWrapper({ 
  imageObject, 
  canvasMeta, 
  textLayers = [],
  selectedLayerId,
  onTextLayersChange,
  onSelectedLayerChange
}: KonvaCanvasWrapperProps) {
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const handleTextClick = (layerId: string) => {
    onSelectedLayerChange?.(layerId);
    setIsEditing(false);
    setEditingLayerId(null);
  };

  const handleTextDoubleClick = (layerId: string) => {
    const layer = textLayers.find(l => l.id === layerId);
    if (layer) {
      setIsEditing(true);
      setEditingLayerId(layerId);
      setEditingText(layer.text);
      onSelectedLayerChange?.(layerId);
    }
  };

  const finishEditing = () => {
    if (editingLayerId && onTextLayersChange) {
      const updatedLayers = textLayers.map(layer => 
        layer.id === editingLayerId 
          ? { ...layer, text: editingText }
          : layer
      );
      onTextLayersChange(updatedLayers);
    }
    setIsEditing(false);
    setEditingLayerId(null);
    setEditingText('');
    // Deselect the text after editing to hide the selection box
    onSelectedLayerChange?.(null);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingLayerId(null);
    setEditingText('');
    // Deselect the text when canceling editing to hide the selection box
    onSelectedLayerChange?.(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finishEditing();
    }
  };


  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus();
      textInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          cancelEditing();
        } else if (selectedLayerId) {
          onSelectedLayerChange?.(null);
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isEditing, selectedLayerId, onSelectedLayerChange]);

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      onSelectedLayerChange?.(null);
      setIsEditing(false);
      setEditingLayerId(null);
    }
  };

  const editingLayer = editingLayerId ? textLayers.find(l => l.id === editingLayerId) : null;

  return (
    <div className="relative">
      <Stage
        ref={stageRef}
        width={canvasMeta.width}
        height={canvasMeta.height}
        className="bg-transparent"
        onClick={handleStageClick}
      >
      {/* Background image layer */}
      <Layer>
        <KonvaImage
          image={imageObject}
          x={0}
          y={0}
          width={canvasMeta.width}
          height={canvasMeta.height}
          listening={false}
        />
      </Layer>

      {/* Text layers */}
      <Layer>
        {textLayers.map((layer) => {
          const isSelected = layer.id === selectedLayerId;
          const isEditingThis = isEditing && editingLayerId === layer.id;
          
          return (
            <React.Fragment key={layer.id}>
              {/* Selection box background for selected text */}
              {isSelected && !isEditingThis && !isDragging && (
                <Rect
                  x={layer.x - 4}
                  y={layer.y - 6}
                  width={layer.width + 8}
                  height={layer.height + 8}
                  fill="transparent"
                  stroke="#000000"
                  strokeWidth={1}
                  opacity={0.7}
                  cornerRadius={4}
                  listening={false}
                />
              )}
              
              {/* Text element */}
              <Text
                x={layer.x}
                y={layer.y}
                text={layer.text}
                fontSize={layer.fontSize}
                fontFamily={layer.fontFamily}
                fill={`rgba(${layer.color.r}, ${layer.color.g}, ${layer.color.b}, ${layer.color.a})`}
                align={layer.alignment}
                width={layer.width}
                height={layer.height}
                rotation={layer.rotation}
                opacity={layer.opacity}
                draggable={!isEditingThis}
                onClick={() => handleTextClick(layer.id)}
                onDblClick={() => handleTextDoubleClick(layer.id)}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(e) => {
                  setIsDragging(false);
                  if (onTextLayersChange) {
                    const updatedLayers = textLayers.map(l => 
                      l.id === layer.id 
                        ? { ...l, x: e.target.x(), y: e.target.y() }
                        : l
                    );
                    onTextLayersChange(updatedLayers);
                  }
                }}
                visible={!isEditingThis}
              />
              
              {/* Editing placeholder when editing */}
              {isEditingThis && (
                <Rect
                  x={layer.x - 2}
                  y={layer.y - 2}
                  width={layer.width + 4}
                  height={layer.height + 4}
                  fill="rgba(255, 255, 255, 0.8)"
                  stroke="#007bff"
                  strokeWidth={2}
                  listening={false}
                />
              )}
            </React.Fragment>
          );
        })}
      </Layer>
      </Stage>

      {/* HTML input overlay for editing */}
      {isEditing && editingLayer && (
        <textarea
          ref={textInputRef}
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={finishEditing}
          className="absolute border-2 border-blue-500 bg-white px-1 py-0.5 resize-none overflow-hidden outline-none"
          style={{
            left: `${editingLayer.x}px`,
            top: `${editingLayer.y}px`,
            width: `${Math.max(editingLayer.width, 100)}px`,
            minHeight: `${editingLayer.height}px`,
            fontSize: `${editingLayer.fontSize}px`,
            fontFamily: editingLayer.fontFamily,
            textAlign: editingLayer.alignment as any,
            color: `rgba(${editingLayer.color.r}, ${editingLayer.color.g}, ${editingLayer.color.b}, ${editingLayer.color.a})`,
            zIndex: 1000,
            lineHeight: '1.2',
            padding: '2px 4px',
          }}
          rows={1}
        />
      )}
    </div>
  );
}