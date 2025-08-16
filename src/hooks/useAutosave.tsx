'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditorHistory } from '@/contexts/editor-history-context';
import { STORAGE_KEY, safelyStorageSet } from '@/helpers/history-storage';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutosaveReturn {
  status: AutosaveStatus;
  lastSaveTime: Date | null;
  forceSave: () => Promise<void>;
}

const AUTOSAVE_DELAY = 500; // 500ms throttle
const SAVE_SUCCESS_DISPLAY_TIME = 2000; // Show "saved" for 2 seconds

export function useAutosave(): UseAutosaveReturn {
  const { history } = useEditorHistory();
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastHistoryRef = useRef(history);
  const hasChangesRef = useRef(false);

  const performSave = useCallback(async () => {
    if (!hasChangesRef.current) return;
    
    setStatus('saving');
    
    try {
      const success = await safelyStorageSet(STORAGE_KEY, history);
      if (success) {
        setStatus('saved');
        setLastSaveTime(new Date());
        hasChangesRef.current = false;
        
        // Clear status after delay
        if (statusTimeoutRef.current) {
          clearTimeout(statusTimeoutRef.current);
        }
        statusTimeoutRef.current = setTimeout(() => {
          setStatus('idle');
        }, SAVE_SUCCESS_DISPLAY_TIME);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), SAVE_SUCCESS_DISPLAY_TIME);
      }
    } catch (error) {
      console.warn('Autosave failed:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), SAVE_SUCCESS_DISPLAY_TIME);
    }
  }, [history]);

  const forceSave = useCallback(async () => {
    // Cancel any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    hasChangesRef.current = true;
    await performSave();
  }, [performSave]);

  // Throttled autosave on history changes
  useEffect(() => {
    // Check if history actually changed
    if (lastHistoryRef.current !== history) {
      lastHistoryRef.current = history;
      hasChangesRef.current = true;
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout
      saveTimeoutRef.current = setTimeout(() => {
        performSave();
        saveTimeoutRef.current = null;
      }, AUTOSAVE_DELAY);
    }
  }, [history, performSave]);

  // Save on blur and unload events
  useEffect(() => {
    const handleBlur = () => {
      if (hasChangesRef.current) {
        forceSave();
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        // Force immediate save without waiting
        safelyStorageSet(STORAGE_KEY, history);
        
        // Optional: Show warning if there are unsaved changes
        event.preventDefault();
        return (event.returnValue = '');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasChangesRef.current) {
        forceSave();
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, [history, forceSave]);

  return {
    status,
    lastSaveTime,
    forceSave,
  };
}