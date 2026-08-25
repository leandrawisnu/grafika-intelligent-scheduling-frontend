import type {
  Guru,
  Hari,
  JamPelajaran,
  Jurusan,
  Kelas,
  MataPelajaran,
  Ruangan,
} from "@/lib/prototype-types";

export const HARI: Hari[] = [
  { id: "h-sen", nama: "Senin", urutan: 1 },
  { id: "h-sel", nama: "Selasa", urutan: 2 },
  { id: "h-rab", nama: "Rabu", urutan: 3 },
  { id: "h-kam", nama: "Kamis", urutan: 4 },
  { id: "h-jum", nama: "Jumat", urutan: 5 },
];

export const JAM: JamPelajaran[] = [
  { id: "j-1", jam_ke: 1, waktu_mulai: "07:00", waktu_selesai: "07:45" },
  { id: "j-2", jam_ke: 2, waktu_mulai: "07:45", waktu_selesai: "08:30" },
  { id: "j-3", jam_ke: 3, waktu_mulai: "08:30", waktu_selesai: "09:15" },
  { id: "j-4", jam_ke: 4, waktu_mulai: "09:15", waktu_selesai: "10:00" },
  { id: "j-5", jam_ke: 5, waktu_mulai: "10:15", waktu_selesai: "11:00" },
  { id: "j-6", jam_ke: 6, waktu_mulai: "11:00", waktu_selesai: "11:45" },
  { id: "j-7", jam_ke: 7, waktu_mulai: "11:45", waktu_selesai: "12:30" },
  { id: "j-8", jam_ke: 8, waktu_mulai: "13:00", waktu_selesai: "13:45" },
];

export const JURUSAN: Jurusan[] = [
  { id: "jur-dkv", kode: "DKV", nama: "Desain Komunikasi Visual" },
  { id: "jur-pg", kode: "PG", nama: "Produksi Grafika" },
  { id: "jur-mm", kode: "MM", nama: "Multimedia" },
];

export const MAPEL: MataPelajaran[] = [
  { id: "m-agama", kode: "PAI", nama: "Pendidikan Agama", jam_wajib_per_minggu: 2 },
  { id: "m-bind", kode: "BIN", nama: "Bahasa Indonesia", jam_wajib_per_minggu: 2 },
  { id: "m-mat", kode: "MTK", nama: "Matematika", jam_wajib_per_minggu: 2 },
  { id: "m-pjok", kode: "PJOK", nama: "PJOK", jam_wajib_per_minggu: 2 },
  { id: "m-pkk", kode: "PKK", nama: "PKK", jam_wajib_per_minggu: 2 },
  { id: "m-desgraf", kode: "DG", nama: "Desain Grafis", jam_wajib_per_minggu: 8 },
  { id: "m-tipografi", kode: "TIP", nama: "Tipografi", jam_wajib_per_minggu: 4 },
  { id: "m-ilustrasi", kode: "ILS", nama: "Ilustrasi", jam_wajib_per_minggu: 4 },
  { id: "m-prod-cetak", kode: "PC", nama: "Produksi Cetak", jam_wajib_per_minggu: 8 },
  { id: "m-prod-digital", kode: "PD", nama: "Produksi Digital", jam_wajib_per_minggu: 4 },
  { id: "m-animasi", kode: "AN2", nama: "Animasi 2D", jam_wajib_per_minggu: 6 },
  { id: "m-editing", kode: "EDV", nama: "Editing Video", jam_wajib_per_minggu: 4 },
];

