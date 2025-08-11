type TextLayer = {
  id: string;                // Unique identifier
  text: string;               // The actual text content
  x: number;                  // Position from left (px)
  y: number;                  // Position from top (px)
  rotation: number;           // Rotation in degrees
  width: number;              // Text box width (px)
  height: number;             // Text box height (px)
  fontFamily: string;         // e.g., "Roboto"
  fontWeight: number;         // 400, 700, etc.
  fontSize: number;           // px
  color: { r: number; g: number; b: number; a: number }; // RGBA
  opacity: number;            // 0–1
  alignment: "left" | "center" | "right";
  locked: boolean;            // Prevents changes if true
  zIndex: number;             // Stacking order
  selected: boolean;          // Is this layer currently selected?
  transformHandles?: TransformHandlesState; // Drag/resize/rotate handles
};

type TransformHandlesState = {
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  activeHandle: string | null; // Which handle is being interacted with
};

export type {
  TextLayer,
  TransformHandlesState,
};