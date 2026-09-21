export type Role = "kurikulum" | "guru" | "siswa";

export type ConflictType =
  | "guru_bentrok"
  | "ruangan_bentrok"
  | "guru_kelebihan_jam"
  | "guru_hari_libur";

export type Severity = "kesalahan" | "peringatan";

export type SlotField = "guru_id" | "hari_id" | "jam_pelajaran_id" | "ruangan_id";

export interface Hari {
  id: string;
  nama: string;
  urutan: number;
}

export interface JamPelajaran {
  id: string;
  jam_ke: number;
  waktu_mulai: string;
  waktu_selesai: string;
}

export interface Jurusan {
  id: string;
  kode: string;
  nama: string;
}

export interface Guru {
  id: string;
  nip: string;
  nama: string;
  jam_maksimal_per_hari: number;
  hari_libur_ids: string[];
  aktif: boolean;
}

export interface MataPelajaran {
  id: string;
  kode: string;
  nama: string;
  jam_wajib_per_minggu: number;
}

export interface Kelas {
  id: string;
  kode: string;
  nama: string;
  tingkat: number;
  jurusan_id: string;
}

export interface Ruangan {
  id: string;
  kode: string;
  nama: string;
  kapasitas: number;
  tipe: string;
}

export interface SlotJadwal {
  id: string;
  kelas_id: string;
  mata_pelajaran_id: string;
  hari_id: string;
  jam_pelajaran_id: string;
  ruangan_id: string | null;
  guru_id: string | null;
}

export interface SlotChange {
  slotId: string;
  field: SlotField;
  from: string | null;
  to: string | null;
  label: string;
}

export interface ResolveAlternative {
  id: string;
  rank: number;
  label: "A" | "B" | "C";
  confidence: number;
  summary: string;
  changes: SlotChange[];
  explanation: string;
  reasoningSteps: string[];
}

export interface PrototypeConflict {
  id: string;
  type: ConflictType;
  severity: Severity;
  description: string;
  slotIds: string[];
  teacherIds: string[];
  roomIds: string[];
  confidence: number;
  resolved: boolean;
  alternatives: ResolveAlternative[];
}

export interface QueryAnswer {
  id: string;
  keywords: string[];
  answer: string;
  table?: { columns: string[]; rows: string[][] };
  list?: string[];
}

export interface WorkflowStep {
  id: string;
  label: string;
  href: string;
  status: "done" | "current" | "locked" | "todo";
}

export const CONFLICT_LABEL: Record<ConflictType, string> = {
  guru_bentrok: "Guru Bentrok",
  ruangan_bentrok: "Ruangan Bentrok",
  guru_kelebihan_jam: "Guru Kelebihan Jam",
  guru_hari_libur: "Guru Hari Piket",
};

export const JADWAL_ID = "js-ganjil-2026";
export const SEMESTER_LABEL = "Ganjil 2026/2027";
