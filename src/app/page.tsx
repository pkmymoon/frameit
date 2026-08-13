"use client";

import * as React from "react";

import { toast } from "sonner";

import { UploadScreen } from "@/components/upload-screen";
import { ReviewScreen } from "@/components/review-screen";
import { coverTransform, suggestedTransform } from "@/lib/crop";
import { renderScene } from "@/lib/render";
import { outputDims, RATIOS, type PhotoState, type Ratio, type Step } from "@/lib/types";
import { detectFaces } from "@/lib/face";

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Page() {
  const [step, setStep] = React.useState<Step>("upload");
  const [ratio, setRatio] = React.useState<Ratio>(RATIOS[0]);
  const [photos, setPhotos] = React.useState<PhotoState[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [overlay, setOverlay] = React.useState<HTMLImageElement | null>(null);
  const [overlayName, setOverlayName] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);

  const overlayUrlRef = React.useRef<string | null>(null);

  const { outW, outH } = outputDims(ratio);

  React.useEffect(() => {
    return () => {
      if (overlayUrlRef.current) URL.revokeObjectURL(overlayUrlRef.current);
    };
  }, []);

  const updatePhoto = (id: string, patch: Partial<PhotoState>) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const addOverlay = async (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    try {
      await img.decode();
      if (overlayUrlRef.current) URL.revokeObjectURL(overlayUrlRef.current);
      overlayUrlRef.current = url;
      setOverlay(img);
      setOverlayName(file.name);
      toast.success("Overlay added");
    } catch {
      URL.revokeObjectURL(url);
      toast.error("Could not read that overlay image");
    }
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
    const newPhotos: PhotoState[] = filesOnly.map((file) => ({
      id: makeId(),
      name: file.name,
      file,
      objectUrl: URL.createObjectURL(file),
      bitmap: null as unknown as ImageBitmap,
      imgW: 1,
      imgH: 1,
      status: "loading",
      faces: [],
      transform: { scale: Math.max(outW, outH), ox: 0, oy: 0 },
      confirmed: false,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);

    (async () => {
      for (const p of newPhotos) {
        try {
          let bitmap: ImageBitmap;
          try {
            bitmap = await createImageBitmap(p.file, { imageOrientation: "from-image" });
          } catch {
            bitmap = await createImageBitmap(p.file);
          }
          const imgW = bitmap.width || 1;
          const imgH = bitmap.height || 1;
          updatePhoto(p.id, { bitmap, imgW, imgH, status: "detecting" });

          const faces = await detectFaces(bitmap);
          const out = outputDims(ratio);
          const transform = suggestedTransform(faces, imgW, imgH, out.outW, out.outH);
          updatePhoto(p.id, { faces, transform, status: "ready" });
        } catch (err) {
          console.error(err);
          updatePhoto(p.id, { status: "error" });
        }
      }
    })();
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.objectUrl) URL.revokeObjectURL(target.objectUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const startReview = () => {
    setPhotos((prev) => {
      const { outW: w, outH: h } = outputDims(ratio);
      return prev.map((p) =>
        p.status === "ready"
          ? { ...p, transform: suggestedTransform(p.faces, p.imgW, p.imgH, w, h), confirmed: false }
          : p
      );
    });
    setCurrentIndex(0);
    setStep("review");
  };

  const changeTransform = (i: number, t: PhotoState["transform"]) => {
    setPhotos((prev) => prev.map((p, idx) => (idx === i ? { ...p, transform: t } : p)));
  };

  const confirmPhoto = (i: number) => {
    setPhotos((prev) => prev.map((p, idx) => (idx === i ? { ...p, confirmed: true } : p)));
  };

  const resetPhoto = (i: number) => {
    setPhotos((prev) =>
      prev.map((p, idx) =>
        idx === i
          ? {
              ...p,
              transform:
                p.status === "ready" && p.faces.length
                  ? suggestedTransform(p.faces, p.imgW, p.imgH, outW, outH)
                  : coverTransform(p.imgW, p.imgH, outW, outH),
              confirmed: false,
            }
          : p
      )
    );
  };

  const exportZip = async () => {
    const readyPhotos = photos.filter((p) => p.status === "ready");
    if (!readyPhotos.length) {
      toast.error("No ready photos to export");
      return;
    }
    setExporting(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const { outW: w, outH: h } = outputDims(ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;

      for (let i = 0; i < readyPhotos.length; i++) {
        const p = readyPhotos[i];
        renderScene(ctx, w, h, p.bitmap, p.transform, 1, overlay);
        const blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", 0.92)
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
      toast.success(`Exported ${readyPhotos.length} framed ${readyPhotos.length === 1 ? "photo" : "photos"}`);
    } catch (err) {
      console.error(err);
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-1 flex-col items-center gap-6 p-4 sm:p-6 lg:p-8">
      <header className="flex w-full max-w-4xl flex-col items-center gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">FrameIt</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Automate the framing of event photos with an overlay — all in your browser, nothing leaves your device.
        </p>
      </header>

      <div className="flex min-h-0 w-full flex-1 justify-center">
        {step === "upload" ? (
          <UploadScreen
            ratio={ratio}
            onRatioChange={setRatio}
            overlay={overlay}
            overlayName={overlayName}
            onOverlayFile={addOverlay}
            onRemoveOverlay={removeOverlay}
            photos={photos}
            onAddFiles={addFiles}
            onRemovePhoto={removePhoto}
            onStart={startReview}
          />
        ) : (
          <ReviewScreen
            photos={photos}
            currentIndex={currentIndex}
            ratio={ratio}
            overlay={overlay}
            exporting={exporting}
            onSelect={setCurrentIndex}
            onTransformChange={changeTransform}
            onConfirm={confirmPhoto}
            onReset={resetPhoto}
            onBack={() => setStep("upload")}
            onExport={exportZip}
          />
        )}
      </div>
    </main>
  );
}