export const GURU: Guru[] = [
  {
    id: "g-ahmad",
    nip: "19780412 200501 1 003",
    nama: "Ahmad Fauzi",
    jam_maksimal_per_hari: 6,
    hari_libur_ids: [],
    mapel_ids: ["m-desgraf", "m-tipografi"],
    aktif: true,
  },
  {
    id: "g-sari",
    nip: "19820618 200604 2 008",
    nama: "Sari Wulandari",
    jam_maksimal_per_hari: 6,
    hari_libur_ids: [],
    mapel_ids: ["m-prod-cetak"],
    aktif: true,
  },
  {
    id: "g-budi",
    nip: "19791103 200312 1 012",
    nama: "Budi Santoso",
    jam_maksimal_per_hari: 6,
    hari_libur_ids: ["h-rab"],
    mapel_ids: ["m-pkk"],
    aktif: true,
  },
  {
    id: "g-rina",
    nip: "19900322 201503 2 004",
    nama: "Rina Kusuma",
    jam_maksimal_per_hari: 6,
    hari_libur_ids: [],
    mapel_ids: ["m-desgraf", "m-ilustrasi"],
    aktif: true,
  },
  {
    id: "g-dedi",
    nip: "19881201 201201 1 009",
    nama: "Dedi Pratama",
    jam_maksimal_per_hari: 6,
    hari_libur_ids: [],
    mapel_ids: ["m-prod-digital", "m-prod-cetak"],
    aktif: true,
  },
  {
    id: "g-lina",
    nip: "19910514 201604 2 011",
    nama: "Lina Marlina",
    jam_maksimal_per_hari: 6,
    hari_libur_ids: [],
    mapel_ids: ["m-animasi", "m-editing"],
    aktif: true,
  },
  {
    id: "g-eko",
    nip: "19760109 199903 1 002",
    nama: "Eko Nugroho",
    jam_maksimal_per_hari: 6,
    hari_libur_ids: [],
    mapel_ids: ["m-mat"],
    aktif: true,
  },
  {
    id: "g-fitri",
    nip: "19850327 200803 2 006",
    nama: "Fitri Handayani",
    jam_maksimal_per_hari: 6,
    hari_libur_ids: [],
    mapel_ids: ["m-bind"],
    aktif: true,
  },
  {
    id: "g-agus",
    nip: "19810711 200502 1 015",
    nama: "Agus Rahman",
    jam_maksimal_per_hari: 6,
    hari_libur_ids: [],
    mapel_ids: ["m-pjok"],
    aktif: true,
  },
  {
    id: "g-maya",
    nip: "19920808 201702 2 003",
    nama: "Maya Putri",
    jam_maksimal_per_hari: 6,
    hari_libur_ids: [],
    mapel_ids: ["m-agama"],
    aktif: true,
  },
];

export const KELAS: Kelas[] = [
  { id: "k-xidkv1", kode: "XI-DKV-1", nama: "XI DKV 1", tingkat: 11, jurusan_id: "jur-dkv" },
  { id: "k-xipg1", kode: "XI-PG-1", nama: "XI PG 1", tingkat: 11, jurusan_id: "jur-pg" },
  { id: "k-ximm1", kode: "XI-MM-1", nama: "XI MM 1", tingkat: 11, jurusan_id: "jur-mm" },
];

export const RUANGAN: Ruangan[] = [
  { id: "r-labkom1", kode: "LK-1", nama: "Lab Komputer 1", kapasitas: 36, tipe: "lab" },
  { id: "r-labkom2", kode: "LK-2", nama: "Lab Komputer 2", kapasitas: 36, tipe: "lab" },
  { id: "r-studio", kode: "ST-DKV", nama: "Studio DKV", kapasitas: 28, tipe: "studio" },
  { id: "r-bengkel", kode: "BG-CET", nama: "Bengkel Cetak", kapasitas: 24, tipe: "bengkel" },
  { id: "r-labmm", kode: "LM-1", nama: "Lab Multimedia", kapasitas: 32, tipe: "lab" },
  { id: "r-teori1", kode: "RT-1", nama: "R. Teori 1", kapasitas: 36, tipe: "teori" },
  { id: "r-teori2", kode: "RT-2", nama: "R. Teori 2", kapasitas: 36, tipe: "teori" },
  { id: "r-lapangan", kode: "LP", nama: "Lapangan", kapasitas: 80, tipe: "lapangan" },
];

export const byId = <T extends { id: string }>(rows: T[]) =>
  Object.fromEntries(rows.map((row) => [row.id, row])) as Record<string, T>;

export const HARI_BY_ID = byId(HARI);
export const JAM_BY_ID = byId(JAM);
export const JURUSAN_BY_ID = byId(JURUSAN);
export const MAPEL_BY_ID = byId(MAPEL);
export const GURU_BY_ID = byId(GURU);
export const KELAS_BY_ID = byId(KELAS);
export const RUANGAN_BY_ID = byId(RUANGAN);

export function jamId(jamKe: number) {
  return `j-${jamKe}`;
}
