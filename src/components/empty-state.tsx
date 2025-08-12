import { ImageUpload } from '@/components/image-upload';

interface EmptyStateProps {
  onImageSelect: (file: File) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
}

export function EmptyState({ onImageSelect, onError, isProcessing }: EmptyStateProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <ImageUpload 
        onImageSelect={onImageSelect}
        onError={onError}
      />
      {isProcessing && (
        <div className="text-center mt-4 text-gray-600">
          <div className="animate-pulse">Processing image...</div>
        </div>
      )}
    </div>
  );
}