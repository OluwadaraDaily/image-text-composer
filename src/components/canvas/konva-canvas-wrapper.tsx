import { useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Text } from 'react-konva';
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

  const handleTextClick = (layerId: string) => {
    onSelectedLayerChange?.(layerId);
  };

  const handleStageClick = (e: any) => {
    // If clicked on empty area, deselect
    if (e.target === e.target.getStage()) {
      onSelectedLayerChange?.(null);
    }
  };

  return (
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
        {textLayers.map((layer) => (
          <Text
            key={layer.id}
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
            draggable
            onClick={() => handleTextClick(layer.id)}
            stroke={layer.id === selectedLayerId ? '#007bff' : undefined}
            strokeWidth={layer.id === selectedLayerId ? 1 : 0}
          />
        ))}
      </Layer>
    </Stage>
  );
}