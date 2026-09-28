import type { Konflik } from "@/lib/types";

export type ConflictListItem = {
  id: string;
  type: string;
  severity: string;
  description: string;
  confidence: number;
  slotIds: string[];
};

const LABEL: Record<string, string> = {
  guru_bentrok: "Guru bentrok",
  ruangan_bentrok: "Ruangan bentrok",
  kelas_bentrok: "Kelas bentrok",
  guru_kelebihan_jam: "Guru kelebihan jam",
  guru_hari_libur: "Guru hari libur",
  jam_mapel_kurang: "Jam mapel kurang",
  kapasitas_ruangan_melebihi: "Kapasitas ruangan",
};

export function conflictTypeLabel(type: string) {
  return LABEL[type] ?? type.replace(/_/g, " ");
}

export function konflikToListItem(k: Konflik): ConflictListItem {
  const slotIds = [k.slot_a_id, k.slot_b_id].filter(Boolean) as string[];
  return {
    id: k.id,
    type: k.tipe_konflik,
    severity: k.tingkat_keparahan,
    description: k.deskripsi,
    confidence: 1,
    slotIds,
  };
}
