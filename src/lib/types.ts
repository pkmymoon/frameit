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

export const SHORT_SIDE = 2160;

export const RESOLUTIONS: number[] = [720, 1080, 1440, 2160];

/** Output pixel dimensions where the shorter side equals `shortSide`. */
export function outputDims(
  ratio: Ratio,
  shortSide: number = SHORT_SIDE,
): { outW: number; outH: number } {
  const short = Math.min(ratio.w, ratio.h);
  const scale = shortSide / short;
  const outW = Math.round(scale * ratio.w);
  const outH = Math.round(scale * ratio.h);
  return { outW, outH };
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
  transform: Transform;
  confirmed: boolean;
}

export type AppStep = "frame" | "photos" | "review";
