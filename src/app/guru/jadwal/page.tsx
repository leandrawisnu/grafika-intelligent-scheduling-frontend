"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScheduleGrid } from "@/components/schedule-grid";
import { useCatalog } from "@/lib/catalog-context";
import { useJadwal } from "@/lib/jadwal-context";
import { usePrototype } from "@/lib/prototype-store";
import { cn } from "@/lib/utils";

export default function GuruJadwalPage() {
  const router = useRouter();
  const catalog = useCatalog();
  const { published, slots, activeJadwalId } = useJadwal();
  const { viewGuruId, setViewGuruId, setRole } = usePrototype();

  useEffect(() => {
    if (!viewGuruId && catalog.guru[0]) setViewGuruId(catalog.guru[0].id);
  }, [catalog.guru, viewGuruId, setViewGuruId]);

  const guru = catalog.guru.find((g) => g.id === viewGuruId) ?? catalog.guru[0];
  const displaySlots = published ? slots : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="gis-page-title">Jadwal mengajar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {published
            ? "Versi terbit dari jadwal dipublikasikan."
            : "Jadwal belum dipublikasikan — grid kosong sampai kurikulum mempublikasikan."}
        </p>
      </div>
      {!activeJadwalId ? (
        <p className="text-sm text-muted-foreground">Belum ada jadwal semester.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {catalog.guru.filter((g) => g.aktif).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setViewGuruId(item.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  viewGuruId === item.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {item.nama_lengkap}
              </button>
            ))}
          </div>
          {guru ? <p className="text-sm">{guru.nama_lengkap}</p> : null}
          <ScheduleGrid
            guruId={guru?.id ?? null}
            slots={displaySlots}
            showConflicts={false}
            interactive={false}
          />
        </>
      )}
      <p className="text-xs text-muted-foreground">
        Demo: ganti role di akun sidebar.
        <button
          type="button"
          className="ml-1 underline"
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
