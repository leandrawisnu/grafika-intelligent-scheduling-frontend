export type MapelTone = {
  id: string;
  label: string;
  cardBg: string;
  border: string;
  dot: string;
};

// Warna unik per mapel (deterministik dari id mapel), bukan per kategori.
const PALETTE: { cardBg: string; border: string; dot: string }[] = [
  { cardBg: "bg-sky-50/90", border: "border-l-sky-500", dot: "bg-sky-500" },
  { cardBg: "bg-violet-50/90", border: "border-l-violet-500", dot: "bg-violet-500" },
  { cardBg: "bg-amber-50/90", border: "border-l-amber-500", dot: "bg-amber-500" },
  { cardBg: "bg-emerald-50/90", border: "border-l-emerald-500", dot: "bg-emerald-500" },
  { cardBg: "bg-rose-50/90", border: "border-l-rose-500", dot: "bg-rose-500" },
  { cardBg: "bg-cyan-50/90", border: "border-l-cyan-500", dot: "bg-cyan-500" },
  { cardBg: "bg-indigo-50/90", border: "border-l-indigo-500", dot: "bg-indigo-500" },
  { cardBg: "bg-orange-50/90", border: "border-l-orange-500", dot: "bg-orange-500" },
  { cardBg: "bg-teal-50/90", border: "border-l-teal-500", dot: "bg-teal-500" },
  { cardBg: "bg-fuchsia-50/90", border: "border-l-fuchsia-500", dot: "bg-fuchsia-500" },
  { cardBg: "bg-lime-50/90", border: "border-l-lime-500", dot: "bg-lime-500" },
  { cardBg: "bg-blue-50/90", border: "border-l-blue-500", dot: "bg-blue-500" },
  { cardBg: "bg-pink-50/90", border: "border-l-pink-500", dot: "bg-pink-500" },
  { cardBg: "bg-yellow-50/90", border: "border-l-yellow-500", dot: "bg-yellow-500" },
  { cardBg: "bg-green-50/90", border: "border-l-green-500", dot: "bg-green-500" },
  { cardBg: "bg-purple-50/90", border: "border-l-purple-500", dot: "bg-purple-500" },
];

function hashTeks(teks: string): number {
  let h = 5381;
  for (let i = 0; i < teks.length; i++) {
    h = (h * 33) ^ teks.charCodeAt(i);
  }
  return Math.abs(h);
}

export function toneForMapel(mapelId: string, mapelName: string): MapelTone {
  const warna = PALETTE[hashTeks(mapelId || mapelName) % PALETTE.length];
  return {
    id: mapelId,
    label: mapelName || "Mapel",
    ...warna,
  };
}

export function legendTonesFromMapel(
  entries: { id: string; name: string }[],
): MapelTone[] {
  const seen = new Set<string>();
  const out: MapelTone[] = [];
  for (const e of entries) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    out.push(toneForMapel(e.id, e.name));
  }
  return out;
}
