"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import type {
  Guru,
  Hari,
  JamPelajaran,
  Jurusan,
  Kelas,
  MataPelajaran,
  Ruangan,
} from "@/lib/types";

type CatalogState = {
  loading: boolean;
  error: string | null;
  hari: Hari[];
  jam: JamPelajaran[];
  kelas: Kelas[];
  guru: Guru[];
  mataPelajaran: MataPelajaran[];
  ruangan: Ruangan[];
  jurusan: Jurusan[];
  refresh: () => Promise<void>;
  guruName: (id: string | null | undefined) => string | null;
  kelasName: (id: string) => string;
  mapelName: (id: string) => string;
  ruanganName: (id: string | null | undefined) => string | null;
  hariName: (id: string) => string;
  jamLabel: (id: string) => string;
};

const CatalogContext = createContext<CatalogState | null>(null);

function halamanMaster(pathname: string) {
  return pathname === "/master" || pathname.startsWith("/master/");
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const sudahMinta = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hari, setHari] = useState<Hari[]>([]);
  const [jam, setJam] = useState<JamPelajaran[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [guru, setGuru] = useState<Guru[]>([]);
  const [mataPelajaran, setMataPelajaran] = useState<MataPelajaran[]>([]);
  const [ruangan, setRuangan] = useState<Ruangan[]>([]);
  const [jurusan, setJurusan] = useState<Jurusan[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const katalog = await api.getKatalog();
      setHari([...katalog.hari].sort((a, b) => a.urutan_hari - b.urutan_hari));
      setJam([...katalog.jam_pelajaran].sort((a, b) => a.jam_ke - b.jam_ke));
      setKelas(katalog.kelas);
      setGuru(katalog.guru);
      setMataPelajaran(katalog.mata_pelajaran);
      setRuangan(katalog.ruangan);
      setJurusan(katalog.jurusan);
    } catch {
      setError("Gagal memuat katalog. Cek backend lalu muat ulang halaman.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (halamanMaster(pathname)) {
      setLoading(false);
      return;
    }
    if (sudahMinta.current) return;
    sudahMinta.current = true;
    void refresh();
  }, [pathname, refresh]);

  const maps = useMemo(() => {
    const guruById = new Map(guru.map((g) => [g.id, g]));
    const kelasById = new Map(kelas.map((k) => [k.id, k]));
    const mapelById = new Map(mataPelajaran.map((m) => [m.id, m]));
    const ruangById = new Map(ruangan.map((r) => [r.id, r]));
    const hariById = new Map(hari.map((h) => [h.id, h]));
    const jamById = new Map(jam.map((j) => [j.id, j]));
    return { guruById, kelasById, mapelById, ruangById, hariById, jamById };
  }, [guru, kelas, mataPelajaran, ruangan, hari, jam]);

  const value = useMemo<CatalogState>(
    () => ({
      loading,
      error,
      hari,
      jam,
      kelas,
      guru,
      mataPelajaran,
      ruangan,
      jurusan,
      refresh,
      guruName: (id) => (id ? maps.guruById.get(id)?.nama_lengkap ?? id : null),
      kelasName: (id) => maps.kelasById.get(id)?.nama ?? id,
      mapelName: (id) => maps.mapelById.get(id)?.nama ?? id,
      ruanganName: (id) => (id ? maps.ruangById.get(id)?.nama ?? id : null),
      hariName: (id) => maps.hariById.get(id)?.nama ?? id,
      jamLabel: (id) => {
        const row = maps.jamById.get(id);
        if (!row) return id;
        return `ke-${row.jam_ke} · ${row.waktu_mulai}`;
      },
    }),
    [loading, error, hari, jam, kelas, guru, mataPelajaran, ruangan, jurusan, refresh, maps]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
