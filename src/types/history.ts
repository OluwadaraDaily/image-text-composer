import type { CanvasMeta, ImageAsset } from './canvas';
import type { TextLayer } from './layers';

type DocumentState = {
  canvas: CanvasMeta;
  image: ImageAsset | null;
  layers: TextLayer[];
};

type EditorHistory = {
  past: DocumentState[];
  present: DocumentState;
  future: DocumentState[];
  limit: number;
};

type HistoryStats = {
  pastCount: number;
  futureCount: number;
  canUndo: boolean;
  canRedo: boolean;
};

export type {
  DocumentState,
  EditorHistory,
  HistoryStats,
};