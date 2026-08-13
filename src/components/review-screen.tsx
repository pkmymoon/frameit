"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  Maximize01Icon,
  Move01Icon,
  Refresh01Icon,
  SparklesIcon,
  Zip01Icon,
  ZoomInAreaIcon,
  ZoomOutAreaIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";
import { CropEditor } from "@/components/crop-editor";
import { MAX_ZOOM, clampTransform, coverTransform } from "@/lib/crop";
import { outputDims, type PhotoState, type Ratio } from "@/lib/types";

interface Props {
  photos: PhotoState[];
  currentIndex: number;
  ratio: Ratio;
  overlay: HTMLImageElement | null;
  exporting: boolean;
  onSelect: (i: number) => void;
  onTransformChange: (i: number, t: PhotoState["transform"]) => void;
  onConfirm: (i: number) => void;
  onReset: (i: number) => void;
  onBack: () => void;
  onExport: () => void;
}

export function ReviewScreen({
  photos,
  currentIndex,
  ratio,
  overlay,
  exporting,
  onSelect,
  onTransformChange,
  onConfirm,
  onReset,
  onBack,
  onExport,
}: Props) {
  const { outW, outH } = outputDims(ratio);
  const photo = photos[currentIndex];
  const confirmedCount = photos.filter((p) => p.confirmed).length;
  const minScale = coverTransform(photo.imgW, photo.imgH, outW, outH).scale;

  const setTransform = (t: PhotoState["transform"]) =>
    onTransformChange(currentIndex, clampTransform(t, photo.imgW, photo.imgH, outW, outH));

  const zoomCenter = (factor: number) => {
    const t = photo.transform;
    const k = Math.min(Math.max(t.scale * factor, minScale), minScale * MAX_ZOOM) / t.scale;
    const scale = t.scale * k;
    const ox = outW / 2 - (outW / 2 - t.ox) * k;
    const oy = outH / 2 - (outH / 2 - t.oy) * k;
    setTransform({ scale, ox, oy });
  };

  const reset = () =>
    onReset(currentIndex);

  const confirmAndNext = () => {
    onConfirm(currentIndex);
    if (currentIndex < photos.length - 1) onSelect(currentIndex + 1);
  };

  const go = (delta: number) => {
    const next = Math.min(photos.length - 1, Math.max(0, currentIndex + delta));
    onSelect(next);
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-0 w-full max-w-6xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
              Photos
            </Button>
            <span className="text-sm font-medium">Framing photos</span>
            <Badge variant="secondary">
              {currentIndex + 1} / {photos.length}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {confirmedCount} confirmed
            </span>
            <Button onClick={onExport} disabled={exporting || photos.length === 0} className="gap-2">
              <HugeiconsIcon icon={Zip01Icon} data-icon="inline-start" />
              {exporting ? "Exporting…" : `Export ZIP (${photos.length})`}
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-4">
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <CropEditor
                key={photo.id + ratio.id}
                photo={photo}
                outW={outW}
                outH={outH}
                overlay={overlay}
                transform={photo.transform}
                onChangeTransform={setTransform}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <HugeiconsIcon icon={Move01Icon} className="size-3.5" /> Drag to pan
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <HugeiconsIcon icon={Maximize01Icon} className="size-3.5" /> Scroll to zoom
                </span>
                {photo.faces.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                    <HugeiconsIcon icon={SparklesIcon} className="size-3.5" /> Auto-cropped to {photo.faces.length} face
                    {photo.faces.length > 1 ? "s" : ""} (amber boxes)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="icon-sm" onClick={reset} aria-label="Reset crop" />}>
                    <HugeiconsIcon icon={Refresh01Icon} />
                  </TooltipTrigger>
                  <TooltipContent>Reset to suggested crop</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="icon-sm" onClick={() => zoomCenter(1 / 1.25)} aria-label="Zoom out" />}>
                    <HugeiconsIcon icon={ZoomOutAreaIcon} />
                  </TooltipTrigger>
                  <TooltipContent>Zoom out</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="icon-sm" onClick={() => zoomCenter(1.25)} aria-label="Zoom in" />}>
                    <HugeiconsIcon icon={ZoomInAreaIcon} />
                  </TooltipTrigger>
                  <TooltipContent>Zoom in</TooltipContent>
                </Tooltip>
                <Button variant="default" onClick={confirmAndNext} className="ml-1 gap-2">
                  {photo.confirmed ? (
                    <HugeiconsIcon icon={CircleCheckIcon} data-icon="inline-start" />
                  ) : (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} data-icon="inline-start" />
                  )}
                  {currentIndex < photos.length - 1 ? "Confirm & next" : "Confirm"}
                </Button>
              </div>
            </div>
          </div>

          <div className="order-first shrink-0 lg:order-none">
            <div className="flex h-max max-h-[60vh] gap-2 overflow-x-auto lg:max-h-full lg:w-28 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelect(i)}
                  className={cn(
                    "relative shrink-0 overflow-hidden rounded-lg border-2 lg:aspect-square",
                    i === currentIndex ? "border-primary" : "border-border opacity-70 hover:opacity-100"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.objectUrl} alt={p.name} className="size-16 object-cover lg:size-full min-w-16 min-h-full" />
                  {p.confirmed && (
                    <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-primary py-0.5 text-primary-foreground">
                      <HugeiconsIcon icon={CircleCheckIcon} className="size-3.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => go(-1)} disabled={currentIndex === 0}>
            <HugeiconsIcon icon={ChevronLeftIcon} data-icon="inline-start" />
            Previous
          </Button>
          <div className="w-40">
            <Progress value={photos.length ? (currentIndex + 1) / photos.length * 100 : 0} />
          </div>
          <Button variant="ghost" size="sm" onClick={() => go(1)} disabled={currentIndex === photos.length - 1}>
            Next
            <HugeiconsIcon icon={ChevronRightIcon} data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}