type CanvasMeta = {
  width: number;       // Display width of the canvas in px
  height: number;      // Display height in px
  scale: number;       // Zoom factor
  rotation: number;    // If the entire canvas can be rotated (usually 0)
};

type ImageAsset = {
  src: string;         // Object URL or base64 data
  width: number;
  height: number;
};

export type {
  CanvasMeta,
  ImageAsset,
};