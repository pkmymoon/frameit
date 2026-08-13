import Link from "next/link";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { FrameIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Page() {
  return (
    <main className="flex min-h-screen w-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HugeiconsIcon icon={FrameIcon} className="size-5" />
            </span>
            FrameIt
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
