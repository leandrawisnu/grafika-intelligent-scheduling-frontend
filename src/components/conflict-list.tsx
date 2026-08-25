"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AiBadge } from "@/components/ai-badge";
import { CONFLICT_LABEL, type PrototypeConflict } from "@/lib/prototype-types";
import { guruName, ruanganName } from "@/lib/prototype-store";

export function ConflictList({
  items,
  selectedId,
  onSelect,
}: {
  items: PrototypeConflict[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl bg-secondary px-4 py-8 text-center text-sm text-muted-foreground">
        <CheckCircle2 className="size-8 text-foreground/50" />
        <p>Tidak ada konflik terbuka.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const active = selectedId === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              data-component="GIS/ConflictCard"
              data-auto-layout="true"
              onClick={() => onSelect?.(item.id)}
              className={cn(
                "w-full rounded-xl px-3 py-3 text-left transition-colors ring-1",
                active ? "bg-ai-muted ring-ai/40" : "bg-card ring-foreground/10 hover:bg-muted/60"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={cn(
                      "size-4 shrink-0",
                      item.severity === "kesalahan" ? "text-destructive" : "text-warning-foreground"
                    )}
                  />
                  <span className="text-sm font-medium">{CONFLICT_LABEL[item.type]}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AiBadge className="h-4 px-1.5 text-[9px]" />
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground/75">{item.description}</p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {item.teacherIds.map(guruName).join(", ")}
                {item.roomIds.length > 0 ? ` · ${item.roomIds.map((id) => ruanganName(id)).join(", ")}` : ""}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
