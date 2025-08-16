import { indexedDB } from '@/db/indexeddb';
import type { EditorHistory } from '@/types/history';

export class HistoryStorageService {
  private readonly STORE_NAME = 'history';
  private readonly HISTORY_KEY = 'current';

  async saveHistory(history: EditorHistory): Promise<boolean> {
    try {
      // Ensure we don't exceed the 20 entry limit for past and future
      const trimmedHistory: EditorHistory = {
        ...history,
        past: history.past.slice(-20),
        future: history.future.slice(0, 20),
      };

      return await indexedDB.set(this.STORE_NAME, trimmedHistory, this.HISTORY_KEY);
    } catch (error) {
      console.error('Failed to save history:', error);
      return false;
    }
  }

  async loadHistory(): Promise<EditorHistory | null> {
    try {
      const historyData = await indexedDB.get<EditorHistory>(this.STORE_NAME, this.HISTORY_KEY);
      
      if (!historyData) {
        return null;
      }

      // Validate the structure
      if (this.isValidHistory(historyData)) {
        return historyData;
      }

      console.warn('Invalid history structure found in storage');
      return null;
    } catch (error) {
      console.error('Failed to load history:', error);
      return null;
    }
  }

  async clearHistory(): Promise<boolean> {
    try {
      return await indexedDB.delete(this.STORE_NAME, this.HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
      return false;
    }
  }

  async hasHistory(): Promise<boolean> {
    try {
      const history = await this.loadHistory();
      return history !== null;
    } catch (error) {
      console.error('Failed to check history existence:', error);
      return false;
    }
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

  async getHistorySize(): Promise<number> {
    try {
      const history = await this.loadHistory();
      if (!history) return 0;
      
      const totalEntries = 1 + history.past.length + history.future.length;
      return totalEntries;
    } catch (error) {
      console.error('Failed to get history size:', error);
      return 0;
    }
  }

  async clearAllData(): Promise<boolean> {
    try {
      return await indexedDB.clear(this.STORE_NAME);
    } catch (error) {
      console.error('Failed to clear all history data:', error);
      return false;
    }
  }
}

export const historyStorageService = new HistoryStorageService();