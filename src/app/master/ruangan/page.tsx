"use client";

import { useEffect, useMemo, useState } from "react";
import { CRUDPage } from "@/components/crud-page";
import { api, type TableQuery } from "@/lib/api";
import { useJadwal } from "@/lib/jadwal-context";
import type { Semester } from "@/lib/types";

export default function RuanganPage() {
  const { jadwal } = useJadwal();
  const semesterAktifId = jadwal?.semester_id ?? "";
  const [semester, setSemester] = useState<Semester[]>([]);

  useEffect(() => {
    api.getSemester().then(setSemester).catch(() => setSemester([]));
  }, []);

  useEffect(() => {
    if (semesterAktifId) api.getRuangan(semesterAktifId).catch(() => {});
  }, [semesterAktifId]);

  const semesterOptions = useMemo(
    () => semester.map((s) => ({ value: s.id, label: s.nama })),
    [semester]
  );

  const fetchRuangan = (query: TableQuery) =>
    api.listRuangan({
      ...query,
      filters: {
        ...query.filters,
        ...(semesterAktifId ? { semester_id: semesterAktifId } : {}),
      },
    });

  return (
    <CRUDPage
      key={semesterAktifId || "semua"}
      title="Ruangan"
      description="Kelola data ruangan per semester"
      aiImpor
      fields={[
        { key: "kode", label: "Kode Ruangan" },
        { key: "nama", label: "Nama Ruangan" },
        { key: "kapasitas", label: "Kapasitas", type: "number" },
        {
          key: "semester_id",
          label: "Semester",
          type: "select" as const,
          options: semesterOptions,
        },
      ]}
      fetchData={fetchRuangan}
      onCreate={(d) => {
        const semesterId = String(d.semester_id ?? "").trim();
        if (!semesterId) throw new Error("Pilih semester");
        return api.createRuangan({ ...d, semester_id: semesterId });
      }}
      onUpdate={(id, d) => {
        const semesterId = String(d.semester_id ?? "").trim();
        if (!semesterId) throw new Error("Pilih semester");
        return api.updateRuangan(id, { ...d, semester_id: semesterId });
      }}
      onDelete={(id) => api.deleteRuangan(id)}
      getInitialData={() => ({
        kode: "",
        nama: "",
        kapasitas: 30,
        semester_id: semesterAktifId || semesterOptions[0]?.value || "",
      })}
    />
  );
}
