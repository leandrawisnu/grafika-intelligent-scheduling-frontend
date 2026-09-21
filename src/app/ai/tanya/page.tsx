"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiBadge } from "@/components/ai-badge";
import { AiInsightBar } from "@/components/ai-insight-bar";
import { matchQuery } from "@/lib/mock";
import type { QueryAnswer } from "@/lib/prototype-types";

const CHIPS = [
  "Guru siapa yang bentrok hari Senin?",
  "Guru mana yang paling banyak mengajar minggu ini?",
  "Cari slot kosong Pak Ahmad",
  "Mengapa jadwal XI DKV belum dapat dipublikasikan?",
  "Tampilkan seluruh konflik minggu ini",
];

export default function AiTanyaPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thread, setThread] = useState<{ q: string; a: QueryAnswer | "empty" }[]>([]);

  const ask = async (text: string) => {
    const pertanyaan = text.trim();
    if (!pertanyaan) return;
    setLoading(true);
    setInput("");
    await new Promise((r) => setTimeout(r, 450));
    const matched = matchQuery(pertanyaan);
    setThread((prev) => [...prev, { q: pertanyaan, a: matched ?? "empty" }]);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Tanya AI</h1>
          <AiBadge>Schedule Query</AiBadge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Cari informasi jadwal dalam bahasa sehari-hari. Jawaban prototipe memakai data dummy SMK Grafika.
        </p>
      </div>

      <AiInsightBar
        title="Pertanyaan terikat ke jadwal Ganjil 2026/2027"
        detail="Bukan chatbot bebas. Hasil bisa berupa tabel konflik, daftar slot kosong, atau alasan publikasi dikunci."
      />

      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => ask(chip)}
            className="rounded-full bg-ai-muted px-3 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-ai hover:text-ai-foreground"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {thread.length === 0 ? (
          <p className="text-sm text-muted-foreground">Pilih contoh di atas atau ketik pertanyaan.</p>
        ) : (
          thread.map((item, i) => (
            <article key={i} className="space-y-2">
              <p className="rounded-xl bg-secondary px-3 py-2 text-sm">{item.q}</p>
              <div className="rounded-xl bg-ai-muted px-3 py-3 text-sm">
                {item.a === "empty" ? (
                  <p>
                    Tidak ketemu di data dummy. Coba salah satu contoh: bentrok Senin, beban guru, slot kosong Ahmad, publikasi DKV, atau seluruh konflik.
                  </p>
                ) : (
                  <>
                    <p className="leading-relaxed">{item.a.answer}</p>
                    {item.a.list ? (
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-foreground/85">
                        {item.a.list.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                    {item.a.table ? (
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr>
                              {item.a.table.columns.map((col) => (
                                <th key={col} className="border-b border-foreground/10 py-1.5 pr-3 font-medium">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {item.a.table.rows.map((row, ri) => (
                              <tr key={ri}>
                                {row.map((cell, ci) => (
                                  <td key={ci} className="py-1.5 pr-3 tabular-nums">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input
          className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ai"
          placeholder="Tanya soal bentrok, beban jam, slot kosong…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          <Send className="mr-1.5 size-4" />
          {loading ? "…" : "Tanya"}
        </Button>
      </form>
    </div>
  );
}
