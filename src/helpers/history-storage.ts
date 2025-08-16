import type { EditorHistory, DocumentState } from '@/types/history';
import { historyStorageService } from '@/services/history-storage';
import { imageStorageService } from '@/services/image-storage';

export const STORAGE_KEY = 'editor-history'; // Legacy key, kept for compatibility

// Helper function to process images in DocumentState for IndexedDB storage
const processImagesForStorage = async (state: DocumentState): Promise<DocumentState> => {
  if (!state.image) {
    return state;
  }

  if (state.image.imageId) {
    return state;
  }

  // If image has a blob URL, convert and store it
  if (state.image.src.startsWith('blob:')) {
    try {
      // Check if the blob URL is still valid before trying to fetch it
      const response = await fetch(state.image.src, { method: 'HEAD' });
      if (response.ok) {
        const imageId = await imageStorageService.saveImageFromBlobUrl(state.image.src);
        if (imageId) {
          return {
            ...state,
            image: {
              ...state.image,
              imageId,
              src: '',
            },
          };
        }
      }
    } catch (error) {
      console.warn('Failed to save blob URL to IndexedDB (blob may be revoked):', error);
      // If blob URL is invalid, return state without attempting to save
      return state;
    }
  }

  // If image has base64 data, convert and store it
  if (state.image.src.startsWith('data:')) {
    try {
      const imageId = await imageStorageService.saveImageFromBase64(state.image.src);
      if (imageId) {
        return {
          ...state,
          image: {
            ...state.image,
            imageId,
            src: '',
          },
        };
      }
    } catch (error) {
      console.warn('Failed to save base64 to IndexedDB:', error);
    }
  }

  return state;
};

// Helper function to prepare history for IndexedDB storage
export const prepareHistoryForStorage = async (history: EditorHistory): Promise<EditorHistory> => {
  const processedPresent = await processImagesForStorage(history.present);
  const processedPast = await Promise.all(
    history.past.map(async (entry) => ({
      ...entry,
      state: await processImagesForStorage(entry.state),
    }))
  );
  const processedFuture = await Promise.all(
    history.future.map(async (entry) => ({
      ...entry,
      state: await processImagesForStorage(entry.state),
    }))
  );

  return {
    present: processedPresent,
    past: processedPast,
    future: processedFuture,
    limit: history.limit,
  };
};

// Main function to save history using IndexedDB
export const safelyStorageSet = async (_key: string, history: EditorHistory): Promise<boolean> => {
  try {
    const preparedHistory = await prepareHistoryForStorage(history);
    return await historyStorageService.saveHistory(preparedHistory);
  } catch (error) {
    console.warn('Failed to save editor history to IndexedDB:', error);
    return false;
  }
};

// Helper function to load history from IndexedDB
export const loadHistoryFromStorage = async (): Promise<EditorHistory | null> => {
  try {
    return await historyStorageService.loadHistory();
  } catch (error) {
    console.warn('Failed to load editor history from IndexedDB:', error);
    return null;
  }
};

// Helper function to restore image URLs from IndexedDB
export const restoreImageUrls = async (state: DocumentState): Promise<DocumentState> => {
  if (!state.image || !state.image.imageId) {
    return state;
  }

  try {
    const blob = await imageStorageService.getImage(state.image.imageId);
    if (blob) {
      const objectUrl = URL.createObjectURL(blob);
      return {
        ...state,
        image: {
          ...state.image,
          src: objectUrl,
        },
      };
    }
  } catch (error) {
    console.warn('Failed to restore image URL:', error);
  }

  return state;
};