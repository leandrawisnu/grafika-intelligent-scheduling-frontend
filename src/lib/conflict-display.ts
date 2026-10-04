import type { Konflik, SlotJadwal } from "@/lib/types";

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

export type ConflictRowSummary = {
  title: string;
  detail: string;
};

type GuruNameLookup = (id: string | null | undefined) => string | null;

function named(catalogName: string | null | undefined, parsed: string, id?: string | null) {
  const fromCatalog = (catalogName || "").trim();
  if (fromCatalog && (!id || fromCatalog !== id)) return fromCatalog;
  const fromText = parsed.trim();
  if (fromText) return fromText;
  return "—";
}

function jamAngka(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return String(Math.round(n));
}

function ringkasKelebihanJam(k: Konflik, guruName?: GuruNameLookup): ConflictRowSummary | null {
  const match = k.deskripsi.match(
    /^Guru (.+) memiliki total (\d+(?:\.\d+)?) jam mengajar per minggu, melebihi batas maksimal (\d+(?:\.\d+)?) jam$/,
  );
  if (!match) return null;
  return {
    title: named(guruName?.(k.guru_id), match[1], k.guru_id),
    detail: `${jamAngka(match[2])} jam · batas ${jamAngka(match[3])}`,
  };
}

function ringkasDariKalimat(k: Konflik, guruName?: GuruNameLookup): ConflictRowSummary | null {
  const bentrokGuru = k.deskripsi.match(
    /^Guru (.+) mengajar dua kelas \(.+ & .+\) pada jam (.+) hari (.+)$/,
  );
  if (bentrokGuru) {
    return {
      title: named(guruName?.(k.guru_id), bentrokGuru[1], k.guru_id),
      detail: `dua kelas · ${bentrokGuru[3]} ${bentrokGuru[2]}`,
    };
  }

  const libur = k.deskripsi.match(/^Guru (.+) dijadwalkan pada hari (.+) yang merupakan hari liburnya$/);
  if (libur) {
    return {
      title: named(guruName?.(k.guru_id), libur[1], k.guru_id),
      detail: libur[2],
    };
  }

  const ruang = k.deskripsi.match(/^Ruangan (.+) digunakan oleh (.+) dan (.+) pada jam (.+) hari (.+)$/);
  if (ruang) {
    return {
      title: ruang[1],
      detail: `${ruang[2]} & ${ruang[3]} · ${ruang[5]} ${ruang[4]}`,
    };
  }

  const kelas = k.deskripsi.match(
    /^Kelas (.+) memiliki dua mata pelajaran \((.+) & (.+)\) pada jam (.+) hari (.+)$/,
  );
  if (kelas) {
    return {
      title: kelas[1],
      detail: `${kelas[2]} & ${kelas[3]} · ${kelas[5]} ${kelas[4]}`,
    };
  }

  return null;
}

export function conflictRowSummary(k: Konflik, guruName?: GuruNameLookup): ConflictRowSummary {
  if (k.tipe_konflik === "guru_kelebihan_jam") {
    const row = ringkasKelebihanJam(k, guruName);
    if (row) return row;
  }
  const row = ringkasDariKalimat(k, guruName);
  if (row) return row;
  const deskripsi = (k.deskripsi || "").trim();
  return { title: deskripsi || "—", detail: "" };
}

const TIPE_LEWAT_GURU = new Set(["guru_kelebihan_jam", "guru_hari_libur"]);

export function konflikMenyentuhKelas(konflik: Konflik, kelasId: string, slots: SlotJadwal[]) {
  if (!kelasId) return true;
  const slotIds = [konflik.slot_a_id, konflik.slot_b_id].filter(Boolean);
  if (slotIds.length > 0) {
    return slots.some((slot) => slotIds.includes(slot.id) && slot.kelas_id === kelasId);
  }
  if (!TIPE_LEWAT_GURU.has(konflik.tipe_konflik) || !konflik.guru_id) return false;
  return slots.some((slot) => slot.guru_id === konflik.guru_id && slot.kelas_id === kelasId);
}

export function groupKonflikByType(items: Konflik[]) {
  const order: string[] = [];
  const grouped = new Map<string, Konflik[]>();
  for (const item of items) {
    const type = item.tipe_konflik;
    const bucket = grouped.get(type);
    if (!bucket) {
      order.push(type);
      grouped.set(type, [item]);
      continue;
    }
    bucket.push(item);
  }
  return order.map((type) => ({ type, items: grouped.get(type) ?? [] }));
}

/** Normalisasi baris konflik dari API (ringkas atau lengkap). */
export function normalisasiKonflik(row: Partial<Konflik> & Record<string, unknown>): Konflik {
  return {
    id: String(row.id ?? ""),
    jadwal_semester_id: String(row.jadwal_semester_id ?? ""),
    tipe_konflik: String(row.tipe_konflik ?? ""),
    tingkat_keparahan: String(row.tingkat_keparahan ?? ""),
    deskripsi: String(row.deskripsi ?? ""),
    terselesaikan: Boolean(row.terselesaikan),
    terdeteksi_pada: String(row.terdeteksi_pada ?? ""),
    slot_a_id: (row.slot_a_id as string | null | undefined) ?? null,
    slot_b_id: (row.slot_b_id as string | null | undefined) ?? null,
    guru_id: (row.guru_id as string | null | undefined) ?? null,
  };
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
