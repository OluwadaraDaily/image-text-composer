import { useRef } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import type { CanvasMeta } from '@/types';

interface KonvaCanvasWrapperProps {
  imageObject: HTMLImageElement;
  canvasMeta: CanvasMeta;
}

export default function KonvaCanvasWrapper({ imageObject, canvasMeta }: KonvaCanvasWrapperProps) {
  const stageRef = useRef<any>(null);

  return (
    <Stage
      ref={stageRef}
      width={canvasMeta.width}
      height={canvasMeta.height}
      className="bg-transparent"
    >
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
    </Stage>
  );
}