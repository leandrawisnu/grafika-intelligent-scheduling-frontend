"use client";

import { GURU } from "@/lib/mock";
import {
  guruName,
  hariName,
  jamLabel,
  kelasName,
  mapelName,
  ruanganName,
  usePrototype,
} from "@/lib/prototype-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PlottingPanel() {
  const { unplotted, assignGuru, teacherBusy, teacherHoursOnDay, published } = usePrototype();

  if (unplotted.length === 0) {
    return (
      <div className="rounded-xl bg-secondary px-4 py-6 text-sm text-secondary-foreground">
        Semua slot sudah punya guru. Lanjut ke prediksi konflik AI.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {unplotted.length} slot belum diplot. Pilih guru yang tidak bentrok di jam yang sama.
      </p>
      <ul className="space-y-3">
        {unplotted.map((slot) => {
          const candidates = GURU.filter((g) => g.aktif);
          return (
            <li key={slot.id} className="rounded-xl p-4 ring-1 ring-foreground/10">
              <p className="text-sm font-medium">
                {kelasName(slot.kelas_id)} · {mapelName(slot.mata_pelajaran_id)}
              </p>
              <p className="text-xs text-muted-foreground">
                {hariName(slot.hari_id)} {jamLabel(slot.jam_pelajaran_id)} · {ruanganName(slot.ruangan_id) ?? "Tanpa ruangan"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {candidates.length === 0 ? (
                  <p className="text-xs text-destructive">Tidak ada guru aktif.</p>
                ) : (
                  candidates.map((guru) => {
                    const busy = teacherBusy(guru.id, slot.hari_id, slot.jam_pelajaran_id, slot.id);
                    const off = guru.hari_libur_ids.includes(slot.hari_id);
                    const hours = teacherHoursOnDay(guru.id, slot.hari_id);
                    const over = hours >= guru.jam_maksimal_per_hari;
                    const blocked = busy || off || over || published;
                    const reason = busy
                      ? "Bentrok jam ini"
                      : off
                        ? "Hari piket"
                        : over
                          ? `Sudah ${hours} jam hari ini`
                          : `${hours}/${guru.jam_maksimal_per_hari} jam hari ini`;
                    return (
                      <Button
                        key={guru.id}
                        size="sm"
                        variant={blocked ? "outline" : "secondary"}
                        disabled={blocked}
                        onClick={() => assignGuru(slot.id, guru.id)}
                        className={cn(blocked && "opacity-60")}
                      >
                        {guruName(guru.id)}
                        <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">{reason}</span>
                      </Button>
                    );
                  })
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
