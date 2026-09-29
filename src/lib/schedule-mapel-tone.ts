export type MapelTone = {
  label: string;
  cardBg: string;
  border: string;
  dot: string;
};

const TONES: MapelTone[] = [
  {
    label: "Praktik grafika",
    cardBg: "bg-sky-50/90",
    border: "border-l-sky-500",
    dot: "bg-sky-500",
  },
  {
    label: "Animasi",
    cardBg: "bg-violet-50/90",
    border: "border-l-violet-500",
    dot: "bg-violet-500",
  },
  {
    label: "Produksi",
    cardBg: "bg-amber-50/90",
    border: "border-l-amber-500",
    dot: "bg-amber-500",
  },
  {
    label: "Teori umum",
    cardBg: "bg-emerald-50/90",
    border: "border-l-emerald-500",
    dot: "bg-emerald-500",
  },
  {
    label: "Lainnya",
    cardBg: "bg-slate-50/90",
    border: "border-l-slate-400",
    dot: "bg-slate-400",
  },
];

const TEORI = TONES[3];
const LAINNYA = TONES[4];

const JURUSAN_PALETTE: { match: RegExp; tone: MapelTone }[] = [
  { match: /anim|\bani\b|multimedia|\bmm\b/, tone: TONES[1] },
  { match: /dkv|desain|grafis|grafika/, tone: TONES[0] },
  { match: /produksi|percetakan|\bpg\b|cetak/, tone: TONES[2] },
];

export type JurusanTone = { kode: string; nama: string };

const TEORI_KATA = [
  "matematika",
  "bahasa",
  "pkn",
  "ppkn",
  "pancasila",
  "sejarah",
  "agama",
  "pjok",
  "olahraga",
  "seni",
  "informatika",
  "bimbingan",
  "konseling",
  "profil pelajar",
];

function teoriUmum(nama: string): boolean {
  const lower = nama.toLowerCase();
  return TEORI_KATA.some((kata) => lower.includes(kata));
}

function toneJurusan(jurusan: JurusanTone): MapelTone {
  const blob = `${jurusan.kode} ${jurusan.nama}`.toLowerCase();
  const dasar = JURUSAN_PALETTE.find((item) => item.match.test(blob))?.tone ?? LAINNYA;
  const label = jurusan.nama.trim() || jurusan.kode.trim() || dasar.label;
  return { ...dasar, label };
}

function toneDariNama(mapelName: string): MapelTone {
  const lower = mapelName.toLowerCase();
  if (lower.includes("desain") || lower.includes("grafis") || lower.includes("foto") || lower.includes("layout")) {
    return TONES[0];
  }
  if (lower.includes("anim") || lower.includes("video") || lower.includes("multimedia")) {
    return TONES[1];
  }
  if (
    lower.includes("produksi") ||
    lower.includes("percetakan") ||
    lower.includes("cetak") ||
    lower.includes("binding")
  ) {
    return TONES[2];
  }
  return LAINNYA;
}

export function toneForMapel(
  _mapelId: string,
  mapelName: string,
  jurusan?: JurusanTone | null,
): MapelTone {
  if (teoriUmum(mapelName)) return TEORI;
  if (jurusan) return toneJurusan(jurusan);
  return toneDariNama(mapelName);
}

export function legendTonesFromMapel(
  entries: { id: string; name: string }[],
  jurusan?: JurusanTone | null,
): MapelTone[] {
  const seen = new Set<string>();
  const out: MapelTone[] = [];
  for (const e of entries) {
    const tone = toneForMapel(e.id, e.name, jurusan);
    if (seen.has(tone.label)) continue;
    seen.add(tone.label);
    out.push(tone);
  }
  return out;
}
