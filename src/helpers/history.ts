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

  // Find the next undo operation that prioritizes text layers over image layer
  let targetIndex = 0;
  let foundTextLayerChange = false;

  // Check if there are any text layer changes in the past
  for (let i = 0; i < past.length; i++) {
    const pastEntry = past[i];
    const currentLayers = present.layers;
    const pastLayers = pastEntry.state.layers;
    
    // If text layers are different, prioritize this change
    if (JSON.stringify(currentLayers) !== JSON.stringify(pastLayers)) {
      targetIndex = i;
      foundTextLayerChange = true;
      break;
    }
  }

  // If no text layer changes found but there's an image change, allow image undo
  if (!foundTextLayerChange) {
    // Find the most recent change that affects the image
    for (let i = 0; i < past.length; i++) {
      const pastEntry = past[i];
      if (JSON.stringify(present.image) !== JSON.stringify(pastEntry.state.image)) {
        targetIndex = i;
        break;
      }
    }
  }

  const targetEntry = past[targetIndex];
  
  // Create the new present state - preserve image if we're only changing text layers
  let newPresentState: DocumentState;
  if (foundTextLayerChange) {
    // Only update text layers, preserve current image and canvas
    newPresentState = {
      ...present,
      layers: targetEntry.state.layers,
    };
  } else {
    // Update the entire state (for image changes when no text changes available)
    newPresentState = targetEntry.state;
  }
  
  // Create entry for current state to add to future
  const currentEntry: HistoryEntry = {
    state: present,
    action: {
      type: 'redo',
      label: 'Redo',
      timestamp: Date.now(),
    },
  };

  // Remove entries up to and including the target
  const newPast = past.slice(targetIndex + 1);
  
  // Add skipped entries to future (in reverse order to maintain chronological order)
  const skippedEntries = past.slice(0, targetIndex);
  const newFuture = [currentEntry, ...skippedEntries.reverse(), ...future];
  
  return {
    past: newPast,
    present: newPresentState,
    future: newFuture,
    limit: history.limit,
  };
}

export function redoHistory(history: EditorHistory): EditorHistory | null {
  const { past, present, future } = history;
  
  // Can't redo if no future states
  if (future.length === 0) {
    return null;
  }

  // Find the next redo operation that prioritizes text layers over image layer
  let targetIndex = 0;
  let foundTextLayerChange = false;

  // Check if there are any text layer changes in the future
  for (let i = 0; i < future.length; i++) {
    const futureEntry = future[i];
    const currentLayers = present.layers;
    const futureLayers = futureEntry.state.layers;
    
    // If text layers are different, prioritize this change
    if (JSON.stringify(currentLayers) !== JSON.stringify(futureLayers)) {
      targetIndex = i;
      foundTextLayerChange = true;
      break;
    }
  }

  // If no text layer changes found but there's an image change, allow image redo
  if (!foundTextLayerChange) {
    // Find the most recent change that affects the image
    for (let i = 0; i < future.length; i++) {
      const futureEntry = future[i];
      if (JSON.stringify(present.image) !== JSON.stringify(futureEntry.state.image)) {
        targetIndex = i;
        break;
      }
    }
  }

  const targetEntry = future[targetIndex];
  
  // Create the new present state - preserve image if we're only changing text layers
  let newPresentState: DocumentState;
  if (foundTextLayerChange) {
    // Only update text layers, preserve current image and canvas
    newPresentState = {
      ...present,
      layers: targetEntry.state.layers,
    };
  } else {
    // Update the entire state (for image changes when no text changes available)
    newPresentState = targetEntry.state;
  }
  
  // Create entry for current state to add to past
  const currentEntry: HistoryEntry = {
    state: present,
    action: {
      type: 'undo',
      label: 'Undo',
      timestamp: Date.now(),
    },
  };

  // Remove entries up to and including the target
  const newFuture = future.slice(targetIndex + 1);
  
  // Add skipped entries to past (in reverse order to maintain chronological order)
  const skippedEntries = future.slice(0, targetIndex);
  const newPast = [currentEntry, ...skippedEntries.reverse(), ...past];
  
  return {
    past: newPast,
    present: newPresentState,
    future: newFuture,
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