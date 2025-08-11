type EditorState = {
  canvas: CanvasMeta;           // Info about the canvas
  image: ImageAsset | null;     // The background image (if any)
  layers: TextLayer[];          // All text layers
  selectedLayerId: string | null; // Which layer is currently selected
  history: EditorHistory;       // Undo/redo tracking
  ui: EditorUIState;            // Ephemeral UI state (e.g., tool panels)
};

type CanvasMeta = {
  width: number;       // Display width of the canvas in px
  height: number;      // Display height in px
  scale: number;       // Zoom factor
  rotation: number;    // If the entire canvas can be rotated (usually 0)
};

type ImageAsset = {
  src: string;         // Object URL or base64 data
  width: number;
  height: number;
};

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

type EditorHistory = {
  past: DocumentState[];   // Array of previous states
  present: DocumentState;  // Current state
  future: DocumentState[]; // States you can redo to
};

type DocumentState = {
  canvas: CanvasMeta;
  image: ImageAsset | null;
  layers: TextLayer[];
};

type EditorUIState = {
  activeTool: "select" | "text" | "move" | "shape";
  showLayersPanel: boolean;
  showPropertiesPanel: boolean;
  zoom: number;
  transformState: {
    isDragging: boolean;
    isResizing: boolean;
    isRotating: boolean;
    activeHandle: string | null;
  };
  hoverLayerId: string | null;
  fontPickerOpen: boolean;
};




export type {
  EditorState,
  CanvasMeta,
  ImageAsset,
  TextLayer,
  TransformHandlesState,
  EditorHistory,
  EditorUIState,
};