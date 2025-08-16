'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KeyboardShortcutsModal } from '@/components/keyboard-shortcuts-modal';

export function HelpButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-white border-2 hover:scale-105"
        title="View keyboard shortcuts"
      >
        <HelpCircle className="w-5 h-5" />
      </Button>
      
      <KeyboardShortcutsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}