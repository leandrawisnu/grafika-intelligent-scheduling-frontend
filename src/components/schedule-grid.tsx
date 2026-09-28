"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/lib/catalog-context";
import { useJadwal } from "@/lib/jadwal-context";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ScheduleSlotCard } from "@/components/schedule-slot-card";
import { legendTonesFromMapel, toneForMapel } from "@/lib/schedule-mapel-tone";
import type { Konflik, SlotJadwal } from "@/lib/types";

export function ScheduleGrid({
  kelasId,
  guruId,
  interactive = true,
  slots: slotsProp,
  showConflicts = true,
  weekdaysOnly = true,
  hideBreaks = true,
  embedded = false,
  showFooter = true,
  onSlotClick,
}: {
  kelasId?: string | null;
  guruId?: string | null;
  interactive?: boolean;
  slots?: SlotJadwal[];
  showConflicts?: boolean;
  weekdaysOnly?: boolean;
  hideBreaks?: boolean;
  embedded?: boolean;
  showFooter?: boolean;
  onSlotClick?: (slot: SlotJadwal, conflicts: Konflik[]) => void;
}) {
  const catalog = useCatalog();
  const {
    slots: ctxSlots,
    validated,
    slotConflicts,
    setSelectedConflictId,
  } = useJadwal();

  const slots = slotsProp ?? ctxSlots;

  const visible = slots.filter((s) => {
    if (kelasId) return s.kelas_id === kelasId;
    if (guruId) return s.guru_id === guruId;
    return true;
  });

  const at = (hariId: string, jamId: string) =>
    visible.filter((s) => s.hari_id === hariId && s.jam_pelajaran_id === jamId);

  const displayHari = useMemo(
    () =>
      weekdaysOnly ? catalog.hari.filter((h) => !h.akhir_pekan) : catalog.hari,
    [catalog.hari, weekdaysOnly]
  );

  const displayJam = useMemo(
    () => (hideBreaks ? catalog.jam.filter((j) => !j.istirahat) : catalog.jam),
    [catalog.jam, hideBreaks]
  );

  const sesiPerHari = useMemo(() => {
    const counts = new Map<string, number>();
    for (const h of displayHari) counts.set(h.id, 0);
    for (const s of visible) {
      counts.set(s.hari_id, (counts.get(s.hari_id) ?? 0) + 1);
    }
    return counts;
  }, [visible, displayHari]);

  const legend = useMemo(() => {
    const mapelEntries = visible.map((s) => ({
      id: s.mata_pelajaran_id,
      name: catalog.mapelName(s.mata_pelajaran_id),
    }));
    const unique = new Map<string, { id: string; name: string }>();
    for (const e of mapelEntries) unique.set(e.id, e);
    return legendTonesFromMapel([...unique.values()]);
  }, [visible, catalog]);

  if (catalog.loading) {
    return <p className="text-sm text-muted-foreground">Memuat grid…</p>;
  }

  if (catalog.jam.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-secondary/40 px-4 py-6 text-sm">
        <p className="font-medium text-foreground">Grid belum bisa ditampilkan</p>
        <p className="mt-1 text-muted-foreground">
          Belum ada data <strong>jam pelajaran</strong>. Grid butuh baris jam dari master — bukan dari seed slot jadwal.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/master/jam-pelajaran" className={buttonVariants({ size: "sm" })}>
            Master jam pelajaran
          </Link>
          <button
            type="button"
            className={buttonVariants({ size: "sm", variant: "outline" })}
            onClick={() => void catalog.refresh()}
          >
            Muat ulang katalog
          </button>
        </div>
        {catalog.error ? <p className="mt-2 text-destructive">{catalog.error}</p> : null}
      </div>
    );
  }

  const formatJam = (t: string) => (t.length >= 5 ? t.slice(0, 5) : t);
  const focused = Boolean(kelasId || guruId);

  const grid = (
    <ScrollArea
      data-component="GIS/ScheduleGrid"
      className={cn(
        embedded ? "h-[min(58vh,36rem)]" : "h-[min(65vh,40rem)]",
        !embedded && "rounded-[var(--radius-card)] border border-border bg-card"
      )}
    >
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
          <tr className="border-b border-border">
            <th className="w-28 px-3 py-3 text-xs font-medium text-muted-foreground">Waktu</th>
            {displayHari.map((hari) => (
              <th key={hari.id} className="px-2 py-3 text-center">
                <p className="text-sm font-semibold text-foreground">{hari.nama}</p>
                <p className="mt-0.5 text-[11px] font-normal text-muted-foreground">
                  {sesiPerHari.get(hari.id) ?? 0} sesi
                </p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayJam.map((jam) => (
            <tr key={jam.id} className="border-b border-border/70">
              <th className="sticky left-0 z-[1] bg-card px-3 py-2 align-top backdrop-blur-sm">
                <p className="text-xs font-semibold text-foreground">Jam ke-{jam.jam_ke}</p>
                <p className="mt-0.5 text-[11px] font-normal tabular-nums text-muted-foreground">
                  {formatJam(jam.waktu_mulai)} – {formatJam(jam.waktu_selesai)}
                </p>
              </th>
              {displayHari.map((hari) => {
                const cellSlots = at(hari.id, jam.id);
                const showAggregate = !focused && cellSlots.length > 1;
                return (
                  <td
                    key={hari.id}
                    className="min-w-[9.5rem] border-l border-border/50 p-1.5 align-top"
                  >
                    {cellSlots.length === 0 ? (
                      <div className="flex min-h-[5.5rem] items-center justify-center text-sm text-muted-foreground/50">
                        —
                      </div>
                    ) : showAggregate ? (
                      <div
                        className="flex min-h-[5.5rem] items-center justify-center rounded-md bg-muted/40 px-2 text-center text-[11px] text-muted-foreground"
                        title="Pilih satu kelas untuk detail"
                      >
                        {cellSlots.length} kelas
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {cellSlots.map((slot) => {
                          const conflicts =
                            showConflicts && validated ? slotConflicts(slot.id) : [];
                          const top = conflicts[0];
                          const unplotted = !slot.guru_id;
                          const mapelName = catalog.mapelName(slot.mata_pelajaran_id);
                          const tone = toneForMapel(slot.mata_pelajaran_id, mapelName);
                          return (
                            <ScheduleSlotCard
                              key={slot.id}
                              mapelName={mapelName}
                              kelasName={!kelasId ? catalog.kelasName(slot.kelas_id) : null}
                              guruName={catalog.guruName(slot.guru_id)}
                              ruanganName={catalog.ruanganName(slot.ruangan_id)}
                              tone={tone}
                              interactive={interactive}
                              conflict={top}
                              unplotted={unplotted}
                              onClick={() => {
                                if (top) setSelectedConflictId(top.id);
                                onSlotClick?.(slot, conflicts);
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );

  if (!showFooter) return grid;

  return (
    <div
      className={cn(
        embedded ? "" : "overflow-hidden rounded-[var(--radius-card)] border border-border bg-card"
      )}
    >
      {grid}
      <div className="flex flex-col gap-2 border-t border-border px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {legend.map((tone) => (
            <span key={tone.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={cn("size-2 rounded-full", tone.dot)} aria-hidden />
              {tone.label}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">Geser untuk melihat jadwal lengkap →</p>
      </div>
    </div>
  );
}
