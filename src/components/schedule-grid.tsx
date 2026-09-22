"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/lib/catalog-context";
import { useJadwal } from "@/lib/jadwal-context";
import { AiBadge } from "@/components/ai-badge";
import type { Konflik, SlotJadwal } from "@/lib/types";

export function ScheduleGrid({
  kelasId,
  guruId,
  interactive = true,
  slots: slotsProp,
  showConflicts = true,
  onSlotClick,
}: {
  kelasId?: string | null;
  guruId?: string | null;
  interactive?: boolean;
  slots?: SlotJadwal[];
  showConflicts?: boolean;
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
          <button type="button" className={buttonVariants({ size: "sm", variant: "outline" })} onClick={() => void catalog.refresh()}>
            Muat ulang katalog
          </button>
        </div>
        {catalog.error ? <p className="mt-2 text-destructive">{catalog.error}</p> : null}
      </div>
    );
  }

  const formatJam = (t: string) => (t.length >= 5 ? t.slice(0, 5) : t);

  return (
    <div
      data-component="GIS/ScheduleGrid"
      className="overflow-x-auto rounded-[var(--radius-card)] border border-border"
    >
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-muted/60">
            <th className="w-28 px-3 py-2 text-xs font-medium text-muted-foreground">Jam</th>
            {catalog.hari.map((hari) => (
              <th key={hari.id} className="px-2 py-2 text-xs font-medium text-foreground">
                {hari.nama}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {catalog.jam.map((jam) => (
            <tr key={jam.id} className="border-t border-border">
              <th className="bg-muted/40 px-3 py-2 align-top text-xs font-medium text-muted-foreground">
                <span className="tabular-nums">ke-{jam.jam_ke}</span>
                <span className="mt-0.5 block font-normal tabular-nums">
                  {formatJam(jam.waktu_mulai)}–{formatJam(jam.waktu_selesai)}
                </span>
              </th>
              {catalog.hari.map((hari) => {
                const cellSlots = at(hari.id, jam.id);
                return (
                  <td key={hari.id} className="p-1 align-top">
                    {cellSlots.length === 0 ? (
                      <div className="min-h-[4.5rem] rounded-[var(--radius-link)] border border-dashed border-border bg-background/50" />
                    ) : (
                      <div className="flex flex-col gap-1">
                        {cellSlots.map((slot) => {
                          const conflicts =
                            showConflicts && validated ? slotConflicts(slot.id) : [];
                          const top = conflicts[0];
                          const unplotted = !slot.guru_id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={!interactive}
                              onClick={() => {
                                if (top) setSelectedConflictId(top.id);
                                onSlotClick?.(slot, conflicts);
                              }}
                              title={
                                top
                                  ? `${catalog.mapelName(slot.mata_pelajaran_id)} · ${top.deskripsi}`
                                  : catalog.mapelName(slot.mata_pelajaran_id)
                              }
                              className={cn(
                                "min-h-[4.5rem] w-full rounded-[var(--radius-link)] px-2 py-1.5 text-left transition-colors",
                                "focus-visible:ring-2 focus-visible:ring-ai focus-visible:outline-none",
                                interactive && "hover:bg-muted/80",
                                !interactive && "cursor-default",
                                top?.tingkat_keparahan === "kesalahan" &&
                                  "bg-destructive/8 ring-1 ring-destructive/25",
                                top?.tingkat_keparahan === "peringatan" &&
                                  "bg-warning/15 ring-1 ring-warning/40",
                                !top && unplotted && "bg-warning/10 ring-1 ring-warning/30",
                                !top && !unplotted && "bg-secondary/80"
                              )}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <p className="text-xs font-medium leading-snug text-foreground">
                                  {catalog.mapelName(slot.mata_pelajaran_id)}
                                </p>
                                {top ? (
                                  <span className="flex items-center gap-0.5">
                                    <AlertTriangle
                                      className={cn(
                                        "size-3.5 shrink-0",
                                        top.tingkat_keparahan === "kesalahan"
                                          ? "text-destructive"
                                          : "text-warning-foreground"
                                      )}
                                    />
                                    <AiBadge className="h-4 px-1 text-[9px]" />
                                  </span>
                                ) : null}
                              </div>
                              {!kelasId ? (
                                <p className="text-[11px] text-foreground/70">
                                  {catalog.kelasName(slot.kelas_id)}
                                </p>
                              ) : null}
                              <p
                                className={cn(
                                  "text-[11px]",
                                  unplotted ? "text-warning-foreground" : "text-foreground/70"
                                )}
                              >
                                {unplotted
                                  ? "Belum diplot"
                                  : catalog.guruName(slot.guru_id) ?? "—"}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {catalog.ruanganName(slot.ruangan_id) ?? "—"}
                              </p>
                            </button>
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
    </div>
  );
}
