import type { Metadata } from "next";

import ToolClient from "./tool-client";

export const metadata: Metadata = {
  title: "Frame a Photo — Free Online Tool",
  description:
    "Upload your own transparent PNG frame, drop in photos, get face-aware smart cropping, and export the full set as a ZIP. Fully private — the whole app runs in your browser.",
  alternates: {
    canonical: "/tool",
  },
  openGraph: {
    title: "Frame-a-Photo Tool — Free Online",
    description:
      "Frame photos with your own transparent PNG overlay, with face-aware cropping and batch ZIP export — entirely in your browser.",
    url: "https://frameit.mymoonpk.com/tool",
    type: "website",
  },
};

export default function ToolPage() {
  return <ToolClient />;
}