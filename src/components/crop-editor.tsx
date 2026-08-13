"use client";

import * as React from "react";

import { MAX_ZOOM, clampTransform, coverTransform } from "@/lib/crop";
import { drawFaceGuides, renderScene } from "@/lib/render";
import type { PhotoState, Transform } from "@/lib/types";

interface Props {
  photo: PhotoState;
  outW: number;
  outH: number;
  overlay: HTMLImageElement | null;
  transform: Transform;
  onChangeTransform: (t: Transform) => void;
}

export function CropEditor({
  photo,
  outW,
  outH,
  overlay,
  transform,
  onChangeTransform,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [box, setBox] = React.useState<{ w: number; h: number } | null>(null);

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      const maxW = Math.max(10, r.width);
      const maxH = Math.max(10, r.height);
      const aspect = outW / outH;
      let w = maxW;
      let h = w / aspect;
      if (h > maxH) {
        h = maxH;
        w = h * aspect;
      }
      setBox({ w: Math.floor(w), h: Math.floor(h) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [outW, outH]);

  const P = box ? box.w / outW : 1;

  const onChangeRef = React.useRef(onChangeTransform);
  const transformRef = React.useRef(transform);

  React.useEffect(() => {
    onChangeRef.current = onChangeTransform;
    transformRef.current = transform;
  }, [onChangeTransform, transform]);

  // Redraw on any relevant change.
  React.useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx || !box) return;
    cv.width = box.w;
    cv.height = box.h;
    renderScene(ctx, box.w, box.h, photo.bitmap, transform, box.w / outW, overlay);
    drawFaceGuides(ctx, photo.faces, transform, box.w / outW);
  }, [photo, box, transform, overlay, outW, outH]);

  const clamp = (t: Transform) =>
    clampTransform(t, photo.imgW, photo.imgH, outW, outH);

  const drag = React.useRef<{
    id: number;
    sx: number;
    sy: number;
    ox: number;
    oy: number;
  } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    drag.current = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      ox: transform.ox,
      oy: transform.oy,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || !P) return;
    onChangeRef.current(
      clamp({
        ...transformRef.current,
        ox: d.ox + (e.clientX - d.sx) / P,
        oy: d.oy + (e.clientY - d.sy) / P,
      })
    );
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  // Native (non-passive) wheel listener so we can preventDefault / zoom.
  React.useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cur = transformRef.current;
      if (!P) return;
      const rect = cv.getBoundingClientRect();
      const cX = (e.clientX - rect.left) / P;
      const cY = (e.clientY - rect.top) / P;
      const factor = Math.pow(1.0015, -e.deltaY);
      const nextScale = Math.min(
        cur.scale * factor,
        coverTransform(photo.imgW, photo.imgH, outW, outH).scale * MAX_ZOOM
      );
      const k = nextScale / cur.scale;
      const ox = cX - (cX - cur.ox) * k;
      const oy = cY - (cY - cur.oy) * k;
      onChangeRef.current(
        clampTransform({ scale: nextScale, ox, oy }, photo.imgW, photo.imgH, outW, outH)
      );
    };
    cv.addEventListener("wheel", onWheel, { passive: false });
    return () => cv.removeEventListener("wheel", onWheel);
  }, [P, photo.imgW, photo.imgH, outW, outH]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30"
    >
      <canvas
        ref={canvasRef}
        style={{ width: box?.w ?? 0, height: box?.h ?? 0 }}
        className="touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </div>
  );
}