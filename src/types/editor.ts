import type { CanvasMeta, ImageAsset } from './canvas';
import type { TextLayer } from './layers';
import type { EditorHistory } from './history';

type EditorState = {
  canvas: CanvasMeta;       
  image: ImageAsset | null;
  layers: TextLayer[]; 
  selectedLayerId: string | null;
  history: EditorHistory;
  ui: EditorUIState;            // Ephemeral UI state (e.g., tool panels)
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
  EditorUIState,
};