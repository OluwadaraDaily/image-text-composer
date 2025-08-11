import type { EditorHistory, DocumentState, HistoryStats } from '@/types/history';

export function createHistory(initialState: DocumentState, limit: number = 20): EditorHistory {
  return {
    past: [],
    present: initialState,
    future: [],
    limit,
  };
}

export function pushHistory(history: EditorHistory, newState: DocumentState): EditorHistory {
  const { past, present, limit } = history;
  
  // Add current state to past
  const newPast = [present, ...past];
  
  // Limit the past array to the specified limit
  if (newPast.length > limit) {
    newPast.splice(limit);
  }
  
  return {
    past: newPast,
    present: newState,
    future: [], // Clear future when new action is performed
    limit,
  };
}

export function undoHistory(history: EditorHistory): EditorHistory | null {
  const { past, present, future } = history;
  
  // Can't undo if no past states
  if (past.length === 0) {
    return null;
  }
  
  const [previousState, ...restPast] = past;
  
  return {
    past: restPast,
    present: previousState,
    future: [present, ...future],
    limit: history.limit,
  };
}

export function redoHistory(history: EditorHistory): EditorHistory | null {
  const { past, present, future } = history;
  
  // Can't redo if no future states
  if (future.length === 0) {
    return null;
  }
  
  const [nextState, ...restFuture] = future;
  
  return {
    past: [present, ...past],
    present: nextState,
    future: restFuture,
    limit: history.limit,
  };
}

export function canUndo(history: EditorHistory): boolean {
  return history.past.length > 0;
}

export function canRedo(history: EditorHistory): boolean {
  return history.future.length > 0;
}

export function getHistoryStats(history: EditorHistory): HistoryStats {
  return {
    pastCount: history.past.length,
    futureCount: history.future.length,
    canUndo: canUndo(history),
    canRedo: canRedo(history),
  };
}