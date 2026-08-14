"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Delete02Icon, ImageAdd02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { RATIOS, RESOLUTIONS, outputDims, type Ratio } from "@/lib/types";
import { cn } from "@/lib/utils";

const RESOLUTION_LABELS: Record<number, string> = {
  720: "HD",
  1080: "Full HD",
  1440: "2K QHD",
  2160: "4K UHD",
};

interface Props {
  overlay: HTMLImageElement | null;
  overlayName: string | null;
  onUploadCustom: (file: File) => void;
  onRemoveFrame: () => void;
  ratio: Ratio;
  onRatioChange: (r: Ratio) => void;
  resolution: number;
  onResolutionChange: (r: number) => void;
  customInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function FramesPanel({
  overlay,
  overlayName,
  onUploadCustom,
  onRemoveFrame,
  ratio,
  onRatioChange,
  resolution,
  onResolutionChange,
  customInputRef,
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resolvedRef = customInputRef ?? inputRef;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Frame</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => resolvedRef.current?.click()}
        >
          <HugeiconsIcon icon={ImageAdd02Icon} className="size-4" />
          {overlay ? "Replace frame" : "Upload your frame"}
        </Button>
        <input
          ref={resolvedRef}
          type="file"
          accept="image/png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUploadCustom(f);
            e.currentTarget.value = "";
          }}
        />
        {overlay && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-border p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={overlay.src}
              alt="frame preview"
              className="size-8 shrink-0 rounded border border-border object-contain"
            />
            <span className="min-w-0 flex-1 truncate text-xs font-medium">
              {overlayName}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Remove frame"
              onClick={onRemoveFrame}
            >
              <HugeiconsIcon icon={Delete02Icon} />
            </Button>
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Aspect ratio
        </p>
        <ToggleGroup
          value={[ratio.id]}
          onValueChange={(v) => {
            const next = RATIOS.find((r) => r.id === v[0]);
            if (next) onRatioChange(next);
          }}
          variant="outline"
          className="flex-wrap"
        >
          {RATIOS.map((r) => (
            <ToggleGroupItem
              key={r.id}
              value={r.id}
              className="min-w-12 flex-1 rounded-full"
            >
              {r.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Resolution
          </p>
          <span className="text-xs text-muted-foreground/70">
            {(() => {
              const { outW, outH } = outputDims(ratio, resolution);
              return `${outW} × ${outH}`;
            })()}
            px
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {RESOLUTIONS.map((r) => {
            const selected = r === resolution;
            return (
              <button
                key={r}
                type="button"
                onClick={() => onResolutionChange(r)}
                aria-pressed={selected}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors",
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/40",
                )}
              >
                <span className="font-medium">
                  {RESOLUTION_LABELS[r] ?? `${r}`}
                </span>
                <span className="text-muted-foreground">{r}px</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
