import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import type { FaceBox } from "./types";

type Delegate = "GPU" | "CPU";

let gpuDetector: Promise<FaceDetector> | null = null;
let cpuDetector: Promise<FaceDetector> | null = null;
let useCpu = false;

async function createDetector(delegate: Delegate): Promise<FaceDetector> {
  const vision = await FilesetResolver.forVisionTasks("/face-detect");
  return FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/face-detect/blaze_face_short_range.tflite",
      delegate,
    },
    runningMode: "IMAGE",
    minDetectionConfidence: 0.45,
  } as never);
}

function getDetector(): Promise<FaceDetector> {
  if (useCpu) {
    cpuDetector ??= createDetector("CPU");
    return cpuDetector;
  }
  gpuDetector ??= createDetector("GPU");
  return gpuDetector;
}

function detectWith(
  detector: FaceDetector,
  canvas: HTMLCanvasElement,
  down: number
): FaceBox[] {
  const res = detector.detect(canvas);
  return (res.detections ?? []).map((d) => {
    const bb = d.boundingBox;
    return {
      x: (bb?.originX ?? 0) / down,
      y: (bb?.originY ?? 0) / down,
      w: (bb?.width ?? 0) / down,
      h: (bb?.height ?? 0) / down,
    };
  });
}

/** Detect faces in an orientation-corrected bitmap, returning boxes in image pixel coords. */
export async function detectFaces(bitmap: ImageBitmap): Promise<FaceBox[]> {
  const down = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const cw = Math.max(1, Math.round(bitmap.width * down));
  const ch = Math.max(1, Math.round(bitmap.height * down));
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(bitmap, 0, 0, cw, ch);

  try {
    const detector = await getDetector();
    return detectWith(detector, canvas, down);
  } catch {
    // GPU inference failed at runtime (e.g. no WebGL available). Fall back to CPU.
    useCpu = true;
    const detector = await getDetector();
    return detectWith(detector, canvas, down);
  }
}