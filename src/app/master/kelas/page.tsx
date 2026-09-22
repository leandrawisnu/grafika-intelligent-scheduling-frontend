"use client";

import { useEffect, useMemo, useState } from "react";
import { CRUDPage } from "@/components/crud-page";
import { api } from "@/lib/api";
import type { Jurusan, Semester } from "@/lib/types";

function kelasPayload(form: Record<string, unknown>) {
  const jurusanId = String(form.jurusan_id ?? "").trim();
  const semesterId = String(form.semester_id ?? "").trim();
  return {
    kode: String(form.kode ?? "").trim(),
    nama: String(form.nama ?? "").trim(),
    tingkat: Number(form.tingkat) || 10,
    jurusan_id: jurusanId,
    semester_id: semesterId,
  };
}

export default function KelasPage() {
  const [jurusan, setJurusan] = useState<Jurusan[]>([]);
  const [semester, setSemester] = useState<Semester[]>([]);

  useEffect(() => {
    api.getJurusan().then(setJurusan).catch(() => setJurusan([]));
    api.getSemester().then(setSemester).catch(() => setSemester([]));
  }, []);

  const jurusanOptions = useMemo(
    () => jurusan.map((j) => ({ value: j.id, label: j.nama })),
    [jurusan]
  );
  const semesterOptions = useMemo(
    () => semester.map((s) => ({ value: s.id, label: s.nama })),
    [semester]
  );

  const fields = useMemo(
    () => [
      { key: "kode", label: "Kode Kelas" },
      { key: "nama", label: "Nama Kelas" },
      { key: "tingkat", label: "Tingkat (10/11/12)", type: "number" as const },
      {
        key: "jurusan_id",
        label: "Jurusan",
        type: "select" as const,
        options: jurusanOptions,
      },
      {
        key: "semester_id",
        label: "Semester",
        type: "select" as const,
        options: semesterOptions,
      },
    ],
    [jurusan, semester, jurusanOptions, semesterOptions]
  );

  return (
    <CRUDPage
      title="Kelas"
      description="Kelola data kelas"
      fields={fields}
      fetchData={() => api.getKelas()}
      onCreate={(d) => {
        const p = kelasPayload(d);
        if (!p.semester_id) throw new Error("Pilih semester");
        if (!jurusanOptions.some((o) => o.value === p.jurusan_id)) {
          throw new Error("Pilih jurusan");
        }
        return api.createKelas(p);
      }}
      onUpdate={(id, d) => {
        const p = kelasPayload(d);
        if (!p.semester_id) throw new Error("Pilih semester");
        if (!jurusanOptions.some((o) => o.value === p.jurusan_id)) {
          throw new Error("Pilih jurusan");
        }
        return api.updateKelas(id, p);
      }}
      onDelete={(id) => api.deleteKelas(id)}
      getInitialData={() => ({
        kode: "",
        nama: "",
        tingkat: 10,
        jurusan_id: jurusanOptions[0]?.value ?? "",
        semester_id: semesterOptions[0]?.value ?? "",
      })}
    />
  );
}
