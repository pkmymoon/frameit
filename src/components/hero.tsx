"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download01Icon,
  FrameIcon,
  ImageAdd01Icon,
  LockIcon,
  SparklesFreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const STEPS = [
  {
    icon: FrameIcon,
    n: "01",
    title: "Pick the frame",
    body: "Upload your own transparent PNG — or start with nothing and just crop.",
  },
  {
    icon: ImageAdd01Icon,
    n: "02",
    title: "Drop the photos",
    body: "Add a few or a hundred. They never leave this tab, so no limits.",
  },
  {
    icon: Download01Icon,
    n: "03",
    title: "Fiddle, then export",
    body: "Pan, zoom, re-order. Grab one photo or the whole set as a ZIP.",
  },
];

export function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-5 pb-4 pt-10 text-center sm:pt-16">
      <Badge
        variant="secondary"
        className="gap-1.5 rounded-full px-1.5 py-1 text-xs"
      >
        <HugeiconsIcon icon={LockIcon} className="size-3.5" />
        Private by design — nothing leaves your device
      </Badge>

      <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
        Frame your photos,
        <br />
        right in the browser
      </h1>

      <p className="max-w-2xl text-base text-muted-foreground text-pretty sm:text-lg">
        Upload your own transparent frame PNG, drop in your photos, and Frame-it
        frames them instantly. No sign-up, no uploads — just your device.
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button
          size="lg"
          className="gap-2 text-base"
          nativeButton={false}
          render={<Link href="/tool" />}
        >
          <HugeiconsIcon icon={SparklesFreeIcons} className="size-5" />
          Frame your photos
        </Button>
      </div>

      <div className="relative mt-6 w-full overflow-hidden rounded-2xl border border-border bg-muted/40 p-6 sm:p-10">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--color-primary)_60%,transparent),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />

        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl mb-6 text-left">
          How it works
        </h2>

        <ol className="grid gap-x-8 gap-y-10 text-left sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="relative flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-primary shadow-sm">
                  {s.n}
                </span>
              </div>
              <h3 className="text-base font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="text-sm text-balance leading-snug text-muted-foreground">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
