"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JADWAL_ID, SEMESTER_LABEL } from "@/lib/prototype-types";
import { usePrototype } from "@/lib/prototype-store";

export default function JadwalPage() {
  const { published, openConflicts, predicted, unplotted } = usePrototype();

  const status = published
    ? "Dipublikasikan"
    : predicted && openConflicts.length === 0
      ? "Siap publikasi"
      : predicted
        ? "Tinjauan AI"
        : unplotted.length > 0
          ? "Plotting"
          : "Draf";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jadwal semester</h1>
        <p className="text-sm text-muted-foreground">Satu semester aktif untuk prototipe SMK Grafika.</p>
      </div>

      <Link
        href={`/jadwal/${JADWAL_ID}`}
        className="block max-w-lg rounded-xl p-4 ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">{SEMESTER_LABEL}</p>
            <p className="mt-1 text-sm text-muted-foreground">DKV · Produksi Grafika · Multimedia</p>
          </div>
          <Badge variant={published ? "default" : "secondary"}>{status}</Badge>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {predicted
            ? `${openConflicts.length} konflik AI terbuka`
            : "Prediksi AI belum dijalankan"}
        </p>
        <Button className="mt-4" size="sm" tabIndex={-1}>
          Buka grid
        </Button>
      </Link>
    </div>
  );
}
