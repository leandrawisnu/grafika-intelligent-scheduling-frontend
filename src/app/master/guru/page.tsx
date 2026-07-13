"use client";

import { CRUDPage } from "@/components/crud-page";
import { api } from "@/lib/api";

export default function GuruPage() {
  return (
    <CRUDPage
      title="Data Guru"
      description="Kelola data guru dan jam mengajar maksimal per minggu"
      fields={[
        { key: "nip", label: "NIP" },
        { key: "nama_lengkap", label: "Nama Lengkap" },
        { key: "jam_maksimal_per_minggu", label: "Jam Maksimal/Minggu", type: "number" },
      ]}
      fetchData={api.getGuru}
      onCreate={(d) => api.createGuru(d)}
      onUpdate={(id, d) => api.updateGuru(id, d)}
      onDelete={(id) => api.deleteGuru(id)}
      getInitialData={() => ({ nip: "", nama_lengkap: "", jam_maksimal_per_minggu: 40 })}
    />
  );
}
