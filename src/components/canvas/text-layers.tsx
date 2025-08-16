import React from 'react';
import { Text, Rect, Group, Circle, Line } from 'react-konva';
import type { TextLayer } from '@/types';
import { useTextLayersWithHistory } from '@/hooks/useTextLayersWithHistory';

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
  onResizeDragMove: (layer: TextLayer, e: any, handleType: string) => void;
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
  const { textLayers, selectedLayerId } = useTextLayersWithHistory();
  
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
              <Group
                x={layer.x + layer.width / 2}
                y={layer.y + layer.height / 2}
                rotation={layer.rotation}
              >
                <Rect
                  x={-layer.width / 2 - 4}
                  y={-layer.height / 2 - 6}
                  width={layer.width + 8}
                  height={layer.height + 8}
                  fill="transparent"
                  stroke="#000000"
                  strokeWidth={1}
                  opacity={0.7}
                  cornerRadius={4}
                  listening={false}
                />
              </Group>
            )}
            
            {/* Text element with improved multi-line support */}
            <Text
              x={layer.x}
              y={layer.y}
              text={layer.text}
              fontSize={layer.fontSize}
              fontFamily={layer.fontFamily}
              fontStyle={layer.fontWeight >= 600 ? 'bold' : 'normal'}
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
              wrap="word"
              ellipsis={false}
              lineHeight={1.2}
              verticalAlign="top"
            />
            
            {/* Transform handles for selected layer */}
            {isSelected && !isEditingThis && !isDragging && (
              <Group
                x={layer.x + layer.width / 2}
                y={layer.y + layer.height / 2}
                rotation={layer.rotation}
              >
                {/* Corner resize handles (diagonal scaling) */}
                {/* Bottom-right corner */}
                <Circle
                  name="corner-br"
                  x={layer.width / 2}
                  y={layer.height / 2}
                  radius={6}
                  fill="white"
                  stroke="#007bff"
                  strokeWidth={2}
                  draggable
                  onMouseEnter={onResizeMouseEnter}
                  onMouseLeave={onResizeMouseLeave}
                  onDragStart={onResizeDragStart}
                  onDragMove={(e) => onResizeDragMove(layer, e, 'corner-br')}
                  onDragEnd={onResizeDragEnd}
                />
                
                {/* Top-left corner */}
                <Circle
                  name="corner-tl"
                  x={-layer.width / 2}
                  y={-layer.height / 2}
                  radius={6}
                  fill="white"
                  stroke="#007bff"
                  strokeWidth={2}
                  draggable
                  onMouseEnter={onResizeMouseEnter}
                  onMouseLeave={onResizeMouseLeave}
                  onDragStart={onResizeDragStart}
                  onDragMove={(e) => onResizeDragMove(layer, e, 'corner-tl')}
                  onDragEnd={onResizeDragEnd}
                />
                
                {/* Top-right corner */}
                <Circle
                  name="corner-tr"
                  x={layer.width / 2}
                  y={-layer.height / 2}
                  radius={6}
                  fill="white"
                  stroke="#007bff"
                  strokeWidth={2}
                  draggable
                  onMouseEnter={onResizeMouseEnter}
                  onMouseLeave={onResizeMouseLeave}
                  onDragStart={onResizeDragStart}
                  onDragMove={(e) => onResizeDragMove(layer, e, 'corner-tr')}
                  onDragEnd={onResizeDragEnd}
                />
                
                {/* Bottom-left corner */}
                <Circle
                  name="corner-bl"
                  x={-layer.width / 2}
                  y={layer.height / 2}
                  radius={6}
                  fill="white"
                  stroke="#007bff"
                  strokeWidth={2}
                  draggable
                  onMouseEnter={onResizeMouseEnter}
                  onMouseLeave={onResizeMouseLeave}
                  onDragStart={onResizeDragStart}
                  onDragMove={(e) => onResizeDragMove(layer, e, 'corner-bl')}
                  onDragEnd={onResizeDragEnd}
                />

                {/* Side resize handles (width/height only) */}
                {/* Right side */}
                <Rect
                  name="side-right"
                  x={layer.width / 2 - 2}
                  y={-3}
                  width={4}
                  height={6}
                  fill="white"
                  stroke="#007bff"
                  strokeWidth={2}
                  draggable
                  onMouseEnter={onResizeMouseEnter}
                  onMouseLeave={onResizeMouseLeave}
                  onDragStart={onResizeDragStart}
                  onDragMove={(e) => onResizeDragMove(layer, e, 'side-right')}
                  onDragEnd={onResizeDragEnd}
                />
                
                {/* Left side */}
                <Rect
                  name="side-left"
                  x={-layer.width / 2 - 2}
                  y={-3}
                  width={4}
                  height={6}
                  fill="white"
                  stroke="#007bff"
                  strokeWidth={2}
                  draggable
                  onMouseEnter={onResizeMouseEnter}
                  onMouseLeave={onResizeMouseLeave}
                  onDragStart={onResizeDragStart}
                  onDragMove={(e) => onResizeDragMove(layer, e, 'side-left')}
                  onDragEnd={onResizeDragEnd}
                />
                
                {/* Top side */}
                <Rect
                  name="side-top"
                  x={-3}
                  y={-layer.height / 2 - 2}
                  width={6}
                  height={4}
                  fill="white"
                  stroke="#007bff"
                  strokeWidth={2}
                  draggable
                  onMouseEnter={onResizeMouseEnter}
                  onMouseLeave={onResizeMouseLeave}
                  onDragStart={onResizeDragStart}
                  onDragMove={(e) => onResizeDragMove(layer, e, 'side-top')}
                  onDragEnd={onResizeDragEnd}
                />
                
                {/* Bottom side */}
                <Rect
                  name="side-bottom"
                  x={-3}
                  y={layer.height / 2 - 2}
                  width={6}
                  height={4}
                  fill="white"
                  stroke="#007bff"
                  strokeWidth={2}
                  draggable
                  onMouseEnter={onResizeMouseEnter}
                  onMouseLeave={onResizeMouseLeave}
                  onDragStart={onResizeDragStart}
                  onDragMove={(e) => onResizeDragMove(layer, e, 'side-bottom')}
                  onDragEnd={onResizeDragEnd}
                />
                
                {/* Rotation handle */}
                <Circle
                  x={0}
                  y={-layer.height / 2 - 25}
                  radius={6}
                  fill="white"
                  stroke="#28a745"
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
                    0, -layer.height / 2,
                    0, -layer.height / 2 - 25
                  ]}
                  stroke="#28a745"
                  strokeWidth={1}
                  opacity={0.5}
                  listening={false}
                />
              </Group>
            )}
            
            {/* Editing placeholder when editing */}
            {isEditingThis && (
              <Group
                x={layer.x + layer.width / 2}
                y={layer.y + layer.height / 2}
                rotation={layer.rotation}
              >
                <Rect
                  x={-layer.width / 2 - 2}
                  y={-layer.height / 2 - 2}
                  width={layer.width + 4}
                  height={layer.height + 4}
                  fill="rgba(255, 255, 255, 0.8)"
                  stroke="#007bff"
                  strokeWidth={2}
                  listening={false}
                />
              </Group>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}