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
    title: "1 · Choose a frame",
    body: "Upload your own transparent PNG to frame your photos.",
  },
  {
    icon: ImageAdd01Icon,
    title: "2 · Add photos",
    body: "Drop in as many as you like — processed locally.",
  },
  {
    icon: Download01Icon,
    title: "3 · Review & export",
    body: "Tweak the crop, then export your framed set as a ZIP.",
  },
];

export function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-2 pb-4 pt-10 text-center sm:pt-16">
      <Badge
        variant="secondary"
        className="gap-1.5 rounded-full px-3 py-1 text-xs"
      >
        <HugeiconsIcon icon={LockIcon} className="size-3.5" />
        Private by design — nothing leaves your device
      </Badge>

      <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
        Frame your photos,
        <br />
        right in the browser
      </h1>

      <p className="max-w-2xl text-base text-muted-foreground text-pretty sm:text-lg">
        Upload your own transparent frame PNG, drop in your photos, and
        FrameIt frames them instantly. No sign-up, no uploads — just your
        device.
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button size="lg" className="gap-2 text-base" render={<Link href="/tool" />}>
          <HugeiconsIcon icon={SparklesFreeIcons} className="size-5" />
          Frame your first photo
        </Button>
      </div>

      <div className="mt-6 w-full rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
        <h2 className="mb-6 text-lg font-semibold">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.title}
              className="flex flex-col items-start gap-2 text-left"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-foreground">
                <HugeiconsIcon icon={s.icon} className="size-5" />
              </span>
              <h3 className="text-sm font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
