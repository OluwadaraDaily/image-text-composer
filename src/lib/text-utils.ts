/**
 * Utilities for text measurement and calculation
 */

export interface TextDimensions {
  width: number;
  height: number;
}

export interface TextMetrics {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight?: number;
}

/**
 * Calculate text dimensions using a canvas context
 * This is more accurate than DOM-based measurement
 */
export function measureTextDimensions(
  text: string, 
  metrics: TextMetrics
): TextDimensions {
  // Create a temporary canvas for measurement
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    // Fallback estimation if canvas context is not available
    return estimateTextDimensions(text, metrics);
  }

  // Set font properties
  const fontWeight = metrics.fontWeight >= 600 ? 'bold' : 
                    metrics.fontWeight >= 500 ? '500' : 
                    'normal';
  ctx.font = `${fontWeight} ${metrics.fontSize}px "${metrics.fontFamily}"`;

  // Split text into lines
  const lines = text.split('\n');
  const lineHeight = metrics.lineHeight || metrics.fontSize * 1.2;

  // Measure each line and get the maximum width
  let maxWidth = 0;
  for (const line of lines) {
    const lineMetrics = ctx.measureText(line);
    maxWidth = Math.max(maxWidth, lineMetrics.width);
  }

  // Calculate total height
  const totalHeight = lines.length * lineHeight;

  return {
    width: Math.max(maxWidth, 20), // Minimum width
    height: Math.max(totalHeight, lineHeight) // Minimum height
  };
}

/**
 * Fallback estimation for text dimensions when canvas is not available
 */
export function estimateTextDimensions(
  text: string, 
  metrics: TextMetrics
): TextDimensions {
  const lines = text.split('\n');
  const lineHeight = metrics.lineHeight || metrics.fontSize * 1.2;
  
  // Rough estimation: average character width is about 0.6 of font size
  const avgCharWidth = metrics.fontSize * 0.6;
  
  // Find the longest line
  const maxLineLength = Math.max(...lines.map(line => line.length));
  const estimatedWidth = Math.max(maxLineLength * avgCharWidth, 20);
  
  // Calculate total height
  const totalHeight = Math.max(lines.length * lineHeight, lineHeight);

  return {
    width: estimatedWidth,
    height: totalHeight
  };
}

/**
 * Calculate dimensions needed for a text box with padding
 */
export function calculateTextBoxDimensions(
  text: string,
  metrics: TextMetrics,
  padding: { x: number; y: number } = { x: 16, y: 8 }
): TextDimensions {
  const textDimensions = measureTextDimensions(text, metrics);
  
  return {
    width: textDimensions.width + padding.x,
    height: textDimensions.height + padding.y
  };
}

/**
 * Auto-resize text layer dimensions based on content
 * Width stays fixed, only height expands
 */
export function autoResizeTextLayer(
  text: string,
  currentLayer: { 
    fontFamily: string; 
    fontSize: number; 
    fontWeight: number;
    width: number;
    height: number;
  },
  minDimensions: { width: number; height: number } = { width: 50, height: 24 }
): TextDimensions {
  const metrics: TextMetrics = {
    fontFamily: currentLayer.fontFamily,
    fontSize: currentLayer.fontSize,
    fontWeight: currentLayer.fontWeight,
    lineHeight: currentLayer.fontSize * 1.2
  };

  // Calculate height based on fixed width and text content
  const fixedWidth = Math.max(currentLayer.width, minDimensions.width);
  const calculatedHeight = calculateTextHeightForWidth(text, metrics, fixedWidth);

  return {
    width: fixedWidth, // Width stays exactly the same
    height: Math.max(calculatedHeight, minDimensions.height)
  };
}

/**
 * Calculate text height for a given fixed width
 */
export function calculateTextHeightForWidth(
  text: string,
  metrics: TextMetrics,
  targetWidth: number
): number {
  // Create a temporary canvas for measurement
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    // Fallback estimation
    const lines = text.split('\n');
    const lineHeight = metrics.lineHeight || metrics.fontSize * 1.2;
    const avgCharWidth = metrics.fontSize * 0.6;
    const charsPerLine = Math.floor((targetWidth - 16) / avgCharWidth); // Account for padding
    
    let totalLines = 0;
    for (const line of lines) {
      totalLines += Math.max(1, Math.ceil(line.length / charsPerLine));
    }
    
    return totalLines * lineHeight + 8; // Add padding
  }

  // Set font properties
  const fontWeight = metrics.fontWeight >= 600 ? 'bold' : 
                    metrics.fontWeight >= 500 ? '500' : 
                    'normal';
  ctx.font = `${fontWeight} ${metrics.fontSize}px "${metrics.fontFamily}"`;

  const lineHeight = metrics.lineHeight || metrics.fontSize * 1.2;
  const availableWidth = targetWidth - 16; // Account for padding
  const lines = text.split('\n');
  
  let totalLines = 0;
  
  for (const line of lines) {
    if (line.length === 0) {
      totalLines += 1; // Empty line still takes up space
      continue;
    }
    
    // Measure how many lines this text will wrap to
    const lineMetrics = ctx.measureText(line);
    const linesNeeded = Math.max(1, Math.ceil(lineMetrics.width / availableWidth));
    totalLines += linesNeeded;
  }

  return totalLines * lineHeight + 8; // Add padding
}

/**
 * Calculate optimal font size for a given text box size
 */
export function calculateOptimalFontSize(
  text: string,
  targetWidth: number,
  targetHeight: number,
  fontFamily: string,
  fontWeight: number = 400,
  minFontSize: number = 8,
  maxFontSize: number = 72
): number {
  let fontSize = maxFontSize;
  
  while (fontSize >= minFontSize) {
    const metrics: TextMetrics = {
      fontFamily,
      fontSize,
      fontWeight,
      lineHeight: fontSize * 1.2
    };
    
    const dimensions = measureTextDimensions(text, metrics);
    
    if (dimensions.width <= targetWidth && dimensions.height <= targetHeight) {
      return fontSize;
    }
    
    fontSize -= 1;
  }
  
  return minFontSize;
}