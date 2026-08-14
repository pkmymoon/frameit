import Link from "next/link";
import type { Metadata } from "next";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { FrameIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const metadata: Metadata = {
  title: "Free Online Photo Framer — Frame Photos in Your Browser",
  description:
    "Frame your photos online for free. Upload your own transparent PNG frame, drop in photos, and get face-aware smart cropping with batch ZIP export — 100% private, in your browser.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Free Online Photo Framer — Frame Photos in Your Browser",
    description:
      "Upload your own transparent PNG frame, drop in photos, and export them all as ZIP. Fully private — everything runs in your browser.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Frame-it — Free Online Photo Framer",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  url: "https://frameit.mymoonpk.com",
  description:
    "Free online tool to frame photos with your own transparent PNG overlay. Face-aware smart cropping and batch ZIP export, fully private and in-browser.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Frame photos with a custom transparent PNG",
    "Face-aware smart cropping",
    "Batch export as ZIP",
    "100% in-browser, no uploads",
  ],
};

export default function Page() {
  return (
    <main className="flex min-h-screen w-full flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HugeiconsIcon icon={FrameIcon} className="size-5" />
            </span>
            Frame-it
          </Link>
          <Button size="sm" nativeButton={false} render={<Link href="/tool" />}>
            Start framing
          </Button>
        </nav>
      </header>

      <Hero />
    </main>
  );
}
