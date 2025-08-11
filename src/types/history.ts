import type { CanvasMeta, ImageAsset } from './canvas';
import type { TextLayer } from './layers';

type DocumentState = {
  canvas: CanvasMeta;
  image: ImageAsset | null;
  layers: TextLayer[];
};

type EditorHistory = {
  past: DocumentState[];   // Array of previous states
  present: DocumentState;  // Current state
  future: DocumentState[]; // States you can redo to
};

export type {
  DocumentState,
  EditorHistory,
};