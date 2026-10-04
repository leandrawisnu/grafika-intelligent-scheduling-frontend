"use client";

import { useEffect, useMemo, useState } from "react";
import { CRUDPage } from "@/components/crud-page";
import { api, type TableQuery } from "@/lib/api";
import { useJadwal } from "@/lib/jadwal-context";
import type { Semester } from "@/lib/types";

export default function JurusanPage() {
  const { jadwal } = useJadwal();
  const semesterAktifId = jadwal?.semester_id ?? "";
  const [semester, setSemester] = useState<Semester[]>([]);

  useEffect(() => {
    api.getSemester().then(setSemester).catch(() => setSemester([]));
  }, []);

  useEffect(() => {
    if (semesterAktifId) api.getJurusan(semesterAktifId).catch(() => {});
  }, [semesterAktifId]);

  const semesterOptions = useMemo(
    () => semester.map((s) => ({ value: s.id, label: s.nama })),
    [semester]
  );

  const fetchJurusan = (query: TableQuery) =>
    api.listJurusan({
      ...query,
      filters: {
        ...query.filters,
        ...(semesterAktifId ? { semester_id: semesterAktifId } : {}),
      },
    });

  return (
    <CRUDPage
      key={semesterAktifId || "semua"}
      title="Jurusan"
      description="Kelola data jurusan per semester"
      fields={[
        { key: "kode", label: "Kode Jurusan" },
        { key: "nama", label: "Nama Jurusan" },
        {
          key: "semester_id",
          label: "Semester",
          type: "select" as const,
          options: semesterOptions,
        },
      ]}
      fetchData={fetchJurusan}
      onCreate={(d) => {
        const semesterId = String(d.semester_id ?? "").trim();
        if (!semesterId) throw new Error("Pilih semester");
        return api.createJurusan({ ...d, semester_id: semesterId });
      }}
      onUpdate={(id, d) => {
        const semesterId = String(d.semester_id ?? "").trim();
        if (!semesterId) throw new Error("Pilih semester");
        return api.updateJurusan(id, { ...d, semester_id: semesterId });
      }}
      onDelete={(id) => api.deleteJurusan(id)}
      getInitialData={() => ({
        kode: "",
        nama: "",
        semester_id: semesterAktifId || semesterOptions[0]?.value || "",
      })}
    />
  );
}
