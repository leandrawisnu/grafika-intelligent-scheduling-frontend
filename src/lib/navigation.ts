/** Deep link ke tab konflik jadwal aktif (atau daftar jadwal). */
export function jadwalKonflikHref(activeJadwalId: string | null | undefined): string {
  return activeJadwalId ? `/jadwal/${activeJadwalId}?tab=konflik` : "/jadwal";
}

export function jadwalDetailHref(activeJadwalId: string | null | undefined): string {
  return activeJadwalId ? `/jadwal/${activeJadwalId}` : "/jadwal";
}
