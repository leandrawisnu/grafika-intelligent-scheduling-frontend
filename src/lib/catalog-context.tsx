"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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

export function CatalogProvider({ children }: { children: ReactNode }) {
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
    const labels = ["hari", "jam", "kelas", "guru", "mapel", "ruangan", "jurusan"] as const;
    const results = await Promise.allSettled([
      api.getHari(),
      api.getJamPelajaran(),
      api.getKelas(),
      api.getGuru(),
      api.getMataPelajaran(),
      api.getRuangan(),
      api.getJurusan(),
    ]);
    const failed: string[] = [];

    if (results[0].status === "fulfilled") {
      setHari(results[0].value.sort((a, b) => a.urutan_hari - b.urutan_hari));
    } else failed.push(labels[0]);
    if (results[1].status === "fulfilled") {
      setJam(results[1].value.sort((a, b) => a.jam_ke - b.jam_ke));
    } else failed.push(labels[1]);
    if (results[2].status === "fulfilled") setKelas(results[2].value);
    else failed.push(labels[2]);
    if (results[3].status === "fulfilled") setGuru(results[3].value);
    else failed.push(labels[3]);
    if (results[4].status === "fulfilled") setMataPelajaran(results[4].value);
    else failed.push(labels[4]);
    if (results[5].status === "fulfilled") setRuangan(results[5].value);
    else failed.push(labels[5]);
    if (results[6].status === "fulfilled") setJurusan(results[6].value);
    else failed.push(labels[6]);

    if (failed.length > 0) {
      setError(`Gagal memuat katalog: ${failed.join(", ")}. Cek backend lalu muat ulang halaman.`);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
