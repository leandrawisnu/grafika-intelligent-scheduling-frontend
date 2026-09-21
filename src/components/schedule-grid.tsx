"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { HARI, JAM } from "@/lib/mock";
import {
  guruName,
  kelasName,
  mapelName,
  ruanganName,
  usePrototype,
} from "@/lib/prototype-store";
import { AiBadge } from "@/components/ai-badge";
import type { PrototypeConflict, SlotJadwal } from "@/lib/prototype-types";

export function ScheduleGrid({
  kelasId,
  guruId,
  interactive = true,
  onSlotClick,
}: {
  kelasId?: string | null;
  guruId?: string | null;
  interactive?: boolean;
  onSlotClick?: (slot: SlotJadwal, conflicts: PrototypeConflict[]) => void;
}) {
  const { slots, slotConflicts, predicted, setSelectedConflictId } = usePrototype();

  const visible = slots.filter((s) => {
    if (kelasId) return s.kelas_id === kelasId;
    if (guruId) return s.guru_id === guruId;
    return true;
  });

  const at = (hariId: string, jamId: string) =>
    visible.filter((s) => s.hari_id === hariId && s.jam_pelajaran_id === jamId);

  return (
    <div
      data-component="GIS/ScheduleGrid"
      className="overflow-x-auto rounded-xl ring-1 ring-foreground/10"
    >
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-muted/60">
            <th className="w-28 px-3 py-2 text-xs font-medium text-muted-foreground">Jam</th>
            {HARI.map((hari) => (
              <th key={hari.id} className="px-2 py-2 text-xs font-medium text-foreground">
                {hari.nama}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {JAM.map((jam) => (
            <tr key={jam.id} className="border-t border-border">
              <th className="bg-muted/40 px-3 py-2 align-top text-xs font-medium text-muted-foreground">
                <span className="tabular-nums">ke-{jam.jam_ke}</span>
                <span className="mt-0.5 block font-normal tabular-nums">
                  {jam.waktu_mulai}–{jam.waktu_selesai}
                </span>
              </th>
              {HARI.map((hari) => {
                const cellSlots = at(hari.id, jam.id);
                return (
                  <td key={hari.id} className="p-1 align-top">
                    {cellSlots.length === 0 ? (
                      <div className="min-h-[4.5rem] rounded-lg border border-dashed border-border bg-background/50" />
                    ) : (
                      <div className="flex flex-col gap-1">
                        {cellSlots.map((slot) => {
                          const conflicts = predicted ? slotConflicts(slot.id) : [];
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
                                  ? `${mapelName(slot.mata_pelajaran_id)} · ${top.description}`
                                  : mapelName(slot.mata_pelajaran_id)
                              }
                              className={cn(
                                "min-h-[4.5rem] w-full rounded-lg px-2 py-1.5 text-left transition-colors",
                                "focus-visible:ring-2 focus-visible:ring-ai focus-visible:outline-none",
                                interactive && "hover:bg-muted/80",
                                !interactive && "cursor-default",
                                top?.severity === "kesalahan" && "bg-destructive/8 ring-1 ring-destructive/25",
                                top?.severity === "peringatan" && "bg-warning/15 ring-1 ring-warning/40",
                                !top && unplotted && "bg-warning/10 ring-1 ring-warning/30",
                                !top && !unplotted && "bg-secondary/80"
                              )}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <p className="text-xs font-medium leading-snug text-foreground">
                                  {mapelName(slot.mata_pelajaran_id)}
                                </p>
                                {top ? (
                                  <span className="flex items-center gap-0.5">
                                    <AlertTriangle
                                      className={cn(
                                        "size-3.5 shrink-0",
                                        top.severity === "kesalahan" ? "text-destructive" : "text-warning-foreground"
                                      )}
                                    />
                                    <AiBadge className="h-4 px-1 text-[9px]" />
                                  </span>
                                ) : null}
                              </div>
                              {!kelasId ? (
                                <p className="text-[11px] text-foreground/70">{kelasName(slot.kelas_id)}</p>
                              ) : null}
                              <p className={cn("text-[11px]", unplotted ? "text-warning-foreground" : "text-foreground/70")}>
                                {unplotted ? "Belum diplot" : guruName(slot.guru_id)}
                              </p>
                              <p className="text-[11px] text-muted-foreground">{ruanganName(slot.ruangan_id) ?? "—"}</p>
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
