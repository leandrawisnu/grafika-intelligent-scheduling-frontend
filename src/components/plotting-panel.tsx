"use client";

import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "@/lib/catalog-context";
import { useJadwal } from "@/lib/jadwal-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Plotting } from "@/lib/types";

export function PlottingPanel() {
  const catalog = useCatalog();
  const { jadwal, unplotted, assignGuru, teacherBusy, teacherHoursOnDay } = useJadwal();
  const semesterId = jadwal?.semester_id ?? null;

  const [plotting, setPlotting] = useState<Plotting[]>([]);
  const [plottingLoading, setPlottingLoading] = useState(false);
  const [plottingError, setPlottingError] = useState<string | null>(null);
  const [kelasId, setKelasId] = useState("");
  const [hariId, setHariId] = useState("");
  const [jamId, setJamId] = useState("");
  const [mapelId, setMapelId] = useState("");
  const [guruId, setGuruId] = useState("");
  const [ruanganId, setRuanganId] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterHariId, setFilterHariId] = useState<string>("semua");

  const muatPlotting = async (semId: string) => {
    setPlottingLoading(true);
    setPlottingError(null);
    try {
      setPlotting(await api.getPlotting(semId));
    } catch (e) {
      setPlottingError(e instanceof Error ? e.message : "Gagal memuat plotting");
    }
    setPlottingLoading(false);
  };

  useEffect(() => {
    if (semesterId) void muatPlotting(semesterId);
    else setPlotting([]);
  }, [semesterId]);

  const jamAktif = useMemo(() => catalog.jam.filter((j) => !j.istirahat), [catalog.jam]);
  const candidates = useMemo(() => catalog.guru.filter((g) => g.aktif), [catalog.guru]);

  useEffect(() => {
    if (!kelasId && catalog.kelas.length > 0) setKelasId(catalog.kelas[0].id);
  }, [catalog.kelas, kelasId]);
  useEffect(() => {
    if (!hariId && catalog.hari.length > 0) {
      const senin = catalog.hari.find((h) => !h.akhir_pekan) ?? catalog.hari[0];
      setHariId(senin.id);
    }
  }, [catalog.hari, hariId]);
  useEffect(() => {
    if (!jamId && jamAktif.length > 0) setJamId(jamAktif[0].id);
  }, [jamAktif, jamId]);
  useEffect(() => {
    if (!mapelId && catalog.mataPelajaran.length > 0) setMapelId(catalog.mataPelajaran[0].id);
  }, [catalog.mataPelajaran, mapelId]);
  useEffect(() => {
    if (!guruId && candidates.length > 0) setGuruId(candidates[0].id);
  }, [candidates, guruId]);

  const terisi = useMemo(() => {
    const s = new Set<string>();
    for (const p of plotting) s.add(`${p.kelas_id}|${p.hari_id}|${p.jam_pelajaran_id}`);
    return s;
  }, [plotting]);

  const bentrokGuru =
    guruId && hariId && jamId
      ? plotting.some((p) => p.guru_id === guruId && p.hari_id === hariId && p.jam_pelajaran_id === jamId)
      : false;
  const bentrokRuang =
    ruanganId && hariId && jamId
      ? plotting.some((p) => p.ruangan_id === ruanganId && p.hari_id === hariId && p.jam_pelajaran_id === jamId)
      : false;

  const simpan = async () => {
    if (!semesterId) return;
    setFormError(null);
    if (!kelasId || !hariId || !jamId || !mapelId || !guruId) {
      setFormError("Kelas, hari, jam, mapel, dan guru wajib diisi.");
      return;
    }
    if (terisi.has(`${kelasId}|${hariId}|${jamId}`)) {
      setFormError("Sel ini sudah ada di plotting. Hapus dulu bila ingin mengganti.");
      return;
    }
    setSaving(true);
    try {
      const row = await api.createPlotting(semesterId, {
        kelas_id: kelasId,
        hari_id: hariId,
        jam_pelajaran_id: jamId,
        mata_pelajaran_id: mapelId,
        guru_id: guruId,
        ...(ruanganId ? { ruangan_id: ruanganId } : {}),
      });
      setPlotting((prev) => [...prev, row]);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Gagal menyimpan plotting");
    }
    setSaving(false);
  };

  const hapus = async (id: string) => {
    try {
      await api.deletePlotting(id);
      setPlotting((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setPlottingError(e instanceof Error ? e.message : "Gagal menghapus plotting");
    }
  };

  if (!semesterId) {
    return <p className="text-sm text-muted-foreground">Pilih jadwal semester dulu untuk mengelola plotting.</p>;
  }

  const daftarKelas = kelasId ? plotting.filter((p) => p.kelas_id === kelasId) : plotting;

  const daftarKelasHari =
    filterHariId === "semua" ? daftarKelas : daftarKelas.filter((p) => p.hari_id === filterHariId);

  const plottingPerHari = useMemo(() => {
    const byId = new Map(catalog.hari.map((h) => [h.id, h]));
    const groups = new Map<string, Plotting[]>();
    for (const p of daftarKelasHari) {
      const list = groups.get(p.hari_id) ?? [];
      list.push(p);
      groups.set(p.hari_id, list);
    }
    const jamKe = (id: string) =>
      catalog.jam.find((j) => j.id === id)?.jam_ke ?? Number.MAX_SAFE_INTEGER;
    for (const list of groups.values()) {
      list.sort((a, b) => jamKe(a.jam_pelajaran_id) - jamKe(b.jam_pelajaran_id));
    }
    return [...groups.entries()]
      .map(([hariIdKey, rows]) => ({ hari: byId.get(hariIdKey), rows }))
      .sort((a, b) => (a.hari?.urutan_hari ?? 999) - (b.hari?.urutan_hari ?? 999));
  }, [daftarKelasHari, catalog.hari, catalog.jam]);

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-card)] border border-border p-4">
        <h3 className="text-sm font-semibold">Tambah plotting manual</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Satu baris = satu jam pelajaran. Mapel 2 jam = 2 baris. Bentrok guru/ruangan boleh disimpan, dicek di Cek konflik.
          {plottingLoading ? " Memuat…" : ` Tersimpan: ${plotting.length} baris.`}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="text-xs">
            Kelas
            <select value={kelasId} onChange={(e) => setKelasId(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
              {catalog.kelas.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Hari
            <select value={hariId} onChange={(e) => setHariId(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
              {catalog.hari.map((h) => (
                <option key={h.id} value={h.id}>{h.nama}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Jam
            <select value={jamId} onChange={(e) => setJamId(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
              {jamAktif.map((j) => (
                <option key={j.id} value={j.id}>ke-{j.jam_ke} · {j.waktu_mulai}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Mapel
            <select value={mapelId} onChange={(e) => setMapelId(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
              {catalog.mataPelajaran.map((m) => (
                <option key={m.id} value={m.id}>{m.nama}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Guru
            <select value={guruId} onChange={(e) => setGuruId(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
              {candidates.map((g) => (
                <option key={g.id} value={g.id}>{g.nama_lengkap}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Ruangan
            <select value={ruanganId} onChange={(e) => setRuanganId(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
              <option value="">Tanpa ruangan</option>
              {catalog.ruangan.map((r) => (
                <option key={r.id} value={r.id}>{r.nama}</option>
              ))}
            </select>
          </label>
        </div>
        {bentrokGuru ? <p className="mt-2 text-xs text-warning-foreground">Info: guru ini sudah dipakai di jam yang sama. Boleh disimpan — bentrok dicek di Cek konflik.</p> : null}
        {bentrokRuang ? <p className="mt-2 text-xs text-warning-foreground">Info: ruangan ini sudah dipakai di jam yang sama. Boleh disimpan — bentrok dicek di Cek konflik.</p> : null}
        {formError ? <p className="mt-2 text-xs text-destructive">{formError}</p> : null}
        {plottingError ? <p className="mt-2 text-xs text-destructive">{plottingError}</p> : null}
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => void simpan()} disabled={saving}>
            {saving ? "Menyimpan…" : "Simpan plotting"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => semesterId && void muatPlotting(semesterId)}>
            Muat ulang
          </Button>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Plotting tersimpan ({daftarKelasHari.length})</h3>
        </div>
        <Tabs value={filterHariId} onValueChange={setFilterHariId} className="mt-2">
          <TabsList className="flex-wrap">
            <TabsTrigger value="semua">Semua</TabsTrigger>
            {catalog.hari.map((h) => (
              <TabsTrigger key={h.id} value={h.id}>{h.nama}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {daftarKelasHari.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">Belum ada plotting. Tambahkan lewat form di atas.</p>
        ) : (
          <div className="mt-2 space-y-4">
            {plottingPerHari.map(({ hari, rows }) => (
              <section key={hari?.id ?? rows[0].hari_id}>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {hari?.nama ?? catalog.hariName(rows[0].hari_id)} ({rows.length})
                </h4>
                <ul className="mt-1.5 space-y-2">
                  {rows.slice(0, 50).map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
                      <span>
                        {catalog.kelasName(p.kelas_id)} · {catalog.mapelName(p.mata_pelajaran_id)} ·{" "}
                        {catalog.jamLabel(p.jam_pelajaran_id)} ·{" "}
                        {catalog.guruName(p.guru_id) ?? "-"} · {catalog.ruanganName(p.ruangan_id) ?? "Tanpa ruangan"}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => void hapus(p.id)}>Hapus</Button>
                    </li>
                  ))}
                  {rows.length > 50 ? (
                    <li className="text-xs text-muted-foreground">…dan {rows.length - 50} baris lagi hari ini.</li>
                  ) : null}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold">Slot jadwal belum diplot ({unplotted.length})</h3>
        {unplotted.length === 0 ? (
          <p className="mt-1 rounded-[var(--radius-card)] border border-border bg-secondary px-4 py-6 text-sm text-secondary-foreground">
            Semua slot sudah punya guru. Lanjut ke validasi konflik.
          </p>
        ) : (
          <ul className="mt-2 space-y-3">
            {unplotted.slice(0, 20).map((slot) => (
              <li key={slot.id} className="rounded-[var(--radius-card)] border border-border p-4">
                <p className="text-sm font-medium">
                  {catalog.kelasName(slot.kelas_id)} · {catalog.mapelName(slot.mata_pelajaran_id)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {catalog.hariName(slot.hari_id)} {catalog.jamLabel(slot.jam_pelajaran_id)} ·{" "}
                  {catalog.ruanganName(slot.ruangan_id) ?? "Tanpa ruangan"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidates.length === 0 ? (
                    <p className="text-xs text-destructive">Tidak ada guru aktif di master.</p>
                  ) : (
                    candidates.map((guru) => {
                      const busy = teacherBusy(guru.id, slot.hari_id, slot.jam_pelajaran_id, slot.id);
                      const hours = teacherHoursOnDay(guru.id, slot.hari_id);
                      const maxDay = Math.max(1, Math.ceil(guru.jam_maksimal_per_minggu / 5));
                      const over = hours >= maxDay;
                      const blocked = busy || over;
                      return (
                        <Button
                          key={guru.id}
                          size="sm"
                          variant={blocked ? "outline" : "secondary"}
                          disabled={blocked}
                          onClick={() => void assignGuru(slot.id, guru.id)}
                          className={cn(blocked && "opacity-60")}
                        >
                          {guru.nama_lengkap}
                        </Button>
                      );
                    })
                  )}
                </div>
              </li>
            ))}
            {unplotted.length > 20 ? (
              <li className="text-xs text-muted-foreground">…dan {unplotted.length - 20} slot lagi.</li>
            ) : null}
          </ul>
        )}
      </div>
    </div>
  );
}
