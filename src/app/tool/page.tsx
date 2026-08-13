"use client";

import * as React from "react";

import Link from "next/link";
import { toast } from "sonner";

import { CropEditor } from "@/components/crop-editor";
import { FramesPanel } from "@/components/frames-panel";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { clampTransform, coverTransform, MAX_ZOOM } from "@/lib/crop";
import { renderScene } from "@/lib/render";
import {
  outputDims,
  RATIOS,
  SHORT_SIDE,
  type PhotoState,
  type Ratio,
  type Transform,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Delete02Icon,
  FrameIcon,
  ImageAdd01Icon,
  ImageAdd02Icon,
  Move01Icon,
  Refresh01Icon,
  Zip01Icon,
  ZoomInAreaIcon,
  ZoomOutAreaIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const ZOOM_BUTTONS = 1.25;

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type MobileTab = "frame" | "photos" | null;

export default function ToolPage() {
  const [ratio, setRatio] = React.useState<Ratio>(RATIOS[0]);
  const [resolution, setResolution] = React.useState<number>(SHORT_SIDE);
  const [photos, setPhotos] = React.useState<PhotoState[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [overlay, setOverlay] = React.useState<HTMLImageElement | null>(null);
  const [overlayName, setOverlayName] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [mobileTab, setMobileTab] = React.useState<MobileTab>(null);

  const overlayUrlRef = React.useRef<string | null>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const frameInputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const { outW, outH } = outputDims(ratio, resolution);
  const photo = photos[selectedIndex] ?? photos[0];

  React.useEffect(() => {
    return () => {
      if (overlayUrlRef.current) URL.revokeObjectURL(overlayUrlRef.current);
    };
  }, []);

  const updatePhoto = (id: string, patch: Partial<PhotoState>) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  };

  const setOverlayImage = async (src: string, name: string) => {
    const img = new Image();
    img.src = src;
    try {
      await img.decode();
      if (overlayUrlRef.current) URL.revokeObjectURL(overlayUrlRef.current);
      overlayUrlRef.current = src;
      setOverlay(img);
      setOverlayName(name);
      const aspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
      const closest = RATIOS.reduce((best, r) =>
        Math.abs(r.w / r.h - aspect) < Math.abs(best.w / best.h - aspect)
          ? r
          : best,
      );
      setRatio(closest);
    } catch {
      URL.revokeObjectURL(src);
      toast.error("Could not load that frame");
    }
  };

  const addCustomOverlay = async (file: File) => {
    const url = URL.createObjectURL(file);
    await setOverlayImage(url, file.name);
    toast.success("Custom frame added");
  };

  const removeOverlay = () => {
    if (overlayUrlRef.current) URL.revokeObjectURL(overlayUrlRef.current);
    overlayUrlRef.current = null;
    setOverlay(null);
    setOverlayName(null);
  };

  const addFiles = (files: File[]) => {
    const filesOnly = files.filter((f) => f.type.startsWith("image/"));
    if (!filesOnly.length) {
      toast.error("Please choose image files");
      return;
    }
    const firstBatch = photos.length === 0;
    const newPhotos: PhotoState[] = filesOnly.map((file) => ({
      id: makeId(),
      name: file.name,
      file,
      objectUrl: URL.createObjectURL(file),
      bitmap: null as unknown as ImageBitmap,
      imgW: 1,
      imgH: 1,
      status: "loading",
      transform: { scale: Math.max(outW, outH), ox: 0, oy: 0 },
      confirmed: true,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (firstBatch) setSelectedIndex(0);

    (async () => {
      for (const p of newPhotos) {
        try {
          let bitmap: ImageBitmap;
          try {
            bitmap = await createImageBitmap(p.file, {
              imageOrientation: "from-image",
            });
          } catch {
            bitmap = await createImageBitmap(p.file);
          }
          const imgW = bitmap.width || 1;
          const imgH = bitmap.height || 1;
          const out = outputDims(ratio, resolution);
          const transform = coverTransform(imgW, imgH, out.outW, out.outH);
          updatePhoto(p.id, { bitmap, imgW, imgH, transform, status: "ready" });
        } catch (err) {
          console.error(err);
          updatePhoto(p.id, { status: "error" });
        }
      }
    })();
  };

  const removePhoto = (id: string) => {
    const idx = photos.findIndex((p) => p.id === id);
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.objectUrl) URL.revokeObjectURL(target.objectUrl);
      return prev.filter((p) => p.id !== id);
    });
    setSelectedIndex((i) => {
      if (idx === -1) return i;
      if (i === idx) return Math.max(0, idx - 1);
      if (i > idx) return i - 1;
      return i;
    });
  };

  const changeTransform = (i: number, t: Transform) => {
    setPhotos((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, transform: t } : p)),
    );
  };

  const resetPhoto = (i: number) => {
    setPhotos((prev) =>
      prev.map((p, idx) =>
        idx === i && p.status === "ready"
          ? { ...p, transform: coverTransform(p.imgW, p.imgH, outW, outH) }
          : p,
      ),
    );
  };

  const zoomCenter = (i: number, factor: number) => {
    const p = photos[i];
    if (!p || p.status !== "ready") return;
    const out = outputDims(ratio, resolution);
    const minScale = coverTransform(p.imgW, p.imgH, out.outW, out.outH).scale;
    const t = p.transform;
    const nextScale = Math.min(
      Math.max(t.scale * factor, minScale),
      minScale * MAX_ZOOM,
    );
    const k = nextScale / t.scale;
    const ox = out.outW / 2 - (out.outW / 2 - t.ox) * k;
    const oy = out.outH / 2 - (out.outH / 2 - t.oy) * k;
    changeTransform(
      i,
      clampTransform(
        { scale: nextScale, ox, oy },
        p.imgW,
        p.imgH,
        out.outW,
        out.outH,
      ),
    );
  };

  const exportZip = async () => {
    const readyPhotos = photos.filter((p) => p.status === "ready");
    if (!readyPhotos.length) {
      toast.error("Nothing to export yet — add some photos first");
      return;
    }
    setExporting(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const { outW: w, outH: h } = outputDims(ratio, resolution);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;

      for (let i = 0; i < readyPhotos.length; i++) {
        const p = readyPhotos[i];
        renderScene(ctx, w, h, p.bitmap, p.transform, 1, overlay);
        const blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob(
            (b) => (b ? res(b) : rej(new Error("encode failed"))),
            "image/jpeg",
            0.92,
          ),
        );
        zip.file(`photo-${String(i + 1).padStart(3, "0")}.jpg`, blob);
        await new Promise((r) => setTimeout(r, 0));
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "framed-photos.zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      toast.success(
        `Exported ${readyPhotos.length} framed ${readyPhotos.length === 1 ? "photo" : "photos"}`,
      );
    } catch (err) {
      console.error(err);
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const readyCount = photos.filter((p) => p.status === "ready").length;
  const busy = photos.some((p) => p.status === "loading");

  const selectIndex = (i: number) => {
    setSelectedIndex(i);
    setMobileTab(null);
  };

  const navPhotos = (delta: number) => {
    if (!photos.length) return;
    setSelectedIndex((i) =>
      Math.min(photos.length - 1, Math.max(0, i + delta)),
    );
    setMobileTab(null);
  };

  return (
    <TooltipProvider>
      <div className="flex h-dvh flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/80 px-3 backdrop-blur sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 font-heading text-base font-semibold tracking-tight"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon icon={FrameIcon} className="size-4" />
              </span>
              <span className="hidden sm:inline">FrameIt</span>
            </Link>
            <span className="mx-2 hidden h-5 w-px bg-border sm:block" />
            <span className="text-xs text-muted-foreground sm:text-sm">
              {photos.length
                ? `${photos.length} photo${photos.length === 1 ? "" : "s"}`
                : "Untitled"}
            </span>
          </div>
          <Button
            onClick={() => void exportZip()}
            disabled={exporting || busy || readyCount === 0}
            className="gap-2"
            size="sm"
          >
            <HugeiconsIcon icon={Zip01Icon} data-icon="inline-start" />
            <span className="hidden sm:inline">
              {exporting ? "Exporting…" : "Export ZIP"}
            </span>
            <span className="sm:hidden">{exporting ? "…" : readyCount}</span>
          </Button>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-border p-4 lg:block">
            <FramesPanel
              overlay={overlay}
              overlayName={overlayName}
              onUploadCustom={addCustomOverlay}
              onRemoveFrame={removeOverlay}
              ratio={ratio}
              onRatioChange={setRatio}
              resolution={resolution}
              onResolutionChange={setResolution}
              customInputRef={frameInputRef}
            />
          </aside>

          <section className="relative flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4">
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <div className="flex min-h-[min(50dvh,32rem)] flex-1 gap-1">
                <button
                  type="button"
                  onClick={() => navPhotos(-1)}
                  disabled={!photos.length || selectedIndex === 0}
                  aria-label="Previous photo"
                  className="group flex w-8 shrink-0 items-center justify-center self-stretch rounded-r-sm rounded-l-xl border border-border bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-25"
                >
                  <HugeiconsIcon icon={ChevronLeftIcon} className="size-5" />
                </button>
                <div className="flex min-w-0 flex-1 items-center justify-center overflow-y-auto rounded-sm border border-border bg-muted/30">
                  {!overlay ? (
                    <EmptyState
                      icon={
                        <HugeiconsIcon icon={FrameIcon} className="size-8" />
                      }
                      title="Choose a frame to begin"
                      body="Upload your own transparent PNG to frame your photos."
                      action="Choose a frame"
                      onClick={() => {
                        if (frameInputRef.current) {
                          frameInputRef.current.click();
                        } else {
                          setMobileTab("frame");
                        }
                      }}
                    />
                  ) : !photo || photo.status === "loading" ? (
                    <EmptyState
                      icon={
                        <HugeiconsIcon
                          icon={ImageAdd01Icon}
                          className="size-8"
                        />
                      }
                      title="Add some photos to frame"
                      body="Drop photos anywhere in this view or click to select them."
                      action="Add photos"
                      onClick={() => photoInputRef.current?.click()}
                    />
                  ) : photo.status === "error" ? (
                    <EmptyState
                      icon={
                        <HugeiconsIcon
                          icon={ImageAdd01Icon}
                          className="size-8"
                        />
                      }
                      title="This photo failed to load"
                      body="Try removing it and adding it again."
                      action="Remove"
                      onClick={() => removePhoto(photo.id)}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col">
                      <CropEditor
                        key={photo.id + ratio.id}
                        photo={photo}
                        outW={outW}
                        outH={outH}
                        overlay={overlay}
                        transform={photo.transform}
                        onChangeTransform={(t) =>
                          changeTransform(selectedIndex, t)
                        }
                      />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => navPhotos(1)}
                  disabled={
                    !photos.length || selectedIndex === photos.length - 1
                  }
                  aria-label="Next photo"
                  className="group flex w-8 shrink-0 items-center justify-center self-stretch rounded-l-sm rounded-r-xl border border-border bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-25"
                >
                  <HugeiconsIcon icon={ChevronRightIcon} className="size-5" />
                </button>
              </div>

              {photo && photo.status === "ready" && (
                <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl border border-border p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() => resetPhoto(selectedIndex)}
                            aria-label="Reset crop"
                          />
                        }
                      >
                        <HugeiconsIcon icon={Refresh01Icon} />
                      </TooltipTrigger>
                      <TooltipContent>Reset crop</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() =>
                              zoomCenter(selectedIndex, 1 / ZOOM_BUTTONS)
                            }
                            aria-label="Zoom out"
                          />
                        }
                      >
                        <HugeiconsIcon icon={ZoomOutAreaIcon} />
                      </TooltipTrigger>
                      <TooltipContent>Zoom out</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() =>
                              zoomCenter(selectedIndex, ZOOM_BUTTONS)
                            }
                            aria-label="Zoom in"
                          />
                        }
                      >
                        <HugeiconsIcon icon={ZoomInAreaIcon} />
                      </TooltipTrigger>
                      <TooltipContent>Zoom in</TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                    <HugeiconsIcon icon={Move01Icon} className="size-3.5" />{" "}
                    Drag to pan · scroll or pinch to zoom
                  </span>
                </div>
              )}
            </div>

            <div className="hidden items-center justify-between gap-3 lg:flex">
              <span className="text-sm text-muted-foreground">
                {readyCount} of {photos.length} photos ready
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => photoInputRef.current?.click()}
              >
                <HugeiconsIcon icon={ImageAdd02Icon} className="size-4" />
                Add photos
              </Button>
            </div>

            {photos.length > 0 && (
              <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
                {photos.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectIndex(i)}
                    className={cn(
                      "group relative aspect-square h-16 shrink-0 overflow-hidden rounded-lg border-2",
                      i === selectedIndex
                        ? "border-primary"
                        : "border-border opacity-70 hover:opacity-100",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.objectUrl}
                      alt={p.name}
                      className="size-full object-cover"
                    />
                    {p.status === "error" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-destructive/20 text-[10px] font-medium text-destructive">
                        Error
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={`Remove ${p.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(p.id);
                      }}
                      className="absolute right-0.5 top-0.5 hidden rounded bg-background/80 p-0.5 text-muted-foreground hover:text-foreground group-hover:block"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="size-3" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(Array.from(e.target.files));
            e.currentTarget.value = "";
          }}
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files)
              addFiles(Array.from(e.dataTransfer.files));
          }}
          className={cn(
            "pointer-events-none fixed inset-0 z-50 hidden items-center justify-center border-4 border-dashed border-primary bg-primary/5",
            dragOver && "pointer-events-auto flex",
          )}
        >
          <p className="text-lg font-medium">Drop photos to frame them</p>
        </div>

        <nav className="flex h-14 shrink-0 items-stretch border-t border-border bg-background lg:hidden">
          <TabButton
            active={mobileTab === "frame"}
            icon={<HugeiconsIcon icon={FrameIcon} className="size-5" />}
            label="Frame"
            onClick={() => setMobileTab(mobileTab === "frame" ? null : "frame")}
          />
          <TabButton
            active={mobileTab === "photos"}
            icon={<HugeiconsIcon icon={ImageAdd01Icon} className="size-5" />}
            label="Photos"
            onClick={() =>
              setMobileTab(mobileTab === "photos" ? null : "photos")
            }
          />
        </nav>

        {mobileTab && (
          <div
            className="absolute bottom-14 left-0 right-0 z-40 max-h-[70dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-4 shadow-2xl lg:hidden"
            role="dialog"
            aria-label={mobileTab === "frame" ? "Frame settings" : "Photos"}
          >
            {mobileTab === "frame" ? (
              <FramesPanel
                overlay={overlay}
                overlayName={overlayName}
                onUploadCustom={addCustomOverlay}
                onRemoveFrame={removeOverlay}
                ratio={ratio}
                onRatioChange={setRatio}
                resolution={resolution}
                onResolutionChange={setResolution}
                customInputRef={frameInputRef}
              />
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground hover:border-primary/60"
                >
                  <HugeiconsIcon icon={ImageAdd01Icon} className="size-6" />
                  <span className="font-medium text-foreground">
                    Click to select or drop photos
                  </span>
                  <span>JPG, PNG, WebP — all processed locally</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyState({
  icon,
  title,
  body,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 p-8 text-center">
      <span className="flex size-16 items-center justify-center rounded-full border border-dashed text-muted-foreground">
        {icon}
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-xs text-sm text-balance text-muted-foreground">
        {body}
      </p>
      <Button onClick={onClick} className="mt-1 gap-2">
        {action}
      </Button>
    </div>
  );
}
