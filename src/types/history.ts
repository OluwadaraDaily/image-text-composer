import type { CanvasMeta, ImageAsset } from './canvas';
import type { TextLayer } from './layers';

type DocumentState = {
  canvas: CanvasMeta;
  image: ImageAsset | null;
  layers: TextLayer[];
};

type HistoryAction = {
  type: string;
  label: string;
  timestamp: number;
};

type HistoryEntry = {
  state: DocumentState;
  action: HistoryAction;
};

type EditorHistory = {
  past: HistoryEntry[];
  present: DocumentState;
  future: HistoryEntry[];
  limit: number;
};

type HistoryStats = {
  pastCount: number;
  futureCount: number;
  canUndo: boolean;
  canRedo: boolean;
  lastAction?: HistoryAction;
  nextAction?: HistoryAction;
};

export type {
  DocumentState,
  HistoryAction,
  HistoryEntry,
  EditorHistory,
  HistoryStats,
};