"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { AiInsightBar } from "@/components/ai-insight-bar";
import { WorkflowStepper } from "@/components/workflow-stepper";
import { ConflictList } from "@/components/conflict-list";
import { useJadwal } from "@/lib/jadwal-context";
import { usePrototype } from "@/lib/prototype-store";
import { jadwalKonflikHref } from "@/lib/navigation";
import { GisPanel, GisSectionHeading, GisStatTile } from "@/components/gis-surface";

export default function Dashboard() {
  const router = useRouter();
  const { role } = usePrototype();
  const {
    activeJadwalId,
    semesterLabel,
    steps,
    validated,
    validating,
    conflictItems,
    openKonflik,
    errorCount,
    warningCount,
    unplotted,
    published,
    runValidasi,
    setSelectedConflictId,
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

  const insightTitle = published
    ? `${semesterLabel} sudah dipublikasikan`
    : !validated
      ? "Validasi konflik belum dijalankan"
      : openKonflik.length === 0
        ? "Tidak ada konflik terbuka. Siap publikasi."
        : `${openKonflik.length} konflik menunggu keputusan kurikulum`;

  const insightDetail = !validated
    ? "Validasi memeriksa bentrok guru, ruangan, dan aturan jam dari database."
    : openKonflik.length > 0
      ? `${errorCount} kesalahan, ${warningCount} peringatan.`
      : "Semua konflik terselesaikan atau tidak ada.";

  const jurusanLabel =
    jadwal?.jurusan
      ?.map((j) => j.jurusan?.kode ?? j.jurusan?.nama)
      .filter(Boolean)
      .join(", ") || "—";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-primary/80">{semesterLabel}</p>
          <h1 className="gis-page-title mt-1">Beranda</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Alur kurikulum: plotting guru, validasi konflik, publikasi ke guru dan siswa.
          </p>
        </div>
        {currentStep ? (
          <Link href={currentStep.href} className={buttonVariants()}>
            Langkah berikutnya: {currentStep.label}
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        ) : null}
      </div>

      <GisPanel className="p-4">
        <WorkflowStepper steps={steps} />
      </GisPanel>

      <AiInsightBar
        title={insightTitle}
        detail={insightDetail}
        meta={validating ? "Memvalidasi…" : validated ? "Validasi pada sesi ini" : "Belum dijalankan"}
      >
        {!validated ? (
          <Button onClick={() => void runValidasi()} disabled={validating || !activeJadwalId}>
            <Sparkles className="mr-1.5 size-4" />
            {validating ? "Memvalidasi…" : "Jalankan validasi"}
          </Button>
        ) : openKonflik.length > 0 ? (
          <Link href={konflikHref} className={buttonVariants()}>
            Tinjau konflik
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        ) : !published && activeJadwalId ? (
          <Link href={`${jsHref}?tab=publikasi`} className={buttonVariants()}>
            Ke publikasi
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        ) : null}
      </AiInsightBar>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="space-y-3">
          <GisSectionHeading title="Status alur" />
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <GisStatTile label="Jurusan di jadwal" value={jurusanLabel} />
            <GisStatTile label="Belum diplot" value={`${unplotted.length} slot`} />
            <GisStatTile
              label="Konflik"
              value={validated ? openKonflik.length : "—"}
              tone="ai"
              icon={AlertTriangle}
            />
          </dl>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href={jsHref} className={buttonVariants({ variant: "outline" })}>
              Buka grid jadwal
            </Link>
            <Link href={`${jsHref}?tab=plotting`} className={buttonVariants({ variant: "outline" })}>
              Plotting guru
            </Link>
            <Link href="/ai/tanya" className={buttonVariants({ variant: "outline" })}>
              Bantuan AI
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          <GisSectionHeading title="Hasil validasi" />
          {!validated ? (
            <GisPanel className="px-4 py-6 text-sm text-muted-foreground">
              Grid belum menandai konflik sampai validasi dijalankan.
            </GisPanel>
          ) : (
            <GisPanel className="p-3">
              <ConflictList
                items={conflictItems}
                onSelect={(id) => {
                  setSelectedConflictId(id);
                  router.push(konflikHref);
                }}
              />
            </GisPanel>
          )}
        </section>
      </div>
    </div>
  );
}
