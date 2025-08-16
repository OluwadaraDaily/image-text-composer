const DB_NAME = 'editor-history-db';
const DB_VERSION = 1;

export interface DatabaseConnection {
  db: IDBDatabase;
  close: () => void;
}

export class IndexedDBWrapper {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  async getDatabase(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = this.openDatabase();
    this.db = await this.dbPromise;
    return this.db;
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = globalThis.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  private createObjectStores(db: IDBDatabase): void {
    // Images store
    if (!db.objectStoreNames.contains('images')) {
      const imagesStore = db.createObjectStore('images', { keyPath: 'id' });
      imagesStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    // History store
    if (!db.objectStoreNames.contains('history')) {
      db.createObjectStore('history');
    }
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    try {
      const db = await this.getDatabase();
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => {
          reject(new Error(`Failed to get item: ${request.error?.message}`));
        };
      });
    } catch (error) {
      console.error(`IndexedDB get error:`, error);
      return null;
    }
  }

  async set<T>(storeName: string, value: T, key?: string): Promise<boolean> {
    try {
      const db = await this.getDatabase();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = key ? store.put(value, key) : store.put(value);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(true);
        };
        request.onerror = () => {
          reject(new Error(`Failed to set item: ${request.error?.message}`));
        };
      });
    } catch (error) {
      console.error(`IndexedDB set error:`, error);
      return false;
    }
  }

  async delete(storeName: string, key: string): Promise<boolean> {
    try {
      const db = await this.getDatabase();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(true);
        };
        request.onerror = () => {
          reject(new Error(`Failed to delete item: ${request.error?.message}`));
        };
      });
    } catch (error) {
      console.error(`IndexedDB delete error:`, error);
      return false;
    }
  }

  async clear(storeName: string): Promise<boolean> {
    try {
      const db = await this.getDatabase();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(true);
        };
        request.onerror = () => {
          reject(new Error(`Failed to clear store: ${request.error?.message}`));
        };
      });
    } catch (error) {
      console.error(`IndexedDB clear error:`, error);
      return false;
    }
  }

  async getAllKeys(storeName: string): Promise<string[]> {
    try {
      const db = await this.getDatabase();
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAllKeys();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result as string[]);
        };
        request.onerror = () => {
          reject(new Error(`Failed to get keys: ${request.error?.message}`));
        };
      });
    } catch (error) {
      console.error(`IndexedDB getAllKeys error:`, error);
      return [];
    }
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
    }
  }
}

export const indexedDB = new IndexedDBWrapper();