/** Deep link ke halaman daftar konflik jadwal aktif. */
export function jadwalKonflikHref(activeJadwalId: string | null | undefined): string {
  return activeJadwalId ? `/jadwal/${activeJadwalId}/konflik` : "/jadwal";
}

export function jadwalDetailHref(activeJadwalId: string | null | undefined): string {
  return activeJadwalId ? `/jadwal/${activeJadwalId}` : "/jadwal";
}
