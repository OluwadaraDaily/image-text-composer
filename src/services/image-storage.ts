import { indexedDB } from '@/db/indexeddb';

export interface StoredImage {
  id: string;
  blob: Blob;
  timestamp: number;
}

export class ImageStorageService {
  private readonly STORE_NAME = 'images';

  async saveImage(blob: Blob, id?: string): Promise<string | null> {
    try {
      const imageId = id || this.generateImageId();
      const storedImage: StoredImage = {
        id: imageId,
        blob,
        timestamp: Date.now(),
      };

      const success = await indexedDB.set(this.STORE_NAME, storedImage);
      return success ? imageId : null;
    } catch (error) {
      console.error('Failed to save image:', error);
      return null;
    }
  }

  async getImage(id: string): Promise<Blob | null> {
    try {
      const storedImage = await indexedDB.get<StoredImage>(this.STORE_NAME, id);
      return storedImage?.blob || null;
    } catch (error) {
      console.error('Failed to get image:', error);
      return null;
    }
  }

  async deleteImage(id: string): Promise<boolean> {
    try {
      return await indexedDB.delete(this.STORE_NAME, id);
    } catch (error) {
      console.error('Failed to delete image:', error);
      return false;
    }
  }

  async deleteMultipleImages(ids: string[]): Promise<void> {
    try {
      await Promise.all(ids.map(id => this.deleteImage(id)));
    } catch (error) {
      console.error('Failed to delete multiple images:', error);
    }
  }

  async getAllImageIds(): Promise<string[]> {
    try {
      return await indexedDB.getAllKeys(this.STORE_NAME);
    } catch (error) {
      console.error('Failed to get image IDs:', error);
      return [];
    }
  }

  async convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async saveImageFromBlobUrl(blobUrl: string, id?: string): Promise<string | null> {
    try {
      const response = await fetch(blobUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      return await this.saveImage(blob, id);
    } catch (error) {
      // Check if this is a blob URL that has been revoked
      if (error instanceof TypeError && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        console.warn('Blob URL has been revoked or is no longer accessible:', blobUrl);
      } else {
        console.error('Failed to save image from blob URL:', error);
      }
      return null;
    }
  }

  async saveImageFromBase64(base64: string, id?: string): Promise<string | null> {
    try {
      const response = await fetch(base64);
      const blob = await response.blob();
      return await this.saveImage(blob, id);
    } catch (error) {
      console.error('Failed to save image from base64:', error);
      return null;
    }
  }

  private generateImageId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  async clearAllImages(): Promise<boolean> {
    try {
      return await indexedDB.clear(this.STORE_NAME);
    } catch (error) {
      console.error('Failed to clear images:', error);
      return false;
    }
  }
}

export const imageStorageService = new ImageStorageService();