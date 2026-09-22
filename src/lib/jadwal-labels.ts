import type { JadwalSemester, Semester } from "@/lib/types";

/** Nested semester from API (`semester` or legacy `Semester`). */
export function nestedSemester(j: JadwalSemester): { nama?: string } | undefined {
  if (j.semester?.nama) return j.semester;
  const legacy = (j as JadwalSemester & { Semester?: { nama?: string } }).Semester;
  return legacy?.nama ? legacy : undefined;
}

export function jadwalSemesterLabel(
  j: JadwalSemester | null | undefined,
  catalog?: Semester[],
): string {
  if (!j) return "Belum ada jadwal aktif";
  const nama = nestedSemester(j)?.nama;
  if (nama) return nama;
  const fromCatalog = catalog?.find((s) => s.id === j.semester_id)?.nama;
  if (fromCatalog) return fromCatalog;
  return "—";
}
