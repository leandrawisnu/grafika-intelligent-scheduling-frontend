"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GisPanel } from "@/components/gis-surface";
import { api } from "@/lib/api";
import { conflictTypeLabel } from "@/lib/conflict-display";
import { useJadwal } from "@/lib/jadwal-context";
import { cn } from "@/lib/utils";

type Usulan = {
  id: string;
  peringkat: number;
  label: string;
  penjelasan: string;
};

const HURUF = ["A", "B", "C"];

export default function TinjauSolusiPage() {
  const params = useParams();
  const jadwalId = params.id as string;
  const konflikId = params.konflikId as string;
  const router = useRouter();
  const { loadJadwal, konflik, loading: jadwalLoading } = useJadwal();
  const item = konflik.find((k) => k.id === konflikId) ?? null;

  const [usulan, setUsulan] = useState<Usulan[]>([]);
  const [terpilih, setTerpilih] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menerapkan, setMenerapkan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jadwalId) void loadJadwal(jadwalId);
  }, [jadwalId, loadJadwal]);

  useEffect(() => {
    let batal = false;
    setLoading(true);
    setError(null);
    api
      .selesaikanKonflik(konflikId)
      .then((res) => {
        if (batal) return;
        const rows = res.alternatif ?? [];
        setUsulan(rows);
        setTerpilih(rows[0]?.id ?? null);
      })
      .catch((e: unknown) => {
        if (batal) return;
        setError(e instanceof Error ? e.message : "Gagal mencocokkan data jadwal");
      })
      .finally(() => {
        if (!batal) setLoading(false);
      });
    return () => {
      batal = true;
    };
  }, [konflikId]);

  const aktif = usulan.find((u) => u.id === terpilih) ?? usulan[0] ?? null;

  const terapkan = async () => {
    if (!aktif) return;
    setMenerapkan(true);
    setError(null);
    try {
      await api.terimaResolusi(aktif.id);
      await loadJadwal(jadwalId, { paksa: true });
      router.push(`/jadwal/${jadwalId}/konflik`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menerapkan usulan");
      setMenerapkan(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground">
          <Link href={`/jadwal/${jadwalId}/konflik`} className="hover:underline">
            Cek konflik
          </Link>
        </p>
        <h1 className="gis-page-title mt-1">Tinjau solusi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih perbaikan yang cocok dengan guru, ruangan, dan jam yang sudah ada.
        </p>
      </div>

      <GisPanel className="px-4 py-4">
        <p className="text-xs font-medium text-muted-foreground">Konflik terpilih</p>
        <p className="mt-1 text-base font-medium">
          {item
            ? conflictTypeLabel(item.tipe_konflik)
            : jadwalLoading
              ? "Memuat konflik…"
              : "Konflik tidak ditemukan"}
        </p>
        {item ? <p className="mt-1 text-sm text-muted-foreground">{item.deskripsi}</p> : null}
      </GisPanel>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Mencocokkan data jadwal…</p>
      ) : usulan.length === 0 ? (
        <GisPanel className="px-4 py-6 text-sm text-muted-foreground">
          Tidak ada kecocokan. Perbaiki manual di plotting.
        </GisPanel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,22rem)]">
          <section className="space-y-3">
            <h2 className="text-sm font-medium">Rekomendasi solusi</h2>
            <ul className="space-y-2">
              {usulan.map((row, index) => {
                const huruf = HURUF[index] ?? String(index + 1);
                const on = row.id === aktif?.id;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setTerpilih(row.id)}
                      className={cn(
                        "w-full rounded-[var(--radius-card)] border px-3 py-3 text-left",
                        on ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50",
                      )}
                    >
                      <p className="text-sm font-medium">
                        {huruf}. {row.label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{row.penjelasan}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-end">
              <Button onClick={() => void terapkan()} disabled={!aktif || menerapkan}>
                {menerapkan ? "Menerapkan…" : "Terapkan"}
              </Button>
            </div>
          </section>

          <GisPanel className="h-fit px-4 py-4">
            <h2 className="text-sm font-medium">Mengapa solusi ini?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {aktif?.penjelasan}
            </p>
          </GisPanel>
        </div>
      )}
    </div>
  );
}
