"use client";

import { CRUDPage } from "@/components/crud-page";
import { api } from "@/lib/api";

export default function JurusanPage() {
  return (
    <CRUDPage
      title="Jurusan"
      description="Kelola data jurusan"
      fields={[
        { key: "kode", label: "Kode Jurusan" },
        { key: "nama", label: "Nama Jurusan" },
      ]}
      fetchData={api.getJurusan}
      onCreate={(d) => api.createJurusan(d)}
      onUpdate={(id, d) => api.updateJurusan(id, d)}
      onDelete={(id) => api.deleteJurusan(id)}
      getInitialData={() => ({ kode: "", nama: "" })}
    />
  );
}
