'use client';

import { TextLayersProvider } from '@/contexts/text-layers-context';
import { EditorHeader } from '@/components/editor/editor-header';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { ReactNode } from 'react';

interface EditorLayoutProps {
  children: ReactNode;
  onReset?: () => void;
}

function EditorLayoutContent({ children, onReset }: EditorLayoutProps) {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EditorHeader onReset={onReset} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

export function EditorLayout({ children, onReset }: EditorLayoutProps) {
  return (
    <TextLayersProvider>
      <EditorLayoutContent onReset={onReset}>
        {children}
      </EditorLayoutContent>
    </TextLayersProvider>
  );
}