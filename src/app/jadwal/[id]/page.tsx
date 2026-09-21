"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Send, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleGrid } from "@/components/schedule-grid";
import { PlottingPanel } from "@/components/plotting-panel";
import { ResolvePanel } from "@/components/resolve-panel";
import { AiInsightBar } from "@/components/ai-insight-bar";
import { AiBadge } from "@/components/ai-badge";
import { KELAS } from "@/lib/mock";
import { JADWAL_ID, SEMESTER_LABEL } from "@/lib/prototype-types";
import { cn } from "@/lib/utils";
import { usePrototype } from "@/lib/prototype-store";

function JadwalDetailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "grid";
  const {
    gridKelasId,
    setGridKelasId,
    predicted,
    predicting,
    published,
    openConflicts,
    unplotted,
    runPrediction,
    publish,
    selectedConflictId,
    setSelectedConflictId,
    conflicts,
  } = usePrototype();

  const selected = conflicts.find((c) => c.id === selectedConflictId) ?? openConflicts[0];

  const setTab = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "grid") params.delete("tab");
    else params.set("tab", value);
    const q = params.toString();
    router.replace(q ? `/jadwal/${JADWAL_ID}?${q}` : `/jadwal/${JADWAL_ID}`);
  };

  const handlePublish = () => {
    const result = publish();
    if (!result.ok && result.reason) {
      setTab("publikasi");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{SEMESTER_LABEL}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={published ? "default" : "secondary"}>
              {published ? "Dipublikasikan" : "Belum dipublikasikan"}
            </Badge>
            {predicted ? (
              <Badge variant={openConflicts.length === 0 ? "secondary" : "destructive"}>
                {openConflicts.length === 0 ? "Bebas konflik" : `${openConflicts.length} konflik AI`}
              </Badge>
            ) : (
              <AiBadge>Prediksi belum jalan</AiBadge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={runPrediction} disabled={predicting || published}>
            <Sparkles className="mr-1.5 size-4" />
            {predicting ? "Memprediksi…" : predicted ? "Ulangi prediksi" : "Prediksi AI"}
          </Button>
          <Button onClick={handlePublish} disabled={published || openConflicts.length > 0 || !predicted || unplotted.length > 0}>
            <Send className="mr-1.5 size-4" />
            Publikasi
          </Button>
        </div>
      </div>

      {predicted && openConflicts.length > 0 ? (
        <AiInsightBar
          title={`${openConflicts.length} sel bertanda AI di grid`}
          detail="Klik sel berwarna untuk membuka alternatif penyelesaian. Overlay hanya muncul setelah prediksi."
        >
          <Link href="/ai/selesaikan" className={buttonVariants({ size: "sm" })}>
            Selesaikan dengan AI
          </Link>
        </AiInsightBar>
      ) : null}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="plotting">Plotting {unplotted.length > 0 ? `(${unplotted.length})` : ""}</TabsTrigger>
          <TabsTrigger value="konflik">Konflik AI</TabsTrigger>
          <TabsTrigger value="publikasi">Publikasi</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setGridKelasId("")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                gridKelasId === "" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              Semua kelas
            </button>
            {KELAS.map((kelas) => (
              <button
                key={kelas.id}
                type="button"
                onClick={() => setGridKelasId(kelas.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  gridKelasId === kelas.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {kelas.nama}
              </button>
            ))}
          </div>
          <ScheduleGrid
            kelasId={gridKelasId || null}
            onSlotClick={(_, conflicts) => {
              if (conflicts[0]) {
                setSelectedConflictId(conflicts[0].id);
                setTab("konflik");
              }
            }}
          />
        </TabsContent>

        <TabsContent value="plotting">
          <PlottingPanel />
        </TabsContent>

        <TabsContent value="konflik" className="space-y-4">
          {!predicted ? (
            <AiInsightBar
              title="Jalankan prediksi untuk mengisi tab ini"
              detail="Tanpa prediksi, grid tidak menandai bentrok lintas jurusan."
            >
              <Button onClick={runPrediction} disabled={predicting}>
                <Sparkles className="mr-1.5 size-4" />
                Jalankan Prediksi AI
              </Button>
            </AiInsightBar>
          ) : selected ? (
            <ResolvePanel conflict={selected} />
          ) : (
            <p className="text-sm text-muted-foreground">Semua konflik sudah diselesaikan.</p>
          )}
        </TabsContent>

        <TabsContent value="publikasi" className="space-y-4">
          {published ? (
            <div className="rounded-xl bg-secondary px-4 py-6 text-sm">
              Jadwal sudah dipublikasikan ke guru dan siswa. Ganti role di sidebar untuk melihat tampilan baca.
            </div>
          ) : openConflicts.length > 0 || !predicted || unplotted.length > 0 ? (
            <AiInsightBar
              title="Publikasi dikunci"
              detail={
                !predicted
                  ? "AI Explain: kurikulum belum menjalankan Conflict Predictor, jadi risiko bentrok lintas jurusan belum diukur."
                  : unplotted.length > 0
                    ? `AI Explain: ${unplotted.length} slot belum punya guru. Jadwal tidak boleh terbit dengan lubang plotting.`
                    : `AI Explain: masih ada ${openConflicts.length} konflik. ${openConflicts.map((c) => c.description.split(".")[0]).join("; ")}.`
              }
            >
              <Link href="/ai/selesaikan" className={buttonVariants({ size: "sm" })}>
                Buka AI Resolve
              </Link>
            </AiInsightBar>
          ) : (
            <div className="space-y-3 rounded-xl bg-secondary px-4 py-6">
              <p className="text-sm font-medium">Tidak ada konflik. Jadwal boleh dipublikasikan.</p>
              <Button onClick={handlePublish}>
                <Send className="mr-1.5 size-4" />
                Publikasikan sekarang
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function JadwalDetailPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat jadwal…</p>}>
      <JadwalDetailInner />
    </Suspense>
  );
}
