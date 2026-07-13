"use client";

import { useEffect, useState } from "react";
import { CRUDPage } from "@/components/crud-page";
import { api } from "@/lib/api";

export default function KelasPage() {
  const [jurusan, setJurusan] = useState<any[]>([]);
  const [semester, setSemester] = useState<any[]>([]);

  useEffect(() => {
    api.getJurusan().then(setJurusan).catch(() => {});
    api.getSemester().then(setSemester).catch(() => {});
  }, []);

  return (
    <CRUDPage
      title="Kelas"
      description="Kelola data kelas"
      fields={[
        { key: "kode", label: "Kode Kelas" },
        { key: "nama", label: "Nama Kelas" },
        { key: "tingkat", label: "Tingkat (10/11/12)", type: "number" },
        { key: "jurusan_id", label: "Jurusan", type: "select", options: jurusan.map((j: any) => ({ value: j.id, label: j.nama })) },
        { key: "semester_id", label: "Semester", type: "select", options: semester.map((s: any) => ({ value: s.id, label: s.nama })) },
      ]}
      fetchData={() => api.getKelas()}
      onCreate={(d) => api.createKelas(d)}
      onUpdate={(id, d) => api.updateKelas(id, d)}
      onDelete={(id) => api.deleteKelas(id)}
      getInitialData={() => ({ kode: "", nama: "", tingkat: 10, jurusan_id: "", semester_id: "" })}
    />
  );
}
