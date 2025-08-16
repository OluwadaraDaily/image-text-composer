export interface ShortcutGroup {
  title: string;
  shortcuts: Shortcut[];
}

export interface Shortcut {
  keys: string[];
  description: string;
  condition?: string;
}

export const keyboardShortcuts: ShortcutGroup[] = [
  {
    title: "Text Management",
    shortcuts: [
      {
        keys: ["T"],
        description: "Add new text layer"
      },
      {
        keys: ["Backspace"],
        description: "Delete selected layer",
        condition: "when layer is selected"
      }
    ]
  },
  {
    title: "Navigation & Selection",
    shortcuts: [
      {
        keys: ["Tab"],
        description: "Cycle to next layer"
      },
      {
        keys: ["Shift", "Tab"],
        description: "Cycle to previous layer"
      },
      {
        keys: ["Escape"],
        description: "Cancel editing or deselect layer"
      }
    ]
  },
  {
    title: "Text Editing",
    shortcuts: [
      {
        keys: ["Enter"],
        description: "Finish editing text",
        condition: "while editing"
      },
      {
        keys: ["Escape"],
        description: "Cancel text editing",
        condition: "while editing"
      }
    ]
  },
  {
    title: "Layer Positioning",
    shortcuts: [
      {
        keys: ["Arrow Keys"],
        description: "Nudge layer by 1px",
        condition: "when layer is selected"
      },
      {
        keys: ["Shift", "Arrow Keys"],
        description: "Nudge layer by 10px",
        condition: "when layer is selected"
      }
    ]
  },
  {
    title: "History",
    shortcuts: [
      {
        keys: ["Ctrl", "Z"],
        description: "Undo (Cmd+Z on Mac)"
      },
      {
        keys: ["Ctrl", "Shift", "Z"],
        description: "Redo (Cmd+Shift+Z on Mac)"
      },
      {
        keys: ["Ctrl", "Y"],
        description: "Redo (Windows alternative)"
      }
    ]
  }
];