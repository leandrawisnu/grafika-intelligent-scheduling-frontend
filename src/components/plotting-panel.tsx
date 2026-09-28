"use client";

import { useCatalog } from "@/lib/catalog-context";
import { useJadwal } from "@/lib/jadwal-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PlottingPanel() {
  const catalog = useCatalog();
  const { unplotted, assignGuru, teacherBusy, teacherHoursOnDay, published } = useJadwal();

  if (unplotted.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-secondary px-4 py-6 text-sm text-secondary-foreground">
        Semua slot sudah punya guru. Lanjut ke validasi konflik.
      </div>
    );
  }

  const candidates = catalog.guru.filter((g) => g.aktif);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {unplotted.length} slot belum diplot. Pilih guru yang tidak bentrok di jam yang sama.
      </p>
      <ul className="space-y-3">
        {unplotted.map((slot) => (
          <li key={slot.id} className="rounded-[var(--radius-card)] border border-border p-4">
            <p className="text-sm font-medium">
              {catalog.kelasName(slot.kelas_id)} · {catalog.mapelName(slot.mata_pelajaran_id)}
            </p>
            <p className="text-xs text-muted-foreground">
              {catalog.hariName(slot.hari_id)} {catalog.jamLabel(slot.jam_pelajaran_id)} ·{" "}
              {catalog.ruanganName(slot.ruangan_id) ?? "Tanpa ruangan"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {candidates.length === 0 ? (
                <p className="text-xs text-destructive">Tidak ada guru aktif di master.</p>
              ) : (
                candidates.map((guru) => {
                  const busy = teacherBusy(
                    guru.id,
                    slot.hari_id,
                    slot.jam_pelajaran_id,
                    slot.id
                  );
                  const hours = teacherHoursOnDay(guru.id, slot.hari_id);
                  const maxDay = Math.max(1, Math.ceil(guru.jam_maksimal_per_minggu / 5));
                  const over = hours >= maxDay;
                  const blocked = busy || over || published;
                  const reason = busy
                    ? "Bentrok jam ini"
                    : over
                      ? `Sudah ${hours} jam hari ini`
                      : `${hours}/${maxDay} jam hari ini`;
                  return (
                    <Button
                      key={guru.id}
                      size="sm"
                      variant={blocked ? "outline" : "secondary"}
                      disabled={blocked}
                      onClick={() => void assignGuru(slot.id, guru.id)}
                      className={cn(blocked && "opacity-60")}
                    >
                      {guru.nama_lengkap}
                      <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                        {reason}
                      </span>
                    </Button>
                  );
                })
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
