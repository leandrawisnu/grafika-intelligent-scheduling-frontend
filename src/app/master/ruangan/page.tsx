"use client";

import { CRUDPage } from "@/components/crud-page";
import { api } from "@/lib/api";

export default function RuanganPage() {
  return (
    <CRUDPage
      title="Ruangan"
      description="Kelola data ruangan"
      fields={[
        { key: "kode", label: "Kode Ruangan" },
        { key: "nama", label: "Nama Ruangan" },
        { key: "kapasitas", label: "Kapasitas", type: "number" },
      ]}
      fetchData={api.getRuangan}
      onCreate={(d) => api.createRuangan(d)}
      onUpdate={(id, d) => api.updateRuangan(id, d)}
      onDelete={(id) => api.deleteRuangan(id)}
      getInitialData={() => ({ kode: "", nama: "", kapasitas: 30 })}
    />
  );
}
