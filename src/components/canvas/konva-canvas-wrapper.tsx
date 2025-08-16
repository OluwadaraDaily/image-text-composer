import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import type { CanvasMeta, TextLayer } from '@/types';
import TextLayers from './text-layers';
import { ContextMenu, ContextMenuItem } from '@/components/ui/context-menu';
import { MultiLineTextEditor } from './multi-line-text-editor';
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
    // Add small buffer to prevent edge clipping and improve smoothness
    const buffer = 2;
    return {
      x: Math.max(buffer, Math.min(x, canvasMeta.width - width - buffer)),
      y: Math.max(buffer, Math.min(y, canvasMeta.height - height - buffer))
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
    const layer = textLayers.find(l => l.id === layerId);
    if (layer) {
      // Store the layer's top-left position, not the Group's center position
      setDragStartPos({ x: layer.x, y: layer.y });
    }
    setSelectedLayerId(layerId);
  };

  const handleDragMove = (layerId: string, e: any) => {
    if (dragAnimationRef.current) {
      cancelAnimationFrame(dragAnimationRef.current);
    }

    dragAnimationRef.current = requestAnimationFrame(() => {
      const layer = textLayers.find(l => l.id === layerId);
      if (!layer || !setTextLayers) return;

      // Get the Group's center position
      let centerX = e.target.x();
      let centerY = e.target.y();

      // Convert center position to top-left position for the layer
      let newX = centerX - layer.width / 2;
      let newY = centerY - layer.height / 2;

      // Apply smooth canvas bounds clamping with easing near edges
      const buffer = 5;
      const easeZone = 20; // Zone where movement slows down near edges
      
      // Calculate clamped position
      const clampedX = Math.max(buffer, Math.min(newX, canvasMeta.width - layer.width - buffer));
      const clampedY = Math.max(buffer, Math.min(newY, canvasMeta.height - layer.height - buffer));
      
      // Apply easing near edges for smoother movement
      const leftEdgeDistance = newX;
      const rightEdgeDistance = canvasMeta.width - layer.width - newX;
      const topEdgeDistance = newY;
      const bottomEdgeDistance = canvasMeta.height - layer.height - newY;
      
      let easedX = clampedX;
      let easedY = clampedY;
      
      // Ease X movement near edges
      if (leftEdgeDistance < easeZone && leftEdgeDistance > 0) {
        const easeRatio = leftEdgeDistance / easeZone;
        easedX = newX * easeRatio + clampedX * (1 - easeRatio);
      } else if (rightEdgeDistance < easeZone && rightEdgeDistance > 0) {
        const easeRatio = rightEdgeDistance / easeZone;
        easedX = newX * easeRatio + clampedX * (1 - easeRatio);
      }
      
      // Ease Y movement near edges
      if (topEdgeDistance < easeZone && topEdgeDistance > 0) {
        const easeRatio = topEdgeDistance / easeZone;
        easedY = newY * easeRatio + clampedY * (1 - easeRatio);
      } else if (bottomEdgeDistance < easeZone && bottomEdgeDistance > 0) {
        const easeRatio = bottomEdgeDistance / easeZone;
        easedY = newY * easeRatio + clampedY * (1 - easeRatio);
      }

      // Convert back to center position for the Group
      centerX = easedX + layer.width / 2;
      centerY = easedY + layer.height / 2;

      // Update position immediately for smooth feedback
      e.target.x(centerX);
      e.target.y(centerY);
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

    // Get the Group's center position
    let centerX = e.target.x();
    let centerY = e.target.y();

    // Convert center position to top-left position for the layer
    let newX = centerX - layer.width / 2;
    let newY = centerY - layer.height / 2;

    // Apply final clamping and update state
    const clamped = clampToCanvas(newX, newY, layer.width, layer.height);
    
    // Use handleLayerUpdate for history tracking
    handleLayerUpdate(layerId, { x: clamped.x, y: clamped.y });
  };

  // Resize handle event handlers with cursor management
  const handleResizeMouseEnter = (e: any) => {
    const container = e.target.getStage()?.container();
    if (!container) return;
    
    // Get the handle type from the event target's name or use a default
    const handleName = e.target.name() || 'corner-br';
    
    // Set appropriate cursor based on handle type
    if (handleName.startsWith('corner-')) {
      // Corner handles get diagonal resize cursors
      if (handleName === 'corner-br' || handleName === 'corner-tl') {
        container.style.cursor = 'nw-resize';
      } else {
        container.style.cursor = 'ne-resize';
      }
    } else if (handleName.startsWith('side-')) {
      // Side handles get directional resize cursors
      if (handleName === 'side-left' || handleName === 'side-right') {
        container.style.cursor = 'ew-resize';
      } else {
        container.style.cursor = 'ns-resize';
      }
    } else {
      container.style.cursor = 'nw-resize'; // Default
    }
  };

  const handleResizeMouseLeave = (e: any) => {
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = 'default';
  };

  const handleResizeDragStart = () => setIsResizing(true);

  const handleResizeDragMove = (layer: TextLayer, e: any, handleType: string = 'corner-br') => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    
    // Calculate new dimensions based on handle type
    let updatedWidth = layer.width;
    let updatedHeight = layer.height;
    let updatedX = layer.x;
    let updatedY = layer.y;
    
    if (handleType.startsWith('corner-')) {
      // Corner handles: resize both width and height (diagonal scaling)
      if (handleType === 'corner-br') {
        // Bottom-right corner
        updatedWidth = Math.max(50, pointerPosition.x - layer.x);
        updatedHeight = Math.max(24, pointerPosition.y - layer.y);
      } else if (handleType === 'corner-tl') {
        // Top-left corner
        const newX = Math.min(pointerPosition.x, layer.x + layer.width - 50);
        const newY = Math.min(pointerPosition.y, layer.y + layer.height - 24);
        updatedWidth = layer.x + layer.width - newX;
        updatedHeight = layer.y + layer.height - newY;
        updatedX = newX;
        updatedY = newY;
      } else if (handleType === 'corner-tr') {
        // Top-right corner
        const newY = Math.min(pointerPosition.y, layer.y + layer.height - 24);
        updatedWidth = Math.max(50, pointerPosition.x - layer.x);
        updatedHeight = layer.y + layer.height - newY;
        updatedY = newY;
      } else if (handleType === 'corner-bl') {
        // Bottom-left corner
        const newX = Math.min(pointerPosition.x, layer.x + layer.width - 50);
        updatedWidth = layer.x + layer.width - newX;
        updatedHeight = Math.max(24, pointerPosition.y - layer.y);
        updatedX = newX;
      }
      
      // Proportional resize with Shift key for corner handles
      if (modifierKeys.shift) {
        const aspectRatio = layer.width / layer.height;
        if (handleType === 'corner-br' || handleType === 'corner-tl') {
          updatedHeight = updatedWidth / aspectRatio;
        } else {
          updatedWidth = updatedHeight * aspectRatio;
        }
      }
      
    } else if (handleType.startsWith('side-')) {
      // Side handles: resize only width OR height
      if (handleType === 'side-right') {
        // Right side: only change width
        updatedWidth = Math.max(50, pointerPosition.x - layer.x);
      } else if (handleType === 'side-left') {
        // Left side: only change width, adjust x position
        const newX = Math.min(pointerPosition.x, layer.x + layer.width - 50);
        updatedWidth = layer.x + layer.width - newX;
        updatedX = newX;
      } else if (handleType === 'side-bottom') {
        // Bottom side: only change height
        updatedHeight = Math.max(24, pointerPosition.y - layer.y);
      } else if (handleType === 'side-top') {
        // Top side: only change height, adjust y position
        const newY = Math.min(pointerPosition.y, layer.y + layer.height - 24);
        updatedHeight = layer.y + layer.height - newY;
        updatedY = newY;
      }
    }
    
    // Center-scale with Alt key (for corner handles only)
    if (modifierKeys.alt && handleType.startsWith('corner-')) {
      const widthDelta = updatedWidth - layer.width;
      const heightDelta = updatedHeight - layer.height;
      updatedX = layer.x - widthDelta / 2;
      updatedY = layer.y - heightDelta / 2;
      
      // Apply canvas bounds clamping for center-scale
      const clamped = clampToCanvas(updatedX, updatedY, updatedWidth, updatedHeight);
      updatedX = clamped.x;
      updatedY = clamped.y;
    } else {
      // Apply canvas bounds clamping for normal resize
      const clamped = clampToCanvas(updatedX, updatedY, updatedWidth, updatedHeight);
      updatedX = clamped.x;
      updatedY = clamped.y;
    }
    
    // Use handleLayerUpdate for history tracking
    handleLayerUpdate(layer.id, {
      x: updatedX,
      y: updatedY,
      width: updatedWidth, 
      height: updatedHeight
      // fontSize intentionally omitted to keep it unchanged
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
    // Get the parent Group's position (which is the center of the text)
    const parentGroup = e.target.getParent();
    const centerX = parentGroup.x();
    const centerY = parentGroup.y();
    
    // Get the rotation handle's position relative to the stage
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    
    const angle = Math.atan2(
      pointerPosition.y - centerY,
      pointerPosition.x - centerX
    ) * 180 / Math.PI;
    
    // Apply angle snapping
    const snappedAngle = snapAngle(angle + 90); // +90 to align with visual expectation
    
    // Use handleLayerUpdate for history tracking
    handleLayerUpdate(layer.id, { rotation: snappedAngle });
  };

  const handleRotationDragEnd = () => setIsRotating(false);

  // Text editing handlers
  const finishEditing = () => {
    if (editingLayerId && editingText !== undefined) {
      // Use handleLayerUpdate for history tracking
      handleLayerUpdate(editingLayerId, { text: editingText });
    }
    setIsEditing(false);
    setEditingLayerId(null);
    setEditingText('');
    // Keep layer selected after editing for continued interaction
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingLayerId(null);
    setEditingText('');
    // Keep layer selected after canceling
  };

  // Handle text change during editing
  const handleTextChange = useCallback((newText: string) => {
    setEditingText(newText);
  }, []);

  // Handle dimension change during editing (only height auto-expands)
  const handleDimensionChange = useCallback((_newWidth: number, newHeight: number) => {
    if (editingLayerId) {
      // Only update height - width should remain user-controlled
      const layer = textLayers.find(l => l.id === editingLayerId);
      if (layer && newHeight !== layer.height) {
        handleLayerUpdate(editingLayerId, { 
          height: newHeight // Only update height, keep width as-is
        });
      }
    }
  }, [editingLayerId, handleLayerUpdate, textLayers]);

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
          onResizeDragMove={(layer, e, handleType) => handleResizeDragMove(layer, e, handleType)}
          onResizeDragEnd={handleResizeDragEnd}
          onRotationMouseEnter={handleRotationMouseEnter}
          onRotationMouseLeave={handleRotationMouseLeave}
          onRotationDragStart={handleRotationDragStart}
          onRotationDragMove={handleRotationDragMove}
          onRotationDragEnd={handleRotationDragEnd}
        />
      </Layer>
      </Stage>

      {/* Multi-line text editor overlay */}
      {isEditing && editingLayer && (
        <MultiLineTextEditor
          layer={editingLayer}
          onTextChange={handleTextChange}
          onDimensionChange={handleDimensionChange}
          onFinish={finishEditing}
          onCancel={cancelEditing}
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