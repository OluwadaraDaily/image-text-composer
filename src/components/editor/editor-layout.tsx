'use client';

import { TextLayersProvider } from '@/contexts/text-layers-context';
import { EditorHeader } from '@/components/editor/editor-header';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { ReactNode } from 'react';

interface EditorLayoutProps {
  children: ReactNode;
  onReset?: () => void;
  onExport?: () => void;
}

function EditorLayoutContent({ children, onReset, onExport }: EditorLayoutProps) {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EditorHeader onReset={onReset} onExport={onExport} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

export function EditorLayout({ children, onReset, onExport }: EditorLayoutProps) {
  return (
    <TextLayersProvider>
      <EditorLayoutContent onReset={onReset} onExport={onExport}>
        {children}
      </EditorLayoutContent>
    </TextLayersProvider>
  );
}