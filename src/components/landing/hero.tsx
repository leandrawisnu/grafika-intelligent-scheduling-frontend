// Diadaptasi dari block gratis Efferd (https://efferd.com):
// hero-1 (announcement badge + radial shade + entrance animation),
// hero-2 (vertical faded border accents),
// hero-3 (left-aligned + framed preview).
// Copy, ikon (lucide), dan token warna disesuaikan ke tema GIS.
// Headline berputar memakai TextRotate dari Fancy Components (MIT).

"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TextRotate from "@/components/fancy/text/text-rotate";

export function LandingHero({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] scroll-mt-20 flex-col justify-center overflow-hidden py-12">
      {/* Shades ala hero-1/hero-2: radial glow + garis batas vertikal pudar */}
      <div aria-hidden="true" className="absolute inset-0 isolate -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(35%_60%_at_50%_0%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent)]" />
        <div className="absolute inset-y-0 left-4 w-px bg-gradient-to-b from-transparent via-border to-border md:left-8" />
        <div className="absolute inset-y-0 right-4 w-px bg-gradient-to-b from-transparent via-border to-border md:right-8" />
        <div className="absolute inset-y-0 left-8 hidden w-px bg-gradient-to-b from-transparent via-border/50 to-border/50 sm:block md:left-12" />
        <div className="absolute inset-y-0 right-8 hidden w-px bg-gradient-to-b from-transparent via-border/50 to-border/50 sm:block md:right-12" />
      </div>

      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="min-w-0">
          <a
            href="#solusi"
            className={cn(
              "group flex w-fit items-center gap-2.5 rounded-full border bg-card px-3 py-1.5",
              "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards transition-all delay-500 duration-500 ease-out"
            )}
          >
            <Sparkles className="size-3.5 text-primary" />
            <span className="text-xs font-medium">Prediksi + resolusi konflik AI</span>
            <span className="block h-4 border-l border-border" />
            <ArrowRight className="size-3.5 text-muted-foreground duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-primary" />
          </a>

          <h1
            className={cn(
              "mt-5 max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl",
              "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-100 duration-500 ease-out"
            )}
          >
            Sinkronisasi jadwal antar jurusan,{" "}
            <TextRotate
              as="span"
              texts={["tanpa bentrok.", "tanpa revisi berulang.", "siap publikasi."]}
              splitBy="words"
              staggerDuration={0.02}
              rotationInterval={2600}
              mainClassName="inline-flex"
              splitLevelClassName="overflow-hidden pb-1"
              elementLevelClassName="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            />
          </h1>

          <p
            className={cn(
              "mt-4 max-w-xl text-base leading-relaxed text-muted-foreground",
              "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-200 duration-500 ease-out"
            )}
          >
            GIS membantu kurikulum menyusun, memplot guru, dan mempublikasikan jadwal pelajaran.
            Potensi bentrok guru dan ruangan terdeteksi sejak plotting — lengkap dengan alternatif
            solusi yang bisa dijelaskan dan dipertanggungjawabkan.
          </p>

          <div
            className={cn(
              "mt-6 flex flex-wrap gap-2",
              "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-300 duration-500 ease-out"
            )}
          >
            <Link href="/login" className={buttonVariants({ size: "lg" })}>
              Masuk ke dashboard
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
            <a href="#solusi" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Lihat cara kerja AI
            </a>
          </div>
        </div>

        {/* Framed preview ala hero-3: glow + bingkai, tanpa shadow (aturan GIS) */}
        <div className="relative min-w-0">
          <div
            aria-hidden="true"
            className="absolute -inset-x-8 inset-y-0 -z-10 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_14%,transparent),transparent,transparent)] blur-[50px]"
          />
          <div
            className={cn(
              "rounded-lg border bg-background p-2",
              "fade-in slide-in-from-bottom-5 animate-in fill-mode-backwards delay-100 duration-1000 ease-out"
            )}
          >
            <div className="space-y-3">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
