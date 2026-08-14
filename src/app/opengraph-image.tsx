import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const alt =
  "Frame-it — frame your photos right in the browser, no uploads, fully private.";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const GREEN = "#4ade80";
const GREEN_DARK = "#15803d";
const FOREGROUND = "#052e16";
const MUTED = "#166534";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${GREEN_DARK} 0%, ${GREEN} 100%)`,
          color: FOREGROUND,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            textAlign: "center",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 28,
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="white"
                strokeWidth="2.4"
              />
              <rect
                x="3"
                y="3"
                width="18"
                height="4.5"
                fill="white"
                opacity="0.9"
              />
              <rect
                x="3"
                y="16.5"
                width="18"
                height="4.5"
                fill="white"
                opacity="0.9"
              />
              <rect
                x="3"
                y="7.5"
                width="4.5"
                height="9"
                fill="white"
                opacity="0.5"
              />
            </svg>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "white",
            }}
          >
            Frame-it
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 36,
              maxWidth: 880,
              lineHeight: 1.3,
              color: MUTED,
            }}
          >
            Frame your photos right in the browser — no uploads, fully private.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}