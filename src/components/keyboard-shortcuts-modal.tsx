'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { keyboardShortcuts, type ShortcutGroup, type Shortcut } from '@/data/keyboard-shortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function KeybindingDisplay({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          {index > 0 && <span className="text-gray-400 text-sm">+</span>}
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </div>
  );
}

function ShortcutItem({ shortcut }: { shortcut: Shortcut }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <div className="text-sm text-gray-900">{shortcut.description}</div>
        {shortcut.condition && (
          <div className="text-xs text-gray-500 mt-0.5">{shortcut.condition}</div>
        )}
      </div>
      <KeybindingDisplay keys={shortcut.keys} />
    </div>
  );
}

function ShortcutGroup({ group }: { group: ShortcutGroup }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
        {group.title}
      </h3>
      <div className="space-y-1">
        {group.shortcuts.map((shortcut, index) => (
          <ShortcutItem key={index} shortcut={shortcut} />
        ))}
      </div>
    </div>
  );
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-4rem)]">
          {keyboardShortcuts.map((group, index) => (
            <ShortcutGroup key={index} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
}