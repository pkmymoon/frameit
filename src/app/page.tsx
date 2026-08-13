import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Hero } from "@/components/hero";
import { FrameIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Page() {
  return (
    <main className="flex min-h-screen w-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HugeiconsIcon icon={FrameIcon} className="size-5" />
            </span>
            FrameIt
          </Link>
          <Button size="sm" render={<Link href="/tool" />}>
            Start framing
          </Button>
        </nav>
      </header>

      <Hero />

      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-4 py-6 text-center text-sm text-muted-foreground sm:px-6">
          <p>
            FrameIt frames your photos entirely in your browser — nothing is uploaded, stored, or shared.
          </p>
          <p>
            Custom frames are transparent PNGs rendered at 1080px · All processing is on-device
          </p>
        </div>
      </footer>
    </main>
  );
}
