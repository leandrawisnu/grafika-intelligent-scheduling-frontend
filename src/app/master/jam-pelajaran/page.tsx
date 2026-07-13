"use client";

import { CRUDPage } from "@/components/crud-page";
import { api } from "@/lib/api";

export default function JamPelajaranPage() {
  return (
    <CRUDPage
      title="Jam Pelajaran"
      description="Kelola slot waktu pelajaran"
      fields={[
        { key: "jam_ke", label: "Jam Ke-", type: "number" },
        { key: "waktu_mulai", label: "Mulai" },
        { key: "waktu_selesai", label: "Selesai" },
      ]}
      fetchData={api.getJamPelajaran}
      onCreate={(d) => api.createJamPelajaran(d)}
      onUpdate={(id, d) => api.updateJamPelajaran(id, d)}
      onDelete={(id) => api.deleteJamPelajaran(id)}
      getInitialData={() => ({ jam_ke: 1, waktu_mulai: "07:00", waktu_selesai: "07:45" })}
    />
  );
}
