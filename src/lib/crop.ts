import type { FaceBox, Transform } from "./types";

export const MAX_ZOOM = 8;
export const FACE_MARGIN = 0.45;

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

/**
 * Suggest a crop (transform) that keeps all detected faces inside the output frame.
 * If no faces are found, falls back to a centered cover crop.
 */
export function suggestedTransform(
  faces: FaceBox[],
  imgW: number,
  imgH: number,
  outW: number,
  outH: number
): Transform {
  const cover = coverTransform(imgW, imgH, outW, outH);
  if (!faces.length) return cover;

  let ux = Infinity;
  let uy = Infinity;
  let ux2 = -Infinity;
  let uy2 = -Infinity;
  for (const f of faces) {
    ux = Math.min(ux, f.x);
    uy = Math.min(uy, f.y);
    ux2 = Math.max(ux2, f.x + f.w);
    uy2 = Math.max(uy2, f.y + f.h);
  }
  const cx = (ux + ux2) / 2;
  const cy = (uy + uy2) / 2;
  const w = ux2 - ux;
  const h = uy2 - uy;
  const roiW = w * (1 + 2 * FACE_MARGIN);
  const roiH = h * (1 + 2 * FACE_MARGIN);
  const fit = Math.max(outW / roiW, outH / roiH);

  let scale = Math.max(cover.scale, fit);
  scale = Math.min(scale, cover.scale * MAX_ZOOM);

  let ox = outW / 2 - scale * cx;
  let oy = outH / 2 - scale * cy;

  const minOx = outW - scale * imgW;
  const minOy = outH - scale * imgH;
  ox = clamp(ox, minOx, 0);
  oy = clamp(oy, minOy, 0);

  return { scale, ox, oy };
}
