"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScheduleGrid } from "@/components/schedule-grid";
import { useCatalog } from "@/lib/catalog-context";
import { useJadwal } from "@/lib/jadwal-context";
import { usePrototype } from "@/lib/prototype-store";
import { cn } from "@/lib/utils";

export default function SiswaJadwalPage() {
  const router = useRouter();
  const catalog = useCatalog();
  const { published, slots, activeJadwalId } = useJadwal();
  const { viewKelasId, setViewKelasId, setRole } = usePrototype();

  useEffect(() => {
    if (!viewKelasId && catalog.kelas[0]) setViewKelasId(catalog.kelas[0].id);
  }, [catalog.kelas, viewKelasId, setViewKelasId]);

  const kelas = catalog.kelas.find((k) => k.id === viewKelasId) ?? catalog.kelas[0];
  const displaySlots = published ? slots : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="gis-page-title">Jadwal pelajaran</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {published
            ? "Versi terbit untuk kelas yang dipilih."
            : "Menunggu publikasi kurikulum."}
        </p>
      </div>
      {!activeJadwalId ? (
        <p className="text-sm text-muted-foreground">Belum ada jadwal semester.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {catalog.kelas.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setViewKelasId(item.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  viewKelasId === item.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {item.nama}
              </button>
            ))}
          </div>
          {kelas ? <p className="text-sm">{kelas.nama}</p> : null}
          <ScheduleGrid
            kelasId={kelas?.id ?? null}
            slots={displaySlots}
            showConflicts={false}
            interactive={false}
          />
        </>
      )}
      <p className="text-xs text-muted-foreground">
        <button
          type="button"
          className="underline"
          onClick={() => {
            setRole("kurikulum");
            router.push("/");
          }}
        >
          Kembali ke kurikulum
        </button>
      </p>
    </div>
  );
}
