"use client";

import { AlertTriangle, MapPin, MoreHorizontal, User } from "lucide-react";
import { AiBadge } from "@/components/ai-badge";
import { cn } from "@/lib/utils";
import type { MapelTone } from "@/lib/schedule-mapel-tone";
import type { Konflik } from "@/lib/types";

export function ScheduleSlotCard({
  mapelName,
  kelasName,
  guruName,
  ruanganName,
  tone,
  interactive = true,
  conflict,
  unplotted,
  onClick,
}: {
  mapelName: string;
  kelasName?: string | null;
  guruName?: string | null;
  ruanganName?: string | null;
  tone: MapelTone;
  interactive?: boolean;
  conflict?: Konflik;
  unplotted?: boolean;
  onClick?: () => void;
}) {
  const severity = conflict?.tingkat_keparahan;

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-md border border-border/50 border-l-4 px-2.5 py-2 text-left transition-shadow",
        tone.cardBg,
        tone.border,
        interactive && "hover:shadow-sm",
        !interactive && "cursor-default",
        severity === "kesalahan" && "ring-1 ring-destructive/30",
        severity === "peringatan" && "ring-1 ring-warning/40",
        unplotted && !severity && "ring-1 ring-warning/25"
      )}
    >
      <div className="flex items-start justify-between gap-1">
        {kelasName ? (
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {kelasName}
          </span>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-0.5">
          {conflict ? (
            <>
              <AlertTriangle
                className={cn(
                  "size-3.5 shrink-0",
                  severity === "kesalahan" ? "text-destructive" : "text-warning-foreground"
                )}
              />
              <AiBadge className="h-4 px-1 text-[9px]" />
            </>
          ) : (
            <MoreHorizontal
              className="size-3.5 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          )}
        </span>
      </div>
      <p className="mt-1 text-sm font-semibold leading-snug text-foreground">{mapelName}</p>
      <div className="mt-2 space-y-0.5">
        <p
          className={cn(
            "flex items-center gap-1 text-[11px]",
            unplotted ? "text-warning-foreground" : "text-muted-foreground"
          )}
        >
          <User className="size-3 shrink-0" aria-hidden />
          {unplotted ? "Belum diplot" : guruName ?? "—"}
        </p>
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden />
          {ruanganName ?? "—"}
        </p>
      </div>
    </button>
  );
}
