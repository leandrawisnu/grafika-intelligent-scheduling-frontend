export interface TahunAjaran {
  id: string;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  aktif: boolean;
}

export interface Semester {
  id: string;
  tahun_ajaran_id: string;
  nama: string;
  semester_ke: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  aktif: boolean;
}

export interface Jurusan {
  id: string;
  kode: string;
  nama: string;
}

export interface Guru {
  id: string;
  nip: string;
  nama_lengkap: string;
  jam_maksimal_per_minggu: number;
  aktif: boolean;
}

export interface MataPelajaran {
  id: string;
  kode: string;
  nama: string;
  jam_wajib_per_minggu: number;
  tingkat: number;
}

export interface Kelas {
  id: string;
  kode: string;
  nama: string;
  tingkat: number;
  jurusan_id: string;
  semester_id: string;
}

export interface Ruangan {
  id: string;
  kode: string;
  nama: string;
  kapasitas: number;
  tipe_ruangan: string;
  aktif: boolean;
}

export interface Hari {
  id: string;
  nama: string;
  urutan_hari: number;
  akhir_pekan: boolean;
}

export interface JamPelajaran {
  id: string;
  jam_ke: number;
  waktu_mulai: string;
  waktu_selesai: string;
  istirahat: boolean;
}

// === JADWAL BARU ===

export interface KonflikPerTipe {
  tipe_konflik: string;
  jumlah: number;
}

export interface RingkasanJadwal {
  jumlah_slot: number;
  jumlah_tanpa_guru: number;
  jumlah_konflik_terbuka: number;
  jumlah_kesalahan: number;
  jumlah_peringatan: number;
  konflik_per_tipe: KonflikPerTipe[];
}

export interface JadwalSemester {
  id: string;
  semester_id: string;
  status: string;
  bebas_konflik: boolean;
  perlu_validasi?: boolean;
  punya_kelas_aktif?: boolean;
  jurusan?: JadwalSemesterJurusan[];
  jadwal_kelas?: JadwalKelas[];
  semester?: { nama: string; tahun_ajaran_id: string };
}

export interface JadwalSemesterJurusan {
  id: string;
  jadwal_semester_id: string;
  jurusan_id: string;
  jurusan?: { kode: string; nama: string };
}

export interface JadwalKelas {
  id: string;
  jadwal_semester_id: string;
  jurusan_id: string;
  kelas_id: string;
  versi: number;
  is_active: boolean;
  kelas?: { nama: string };
  jurusan?: { nama: string };
  slot_jadwal?: SlotJadwal[];
}

export interface SlotJadwal {
  id: string;
  jadwal_kelas_id: string;
  kelas_id: string;
  mata_pelajaran_id: string;
  hari_id: string;
  jam_pelajaran_id: string;
  ruangan_id: string | null;
  guru_id: string | null;
  minggu_ke: number;
  terkunci: boolean;
  kelas?: { nama: string };
  mata_pelajaran?: { nama: string };
  hari?: { nama: string };
  jam_pelajaran?: { waktu_mulai: string; waktu_selesai: string };
  ruangan?: { nama: string };
  guru?: { nama_lengkap: string };
}

export interface BarisImpor {
  hari: string;
  jam: string;
  mata_pelajaran: string;
  kelas: string;
  guru: string;
  ruangan: string;
  hari_id?: string;
  jam_pelajaran_id?: string;
  mata_pelajaran_id?: string;
  kelas_id?: string;
  guru_id?: string;
  ruangan_id?: string;
  status: "siap" | "perlu_pilihan" | "sudah_ada";
}

export interface PratinjauImpor {
  berkas_key: string;
  baris: BarisImpor[];
}

export interface Konflik {
  id: string;
  jadwal_semester_id: string;
  tipe_konflik: string;
  tingkat_keparahan: string;
  deskripsi: string;
  terselesaikan: boolean;
  terdeteksi_pada: string;
  slot_a_id?: string | null;
  slot_b_id?: string | null;
  guru_id?: string | null;
}
