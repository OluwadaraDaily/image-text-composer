# Image Text Composer

A powerful, desktop-only image editing tool that enables users to upload PNG images and overlay them with fully customizable text layers. Built with Next.js, TypeScript, and Konva for smooth canvas interactions.

## Setup and Run Instructions

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd image-text-composer

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Development
```bash
# Run the development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Build for Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Linting
```bash
npm run lint
```

## Architecture Overview

The application follows a modular, component-based architecture with clear separation of concerns:

### Core Components
- **Canvas System**: Built on Konva/React-Konva for high-performance 2D rendering
- **State Management**: Context-based architecture with history management
- **Storage Layer**: IndexedDB for persistent data storage
- **Type System**: Comprehensive TypeScript definitions

### Key Directories
```
src/
├── components/           # React components
│   ├── canvas/          # Canvas-related components
│   ├── editor/          # Editor layout and header
│   ├── history/         # Undo/redo controls
│   ├── text-controls/   # Text styling controls
│   └── ui/              # Reusable UI components
├── contexts/            # React contexts for state management
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── services/            # Data services (storage, etc.)
├── types/               # TypeScript type definitions
└── helpers/             # Helper functions
```

### State Management
- **Editor History Context**: Manages undo/redo history with configurable limits
- **Text Layers Context**: Handles text layer operations and transformations
- **Persistent Storage**: Automatic saving to IndexedDB with restoration on reload

## Technology Choices and Trade-offs

### Core Technologies

| Technology | Purpose | Trade-offs |
|------------|---------|------------|
| **Next.js 15** | React framework | ✅ SSR, App Router, Performance<br/>❌ Slightly heavier than vanilla React |
| **TypeScript** | Type safety | ✅ Better DX, fewer runtime errors<br/>❌ Additional build complexity |
| **Konva/React-Konva** | Canvas rendering | ✅ High performance, rich API<br/>❌ Learning curve, bundle size |
| **Tailwind CSS** | Styling | ✅ Rapid development, consistency<br/>❌ Large initial CSS bundle |
| **Radix UI** | Component primitives | ✅ Accessibility, customization<br/>❌ Additional dependencies |

### Design Decisions

1. **Canvas Choice**: Konva over HTML5 Canvas for better React integration and transformation handling
2. **Storage Strategy**: IndexedDB over localStorage for larger storage capacity and blob support
3. **State Architecture**: Context over Redux for simpler setup and sufficient complexity
4. **Font Loading**: Google Fonts API with dynamic loading for better performance
5. **History Management**: Custom implementation for fine-grained control over undo/redo

## Implemented Bonus Features

### ✅ Core Features (All Implemented)
- ✅ PNG image upload with aspect ratio preservation
- ✅ Multiple text layers with full editing capabilities
- ✅ Font family selection (all Google Fonts)
- ✅ Font size, weight, color, opacity, alignment controls
- ✅ Multi-line text editing
- ✅ Drag, resize, rotate transformations
- ✅ Layer reordering
- ✅ Snap-to-center guides
- ✅ Arrow key nudging
- ✅ Undo/Redo (20+ steps with history indicator)
- ✅ Autosave to localStorage with restoration
- ✅ Reset functionality
- ✅ PNG export with original dimensions

### ✅ Implemented Bonus Features
- **🎯 Lock/Unlock Layers**: Text layers can be locked to prevent accidental modification
- **🎯 Layer Management**: Advanced layer controls with visibility and locking
- **🎯 Multi-line Text Support**: Enhanced text editing with automatic resizing
- **🎯 Smart Font Loading**: Dynamic Google Fonts loading with caching
- **🎯 Enhanced Canvas UX**: 
  - Smooth transformations with visual feedback
  - Snap-to-center guidelines
  - Precise keyboard nudging (arrow keys)
  - Context menus for layer operations
- **🎯 Advanced Export System**: 
  - PNG export maintaining original image dimensions
  - Project export/import functionality
- **🎯 Responsive Design**: Optimized for desktop with size guards
- **🎯 Performance Optimizations**:
  - Image caching in IndexedDB
  - Efficient re-rendering with React optimization patterns
  - Font preloading for popular typefaces

### ❌ Not Implemented
- Custom font upload (TTF/OTF/WOFF)
- Multi-select with group transforms
- Smart spacing hints between layers
- Line-height and letter-spacing controls
- Text shadow effects
- Curved/warped text along paths

## Known Limitations

### Technical Limitations
1. **Desktop Only**: Not optimized for mobile/touch interfaces
2. **PNG Only**: Limited to PNG format for import/export
3. **Memory Usage**: Large images may impact performance on lower-end devices
4. **Browser Compatibility**: Requires modern browsers with Canvas and IndexedDB support
5. **Font Loading**: Initial font loading may cause brief delays

### UX Limitations
1. **Complex Text Formatting**: No rich text editing (bold/italic within text)
2. **Vector Graphics**: No vector shape tools beyond text
3. **Image Editing**: No built-in image adjustment tools (brightness, contrast, etc.)
4. **Collaboration**: Single-user application with no real-time collaboration
5. **Batch Operations**: No multi-select for bulk layer operations

### Performance Considerations
1. **Large Images**: Performance may degrade with very large images (>4K resolution)
2. **Many Layers**: Canvas performance decreases with 50+ text layers
3. **Font Loading**: Network-dependent font loading may cause temporary layout shifts
4. **Memory Management**: Undo history is limited to prevent memory issues

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing
This project follows standard React/TypeScript development practices. Please ensure TypeScript compilation and linting pass before submitting changes.
