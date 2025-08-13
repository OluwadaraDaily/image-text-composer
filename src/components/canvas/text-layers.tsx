import React from 'react';
import { Text, Rect, Group, Circle, Line } from 'react-konva';
import type { TextLayer } from '@/types';
import { useTextLayers } from '@/contexts/text-layers-context';

interface TextLayersProps {
  isEditing: boolean;
  editingLayerId: string | null;
  isDragging: boolean;
  modifierKeys: { shift: boolean; alt: boolean };
  onTextClick: (layerId: string, e?: any) => void;
  onTextRightClick?: (layerId: string, e: any) => void;
  onTextDoubleClick: (layerId: string) => void;
  onTextMouseEnter: (e: any) => void;
  onTextMouseLeave: (e: any) => void;
  onDragStart: (layerId: string, e: any) => void;
  onDragMove: (layerId: string, e: any) => void;
  onDragEnd: (layerId: string, e: any) => void;
  onResizeMouseEnter: (e: any) => void;
  onResizeMouseLeave: (e: any) => void;
  onResizeDragStart: () => void;
  onResizeDragMove: (layer: TextLayer, e: any) => void;
  onResizeDragEnd: () => void;
  onRotationMouseEnter: (e: any) => void;
  onRotationMouseLeave: (e: any) => void;
  onRotationDragStart: () => void;
  onRotationDragMove: (layer: TextLayer, e: any) => void;
  onRotationDragEnd: () => void;
}

export default function TextLayers({
  isEditing,
  editingLayerId,
  isDragging,
  modifierKeys,
  onTextClick,
  onTextRightClick,
  onTextDoubleClick,
  onTextMouseEnter,
  onTextMouseLeave,
  onDragStart,
  onDragMove,
  onDragEnd,
  onResizeMouseEnter,
  onResizeMouseLeave,
  onResizeDragStart,
  onResizeDragMove,
  onResizeDragEnd,
  onRotationMouseEnter,
  onRotationMouseLeave,
  onRotationDragStart,
  onRotationDragMove,
  onRotationDragEnd
}: TextLayersProps) {
  const { textLayers, selectedLayerId } = useTextLayers();
  
  // Sort layers by zIndex to ensure correct rendering order
  const sortedLayers = [...textLayers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <>
      {sortedLayers.map((layer) => {
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
                fontStyle={`${layer.fontWeight}`}
                fill={`rgba(${layer.color.r}, ${layer.color.g}, ${layer.color.b}, ${layer.color.a})`}
                align={layer.alignment}
                width={layer.width}
                height={layer.height}
                rotation={layer.rotation}
                opacity={layer.opacity}
                draggable={!isEditingThis}
                onClick={(e) => onTextClick(layer.id, e)}
                onContextMenu={onTextRightClick ? (e) => onTextRightClick(layer.id, e) : undefined}
                onDblClick={() => onTextDoubleClick(layer.id)}
                onDragStart={(e) => onDragStart(layer.id, e)}
                onDragMove={(e) => onDragMove(layer.id, e)}
                onDragEnd={(e) => onDragEnd(layer.id, e)}
                onMouseEnter={onTextMouseEnter}
                onMouseLeave={onTextMouseLeave}
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
                    onMouseEnter={onResizeMouseEnter}
                    onMouseLeave={onResizeMouseLeave}
                    onDragStart={onResizeDragStart}
                    onDragMove={(e) => onResizeDragMove(layer, e)}
                    onDragEnd={onResizeDragEnd}
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
                    onMouseEnter={onRotationMouseEnter}
                    onMouseLeave={onRotationMouseLeave}
                    onDragStart={onRotationDragStart}
                    onDragMove={(e) => onRotationDragMove(layer, e)}
                    onDragEnd={onRotationDragEnd}
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
    </>
  );
}