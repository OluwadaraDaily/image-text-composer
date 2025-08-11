'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onError?: (error: string) => void;
}

export function ImageUpload({ onImageSelect, onError }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateFile = useCallback((file: File): boolean => {
    // Check file type - PNG only
    if (file.type !== 'image/png') {
      const error = 'Only PNG files are supported';
      toast.error(error);
      onError?.(error);
      return false;
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const error = 'File size must be less than 10MB';
      toast.error(error);
      onError?.(error);
      return false;
    }

    return true;
  }, [onError]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!validateFile(file)) return;

    setIsProcessing(true);
    try {
      onImageSelect(file);
      toast.success('Image uploaded successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process image';
      toast.error(message);
      onError?.(message);
    } finally {
      setIsProcessing(false);
    }
  }, [onImageSelect, onError, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    console.log('handleDrop event =>', e);
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileInputChange event =>', e);
    handleFiles(e.target.files);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-white'
          }
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 mb-4">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            ) : (
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload a PNG image
            </h3>
            <p className="text-sm text-gray-600">
              Drag and drop your PNG file here, or click to browse
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="relative"
              disabled={isProcessing}
              onClick={(event) => {
                event.stopPropagation();
                document.getElementById('file-input')?.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Choose File'}
            </Button>
            
            <Input
              id="file-input"
              type="file"
              accept=".png,image/png"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isProcessing}
            />
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Supported: PNG files only • Max size: 10MB
          </div>
        </div>
      </div>
    </div>
  );
}