'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { TextLayer } from '@/types';
import { autoResizeTextLayer } from '@/lib/text-utils';

interface MultiLineTextEditorProps {
  layer: TextLayer;
  onTextChange: (text: string) => void;
  onDimensionChange: (width: number, height: number) => void;
  onFinish: () => void;
  onCancel: () => void;
}

export function MultiLineTextEditor({
  layer,
  onTextChange,
  onDimensionChange,
  onFinish,
  onCancel
}: MultiLineTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(layer.text);
  const [dimensions, setDimensions] = useState({
    width: layer.width,
    height: layer.height
  });

  // Calculate text dimensions - width stays fixed, only height auto-expands
  const calculateTextDimensions = useCallback((textContent: string) => {
    if (!textContent.trim()) {
      // For empty text, return current width with minimum height
      return {
        width: layer.width, // Keep current width
        height: Math.max(layer.fontSize * 1.4, 24) // Minimum height
      };
    }

    // Use the utility function but keep width fixed
    const newDimensions = autoResizeTextLayer(
      textContent,
      {
        fontFamily: layer.fontFamily,
        fontSize: layer.fontSize,
        fontWeight: layer.fontWeight,
        width: layer.width,
        height: layer.height
      },
      { width: layer.width, height: layer.fontSize * 1.4 } // Use current width as minimum
    );
    
    // Only allow height to change, keep width fixed
    return {
      width: layer.width, // Width stays exactly the same
      height: newDimensions.height // Only height can expand
    };
  }, [layer.fontFamily, layer.fontSize, layer.fontWeight, layer.width, layer.height]);

  // Auto-resize on text change
  useEffect(() => {
    const newDimensions = calculateTextDimensions(text);
    
    // Only update if dimensions actually changed to avoid infinite loops
    if (newDimensions.width !== dimensions.width || newDimensions.height !== dimensions.height) {
      setDimensions(newDimensions);
      onDimensionChange(newDimensions.width, newDimensions.height);
    }
  }, [text, calculateTextDimensions, dimensions.width, dimensions.height, onDimensionChange]);

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onTextChange(newText);
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent conflicts with global shortcuts
    
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      // Ctrl/Cmd + Enter to finish editing
      e.preventDefault();
      onFinish();
    } else if (e.key === 'Escape') {
      // Escape to cancel
      e.preventDefault();
      onCancel();
    }
    // Allow normal Enter for new lines
  };

  // Auto-focus and select on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  // Calculate font weight style
  const fontWeightStyle = layer.fontWeight >= 600 ? 'bold' : 
                         layer.fontWeight >= 500 ? '500' : 
                         'normal';

  return (
    <>
      {/* Hidden measuring div to calculate text dimensions */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          fontSize: `${layer.fontSize}px`, // Keep font size fixed
          fontFamily: layer.fontFamily,
          fontWeight: fontWeightStyle,
          lineHeight: '1.2',
          width: `${Math.max(layer.width - 16, 50)}px`, // Use fixed layer width
          padding: '4px 8px',
          border: '2px solid transparent', // Match textarea border
          top: '-9999px',
          left: '-9999px',
        }}
        aria-hidden="true"
      />
      
      {/* Actual editing textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onBlur={onFinish}
        placeholder="Type your text here..."
        className="absolute border-2 border-blue-500 bg-white bg-opacity-95 backdrop-blur-sm resize-none overflow-hidden outline-none shadow-lg"
        style={{
          left: `${layer.x}px`,
          top: `${layer.y}px`,
          transform: `rotate(${layer.rotation}deg)`,
          transformOrigin: `${dimensions.width / 2}px ${dimensions.height / 2}px`,
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          fontSize: `${layer.fontSize}px`,
          fontFamily: layer.fontFamily,
          fontWeight: fontWeightStyle,
          textAlign: layer.alignment as any,
          color: `rgba(${layer.color.r}, ${layer.color.g}, ${layer.color.b}, ${layer.color.a})`,
          opacity: layer.opacity,
          zIndex: 1000,
          lineHeight: '1.2',
          padding: '4px 8px',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          borderRadius: '4px',
        }}
      />
      
      {/* Helper text overlay */}
      <div
        className="absolute text-xs text-gray-500 bg-white bg-opacity-90 px-2 py-1 rounded-md shadow-md pointer-events-none"
        style={{
          left: `${layer.x}px`,
          top: `${layer.y + dimensions.height + 8}px`,
          zIndex: 1001,
          transform: layer.rotation !== 0 ? `rotate(${layer.rotation}deg)` : undefined,
          transformOrigin: layer.rotation !== 0 ? `0 0` : undefined,
        }}
      >
        Press Ctrl+Enter to finish, Esc to cancel
      </div>
    </>
  );
}