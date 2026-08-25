"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiBadge } from "@/components/ai-badge";
import { cn } from "@/lib/utils";
import { CONFLICT_LABEL, type PrototypeConflict } from "@/lib/prototype-types";
import { usePrototype } from "@/lib/prototype-store";

export function ResolvePanel({ conflict }: { conflict: PrototypeConflict }) {
  const { applyAlternative, appliedAltByConflict, published } = usePrototype();
  const applied = appliedAltByConflict[conflict.id];
  const [openExplain, setOpenExplain] = useState<string | null>(conflict.alternatives[0]?.id ?? null);

  if (conflict.resolved) {
    const alt = conflict.alternatives.find((a) => a.id === applied);
    return (
      <div className="rounded-xl bg-secondary px-4 py-3 text-sm">
        <p className="font-medium text-foreground">Konflik ini sudah diselesaikan.</p>
        {alt ? (
          <p className="mt-1 text-muted-foreground">
            Solusi {alt.label} diterapkan ({Math.round(alt.confidence * 100)}% rekomendasi). {alt.summary}
          </p>
        ) : (
          <p className="mt-1 text-muted-foreground">Perubahan sudah masuk ke grid jadwal.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <AiBadge>AI Resolve</AiBadge>
            <h2 className="text-base font-medium">{CONFLICT_LABEL[conflict.type]}</h2>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-foreground/80">{conflict.description}</p>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          Prediksi {Math.round(conflict.confidence * 100)}%
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {conflict.alternatives.map((alt) => {
          const selected = openExplain === alt.id;
          return (
            <article
              key={alt.id}
              data-component="GIS/ResolveCard"
              data-auto-layout="true"
              className={cn(
                "flex flex-col rounded-xl bg-card p-4 ring-1 ring-foreground/10",
                alt.rank === 1 && "ring-ai/40 bg-ai-muted/40"
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium">Solusi {alt.label}</p>
                <p className="text-xs tabular-nums text-ai">
                  {Math.round(alt.confidence * 100)}% rekomendasi
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-ai"
                  style={{ width: `${Math.round(alt.confidence * 100)}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">{alt.summary}</p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {alt.changes.map((change, i) => (
                  <li key={i}>{change.label}</li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-3 flex items-center gap-1 text-xs font-medium text-ai"
                onClick={() => setOpenExplain(selected ? null : alt.id)}
              >
                <ChevronDown className={cn("size-3.5 transition-transform", selected && "rotate-180")} />
                AI Explain
              </button>
              {selected ? (
                <div className="mt-2 space-y-2 text-xs leading-relaxed text-foreground/80">
                  <p>{alt.explanation}</p>
                  <ol className="list-decimal space-y-1 pl-4">
                    {alt.reasoningSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              ) : null}
              <Button
                className="mt-4"
                disabled={published}
                onClick={() => applyAlternative(conflict.id, alt.id)}
              >
                <Check className="mr-1.5 size-4" />
                Terapkan solusi {alt.label}
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
