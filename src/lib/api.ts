import type {
  TahunAjaran, Semester, Jurusan, Guru, MataPelajaran, Kelas, Ruangan, Hari, JamPelajaran,
  JadwalSemester, JadwalKelas, SlotJadwal, Konflik,
} from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Data Master
  getTahunAjaran: () => request<TahunAjaran[]>("/tahun-ajaran"),
  createTahunAjaran: (d: Partial<TahunAjaran>) => request<TahunAjaran>("/tahun-ajaran", { method: "POST", body: JSON.stringify(d) }),
  updateTahunAjaran: (id: string, d: Partial<TahunAjaran>) => request<TahunAjaran>(`/tahun-ajaran/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  deleteTahunAjaran: (id: string) => request<{status: string}>(`/tahun-ajaran/${id}`, { method: "DELETE" }),

  getSemester: (tahunAjaranId?: string) => request<Semester[]>(`/semester${tahunAjaranId ? `?tahun_ajaran_id=${tahunAjaranId}` : ""}`),
  createSemester: (d: Partial<Semester>) => request<Semester>("/semester", { method: "POST", body: JSON.stringify(d) }),

  getJurusan: () => request<Jurusan[]>("/jurusan"),
  createJurusan: (d: Partial<Jurusan>) => request<Jurusan>("/jurusan", { method: "POST", body: JSON.stringify(d) }),
  updateJurusan: (id: string, d: Partial<Jurusan>) => request<Jurusan>(`/jurusan/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  deleteJurusan: (id: string) => request<{status: string}>(`/jurusan/${id}`, { method: "DELETE" }),

  getGuru: () => request<Guru[]>("/guru"),
  createGuru: (d: Partial<Guru>) => request<Guru>("/guru", { method: "POST", body: JSON.stringify(d) }),
  updateGuru: (id: string, d: Partial<Guru>) => request<Guru>(`/guru/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  deleteGuru: (id: string) => request<{status: string}>(`/guru/${id}`, { method: "DELETE" }),

  getMataPelajaran: () => request<MataPelajaran[]>("/mata-pelajaran"),
  createMataPelajaran: (d: Partial<MataPelajaran>) => request<MataPelajaran>("/mata-pelajaran", { method: "POST", body: JSON.stringify(d) }),
  updateMataPelajaran: (id: string, d: Partial<MataPelajaran>) => request<MataPelajaran>(`/mata-pelajaran/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  deleteMataPelajaran: (id: string) => request<{status: string}>(`/mata-pelajaran/${id}`, { method: "DELETE" }),

  getKelas: (semesterId?: string) => request<Kelas[]>(`/kelas${semesterId ? `?semester_id=${semesterId}` : ""}`),
  createKelas: (d: Partial<Kelas>) => request<Kelas>("/kelas", { method: "POST", body: JSON.stringify(d) }),
  updateKelas: (id: string, d: Partial<Kelas>) => request<Kelas>(`/kelas/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  deleteKelas: (id: string) => request<{status: string}>(`/kelas/${id}`, { method: "DELETE" }),

  getRuangan: () => request<Ruangan[]>("/ruangan"),
  createRuangan: (d: Partial<Ruangan>) => request<Ruangan>("/ruangan", { method: "POST", body: JSON.stringify(d) }),
  updateRuangan: (id: string, d: Partial<Ruangan>) => request<Ruangan>(`/ruangan/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  deleteRuangan: (id: string) => request<{status: string}>(`/ruangan/${id}`, { method: "DELETE" }),

  getHari: () => request<Hari[]>("/hari"),
  getJamPelajaran: () => request<JamPelajaran[]>("/jam-pelajaran"),
  createJamPelajaran: (d: Partial<JamPelajaran>) => request<JamPelajaran>("/jam-pelajaran", { method: "POST", body: JSON.stringify(d) }),
  updateJamPelajaran: (id: string, d: Partial<JamPelajaran>) => request<JamPelajaran>(`/jam-pelajaran/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  deleteJamPelajaran: (id: string) => request<{status: string}>(`/jam-pelajaran/${id}`, { method: "DELETE" }),

  getHariLiburGuru: (guruId: string) => request<any[]>(`/guru/${guruId}/hari-libur`),
  createHariLiburGuru: (guruId: string, d: any) => request<any>(`/guru/${guruId}/hari-libur`, { method: "POST", body: JSON.stringify(d) }),
  getKualifikasiGuru: (guruId: string) => request<any[]>(`/guru/${guruId}/kualifikasi`),
  createKualifikasiGuru: (guruId: string, d: any) => request<any>(`/guru/${guruId}/kualifikasi`, { method: "POST", body: JSON.stringify(d) }),

  // === JADWAL SEMESTER ===
  createJadwalSemester: (d: { semester_id: string }) => request<JadwalSemester>("/jadwal-semester", { method: "POST", body: JSON.stringify(d) }),
  getJadwalSemester: () => request<JadwalSemester[]>("/jadwal-semester"),
  getJadwalSemesterById: (id: string) => request<JadwalSemester>(`/jadwal-semester/${id}`),
  updateStatus: (id: string, status: string) => request<JadwalSemester>(`/jadwal-semester/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  publikasi: (id: string) => request<JadwalSemester>(`/jadwal-semester/${id}/publikasi`, { method: "POST" }),
  batalkanPublikasi: (id: string) => request<JadwalSemester>(`/jadwal-semester/${id}/batalkan-publikasi`, { method: "POST" }),
  cekKesiapan: (id: string) => request<{siap: boolean; pesan: string}>(`/jadwal-semester/${id}/kesiapan`),

  // Jurusan dalam jadwal semester
  tambahJurusan: (id: string, jurusanIds: string[]) =>
    request<JadwalSemester>(`/jadwal-semester/${id}/jurusan`, { method: "POST", body: JSON.stringify({ jurusan_ids: jurusanIds }) }),
  hapusJurusan: (id: string, jurusanId: string) =>
    request<{status: string}>(`/jadwal-semester/${id}/jurusan/${jurusanId}`, { method: "DELETE" }),

  // === JADWAL KELAS ===
  createJadwalKelas: (jsId: string, d: { kelas_id: string }) =>
    request<JadwalKelas>(`/jadwal-semester/${jsId}/jadwal-kelas`, { method: "POST", body: JSON.stringify(d) }),
  getJadwalKelas: (id: string) => request<JadwalKelas>(`/jadwal-kelas/${id}`),
  getJadwalKelasAktif: (jsId: string) => request<JadwalKelas[]>(`/jadwal-semester/${jsId}/jadwal-kelas-aktif`),

  // Slot
  tambahSlot: (jkId: string, d: Partial<SlotJadwal>) =>
    request<SlotJadwal>(`/jadwal-kelas/${jkId}/slot`, { method: "POST", body: JSON.stringify(d) }),
  tambahSlotMassal: (jkId: string, slots: Partial<SlotJadwal>[]) =>
    request<SlotJadwal[]>(`/jadwal-kelas/${jkId}/slot/massal`, { method: "POST", body: JSON.stringify({ slots }) }),
  perbaruiSlot: (slotId: string, d: any) => request<SlotJadwal>(`/slot/${slotId}`, { method: "PUT", body: JSON.stringify(d) }),
  hapusSlot: (slotId: string) => request<{status: string}>(`/slot/${slotId}`, { method: "DELETE" }),

  // Penempatan Guru
  getSlotBelumDiplot: (jsId: string) => request<SlotJadwal[]>(`/jadwal-semester/${jsId}/slot-belum-diplot`),
  tugaskanGuru: (slotId: string, guruId: string) =>
    request<SlotJadwal>(`/slot/${slotId}/tugaskan-guru`, { method: "PUT", body: JSON.stringify({ guru_id: guruId }) }),
  tugaskanMassal: (jsId: string, tugas: { slot_id: string; guru_id: string }[]) =>
    request<{status: string}>(`/jadwal-semester/${jsId}/tugaskan-guru/massal`, { method: "POST", body: JSON.stringify({ tugas }) }),
  getKetersediaanGuru: (jsId: string) => request<any[]>(`/jadwal-semester/${jsId}/ketersediaan-guru`),

  // Konflik
  getKonflik: (jsId: string) => request<Konflik[]>(`/jadwal-semester/${jsId}/konflik`),
  validasiJadwal: (jsId: string) =>
    request<{jumlah_konflik: number; konflik: any[]; bersih: boolean}>(`/jadwal-semester/${jsId}/validasi`, { method: "POST" }),
  prediksiKonflik: (jsId: string) =>
    request<{konflik: any[]}>(`/jadwal-semester/${jsId}/prediksi-konflik`, { method: "POST" }),

  // AI
  selesaikanKonflik: (konflikId: string) =>
    request<{alternatif: any[]}>(`/konflik/${konflikId}/selesaikan`, { method: "POST" }),
  getResolusi: (konflikId: string) => request<any[]>(`/konflik/${konflikId}/resolusi`),
  terimaResolusi: (resolusiId: string) => request<{status: string}>(`/resolusi/${resolusiId}/terima`, { method: "POST" }),
  jelaskanKonflik: (konflikId: string) => request<any>(`/konflik/${konflikId}/jelaskan`, { method: "POST" }),
  aiTanya: (pertanyaan: string, jadwalSemesterId: string) =>
    request<{jawaban: string; data_hasil?: any}>(`/ai/tanya`, {
      method: "POST", body: JSON.stringify({ pertanyaan, jadwal_semester_id: jadwalSemesterId }),
    }),
};
