type TextLayer = {
  id: string; 
  text: string;            
  x: number;            
  y: number;             
  rotation: number;  
  width: number; 
  height: number; 
  fontFamily: string;
  fontWeight: number;         
  fontSize: number;           
  color: { r: number; g: number; b: number; a: number };
  opacity: number;            
  alignment: "left" | "center" | "right";
  locked: boolean;            
  zIndex: number;             
  selected: boolean;
  transformHandles?: TransformHandlesState;
};

type TransformHandlesState = {
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  activeHandle: string | null;
};

export type {
  TextLayer,
  TransformHandlesState,
};