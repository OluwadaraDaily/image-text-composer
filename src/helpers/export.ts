import type { EditorHistory, DocumentState } from '@/types/history';
import { imageStorage } from '@/services/image-storage';

export interface ExportData {
  version: string;
  createdAt: string;
  history: EditorHistory;
  metadata: {
    totalStates: number;
    hasImages: boolean;
  };
}

export class ExportService {
  private readonly EXPORT_VERSION = '1.0.0';

  async exportProject(): Promise<string | null> {
    try {
      // Load the current history from storage
      const { loadHistoryFromStorage } = await import('@/helpers/history-storage');
      const history = await loadHistoryFromStorage();
      
      if (!history) {
        console.warn('No history found to export');
        return null;
      }

      // Convert all imageIds back to base64 for export
      const exportHistory = await this.convertHistoryForExport(history);
      
      // Prepare export data
      const exportData: ExportData = {
        version: this.EXPORT_VERSION,
        createdAt: new Date().toISOString(),
        history: exportHistory,
        metadata: {
          totalStates: 1 + exportHistory.past.length + exportHistory.future.length,
          hasImages: this.hasImages(exportHistory),
        },
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export project:', error);
      return null;
    }
  }

  private async convertHistoryForExport(history: EditorHistory): Promise<EditorHistory> {
    const convertState = async (state: DocumentState): Promise<DocumentState> => {
      if (!state.image || !state.image.imageId) {
        return state;
      }

      try {
        const blob = await imageStorage.getImage(state.image.imageId);
        if (blob) {
          const base64 = await imageStorage.convertBlobToBase64(blob);
          return {
            ...state,
            image: {
              ...state.image,
              src: base64,
              imageId: undefined, // Remove imageId for export
            },
          };
        }
      } catch (error) {
        console.warn('Failed to convert image for export:', error);
      }

      return state;
    };

    const [convertedPresent, convertedPast, convertedFuture] = await Promise.all([
      convertState(history.present),
      Promise.all(
        history.past.map(async (entry) => ({
          ...entry,
          state: await convertState(entry.state),
        }))
      ),
      Promise.all(
        history.future.map(async (entry) => ({
          ...entry,
          state: await convertState(entry.state),
        }))
      ),
    ]);

    return {
      present: convertedPresent,
      past: convertedPast,
      future: convertedFuture,
      limit: history.limit,
    };
  }

  private hasImages(history: EditorHistory): boolean {
    const checkState = (state: DocumentState): boolean => {
      return !!(state.image && (state.image.src || state.image.imageId));
    };

    return (
      checkState(history.present) ||
      history.past.some(entry => checkState(entry.state)) ||
      history.future.some(entry => checkState(entry.state))
    );
  }

  async downloadExport(): Promise<boolean> {
    try {
      const exportData = await this.exportProject();
      if (!exportData) {
        return false;
      }

      // Create a blob and download link
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-text-composer-export-${Date.now()}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Failed to download export:', error);
      return false;
    }
  }

  validateExportData(data: unknown): data is ExportData {
    if (!data || typeof data !== 'object') return false;
    
    const obj = data as Record<string, unknown>;

    return (
      typeof obj.version === 'string' &&
      typeof obj.createdAt === 'string' &&
      obj.history !== undefined &&
      typeof obj.history === 'object' &&
      obj.history !== null &&
      this.isValidHistory(obj.history) &&
      obj.metadata !== undefined &&
      obj.metadata !== null &&
      typeof obj.metadata === 'object'
    );
  }

  private isValidHistory(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    
    const history = data as Record<string, unknown>;
    
    return (
      !!history.present &&
      typeof history.present === 'object' &&
      Array.isArray(history.past) &&
      Array.isArray(history.future) &&
      typeof history.limit === 'number'
    );
  }

  getExportSummary(data: ExportData): string {
    const { metadata, createdAt } = data;
    const date = new Date(createdAt).toLocaleDateString();
    
    return `Export created on ${date}\n` +
           `Total states: ${metadata.totalStates}\n` +
           `Contains images: ${metadata.hasImages ? 'Yes' : 'No'}\n` +
           `Version: ${data.version}`;
  }
}

// Singleton instance
export const exportService = new ExportService();