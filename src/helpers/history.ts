import type { EditorHistory, DocumentState, HistoryStats, HistoryAction, HistoryEntry } from '@/types/history';

export function createHistory(initialState: DocumentState, limit: number = 20): EditorHistory {
  return {
    past: [],
    present: initialState,
    future: [],
    limit,
  };
}

export function pushHistoryWithAction(
  history: EditorHistory, 
  newState: DocumentState, 
  action: HistoryAction
): EditorHistory {
  const { past, present, limit } = history;
  
  // Create entry with current state and action
  const newEntry: HistoryEntry = {
    state: present,
    action,
  };
  
  // Add current entry to past
  const newPast = [newEntry, ...past];
  
  // Limit the past array to the specified limit
  if (newPast.length > limit) {
    newPast.splice(limit);
  }
  
  return {
    past: newPast,
    present: newState,
    future: [],
    limit,
  };
}

// Keep backward compatibility
export function pushHistory(history: EditorHistory, newState: DocumentState): EditorHistory {
  const defaultAction: HistoryAction = {
    type: 'unknown',
    label: 'Unknown Action',
    timestamp: Date.now(),
  };
  
  return pushHistoryWithAction(history, newState, defaultAction);
}

export function undoHistory(history: EditorHistory): EditorHistory | null {
  const { past, present, future } = history;
  
  // Can't undo if no past states
  if (past.length === 0) {
    return null;
  }
  
  const [previousEntry, ...restPast] = past;
  
  // Create entry for current state to add to future
  const currentEntry: HistoryEntry = {
    state: present,
    action: {
      type: 'redo',
      label: 'Redo',
      timestamp: Date.now(),
    },
  };
  
  return {
    past: restPast,
    present: previousEntry.state,
    future: [currentEntry, ...future],
    limit: history.limit,
  };
}

export function redoHistory(history: EditorHistory): EditorHistory | null {
  const { past, present, future } = history;
  
  // Can't redo if no future states
  if (future.length === 0) {
    return null;
  }
  
  const [nextEntry, ...restFuture] = future;
  
  // Create entry for current state to add to past
  const currentEntry: HistoryEntry = {
    state: present,
    action: {
      type: 'undo',
      label: 'Undo',
      timestamp: Date.now(),
    },
  };
  
  return {
    past: [currentEntry, ...past],
    present: nextEntry.state,
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

export function getLastAction(history: EditorHistory): HistoryAction | undefined {
  return history.past[0]?.action;
}

export function getNextAction(history: EditorHistory): HistoryAction | undefined {
  return history.future[0]?.action;
}

export function getHistoryStats(history: EditorHistory): HistoryStats {
  return {
    pastCount: history.past.length,
    futureCount: history.future.length,
    canUndo: canUndo(history),
    canRedo: canRedo(history),
    lastAction: getLastAction(history),
    nextAction: getNextAction(history),
  };
}