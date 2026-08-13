export interface Ratio {
  id: string;
  label: string;
  w: number;
  h: number;
}

export const RATIOS: Ratio[] = [
  { id: "4:5", label: "4:5", w: 4, h: 5 },
  { id: "1:1", label: "1:1", w: 1, h: 1 },
  { id: "3:2", label: "3:2", w: 3, h: 2 },
  { id: "16:9", label: "16:9", w: 16, h: 9 },
  { id: "9:16", label: "9:16", w: 9, h: 16 },
];

export const LONG_SIDE = 1080;

export function outputDims(ratio: Ratio): { outW: number; outH: number } {
  const long = Math.max(ratio.w, ratio.h);
  const outW = Math.round(LONG_SIDE * (ratio.w / long));
  const outH = Math.round(LONG_SIDE * (ratio.h / long));
  return { outW, outH };
}

export interface FaceBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Transform {
  scale: number;
  ox: number;
  oy: number;
}

export type PhotoStatus = "loading" | "detecting" | "ready" | "error";

export interface PhotoState {
  id: string;
  name: string;
  file: File;
  objectUrl: string;
  bitmap: ImageBitmap;
  imgW: number;
  imgH: number;
  status: PhotoStatus;
  faces: FaceBox[];
  transform: Transform;
  confirmed: boolean;
}

export type Step = "upload" | "review";
