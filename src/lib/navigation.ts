/** Halaman yang butuh sesi. Login dan beranda publik tidak termasuk. */
export function ruteAplikasi(pathname: string) {
  return (
    pathname !== "/" &&
    pathname !== "/style-guide" &&
    pathname !== "/login" &&
    !pathname.startsWith("/login/")
  );
}

/** Deep link ke halaman daftar konflik jadwal aktif. */
export function jadwalKonflikHref(activeJadwalId: string | null | undefined): string {
  return activeJadwalId ? `/jadwal/${activeJadwalId}/konflik` : "/jadwal";
}

export function jadwalDetailHref(activeJadwalId: string | null | undefined): string {
  return activeJadwalId ? `/jadwal/${activeJadwalId}` : "/jadwal";
}
