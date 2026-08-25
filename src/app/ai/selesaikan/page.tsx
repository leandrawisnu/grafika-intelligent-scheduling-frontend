"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiInsightBar } from "@/components/ai-insight-bar";
import { ConflictList } from "@/components/conflict-list";
import { ResolvePanel } from "@/components/resolve-panel";
import { usePrototype } from "@/lib/prototype-store";

export default function AiSelesaikanPage() {
  const {
    predicted,
    predicting,
    runPrediction,
    openConflicts,
    conflicts,
    selectedConflictId,
    setSelectedConflictId,
  } = usePrototype();

  const selected =
    conflicts.find((c) => c.id === selectedConflictId) ??
    openConflicts[0] ??
    null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Resolve Conflict</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Tiga alternatif per konflik, masing-masing dengan skor rekomendasi. AI Explain menguraikan mengapa solusi itu dipilih.
        </p>
      </div>

      {!predicted ? (
        <AiInsightBar
          title="Resolve butuh hasil prediksi"
          detail="Jalankan Conflict Predictor dulu. Resolve prototipe meniru pemrosesan ≤ 15 detik, di sini instan setelah prediksi."
        >
          <Button onClick={runPrediction} disabled={predicting}>
            <Sparkles className="mr-1.5 size-4" />
            {predicting ? "Memindai…" : "Jalankan Prediksi AI"}
          </Button>
        </AiInsightBar>
      ) : (
        <>
          <AiInsightBar
            title={
              openConflicts.length === 0
                ? "Semua konflik sudah dipilih penyelesaiannya"
                : "Pilih solusi A, B, atau C — grid jadwal berubah setelah diterapkan"
            }
            detail="Solusi peringkat 1 ditandai dengan latar AI. Explain terbuka di kartu yang sama."
          />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
            <ConflictList
              items={[...openConflicts, ...conflicts.filter((c) => c.resolved)]}
              selectedId={selected?.id}
              onSelect={setSelectedConflictId}
            />
            <div>{selected ? <ResolvePanel conflict={selected} /> : null}</div>
          </div>
        </>
      )}
    </div>
  );
}
