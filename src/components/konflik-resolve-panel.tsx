"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiBadge } from "@/components/ai-badge";
import { conflictTypeLabel } from "@/lib/conflict-display";
import { api } from "@/lib/api";
import type { Konflik } from "@/lib/types";
import { useJadwal } from "@/lib/jadwal-context";

export function KonflikResolvePanel({ konflik }: { konflik: Konflik }) {
  const { published, activeJadwalId, loadJadwal } = useJadwal();
  const [loading, setLoading] = useState(false);
  const [mlError, setMlError] = useState<string | null>(null);
  const [alternatif, setAlternatif] = useState<unknown[] | null>(null);

  useEffect(() => {
    setAlternatif(null);
    setMlError(null);
  }, [konflik.id]);

  const fetchMl = async () => {
    setLoading(true);
    setMlError(null);
    try {
      const res = await api.selesaikanKonflik(konflik.id);
      setAlternatif(res.alternatif ?? []);
    } catch (e) {
      setMlError(e instanceof Error ? e.message : "Layanan ML tidak tersedia");
    } finally {
      setLoading(false);
    }
  };

  if (konflik.terselesaikan) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-secondary px-4 py-3 text-sm">
        <p className="font-medium text-foreground">Konflik ini sudah ditandai terselesaikan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <AiBadge>Validasi DB</AiBadge>
          <h2 className="text-base font-medium">{conflictTypeLabel(konflik.tipe_konflik)}</h2>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-foreground/80">{konflik.deskripsi}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Tingkat: {konflik.tingkat_keparahan}. Perbaiki manual di grid/plotting, atau minta alternatif dari ML.
        </p>
      </div>

      <Button variant="outline" onClick={() => void fetchMl()} disabled={loading || published}>
        <Sparkles className="mr-1.5 size-4" />
        {loading ? "Meminta alternatif…" : "Minta alternatif ML"}
      </Button>

      {mlError ? (
        <p className="text-sm text-destructive">{mlError}. Gunakan grid untuk menyesuaikan slot.</p>
      ) : null}

      {alternatif && alternatif.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {alternatif.map((alt, i) => (
            <li key={i} className="rounded-[var(--radius-card)] border border-border bg-card p-3">
              <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(alt, null, 2)}</pre>
            </li>
          ))}
        </ul>
      ) : alternatif ? (
        <p className="text-sm text-muted-foreground">ML tidak mengembalikan alternatif.</p>
      ) : null}

      {activeJadwalId ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void loadJadwal(activeJadwalId)}
          disabled={published}
        >
          Muat ulang konflik
        </Button>
      ) : null}
    </div>
  );
}
