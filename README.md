# Frame-it

Frame your photos seamlessly with your own custom frame. Everything runs **100% in the browser** — fully secure, your photos never leave your device, and there is no backend or server.

## What it does

- Upload a **transparent PNG overlay** (your own custom frame) once.
- Pick an **output frame ratio** (4:5, 1:1, 3:2, 16:9, 9:16).
- Upload **many photos** at once.
- **Face detection** (MediaPipe, in-browser) automatically suggests a crop for each photo that keeps every face in frame — so heads are never chopped off.
- **Review** each photo: drag to pan, scroll to zoom, then confirm. Amber boxes mark detected faces.
- **Export** all framed photos as a single `.zip` (photo + overlay composited at 1080px, JPEG).

No images are uploaded to any server. The MediaPipe WASM + model are served from this site's `public/` folder.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build (static export)

```bash
npm run build
```

The static site is written to `out/` (see `next.config.ts`, `output: "export"`). Preview it locally:

```bash
npx serve out
```

### Deploy to Vercel (free, no backend)

1. Push this folder to a GitHub/GitLab repo.
2. In Vercel: **Add New → Project → Import** the repo.
3. Keep the defaults — Vercel auto-detects Next.js and runs the static export.
4. Deploy. The site is served completely statically; no server functions, no database.

## Project structure

- `app/page.tsx` — app state and flow (upload → review → export).
- `components/crop-editor.tsx` — interactive pan/zoom crop canvas.
- `components/upload-screen.tsx` / `components/review-screen.tsx` — the two screens.
- `lib/face.ts` — MediaPipe face detection (GPU with CPU fallback).
- `lib/crop.ts` — cover-fit + face-aware crop math.
- `lib/render.ts` — composites the photo + overlay.
- `public/face-detect/` — vendored MediaPipe WASM + face-detection model.
