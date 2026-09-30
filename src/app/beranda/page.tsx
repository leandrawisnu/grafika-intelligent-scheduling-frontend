"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { AiInsightBar } from "@/components/ai-insight-bar";
import { conflictTypeLabel, groupKonflikByType } from "@/lib/conflict-display";
import { useJadwal } from "@/lib/jadwal-context";
import { usePrototype } from "@/lib/prototype-store";
import { jadwalKonflikHref } from "@/lib/navigation";
import { GisPanel, GisStatTile } from "@/components/gis-surface";
import { cn } from "@/lib/utils";

const angka = new Intl.NumberFormat("id-ID");

export default function Dashboard() {
  const { role } = usePrototype();
  const {
    activeJadwalId,
    semesterLabel,
    steps,
    validated,
    validating,
    openKonflik,
    errorCount,
    warningCount,
    unplotted,
    runValidasi,
    jadwal,
  } = useJadwal();

  if (role === "guru") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Dashboard kurikulum. Untuk jadwal mengajar, buka{" "}
          <Link href="/guru/jadwal" className="font-medium text-primary underline-offset-4 hover:underline">
            Jadwal Mengajar
          </Link>
          .
        </p>
      </div>
    );
  }
  if (role === "siswa") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Dashboard kurikulum. Untuk jadwal pelajaran, buka{" "}
          <Link href="/siswa/jadwal" className="font-medium text-primary underline-offset-4 hover:underline">
            Jadwal Pelajaran
          </Link>
          .
        </p>
      </div>
    );
  }

  const jsHref = activeJadwalId ? `/jadwal/${activeJadwalId}` : "/jadwal";
  const konflikHref = jadwalKonflikHref(activeJadwalId);
  const currentStep = steps.find((s) => s.status === "current");
  const ringkasan = groupKonflikByType(openKonflik)
    .map((group) => ({ type: group.type, jumlah: group.items.length }))
    .sort((a, b) => b.jumlah - a.jumlah);

  const jumlahJurusan = jadwal?.jurusan?.length ?? 0;

  const pintasan = [
    { href: jsHref, label: "Grid jadwal" },
    { href: `${jsHref}?tab=plotting`, label: "Plotting guru" },
    { href: "/ai/tanya", label: "Bantuan AI" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="gis-page-title">Beranda</h1>
          <p className="mt-1 text-sm text-muted-foreground">{semesterLabel}</p>
        </div>
        {currentStep ? (
          <Link href={currentStep.href} className={buttonVariants()}>
            {currentStep.label}
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        ) : null}
      </div>

      {!validated ? (
        <AiInsightBar title="Validasi belum dijalankan" detail="Bentrok dihitung setelah jadwal diperiksa.">
          <Button size="sm" onClick={() => void runValidasi()} disabled={validating || !activeJadwalId}>
            {validating ? "Memvalidasi…" : "Jalankan validasi"}
          </Button>
        </AiInsightBar>
      ) : openKonflik.length > 0 ? (
        <AiInsightBar
          title={`${angka.format(openKonflik.length)} konflik menunggu`}
          detail={`${angka.format(errorCount)} kesalahan, ${angka.format(warningCount)} peringatan.`}
        >
          <Link href={konflikHref} className={buttonVariants({ size: "sm" })}>
            Tinjau konflik
          </Link>
        </AiInsightBar>
      ) : null}

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <GisStatTile label="Jurusan" value={jadwal ? angka.format(jumlahJurusan) : "—"} />
        <GisStatTile label="Slot belum diplot" value={angka.format(unplotted.length)} />
        <GisStatTile label="Kesalahan" value={validated ? angka.format(errorCount) : "—"} />
        <GisStatTile label="Peringatan" value={validated ? angka.format(warningCount) : "—"} />
      </dl>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.7fr)]">
        <GisPanel className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-medium">Ringkasan bentrok</h2>
              <p className="text-xs text-muted-foreground">
                {validated ? `${angka.format(openKonflik.length)} terbuka` : "Belum divalidasi"}
              </p>
            </div>
            {validated && openKonflik.length > 0 ? (
              <Link href={konflikHref} className="text-xs font-medium text-primary hover:underline">
                Daftar
              </Link>
            ) : null}
          </div>
          {!validated ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Jalankan validasi untuk mengisi ringkasan ini.</p>
          ) : ringkasan.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Tidak ada konflik terbuka.</p>
          ) : (
            <ul>
              {ringkasan.map((row) => (
                <li key={row.type} className="border-b border-border last:border-b-0">
                  <Link
                    href={konflikHref}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                  >
                    <span>{conflictTypeLabel(row.type)}</span>
                    <span className="font-medium tabular-nums">{angka.format(row.jumlah)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </GisPanel>

        <div className="space-y-3">
          <GisPanel className="p-4">
            <h2 className="text-sm font-medium">Alur</h2>
            <ol className="mt-3 space-y-2">
              {steps.map((step) => (
                <li key={step.id}>
                  <Link href={step.href} className="flex items-center gap-2 text-sm">
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full border",
                        step.status === "done" && "border-transparent bg-secondary text-foreground",
                        step.status === "current" && "border-primary bg-primary text-primary-foreground",
                        step.status === "todo" && "border-border text-transparent",
                      )}
                    >
                      <Check className="size-2.5" aria-hidden />
                    </span>
                    <span className={step.status === "todo" ? "text-muted-foreground" : "text-foreground"}>
                      {step.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </GisPanel>

          <GisPanel className="overflow-hidden">
            <h2 className="border-b border-border px-4 py-3 text-sm font-medium">Pintasan</h2>
            <ul>
              {pintasan.map((item) => (
                <li key={item.href} className="border-b border-border last:border-b-0">
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                  >
                    {item.label}
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </GisPanel>
        </div>
      </div>
    </div>
  );
}
