import type { Transform } from "./types";

export const MAX_ZOOM = 8;

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function coverTransform(
  imgW: number,
  imgH: number,
  outW: number,
  outH: number
): Transform {
  const scale = Math.max(outW / imgW, outH / imgH);
  return { scale, ox: (outW - scale * imgW) / 2, oy: (outH - scale * imgH) / 2 };
}

export function minScaleFor(
  imgW: number,
  imgH: number,
  outW: number,
  outH: number
): number {
  return coverTransform(imgW, imgH, outW, outH).scale;
}

/** Clamp a transform so the image always fills the output frame and zoom stays in range. */
export function clampTransform(
  t: Transform,
  imgW: number,
  imgH: number,
  outW: number,
  outH: number
): Transform {
  const minScale = minScaleFor(imgW, imgH, outW, outH);
  const scale = clamp(t.scale, minScale, minScale * MAX_ZOOM);
  const minOx = outW - scale * imgW;
  const maxOx = 0;
  const minOy = outH - scale * imgH;
  const maxOy = 0;
  return {
    scale,
    ox: clamp(t.ox, minOx, maxOx),
    oy: clamp(t.oy, minOy, maxOy),
  };
}
