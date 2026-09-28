"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CRUDPage } from "@/components/crud-page";
import { api } from "@/lib/api";
import { SEMESTER_KE_OPTIONS, labelSemesterKe } from "@/lib/semester-ke";
import type { TahunAjaran } from "@/lib/types";

export default function SemesterPage() {
  const [tahun, setTahun] = useState<TahunAjaran[]>([]);

  const loadTahun = useCallback(() => {
    void api.getTahunAjaran().then(setTahun).catch(() => setTahun([]));
  }, []);

  useEffect(() => {
    loadTahun();
  }, [loadTahun]);

  const tahunOptions = useMemo(
    () => tahun.map((t) => ({ value: t.id, label: t.nama })),
    [tahun],
  );

  const fields = useMemo(
    () => [
      {
        key: "tahun_ajaran_id",
        label: "Tahun ajaran",
        type: "select" as const,
        required: true,
        options: tahunOptions,
        emptyOptionsHint: "Belum ada tahun ajaran.",
        emptyOptionsHref: "/master/tahun-ajaran",
      },
      {
        key: "semester_ke",
        label: "Ganjil / Genap",
        type: "select" as const,
        selectVariant: "segmented" as const,
        required: true,
        options: [...SEMESTER_KE_OPTIONS],
        render: (value: unknown) => labelSemesterKe(value),
      },
      {
        key: "nama",
        label: "Nama semester",
        required: true,
        placeholder: "Ganjil 2026/2027",
      },
      {
        key: "tanggal_mulai",
        label: "Tanggal mulai",
        type: "date" as const,
        required: true,
      },
      {
        key: "tanggal_selesai",
        label: "Tanggal selesai",
        type: "date" as const,
        required: true,
      },
    ],
    [tahun, tahunOptions],
  );

  const normalizePayload = (p: Record<string, unknown>): Record<string, unknown> => ({
    ...p,
    semester_ke: Number(p.semester_ke ?? 1),
  });

  return (
    <CRUDPage
      title="Semester"
      description="Kelola semester per tahun ajaran"
      dialogTitle="Tambah semester"
      editDialogTitle="Edit semester"
      dialogHint="Pilih tahun ajaran yang sudah dibuat di menu Tahun ajaran."
      onDialogOpen={loadTahun}
      fields={fields}
      fetchData={api.getSemester}
      onCreate={async (d) => {
        const p = d as Record<string, unknown>;
        if (!p.tahun_ajaran_id) throw new Error("Pilih tahun ajaran");
        if (!String(p.nama ?? "").trim()) throw new Error("Nama semester wajib");
        const body = normalizePayload(p);
        return api.createSemester({
          tahun_ajaran_id: String(body.tahun_ajaran_id),
          nama: String(body.nama).trim(),
          semester_ke: Number(body.semester_ke ?? 1),
          tanggal_mulai: String(body.tanggal_mulai ?? ""),
          tanggal_selesai: String(body.tanggal_selesai ?? ""),
        });
      }}
      onUpdate={(id, d) => api.updateSemester(id, normalizePayload(d as Record<string, unknown>))}
      onDelete={(id) => api.deleteSemester(id)}
      getInitialData={() => ({
        tahun_ajaran_id: tahunOptions[0]?.value ?? "",
        nama: "",
        semester_ke: "1",
        tanggal_mulai: "",
        tanggal_selesai: "",
      })}
    />
  );
}
