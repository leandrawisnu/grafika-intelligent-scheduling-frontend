"use client";

import { CRUDPage } from "@/components/crud-page";
import { api } from "@/lib/api";

export default function TahunAjaranPage() {
  return (
    <CRUDPage
      title="Tahun Ajaran"
      description="Kelola data tahun ajaran"
      fields={[
        { key: "nama", label: "Nama", required: true, placeholder: "2025/2026" },
        {
          key: "tanggal_mulai",
          label: "Tanggal mulai",
          type: "date",
          required: true,
        },
        {
          key: "tanggal_selesai",
          label: "Tanggal selesai",
          type: "date",
          required: true,
        },
      ]}
      fetchData={api.getTahunAjaran}
      onCreate={(d) => api.createTahunAjaran(d)}
      onUpdate={(id, d) => api.updateTahunAjaran(id, d)}
      onDelete={(id) => api.deleteTahunAjaran(id)}
      getInitialData={() => ({ nama: "", tanggal_mulai: "", tanggal_selesai: "" })}
    />
  );
}
