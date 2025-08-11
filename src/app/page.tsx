'use client';

import { ImageUpload } from '@/components/image-upload';
import { useState } from 'react';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    console.log('Selected image:', file.name, file.size, file.type);
  };

  const handleError = (error: string) => {
    console.error('Image upload error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Image Text Composer
          </h1>
          <p className="text-gray-600">
            Upload a PNG image to start adding text overlays
          </p>
        </div>

        {!selectedImage ? (
          <ImageUpload 
            onImageSelect={handleImageSelect}
            onError={handleError}
          />
        ) : (
          <div className="text-center">
            <p className="text-green-600 mb-4">
              ✅ Image uploaded: {selectedImage.name}
            </p>
            <button 
              onClick={() => setSelectedImage(null)}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Upload a different image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
