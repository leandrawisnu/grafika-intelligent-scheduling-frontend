"use client";

import { CRUDPage } from "@/components/crud-page";
import { api } from "@/lib/api";

export default function MataPelajaranPage() {
  return (
    <CRUDPage
      title="Mata Pelajaran"
      description="Kelola data mata pelajaran"
      fields={[
        { key: "kode", label: "Kode" },
        { key: "nama", label: "Nama Mata Pelajaran" },
        { key: "jam_wajib_per_minggu", label: "Jam/Minggu", type: "number" },
        { key: "tingkat", label: "Tingkat (10/11/12)", type: "number" },
      ]}
      fetchData={api.getMataPelajaran}
      onCreate={(d) => api.createMataPelajaran(d)}
      onUpdate={(id, d) => api.updateMataPelajaran(id, d)}
      onDelete={(id) => api.deleteMataPelajaran(id)}
      getInitialData={() => ({ kode: "", nama: "", jam_wajib_per_minggu: 4, tingkat: 10 })}
    />
  );
}
