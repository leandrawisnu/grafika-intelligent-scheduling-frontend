"use client";

import { useLayoutEffect } from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { AiInsightBar } from "@/components/ai-insight-bar";
import { ConflictList } from "@/components/conflict-list";
import { ScheduleGrid } from "@/components/schedule-grid";
import { usePrototype } from "@/lib/prototype-store";

export default function AiKonflikPage() {
  const {
    predicted,
    predicting,
    runPrediction,
    ensurePredicted,
    openConflicts,
    errorCount,
    warningCount,
    selectedConflictId,
    setSelectedConflictId,
    gridKelasId,
  } = usePrototype();

  useLayoutEffect(() => {
    ensurePredicted();
  }, [ensurePredicted]);

  return (
    <div className="space-y-6" data-auto-layout="true" data-component="GIS/AI Conflict Predictor">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Conflict Predictor</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Memindai draf lintas jurusan sebelum sinkronisasi dikunci. Output: daftar bentrok, tingkat risiko, guru dan ruangan terdampak.
        </p>
      </div>

      <AiInsightBar
        title={
          !predicted
            ? "Belum ada hasil prediksi"
            : openConflicts.length === 0
              ? "Tidak ada potensi konflik terbuka"
              : `${openConflicts.length} potensi bentrok · ${errorCount} kesalahan · ${warningCount} peringatan`
        }
        detail={
          predicted
            ? "Keyakinan model tertera per item. Klik baris untuk membuka AI Resolve."
            : "Prediksi prototipe meniru pemindaian ≤ 5 detik."
        }
      >
        <Button data-component="GIS/Button/Primary" onClick={runPrediction} disabled={predicting}>
          <Sparkles className="mr-1.5 size-4" />
          {predicting ? "Memindai…" : predicted ? "Prediksi ulang" : "Jalankan prediksi"}
        </Button>
      </AiInsightBar>

      {predicted ? (
        <div
          className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]"
          data-auto-layout="true"
        >
          <ConflictList
            items={openConflicts}
            selectedId={selectedConflictId}
            onSelect={setSelectedConflictId}
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Overlay pada grid</p>
              <Link href="/ai/selesaikan" className={buttonVariants({ size: "sm", variant: "outline" })}>
                Selesaikan yang dipilih
              </Link>
            </div>
            <ScheduleGrid
              kelasId={gridKelasId || null}
              onSlotClick={(_, conflicts) => {
                if (conflicts[0]) setSelectedConflictId(conflicts[0].id);
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Setelah prediksi, sel bermasalah mendapat tanda AI. Guru bentrok, ruangan dobel, kelebihan jam, dan hari piket tampil terpisah.
        </p>
      )}
    </div>
  );
}
