import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import type { CanvasMeta, TextLayer } from '@/types';
import TextLayers from './text-layers';
import { ContextMenu, ContextMenuItem } from '@/components/ui/context-menu';
import { useTextLayersWithHistory } from '@/hooks/useTextLayersWithHistory';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useEditorHistory } from '@/contexts/editor-history-context';


interface KonvaCanvasWrapperProps {
  imageObject: HTMLImageElement;
  canvasMeta: CanvasMeta;
}

export default function KonvaCanvasWrapper({ 
  imageObject, 
  canvasMeta
}: KonvaCanvasWrapperProps) {
  const { 
    textLayers, 
    selectedLayerId, 
    setTextLayers, 
    setSelectedLayerId, 
    handleBringForward, 
    handleBringBackward, 
    handleBringToFront, 
    handleBringToBack,
    handleLayerUpdate,
    handleDeleteLayer
  } = useTextLayersWithHistory();
  const stageRef = useRef<any>(null);
  const { setStageRef } = useEditorHistory();
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
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    layerId: string | null;
  }>({ visible: false, x: 0, y: 0, layerId: null });

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

  const cycleThroughLayers = useCallback((direction: 'forward' | 'backward') => {
    if (textLayers.length === 0) return;

    // Sort layers by zIndex to ensure consistent tab order
    const sortedLayers = [...textLayers].sort((a, b) => a.zIndex - b.zIndex);
    
    if (!selectedLayerId) {
      // If nothing selected, select first layer
      setSelectedLayerId(sortedLayers[0].id);
      return;
    }

    const currentIndex = sortedLayers.findIndex(layer => layer.id === selectedLayerId);
    
    if (currentIndex === -1) {
      // If selected layer not found, select first layer
      setSelectedLayerId(sortedLayers[0].id);
      return;
    }

    let nextIndex;
    if (direction === 'forward') {
      nextIndex = (currentIndex + 1) % sortedLayers.length;
    } else {
      nextIndex = (currentIndex - 1 + sortedLayers.length) % sortedLayers.length;
    }

    setSelectedLayerId(sortedLayers[nextIndex].id);
  }, [textLayers, selectedLayerId, setSelectedLayerId]);

  // Stage event handlers
  const handleStageClick = (e: any) => {
    // Only handle left clicks, ignore right clicks
    if (e.evt.button !== 0) return;
    
    if (e.target === e.target.getStage()) {
      setSelectedLayerId(null);
      setIsEditing(false);
      setEditingLayerId(null);
      handleContextMenuClose(); // Close context menu when clicking on stage
    }
  };

  // Context menu handlers
  const handleContextMenuClose = () => {
    setContextMenu({ visible: false, x: 0, y: 0, layerId: null });
  };

  const handleContextMenuAction = (action: string, layerId: string) => {
    handleContextMenuClose();
    
    switch (action) {
      case 'bring-forward':
        handleBringForward(layerId);
        break;
      case 'bring-backward':
        handleBringBackward(layerId);
        break;
      case 'bring-to-front':
        handleBringToFront(layerId);
        break;
      case 'bring-to-back':
        handleBringToBack(layerId);
        break;
    }
  };

  // Text event handlers
  const handleTextClick = (layerId: string, e?: any) => {
    // Only handle left clicks, ignore right clicks
    if (e && e.evt && e.evt.button !== 0) return;
    
    setSelectedLayerId(layerId);
    setIsEditing(false);
    setEditingLayerId(null);
    handleContextMenuClose(); // Close context menu on click
  };

  const handleTextRightClick = (layerId: string, e: any) => {
    e.evt.preventDefault(); // Prevent browser context menu
    
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    const stageContainer = stage.container();
    const rect = stageContainer.getBoundingClientRect();
    
    // Calculate absolute position by adding canvas offset to pointer position
    const absoluteX = rect.left + pointerPosition.x;
    const absoluteY = rect.top + pointerPosition.y;
    
    setContextMenu({
      visible: true,
      x: absoluteX,
      y: absoluteY,
      layerId
    });
    
    setSelectedLayerId(layerId);
  };

  const handleTextDoubleClick = (layerId: string) => {
    const layer = textLayers.find(l => l.id === layerId);
    if (layer) {
      setIsEditing(true);
      setEditingLayerId(layerId);
      setEditingText(layer.text);
      setSelectedLayerId(layerId);
    }
  };

  const handleTextMouseEnter = (e: any) => {
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = 'move';
  };

  const handleTextMouseLeave = (e: any) => {
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = 'default';
  };

  // Drag event handlers
  const handleDragStart = (layerId: string, e: any) => {
    setIsDragging(true);
    setDragStartPos({ x: e.target.x(), y: e.target.y() });
    setSelectedLayerId(layerId);
  };

  const handleDragMove = (layerId: string, e: any) => {
    if (dragAnimationRef.current) {
      cancelAnimationFrame(dragAnimationRef.current);
    }

    dragAnimationRef.current = requestAnimationFrame(() => {
      const layer = textLayers.find(l => l.id === layerId);
      if (!layer || !setTextLayers) return;

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

    if (!setTextLayers) return;

    const layer = textLayers.find(l => l.id === layerId);
    if (!layer) return;

    let newX = e.target.x();
    let newY = e.target.y();

    // Apply final clamping and update state
    const clamped = clampToCanvas(newX, newY, layer.width, layer.height);
    
    // Use handleLayerUpdate for history tracking
    handleLayerUpdate(layerId, { x: clamped.x, y: clamped.y });
  };

  // Resize handle event handlers
  const handleResizeMouseEnter = (e: any) => {
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = 'nw-resize';
  };

  const handleResizeMouseLeave = (e: any) => {
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = 'default';
  };

  const handleResizeDragStart = () => setIsResizing(true);

  const handleResizeDragMove = (layer: TextLayer, e: any) => {
    const newWidth = Math.max(20, e.target.x() - layer.x);
    const newHeight = Math.max(15, e.target.y() - layer.y);
    
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
    
    // Use handleLayerUpdate for history tracking
    handleLayerUpdate(layer.id, {
      x: updatedX,
      y: updatedY,
      width: updatedWidth, 
      height: updatedHeight, 
      fontSize: updatedFontSize 
    });
  };

  const handleResizeDragEnd = () => setIsResizing(false);

  // Rotation handle event handlers
  const handleRotationMouseEnter = (e: any) => {
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = 'url("data:image/svg+xml,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'M12 2L10 6h4L12 2zM2 12l4-2v4L2 12zm20 0l-4-2v4l4-2zM12 22l2-4h-4l2 4z\' fill=\'%23333\'/%3e%3c/svg%3e") 12 12, auto';
  };

  const handleRotationMouseLeave = (e: any) => {
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = 'default';
  };

  const handleRotationDragStart = () => setIsRotating(true);

  const handleRotationDragMove = (layer: TextLayer, e: any) => {
    const centerX = layer.x + layer.width / 2;
    const centerY = layer.y + layer.height / 2;
    
    const angle = Math.atan2(
      e.target.y() - centerY,
      e.target.x() - centerX
    ) * 180 / Math.PI;
    
    // Apply angle snapping
    const snappedAngle = snapAngle(angle + 90); // +90 to align with visual expectation
    
    // Use handleLayerUpdate for history tracking
    handleLayerUpdate(layer.id, { rotation: snappedAngle });
  };

  const handleRotationDragEnd = () => setIsRotating(false);

  // Text editing handlers
  const finishEditing = () => {
    if (editingLayerId) {
      // Use handleLayerUpdate for history tracking
      handleLayerUpdate(editingLayerId, { text: editingText });
    }
    setIsEditing(false);
    setEditingLayerId(null);
    setEditingText('');
    // Deselect the text after editing to hide the selection box
    setSelectedLayerId(null);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingLayerId(null);
    setEditingText('');
    setSelectedLayerId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finishEditing();
    }
  };

  // Use consolidated keyboard shortcuts
  useKeyboardShortcuts({
    selectedLayerId,
    textLayers,
    onDeleteLayer: handleDeleteLayer,
    onLayerUpdate: handleLayerUpdate,
    onSetSelectedLayerId: setSelectedLayerId,
    onCycleLayers: cycleThroughLayers,
    isEditing,
    onCancelEditing: cancelEditing,
    onFinishEditing: finishEditing,
    onModifierKeysChange: setModifierKeys,
    canvasMeta
  });

  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus();
      textInputRef.current.select();
    }
  }, [isEditing]);

  // Set up export functionality
  useEffect(() => {
    if (stageRef.current) {
      setStageRef(stageRef.current);
    }
  }, [setStageRef]);



  const editingLayer = editingLayerId ? textLayers.find(l => l.id === editingLayerId) : null;

  // Get context menu options based on layer position
  const getContextMenuOptions = (layerId: string) => {
    const layer = textLayers.find(l => l.id === layerId);
    if (!layer) return { canMoveUp: false, canMoveDown: false };
    
    const sortedLayers = [...textLayers].sort((a, b) => a.zIndex - b.zIndex);
    const currentIndex = sortedLayers.findIndex(l => l.id === layerId);
    
    return {
      canMoveUp: currentIndex < sortedLayers.length - 1,
      canMoveDown: currentIndex > 0,
      isTopmost: currentIndex === sortedLayers.length - 1,
      isBottommost: currentIndex === 0
    };
  };

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
        <TextLayers
          isEditing={isEditing}
          editingLayerId={editingLayerId}
          isDragging={isDragging}
          modifierKeys={modifierKeys}
          onTextClick={handleTextClick}
          onTextRightClick={handleTextRightClick}
          onTextDoubleClick={handleTextDoubleClick}
          onTextMouseEnter={handleTextMouseEnter}
          onTextMouseLeave={handleTextMouseLeave}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onResizeMouseEnter={handleResizeMouseEnter}
          onResizeMouseLeave={handleResizeMouseLeave}
          onResizeDragStart={handleResizeDragStart}
          onResizeDragMove={handleResizeDragMove}
          onResizeDragEnd={handleResizeDragEnd}
          onRotationMouseEnter={handleRotationMouseEnter}
          onRotationMouseLeave={handleRotationMouseLeave}
          onRotationDragStart={handleRotationDragStart}
          onRotationDragMove={handleRotationDragMove}
          onRotationDragEnd={handleRotationDragEnd}
        />
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

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.layerId && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          visible={contextMenu.visible}
          onClose={handleContextMenuClose}
        >
          {(() => {
            const options = getContextMenuOptions(contextMenu.layerId);
            return (
              <>
                <ContextMenuItem
                  onClick={() => handleContextMenuAction('bring-forward', contextMenu.layerId!)}
                  disabled={!options.canMoveUp}
                >
                  Bring Forward
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => handleContextMenuAction('bring-backward', contextMenu.layerId!)}
                  disabled={!options.canMoveDown}
                >
                  Send Backward
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => handleContextMenuAction('bring-to-front', contextMenu.layerId!)}
                  disabled={options.isTopmost}
                >
                  Bring to Front
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => handleContextMenuAction('bring-to-back', contextMenu.layerId!)}
                  disabled={options.isBottommost}
                >
                  Send to Back
                </ContextMenuItem>
              </>
            );
          })()}
        </ContextMenu>
      )}
    </div>
  );
}