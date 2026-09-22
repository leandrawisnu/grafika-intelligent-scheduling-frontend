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

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function toneForMapel(mapelId: string, mapelName: string): MapelTone {
  const lower = mapelName.toLowerCase();
  if (
    lower.includes("desain") ||
    lower.includes("grafis") ||
    lower.includes("foto") ||
    lower.includes("layout")
  ) {
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
  if (
    lower.includes("matematika") ||
    lower.includes("bahasa") ||
    lower.includes("pkn") ||
    lower.includes("sejarah") ||
    lower.includes("agama")
  ) {
    return TONES[3];
  }
  return TONES[hashId(mapelId) % TONES.length];
}

export function legendTonesFromMapel(
  entries: { id: string; name: string }[]
): MapelTone[] {
  const seen = new Set<string>();
  const out: MapelTone[] = [];
  for (const e of entries) {
    const tone = toneForMapel(e.id, e.name);
    if (seen.has(tone.label)) continue;
    seen.add(tone.label);
    out.push(tone);
  }
  return out;
}
