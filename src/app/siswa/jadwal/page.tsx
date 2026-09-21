"use client";

import { useRouter } from "next/navigation";
import { KELAS } from "@/lib/mock";
import { ScheduleGrid } from "@/components/schedule-grid";
import { usePrototype } from "@/lib/prototype-store";
import { cn } from "@/lib/utils";

export default function SiswaJadwalPage() {
  const router = useRouter();
  const { viewKelasId, setViewKelasId, published, setRole } = usePrototype();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jadwal pelajaran</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {published
            ? "Jadwal kelas yang sudah dipublikasikan kurikulum."
            : "Masih draf. Siswa di sekolah nyata hanya melihat versi terbit."}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {KELAS.map((kelas) => (
          <button
            key={kelas.id}
            type="button"
            onClick={() => setViewKelasId(kelas.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              viewKelasId === kelas.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {kelas.nama}
          </button>
        ))}
      </div>
      <ScheduleGrid kelasId={viewKelasId} interactive={false} />
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
