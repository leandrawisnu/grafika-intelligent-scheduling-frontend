"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { AiInsightBar } from "@/components/ai-insight-bar";
import { WorkflowStepper } from "@/components/workflow-stepper";
import { ConflictList } from "@/components/conflict-list";
import { JADWAL_ID } from "@/lib/prototype-types";
import { usePrototype } from "@/lib/prototype-store";

export default function Dashboard() {
  const router = useRouter();
  const store = usePrototype();
  const {
    role,
    steps,
    predicted,
    predicting,
    openConflicts,
    errorCount,
    warningCount,
    unplotted,
    published,
    runPrediction,
    setSelectedConflictId,
  } = store;

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

  const insightTitle = published
    ? "Jadwal Ganjil 2026/2027 sudah dipublikasikan"
    : !predicted
      ? "AI belum memindai sinkronisasi semester ini"
      : openConflicts.length === 0
        ? "Tidak ada konflik terbuka. Siap publikasi."
        : `${openConflicts.length} potensi konflik menunggu keputusan kurikulum`;

  const insightDetail = !predicted
    ? "Conflict Predictor menandai bentrok guru, ruangan, kelebihan jam, dan hari piket sebelum jadwal dikunci."
    : openConflicts.length > 0
      ? `${errorCount} kesalahan, ${warningCount} peringatan. Setiap item punya tiga alternatif penyelesaian.`
      : "Semua rekomendasi AI yang dipilih sudah diterapkan ke grid.";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sinkronisasi Ganjil 2026/2027</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Tiga jurusan sudah mengumpulkan draf. Tugas kurikulum: plotting guru, minta AI memprediksi konflik, pilih penyelesaian, lalu publikasi.
        </p>
      </div>

      <WorkflowStepper steps={steps} />

      <AiInsightBar
        title={insightTitle}
        detail={insightDetail}
        meta={
          predicting
            ? "Memindai slot lintas jurusan…"
            : predicted
              ? "Prediksi terakhir pada sesi demo ini"
              : "Belum dijalankan"
        }
      >
        {!predicted ? (
          <Button onClick={runPrediction} disabled={predicting}>
            <Sparkles className="mr-1.5 size-4" />
            {predicting ? "Memprediksi…" : "Jalankan Prediksi AI"}
          </Button>
        ) : openConflicts.length > 0 ? (
          <Link href="/ai/konflik" className={buttonVariants()}>
            Tinjau konflik
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        ) : !published ? (
          <Link href={`/jadwal/${JADWAL_ID}?tab=publikasi`} className={buttonVariants()}>
            Ke publikasi
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        ) : null}
      </AiInsightBar>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Status alur</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-secondary px-3 py-3">
              <dt className="text-xs text-muted-foreground">Jurusan</dt>
              <dd className="mt-1 font-medium">DKV, PG, MM</dd>
            </div>
            <div className="rounded-xl bg-secondary px-3 py-3">
              <dt className="text-xs text-muted-foreground">Belum diplot</dt>
              <dd className="mt-1 font-medium tabular-nums">{unplotted.length} slot</dd>
            </div>
            <div className="rounded-xl bg-ai-muted px-3 py-3">
              <dt className="flex items-center gap-1 text-xs text-ai">
                <AlertTriangle className="size-3.5" />
                Konflik AI
              </dt>
              <dd className="mt-1 font-medium tabular-nums">
                {predicted ? openConflicts.length : "—"}
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href={`/jadwal/${JADWAL_ID}`} className={buttonVariants({ variant: "outline" })}>
              Buka grid jadwal
            </Link>
            <Link href={`/jadwal/${JADWAL_ID}?tab=plotting`} className={buttonVariants({ variant: "outline" })}>
              Plotting guru
            </Link>
            <Link href="/ai/tanya" className={buttonVariants({ variant: "outline" })}>
              Tanya AI
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">Hasil prediksi</h2>
          {!predicted ? (
            <p className="rounded-xl bg-muted px-4 py-6 text-sm text-muted-foreground">
              Grid masih terlihat bersih sampai prediksi dijalankan. Bentrok lintas jurusan baru muncul sebagai overlay AI.
            </p>
          ) : (
            <ConflictList
              items={openConflicts}
              onSelect={(id) => {
                setSelectedConflictId(id);
                router.push("/ai/selesaikan");
              }}
            />
          )}
        </section>
      </div>
    </div>
  );
}
