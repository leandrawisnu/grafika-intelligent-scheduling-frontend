"use client";

import Link from "next/link";

function BrandLockup() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center">
        <img src="/Icons/GIS%20-%20Icon%20Dark.svg" alt="" className="size-8" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-sm font-bold tracking-tight text-white">GIS</span>
        <span className="block text-[11px] text-white/75">SMKN 4 Malang</span>
      </span>
    </div>
  );
}

export function LoginFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-full min-h-0 lg:grid-cols-2">
      <aside
        className="relative hidden min-h-0 flex-col justify-between overflow-hidden px-12 py-10 text-white lg:flex xl:px-16"
        style={{
          background: "linear-gradient(165deg, #0e4c88 0%, #0a3a6c 46%, #062848 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(255 255 255 / 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.14) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
          aria-hidden
        />
        <div className="relative">
          <BrandLockup />
        </div>
        <div className="relative max-w-lg">
          <p className="text-xs font-medium tracking-[0.18em] text-white/70">SMKN 4 MALANG</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.15] tracking-tight text-white xl:text-5xl">
            Grafika Intelligent
            <br />
            <span className="relative inline-block">
              Scheduling
              <span className="absolute right-0 -bottom-1.5 left-0 h-1 rounded-full bg-[#3d9dff]" aria-hidden />
            </span>
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/75">
            Sistem penjadwalan cerdas untuk mengatur jadwal pelajaran, ruang, dan guru dengan lebih cepat dan akurat.
          </p>
        </div>
        <p className="relative text-xs text-white/60">Versi 0.1.0</p>
      </aside>

      <section className="flex min-h-0 flex-col bg-[#f3f6fb]">
        <div
          className="px-6 py-4 lg:hidden"
          style={{ background: "linear-gradient(165deg, #0e4c88 0%, #0a3a6c 100%)" }}
        >
          <BrandLockup />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-[26rem]">
            <div className="rounded-[1.35rem] border border-[#e7eef5] bg-[#f6f8fb] px-8 py-8 shadow-[0_10px_28px_rgb(28_55_90/0.12)]">
              {children}
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              © 2026 SMKN 4 Malang · Grafika Intelligent Scheduling
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export function LoginHeading({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">Akses sekolah</p>
      <h2 className="mt-2 text-[2rem] leading-tight font-bold tracking-[-0.02em] text-foreground">{title}</h2>
      <p className="mt-2 text-[15px] font-normal leading-6 text-muted-foreground">{children}</p>
    </div>
  );
}

export function LoginBackLink() {
  return (
    <Link href="/login" className="text-sm font-medium text-primary hover:underline">
      Kembali ke masuk
    </Link>
  );
}
