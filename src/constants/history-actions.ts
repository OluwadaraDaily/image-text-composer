import type { HistoryAction } from '@/types/history';

export const HISTORY_ACTION_TYPES = {
  ADD_TEXT_LAYER: 'add_text_layer',
  UPDATE_TEXT_CONTENT: 'update_text_content',
  UPDATE_FONT_FAMILY: 'update_font_family',
  UPDATE_FONT_SIZE: 'update_font_size',
  UPDATE_FONT_WEIGHT: 'update_font_weight',
  UPDATE_TEXT_ALIGNMENT: 'update_text_alignment',
  UPDATE_TEXT_COLOR: 'update_text_color',
  UPDATE_TEXT_OPACITY: 'update_text_opacity',
  MOVE_LAYER: 'move_layer',
  RESIZE_LAYER: 'resize_layer',
  ROTATE_LAYER: 'rotate_layer',
  DELETE_LAYER: 'delete_layer',
  REORDER_LAYERS: 'reorder_layers',
  DUPLICATE_LAYER: 'duplicate_layer',
  SET_IMAGE: 'set_image',
  CLEAR_CANVAS: 'clear_canvas',
} as const;

export function createHistoryAction(type: string, label: string): HistoryAction {
  return {
    type,
    label,
    timestamp: Date.now(),
  };
}

export function getActionLabel(type: string, details?: any): string {
  switch (type) {
    case HISTORY_ACTION_TYPES.ADD_TEXT_LAYER:
      return 'Add Text Layer';
    case HISTORY_ACTION_TYPES.UPDATE_TEXT_CONTENT:
      return `Update Text: "${details?.text?.substring(0, 20) || 'text'}${details?.text?.length > 20 ? '...' : ''}"`;
    case HISTORY_ACTION_TYPES.UPDATE_FONT_FAMILY:
      return `Change Font: ${details?.fontFamily || 'font'}`;
    case HISTORY_ACTION_TYPES.UPDATE_FONT_SIZE:
      return `Set Font Size: ${details?.fontSize || 'size'}px`;
    case HISTORY_ACTION_TYPES.UPDATE_FONT_WEIGHT:
      return `Set Font Weight: ${details?.fontWeight || 'weight'}`;
    case HISTORY_ACTION_TYPES.UPDATE_TEXT_ALIGNMENT:
      return `Align Text: ${details?.alignment || 'alignment'}`;
    case HISTORY_ACTION_TYPES.UPDATE_TEXT_COLOR:
      return 'Change Text Color';
    case HISTORY_ACTION_TYPES.UPDATE_TEXT_OPACITY:
      return `Set Opacity: ${details?.opacity || 'opacity'}%`;
    case HISTORY_ACTION_TYPES.MOVE_LAYER:
      return 'Move Layer';
    case HISTORY_ACTION_TYPES.RESIZE_LAYER:
      return 'Resize Layer';
    case HISTORY_ACTION_TYPES.ROTATE_LAYER:
      return 'Rotate Layer';
    case HISTORY_ACTION_TYPES.DELETE_LAYER:
      return 'Delete Layer';
    case HISTORY_ACTION_TYPES.REORDER_LAYERS:
      return 'Reorder Layers';
    case HISTORY_ACTION_TYPES.DUPLICATE_LAYER:
      return 'Duplicate Layer';
    case HISTORY_ACTION_TYPES.SET_IMAGE:
      return 'Set Background Image';
    case HISTORY_ACTION_TYPES.CLEAR_CANVAS:
      return 'Clear Canvas';
    default:
      return 'Unknown Action';
  }
}