"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ArrowRight01Icon,
  CircleCheckIcon,
  Delete02Icon,
  ImageAdd01Icon,
  Loading01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";
import { RATIOS, type PhotoState, type Ratio } from "@/lib/types";

interface Props {
  ratio: Ratio;
  onRatioChange: (r: Ratio) => void;
  overlay: HTMLImageElement | null;
  overlayName: string | null;
  onOverlayFile: (file: File) => void;
  onRemoveOverlay: () => void;
  photos: PhotoState[];
  onAddFiles: (files: File[]) => void;
  onRemovePhoto: (id: string) => void;
  onStart: () => void;
}

export function UploadScreen({
  ratio,
  onRatioChange,
  overlay,
  overlayName,
  onOverlayFile,
  onRemoveOverlay,
  photos,
  onAddFiles,
  onRemovePhoto,
  onStart,
}: Props) {
  const overlayInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const busy = photos.some((p) => p.status === "loading" || p.status === "detecting");
  const ready = photos.filter((p) => p.status === "ready").length;

  const handlePhotos = (list: FileList | null) => {
    if (!list) return;
    onAddFiles(Array.from(list));
  };

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Frame your event photos</CardTitle>
          <CardDescription>
            Fully local — photos never leave your browser. Add a transparent overlay PNG, pick a frame, then
            upload your photos. Face detection will suggest a crop so no one is cut off.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                <HugeiconsIcon icon={ImageAdd01Icon} data-icon="inline-start" />
                Frame ratio
              </span>
            </CardDescription>
            <CardTitle className="text-lg">Output frame</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ToggleGroup
              value={[ratio.id]}
              onValueChange={(v) => {
                const id = v[0];
                const next = RATIOS.find((r) => r.id === id);
                if (next) onRatioChange(next);
              }}
              variant="outline"
            >
              {RATIOS.map((r) => (
                <ToggleGroupItem key={r.id} value={r.id} className="min-w-14">
                  {r.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                <HugeiconsIcon icon={ImageAdd01Icon} data-icon="inline-start" />
                Transparent PNG overlay
              </span>
            </CardDescription>
            <CardTitle className="text-lg">Event details overlay</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {overlay ? (
              <div className="flex items-center gap-3 rounded-lg border border-border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={overlay.src}
                  alt="overlay preview"
                  className="size-14 shrink-0 rounded-md border border-border object-contain"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-sm font-medium">{overlayName}</span>
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <HugeiconsIcon icon={CircleCheckIcon} /> Overlay set
                  </span>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label="Remove overlay" onClick={onRemoveOverlay}>
                  <HugeiconsIcon icon={Delete02Icon} />
                </Button>
              </div>
            ) : (
              <Empty className="border-dashed py-8">
                <EmptyContent>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={ImageAdd01Icon} />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>No overlay yet</EmptyTitle>
                    <EmptyDescription>Add the event-banner PNG with transparent background.</EmptyDescription>
                  </EmptyHeader>
                </EmptyContent>
                <Button variant="outline" onClick={() => overlayInputRef.current?.click()}>
                  Upload overlay PNG
                </Button>
              </Empty>
            )}
            <input
              ref={overlayInputRef}
              type="file"
              accept="image/png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onOverlayFile(f);
                e.currentTarget.value = "";
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
          <CardDescription>
            Select or drag in as many photos as you like. They are processed entirely in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handlePhotos(e.dataTransfer.files);
            }}
            className={cn(
              "flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center text-sm text-muted-foreground transition-colors",
              dragOver ? "border-primary bg-muted/40" : "border-border hover:border-primary/60"
            )}
          >
            <HugeiconsIcon icon={ImageAdd01Icon} className="size-7 text-muted-foreground" />
            <span className="font-medium">Click to select or drop photos here</span>
            <span>JPG, PNG, WebP — all processed locally</span>
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handlePhotos(e.target.files);
              e.currentTarget.value = "";
            }}
          />

          {photos.length > 0 && (
            <>
              <Separator />
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {photos.map((p) => (
                  <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.objectUrl} alt={p.name} className="size-full object-cover" />
                    <div className="absolute inset-x-0 top-0 flex justify-end p-1">
                      <button
                        type="button"
                        aria-label={`Remove ${p.name}`}
                        onClick={() => onRemovePhoto(p.id)}
                        className="rounded-md bg-background/80 p-1 text-muted-foreground hover:text-foreground"
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                      </button>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 flex justify-center p-1">
                      {p.status === "loading" || p.status === "detecting" ? (
                        <Badge variant="outline" className="flex items-center gap-1 bg-background/80 text-xs">
                          <HugeiconsIcon icon={Loading01Icon} className="animate-spin" /> Detecting faces
                        </Badge>
                      ) : p.faces.length > 0 ? (
                        <Badge className="flex items-center gap-1 bg-background/80 text-xs">
                          <HugeiconsIcon icon={SparklesIcon} className="size-3" /> {p.faces.length} face{p.faces.length > 1 ? "s" : ""}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-background/80 text-xs">
                          No faces found
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {ready} of {photos.length} photos have face detection results.
                </p>
                <Button onClick={onStart} disabled={busy || photos.length === 0} className="gap-2">
                  Frame & review{" "}
                  <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}