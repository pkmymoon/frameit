import type { Transform } from "./types";

/**
 * Render the framed scene onto a canvas.
 * @param cw,ch - canvas pixel dimensions
 * @param bitmap - decoded (orientation-corrected) image
 * @param t - transform in output-canvas coordinates
 * @param P - preview scale factor (canvas px per output px); 1 for full export
 * @param overlay - optional transparent PNG drawn full-frame on top
 */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  bitmap: ImageBitmap,
  t: Transform,
  P: number,
  overlay?: HTMLImageElement | null
): void {
  const W = cw;
  const H = ch;
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, t.ox * P, t.oy * P, t.scale * P * bitmap.width, t.scale * P * bitmap.height);
  if (overlay) {
    ctx.drawImage(overlay, 0, 0, W, H);
  }
  ctx.restore();
}