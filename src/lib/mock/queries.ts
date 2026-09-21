import type { QueryAnswer } from "@/lib/prototype-types";

export const QUERY_BANK: QueryAnswer[] = [
  {
    id: "bentrok-senin",
    keywords: ["bentrok", "senin", "guru siapa"],
    answer:
      "Satu guru bentrok pada Senin: Ahmad Fauzi. Ia diplot di XI DKV 1 (Desain Grafis, Lab Komputer 1) dan XI MM 1 (Animasi 2D, Lab Multimedia) pada jam ke-3 (08:30–09:15). AI menilai risiko kesalahan dengan keyakinan 97%.",
    table: {
      columns: ["Guru", "Kelas", "Mapel", "Jam", "Ruangan"],
      rows: [
        ["Ahmad Fauzi", "XI DKV 1", "Desain Grafis", "Senin jam ke-3", "Lab Komputer 1"],
        ["Ahmad Fauzi", "XI MM 1", "Animasi 2D", "Senin jam ke-3", "Lab Multimedia"],
      ],
    },
  },
  {
    id: "paling-banyak",
    keywords: ["paling banyak", "beban", "minggu ini"],
    answer:
      "Sari Wulandari paling banyak mengajar minggu ini: 16 jam, termasuk 7 jam pada Selasa (melebihi batas 6 jam/hari). Dedi Pratama 6 jam, Ahmad Fauzi 9 jam sebelum resolusi.",
    table: {
      columns: ["Guru", "Jam minggu ini", "Catatan AI"],
      rows: [
        ["Sari Wulandari", "16", "Kelebihan jam Selasa"],
        ["Ahmad Fauzi", "9", "Bentrok Senin jam ke-3"],
        ["Lina Marlina", "11", "Aman"],
        ["Dedi Pratama", "6", "Terlibat bentrok Lab Komputer 1"],
      ],
    },
  },
  {
    id: "slot-ahmad",
    keywords: ["slot kosong", "pak ahmad", "ahmad"],
    answer:
      "Slot kosong yang aman untuk Ahmad Fauzi (tidak bentrok, di bawah batas harian, bukan hari libur):",
    list: [
      "Senin jam ke-6 dan ke-7 — XI DKV 1 jam ke-7 belum diplot; Ahmad bebas jam ke-6–8.",
      "Selasa jam ke-7–8 — Ahmad selesai jam ke-6.",
      "Rabu jam ke-5–8 — Ahmad hanya sampai jam ke-4.",
      "Kamis sepanjang hari — Ahmad tidak diplot.",
      "Jumat jam ke-4–8 — Ahmad selesai jam ke-2.",
    ],
  },
  {
    id: "publikasi-dkv",
    keywords: ["mengapa", "belum", "publikasi", "dkv", "dipublikasikan"],
    answer:
      "Jadwal XI DKV belum dapat dipublikasikan karena semester ini masih punya konflik lintas jurusan. Publikasi dikunci sampai seluruh konflik terselesaikan, bukan hanya kelas DKV.",
    list: [
      "Ahmad Fauzi bentrok Senin jam ke-3 (DKV × MM).",
      "Lab Komputer 1 dobel Selasa jam ke-2 (DKV × PG).",
      "Sari Wulandari kelebihan jam Selasa (PG, memblokir sinkronisasi).",
      "Budi Santoso diplot di hari piket Rabu (PG).",
      "Tiga slot masih belum diplot guru.",
    ],
  },
  {
    id: "semua-konflik",
    keywords: ["seluruh konflik", "semua konflik", "konflik minggu"],
    answer:
      "AI Conflict Predictor menemukan 4 potensi konflik pada Ganjil 2026/2027. Dua berstatus kesalahan (wajib diselesaikan), satu kesalahan beban jam, satu peringatan hari piket.",
    table: {
      columns: ["Jenis", "Pihak", "Waktu", "Risiko", "Keyakinan"],
      rows: [
        ["Guru bentrok", "Ahmad Fauzi", "Senin jam ke-3", "Kesalahan", "97%"],
        ["Ruangan bentrok", "Lab Komputer 1", "Selasa jam ke-2", "Kesalahan", "95%"],
        ["Kelebihan jam", "Sari Wulandari", "Selasa 7 jam", "Kesalahan", "93%"],
        ["Hari piket", "Budi Santoso", "Rabu jam ke-4", "Peringatan", "91%"],
      ],
    },
  },
];

export function matchQuery(text: string): QueryAnswer | null {
  const q = text.toLowerCase();
  const scored = QUERY_BANK.map((item) => ({
    item,
    hits: item.keywords.filter((k) => q.includes(k)).length,
  }));
  scored.sort((a, b) => b.hits - a.hits);
  if (scored[0].hits === 0) return null;
  return scored[0].item;
}
