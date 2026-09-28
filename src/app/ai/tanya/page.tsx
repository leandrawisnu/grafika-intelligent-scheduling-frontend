"use client";

import { useState } from "react";
import { AiPromptComposer } from "@/components/ai-prompt-composer";
import { api } from "@/lib/api";
import { useJadwal } from "@/lib/jadwal-context";
import { cn } from "@/lib/utils";

const CHIPS = [
  "Guru siapa yang bentrok hari Senin?",
  "Guru mana yang paling banyak mengajar minggu ini?",
  "Tampilkan seluruh konflik minggu ini",
];

export default function AiTanyaPage() {
  const { activeJadwalId, semesterLabel } = useJadwal();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thread, setThread] = useState<{ q: string; a: string; err?: boolean }[]>([]);

  const hasThread = thread.length > 0;

  const ask = async (text: string) => {
    const pertanyaan = text.trim();
    if (!pertanyaan || loading) return;
    if (!activeJadwalId) {
      setThread((prev) => [
        ...prev,
        { q: pertanyaan, a: "Buat atau pilih jadwal semester dulu.", err: true },
      ]);
      setInput("");
      return;
    }
    setLoading(true);
    setInput("");
    try {
      const res = await api.aiTanya(pertanyaan, activeJadwalId);
      setThread((prev) => [...prev, { q: pertanyaan, a: res.jawaban }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal menghubungi AI";
      setThread((prev) => [...prev, { q: pertanyaan, a: msg, err: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-component="GIS/AiTanya"
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col",
        hasThread ? "min-h-[calc(100dvh-12rem)]" : "min-h-[calc(100dvh-14rem)] justify-center",
      )}
    >
      {!hasThread ? (
        <div className="mb-8 space-y-2 text-center">
          <h1 className="gis-page-title text-[2rem] md:text-[2.25rem]">Ada yang bisa dibantu?</h1>
          <p className="text-sm text-muted-foreground">
            Pertanyaan terikat ke jadwal aktif
            {semesterLabel !== "Belum ada jadwal aktif" ? ` · ${semesterLabel}` : ""}
          </p>
        </div>
      ) : (
        <div className="mb-6 flex-1 space-y-6 overflow-y-auto pb-4">
          {thread.map((item, i) => (
            <article key={i} className="space-y-3">
              <p className="text-base font-medium text-foreground">{item.q}</p>
              <div
                className={cn(
                  "rounded-[var(--radius-card)] border px-4 py-3 text-sm leading-relaxed",
                  item.err
                    ? "border-destructive/20 bg-destructive/10 text-destructive"
                    : "border-primary/15 bg-ai-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-wrap">{item.a}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="shrink-0 space-y-4">
        <AiPromptComposer
          value={input}
          onChange={setInput}
          onSubmit={() => void ask(input)}
          placeholder="Guru siapa yang bentrok hari Senin?"
          loading={loading}
        />

        {!hasThread ? (
          <div className="flex flex-wrap justify-center gap-2">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => void ask(chip)}
                disabled={loading}
                className="rounded-full border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
