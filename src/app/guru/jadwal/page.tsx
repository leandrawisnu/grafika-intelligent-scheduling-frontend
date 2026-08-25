"use client";

import { useRouter } from "next/navigation";
import { GURU, KELAS } from "@/lib/mock";
import { ScheduleGrid } from "@/components/schedule-grid";
import { usePrototype } from "@/lib/prototype-store";
import { cn } from "@/lib/utils";

export default function GuruJadwalPage() {
  const router = useRouter();
  const { viewGuruId, setViewGuruId, published, setRole } = usePrototype();
  const guru = GURU.find((g) => g.id === viewGuruId) ?? GURU[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jadwal mengajar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {published
            ? "Versi terbit. Perubahan kurikulum sudah masuk ke grid ini."
            : "Draft kurikulum. Perubahan konflik AI belum tentu final sampai publikasi."}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {GURU.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setViewGuruId(item.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              viewGuruId === item.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {item.nama}
          </button>
        ))}
      </div>
      <p className="text-sm">
        {guru.nama}
        {guru.hari_libur_ids.length > 0 ? " · hari piket Rabu" : ""}
      </p>
      <ScheduleGrid guruId={viewGuruId} interactive={false} />
      <p className="text-xs text-muted-foreground">
        Demo: ganti role di sidebar. Kelas siswa ada di tampilan Siswa
        {KELAS.length ? ` (${KELAS.map((k) => k.nama).join(", ")})` : ""}.
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
