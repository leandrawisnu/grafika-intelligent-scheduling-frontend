"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScheduleGrid } from "@/components/schedule-grid";
import { GisPanel } from "@/components/gis-surface";
import { useCatalog } from "@/lib/catalog-context";
import { useJadwal } from "@/lib/jadwal-context";
import { conflictTypeLabel } from "@/lib/conflict-display";
import { cn } from "@/lib/utils";
import type { Konflik, SlotJadwal } from "@/lib/types";

const TIPE_GURU = new Set(["guru_bentrok", "guru_hari_libur", "guru_kelebihan_jam"]);

function namaBukanId(name: string | null | undefined, id: string | null | undefined) {
  if (!name || (id && name === id)) return null;
  return name;
}

function pratinjau(konflik: Konflik | null, slots: SlotJadwal[]) {
  if (!konflik) return { guruId: null as string | null, slots: undefined as SlotJadwal[] | undefined, judul: "Pratinjau jadwal" };
  const terkait = slots.filter((s) => s.id === konflik.slot_a_id || s.id === konflik.slot_b_id);
  const guruId = konflik.guru_id || terkait.find((s) => s.guru_id)?.guru_id || null;
  if (TIPE_GURU.has(konflik.tipe_konflik) && guruId) {
    return { guruId, slots: undefined, judul: "Pratinjau jadwal" };
  }
  const kelasIds = new Set(terkait.map((s) => s.kelas_id));
  const milikKelas = slots.filter((s) => kelasIds.has(s.kelas_id));
  return {
    guruId: null,
    slots: milikKelas.length > 0 ? milikKelas : undefined,
    judul: "Pratinjau jadwal",
  };
}

function DaftarKonflikInner() {
  const params = useParams();
  const jadwalId = params.id as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const catalog = useCatalog();
  const { loadJadwal, openKonflik, slots, validated, validating, predicting, runValidasi, runPrediksiMl } = useJadwal();

  useEffect(() => {
    if (jadwalId) void loadJadwal(jadwalId);
  }, [jadwalId, loadJadwal]);

  const selected = openKonflik.find((k) => k.id === searchParams.get("pilih")) ?? openKonflik[0] ?? null;
  const preview = pratinjau(selected, slots);
  const guruLabel = namaBukanId(catalog.guruName(preview.guruId), preview.guruId);

  const pilih = (id: string) => {
    router.replace(`/jadwal/${jadwalId}/konflik?pilih=${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="gis-page-title">Cek konflik</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Bentrok guru, ruangan, dan jam pada jadwal semester ini.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void runValidasi()} disabled={validating || !jadwalId}>
            {validating ? "Memeriksa…" : "Periksa ulang"}
          </Button>
          <Button variant="outline" onClick={() => void runPrediksiMl()} disabled={predicting || !jadwalId}>
            <Sparkles className="mr-1.5 size-4" />
            {predicting ? "ML…" : "Prediksi ML"}
          </Button>
        </div>
      </div>

      {!validated ? (
        <GisPanel className="px-4 py-6 text-sm text-muted-foreground">
          Jalankan periksa ulang supaya daftar bentrok terisi dari data jadwal.
        </GisPanel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium">Potensi konflik</h2>
              <span className="text-xs text-muted-foreground">{openKonflik.length} ditemukan</span>
            </div>
            {openKonflik.length === 0 ? (
              <GisPanel className="px-4 py-6 text-sm text-muted-foreground">Tidak ada konflik terbuka.</GisPanel>
            ) : (
              <ul className="space-y-2">
                {openKonflik.map((item) => {
                  const active = item.id === selected?.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => pilih(item.id)}
                        className={cn(
                          "w-full rounded-[var(--radius-card)] border px-3 py-3 text-left",
                          active ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50",
                        )}
                      >
                        <p className="text-sm font-medium">{conflictTypeLabel(item.tipe_konflik)}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.deskripsi}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <GisPanel className="overflow-hidden p-0">
            <div className="border-b border-border px-4 py-4">
              <h2 className="text-base font-semibold">{preview.judul}</h2>
              <p className="text-sm text-muted-foreground">
                {guruLabel ?? selected?.deskripsi ?? "Pilih konflik untuk melihat jadwal yang terlibat."}
              </p>
            </div>
            <ScheduleGrid
              guruId={preview.guruId}
              slots={preview.slots}
              embedded
              showFooter
              showAllInCell={!preview.guruId}
              onSlotClick={(_, conflicts) => {
                if (conflicts[0]) pilih(conflicts[0].id);
              }}
            />
            <div className="flex justify-end border-t border-border px-4 py-3">
              {selected ? (
                <Link
                  href={`/jadwal/${jadwalId}/konflik/${selected.id}`}
                  className={buttonVariants()}
                >
                  Tinjau solusi
                </Link>
              ) : (
                <Button disabled>Tinjau solusi</Button>
              )}
            </div>
          </GisPanel>
        </div>
      )}
    </div>
  );
}

export default function DaftarKonflikPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat konflik…</p>}>
      <DaftarKonflikInner />
    </Suspense>
  );
}
