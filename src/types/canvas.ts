type CanvasMeta = {
  width: number;
  height: number;
  scale: number;
  rotation: number;
};

type ImageAsset = {
  src: string;         // Object URL or base64 data (legacy)
  imageId?: string;    // IndexedDB image ID (new)
  width: number;
  height: number;
};

export type {
  CanvasMeta,
  ImageAsset,
};