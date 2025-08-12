import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect, Transformer, Group, Circle, Line } from 'react-konva';
import Konva from 'konva';
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
  const dragAnimationRef = useRef<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [modifierKeys, setModifierKeys] = useState({ shift: false, alt: false });

  // Utility functions
  const snapAngle = (angle: number): number => {
    const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315];
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    for (const snapAngle of snapAngles) {
      if (Math.abs(normalizedAngle - snapAngle) < 8) { // 8 degree tolerance
        return snapAngle;
      }
    }
    return normalizedAngle;
  };

  const clampToCanvas = (x: number, y: number, width: number, height: number) => {
    return {
      x: Math.max(0, Math.min(x, canvasMeta.width - width)),
      y: Math.max(0, Math.min(y, canvasMeta.height - height))
    };
  };

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

  // Helper function to cycle through text layers
  const cycleThroughLayers = useCallback((direction: 'forward' | 'backward') => {
    if (textLayers.length === 0) return;

    // Sort layers by zIndex to ensure consistent tab order
    const sortedLayers = [...textLayers].sort((a, b) => a.zIndex - b.zIndex);
    
    if (!selectedLayerId) {
      // If nothing selected, select first layer
      onSelectedLayerChange?.(sortedLayers[0].id);
      return;
    }

    const currentIndex = sortedLayers.findIndex(layer => layer.id === selectedLayerId);
    
    if (currentIndex === -1) {
      // If selected layer not found, select first layer
      onSelectedLayerChange?.(sortedLayers[0].id);
      return;
    }

    let nextIndex;
    if (direction === 'forward') {
      nextIndex = (currentIndex + 1) % sortedLayers.length;
    } else {
      nextIndex = (currentIndex - 1 + sortedLayers.length) % sortedLayers.length;
    }

    onSelectedLayerChange?.(sortedLayers[nextIndex].id);
  }, [textLayers, selectedLayerId, onSelectedLayerChange]);


  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus();
      textInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Track modifier keys
      setModifierKeys(prev => ({
        ...prev,
        shift: e.shiftKey,
        alt: e.altKey
      }));
      
      // Check if we're in a text input/textarea to avoid interfering with typing
      const activeElement = document.activeElement;
      const isInTextInput = activeElement?.tagName === 'INPUT' || 
                           activeElement?.tagName === 'TEXTAREA' || 
                           (activeElement as HTMLElement)?.isContentEditable === true;
      
      // Handle Escape key
      if (e.key === 'Escape') {
        if (isEditing) {
          cancelEditing();
        } else if (selectedLayerId) {
          onSelectedLayerChange?.(null);
        }
      }
      
      // Handle Backspace key (only when not editing)
      if (e.key === 'Backspace' && !isEditing && selectedLayerId) {
        e.preventDefault();
        // Delete the selected layer
        if (onTextLayersChange) {
          const updatedLayers = textLayers.filter(l => l.id !== selectedLayerId);
          onTextLayersChange(updatedLayers);
          onSelectedLayerChange?.(null);
        }
      }
      
      // Handle arrow key nudging
      if (!isInTextInput && !isEditing && selectedLayerId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        
        const layer = textLayers.find(l => l.id === selectedLayerId);
        if (!layer || !onTextLayersChange) return;
        
        const nudgeDistance = e.shiftKey ? 10 : 1;
        let deltaX = 0, deltaY = 0;
        
        switch (e.key) {
          case 'ArrowLeft': deltaX = -nudgeDistance; break;
          case 'ArrowRight': deltaX = nudgeDistance; break;
          case 'ArrowUp': deltaY = -nudgeDistance; break;
          case 'ArrowDown': deltaY = nudgeDistance; break;
        }
        
        const clamped = clampToCanvas(layer.x + deltaX, layer.y + deltaY, layer.width, layer.height);
        const updatedLayers = textLayers.map(l => 
          l.id === selectedLayerId 
            ? { ...l, x: clamped.x, y: clamped.y }
            : l
        );
        onTextLayersChange(updatedLayers);
      }
      
      // Handle Tab navigation (only when not in text inputs and not editing)
      if (e.key === 'Tab' && !isInTextInput && !isEditing) {
        e.preventDefault(); // Prevent default tab behavior
        
        if (e.shiftKey) {
          // Shift+Tab: cycle backward
          cycleThroughLayers('backward');
        } else {
          // Tab: cycle forward
          cycleThroughLayers('forward');
        }
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      // Update modifier keys on release
      setModifierKeys(prev => ({
        ...prev,
        shift: e.shiftKey,
        alt: e.altKey
      }));
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    document.addEventListener('keyup', handleGlobalKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('keyup', handleGlobalKeyUp);
      
      if (dragAnimationRef.current) {
        cancelAnimationFrame(dragAnimationRef.current);
      }
    };
  }, [isEditing, selectedLayerId, cycleThroughLayers, textLayers, onTextLayersChange, onSelectedLayerChange]);

  // Enhanced drag handling with rAF
  const handleDragStart = (layerId: string, e: any) => {
    setIsDragging(true);
    setDragStartPos({ x: e.target.x(), y: e.target.y() });
    onSelectedLayerChange?.(layerId);
  };

  const handleDragMove = (layerId: string, e: any) => {
    if (dragAnimationRef.current) {
      cancelAnimationFrame(dragAnimationRef.current);
    }

    dragAnimationRef.current = requestAnimationFrame(() => {
      const layer = textLayers.find(l => l.id === layerId);
      if (!layer || !onTextLayersChange) return;

      let newX = e.target.x();
      let newY = e.target.y();

      // Apply canvas bounds clamping
      const clamped = clampToCanvas(newX, newY, layer.width, layer.height);
      newX = clamped.x;
      newY = clamped.y;

      // Update position immediately for smooth feedback
      e.target.x(newX);
      e.target.y(newY);
    });
  };

  const handleDragEnd = (layerId: string, e: any) => {
    setIsDragging(false);
    
    if (dragAnimationRef.current) {
      cancelAnimationFrame(dragAnimationRef.current);
    }

    if (!onTextLayersChange) return;

    const layer = textLayers.find(l => l.id === layerId);
    if (!layer) return;

    let newX = e.target.x();
    let newY = e.target.y();

    // Apply final clamping and update state
    const clamped = clampToCanvas(newX, newY, layer.width, layer.height);
    
    const updatedLayers = textLayers.map(l => 
      l.id === layerId 
        ? { ...l, x: clamped.x, y: clamped.y }
        : l
    );
    onTextLayersChange(updatedLayers);
  };

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
              
              {/* Text element wrapped in Group for transform controls */}
              <Group>
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
                  onDragStart={(e) => handleDragStart(layer.id, e)}
                  onDragMove={(e) => handleDragMove(layer.id, e)}
                  onDragEnd={(e) => handleDragEnd(layer.id, e)}
                  onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'move';
                  }}
                  onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'default';
                  }}
                  visible={!isEditingThis}
                />
                
                {/* Transform handles for selected layer */}
                {isSelected && !isEditingThis && !isDragging && (
                  <>
                    {/* Resize handles */}
                    <Circle
                      x={layer.x + layer.width}
                      y={layer.y + layer.height}
                      radius={6}
                      fill="white"
                      stroke="#007bff"
                      strokeWidth={2}
                      draggable
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'nw-resize';
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'default';
                      }}
                      onDragStart={() => setIsResizing(true)}
                      onDragMove={(e) => {
                        const newWidth = Math.max(20, e.target.x() - layer.x);
                        const newHeight = Math.max(15, e.target.y() - layer.y);
                        
                        if (onTextLayersChange) {
                          let updatedWidth = newWidth;
                          let updatedHeight = newHeight;
                          let updatedFontSize = layer.fontSize;
                          let updatedX = layer.x;
                          let updatedY = layer.y;
                          
                          // Proportional resize with Shift key
                          if (modifierKeys.shift) {
                            const aspectRatio = layer.width / layer.height;
                            updatedHeight = newWidth / aspectRatio;
                          }
                          
                          // Center-scale with Alt key
                          if (modifierKeys.alt) {
                            const widthDelta = updatedWidth - layer.width;
                            const heightDelta = updatedHeight - layer.height;
                            updatedX = layer.x - widthDelta / 2;
                            updatedY = layer.y - heightDelta / 2;
                            
                            // Apply canvas bounds clamping for center-scale
                            const clamped = clampToCanvas(updatedX, updatedY, updatedWidth, updatedHeight);
                            updatedX = clamped.x;
                            updatedY = clamped.y;
                          }
                          
                          // Scale font size with resize (our decision from task 2)
                          const scaleX = updatedWidth / layer.width;
                          const scaleY = updatedHeight / layer.height;
                          const avgScale = (scaleX + scaleY) / 2;
                          updatedFontSize = Math.max(8, layer.fontSize * avgScale);
                          
                          const updatedLayers = textLayers.map(l => 
                            l.id === layer.id 
                              ? { 
                                  ...l, 
                                  x: updatedX,
                                  y: updatedY,
                                  width: updatedWidth, 
                                  height: updatedHeight, 
                                  fontSize: updatedFontSize 
                                }
                              : l
                          );
                          onTextLayersChange(updatedLayers);
                        }
                      }}
                      onDragEnd={() => setIsResizing(false)}
                    />
                    
                    {/* Rotation handle */}
                    <Circle
                      x={layer.x + layer.width / 2}
                      y={layer.y - 20}
                      radius={6}
                      fill="white"
                      stroke="#007bff"
                      strokeWidth={2}
                      draggable
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'crosshair';
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'default';
                      }}
                      onDragStart={() => setIsRotating(true)}
                      onDragMove={(e) => {
                        const centerX = layer.x + layer.width / 2;
                        const centerY = layer.y + layer.height / 2;
                        
                        const angle = Math.atan2(
                          e.target.y() - centerY,
                          e.target.x() - centerX
                        ) * 180 / Math.PI;
                        
                        // Apply angle snapping
                        const snappedAngle = snapAngle(angle + 90); // +90 to align with visual expectation
                        
                        if (onTextLayersChange) {
                          const updatedLayers = textLayers.map(l => 
                            l.id === layer.id 
                              ? { ...l, rotation: snappedAngle }
                              : l
                          );
                          onTextLayersChange(updatedLayers);
                        }
                      }}
                      onDragEnd={() => setIsRotating(false)}
                    />
                    
                    {/* Visual connection line to rotation handle */}
                    <Line
                      points={[
                        layer.x + layer.width / 2, layer.y,
                        layer.x + layer.width / 2, layer.y - 20
                      ]}
                      stroke="#007bff"
                      strokeWidth={1}
                      opacity={0.5}
                      listening={false}
                    />
                  </>
                )}
              </Group>
              
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