"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiInsightBar } from "@/components/ai-insight-bar";
import { GisPanel } from "@/components/gis-surface";
import { useCatalog } from "@/lib/catalog-context";
import { useJadwal } from "@/lib/jadwal-context";
import { api } from "@/lib/api";
import { KelasGridFilter, awalKelasId } from "@/components/kelas-grid-filter";
import { conflictRowSummary, conflictTypeLabel, groupKonflikByType, konflikMenyentuhKelas } from "@/lib/conflict-display";
import { nestedKelas } from "@/lib/jadwal-labels";
import { cn } from "@/lib/utils";
import type { Konflik, SlotJadwal } from "@/lib/types";

const TIPE_GURU = new Set(["guru_bentrok", "guru_hari_libur", "guru_kelebihan_jam"]);

function KartuSlot({ slot, bentrok }: { slot: SlotJadwal; bentrok: boolean }) {
  const katalog = useCatalog();
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border p-3",
        bentrok ? "border-destructive/60 bg-destructive/5" : "border-border bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold">{katalog.mapelName(slot.mata_pelajaran_id)}</span>
        {bentrok ? <AlertTriangle className="size-4 shrink-0 text-destructive" /> : null}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {katalog.kelasName(slot.kelas_id)} · {katalog.guruName(slot.guru_id) ?? "Belum ada guru"}
      </p>
      <p className="text-xs text-muted-foreground">
        {katalog.ruanganName(slot.ruangan_id) ?? "Tanpa ruangan"}
      </p>
    </div>
  );
}

function PratinjauKartu({ konflik, slots }: { konflik: Konflik; slots: SlotJadwal[] }) {
  const katalog = useCatalog();
  const terkait = slots.filter((s) => s.id === konflik.slot_a_id || s.id === konflik.slot_b_id);
  const terkaitIds = new Set(terkait.map((s) => s.id));
  const guruId = konflik.guru_id || terkait.find((s) => s.guru_id)?.guru_id || null;
  const tampil = useMemo(() => {
    if (TIPE_GURU.has(konflik.tipe_konflik) && guruId) {
      const hariFokus = terkait[0]?.hari_id;
      return hariFokus
        ? slots.filter((s) => s.guru_id === guruId && s.hari_id === hariFokus)
        : slots.filter((s) => s.guru_id === guruId);
    }
    return terkait;
  }, [konflik, slots, guruId, terkait]);

  const groups = useMemo(() => {
    const m = new Map<string, SlotJadwal[]>();
    for (const s of tampil) {
      const key = `${s.hari_id}|${s.jam_pelajaran_id}`;
      const arr = m.get(key) ?? [];
      arr.push(s);
      m.set(key, arr);
    }
    return [...m.entries()]
      .map(([key, rows]) => {
        const [hariId, jamId] = key.split("|");
        const hari = katalog.hari.find((h) => h.id === hariId);
        const jam = katalog.jam.find((j) => j.id === jamId);
        return { hari, jam, rows };
      })
      .sort(
        (a, b) =>
          (a.hari?.urutan_hari ?? 999) - (b.hari?.urutan_hari ?? 999) ||
          (a.jam?.jam_ke ?? 999) - (b.jam?.jam_ke ?? 999)
      );
  }, [tampil, katalog.hari, katalog.jam]);

  if (tampil.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        Tidak ada slot yang terlibat.
      </p>
    );
  }

  return (
    <div className="max-h-[28rem] space-y-4 overflow-y-auto px-4 py-4">
      {groups.map(({ hari, jam, rows }) => (
        <section key={`${hari?.id ?? ""}|${jam?.id ?? ""}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {hari?.nama ?? "—"} · ke-{jam?.jam_ke ?? "?"} ({jam?.waktu_mulai ?? ""} – {jam?.waktu_selesai ?? ""})
          </p>
          <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
            {rows.map((s) => (
              <KartuSlot key={s.id} slot={s} bentrok={terkaitIds.has(s.id)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function DaftarKonflikInner() {
  const params = useParams();
  const jadwalId = params.id as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const catalog = useCatalog();
  const {
    loadJadwal,
    loadKonflikFor,
    loadSlotsFor,
    konflikDimuat,
    error,
    openKonflik,
    slots,
    validated,
    validating,
    predicting,
    runValidasi,
    runPrediksiMl,
    jadwal,
    jadwalKelasAktif,
  } = useJadwal();
  const [filterKelasId, setFilterKelasId] = useState<string | null>(null);
  const [tipeTab, setTipeTab] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const isDemo = useMemo(() => {
    const sem = (jadwal?.semester?.nama ?? "").toLowerCase();
    const ta = (jadwal?.semester?.tahun_ajaran?.nama ?? "").toLowerCase();
    return sem.includes("demo") || ta.includes("demo");
  }, [jadwal]);

  const tambahDemo = async () => {
    if (!jadwalId) return;
    setDemoLoading(true);
    try {
      await api.demoKonflik(jadwalId);
      await runValidasi();
    } finally {
      setDemoLoading(false);
    }
  };

  useEffect(() => {
    if (!jadwalId) return;
    void (async () => {
      await loadJadwal(jadwalId);
      await loadSlotsFor(jadwalId);
      if (!konflikDimuat) await loadKonflikFor(jadwalId);
    })();
  }, [jadwalId, loadJadwal, loadSlotsFor, loadKonflikFor, konflikDimuat]);

  const kelasInJadwal = useMemo(() => {
    const rows = jadwalKelasAktif.length > 0
      ? jadwalKelasAktif
      : (jadwal?.jadwal_kelas ?? []).filter((jk) => jk.is_active);
    const unik = new Map<string, { id: string; nama: string }>();
    for (const jk of rows) {
      const id = jk.kelas_id;
      if (unik.has(id)) continue;
      const nested = nestedKelas(jk);
      const fromCatalog = catalog.kelas.find((k) => k.id === id)?.nama;
      const nama = nested?.nama ?? fromCatalog;
      unik.set(id, { id, nama: nama && nama !== id ? nama : "—" });
    }
    return [...unik.values()].sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  }, [jadwalKelasAktif, jadwal, catalog.kelas]);

  const kelasFilterId = filterKelasId ?? awalKelasId(kelasInJadwal);

  useEffect(() => {
    if (filterKelasId !== null) return;
    const awal = awalKelasId(kelasInJadwal);
    if (awal) setFilterKelasId(awal);
  }, [filterKelasId, kelasInJadwal]);

  const slotById = useMemo(() => {
    const m = new Map<string, SlotJadwal>();
    for (const s of slots) m.set(s.id, s);
    return m;
  }, [slots]);

  const urutPerKelasHariJam = (items: Konflik[]): Konflik[] => {
    const kunci = (k: Konflik): [string, number, number] => {
      const slot = slotById.get(k.slot_a_id ?? "") ?? slotById.get(k.slot_b_id ?? "");
      if (!slot) return ["￿", 999, 999];
      const kelas = catalog.kelas.find((x) => x.id === slot.kelas_id)?.nama ?? "";
      const hari = catalog.hari.find((h) => h.id === slot.hari_id)?.urutan_hari ?? 999;
      const jam = catalog.jam.find((j) => j.id === slot.jam_pelajaran_id)?.jam_ke ?? 999;
      return [kelas, hari, jam];
    };
    return [...items].sort((a, b) => {
      const ka = kunci(a);
      const kb = kunci(b);
      return ka[0].localeCompare(kb[0], "id") || ka[1] - kb[1] || ka[2] - kb[2];
    });
  };

  const visible = useMemo(
    () => openKonflik.filter((item) => konflikMenyentuhKelas(item, kelasFilterId, slots)),
    [openKonflik, kelasFilterId, slots],
  );
  const groups = useMemo(() => groupKonflikByType(visible), [visible]);
  const activeType = groups.some((group) => group.type === tipeTab)
    ? tipeTab
    : groups.find((group) => group.items.some((item) => item.id === searchParams.get("pilih")))?.type
      ?? groups[0]?.type
      ?? null;
  const activeItems = urutPerKelasHariJam(
    groups.find((group) => group.type === activeType)?.items ?? [],
  );
  const selected = activeItems.find((k) => k.id === searchParams.get("pilih")) ?? activeItems[0] ?? null;

  const pilih = (id: string) => {
    const item = visible.find((row) => row.id === id);
    if (item) setTipeTab(item.tipe_konflik);
    router.replace(`/jadwal/${jadwalId}/konflik?pilih=${id}`);
  };

  const gantiTipe = (type: string) => {
    setTipeTab(type);
    const first = groups.find((group) => group.type === type)?.items[0];
    if (first && first.id !== selected?.id) pilih(first.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="gis-page-title">Cek konflik</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Bentrok guru, ruangan, dan jam pada jadwal semester ini.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isDemo ? (
            <Button variant="outline" onClick={() => void tambahDemo()} disabled={demoLoading || !jadwalId}>
              {demoLoading ? "Menyuntikkan…" : "Tambah konflik acak (demo)"}
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => void runValidasi()} disabled={validating || !jadwalId}>
            {validating ? "Memeriksa…" : "Periksa ulang"}
          </Button>
          <Button variant="outline" onClick={() => void runPrediksiMl()} disabled={predicting || !jadwalId}>
            <Sparkles className="mr-1.5 size-4" />
            {predicting ? "ML…" : "Prediksi ML"}
          </Button>
        </div>
      </div>

      {error ? (
        <AiInsightBar title="Slot jadwal gagal dimuat" detail={error}>
          <Button size="sm" variant="outline" onClick={() => void loadSlotsFor(jadwalId)}>
            Muat ulang
          </Button>
        </AiInsightBar>
      ) : null}

      {!validated ? (
        <GisPanel className="px-4 py-6 text-sm text-muted-foreground">
          Jalankan periksa ulang supaya daftar bentrok terisi dari data jadwal.
        </GisPanel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
          <section className="space-y-2">
            <KelasGridFilter
              kelas={kelasInJadwal}
              value={kelasFilterId}
              onChange={setFilterKelasId}
              requireSelection={false}
            />
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium">Potensi konflik</h2>
              <span className="text-xs text-muted-foreground">{visible.length} ditemukan</span>
            </div>
            {openKonflik.length === 0 ? (
              <GisPanel className="px-4 py-6 text-sm text-muted-foreground">Tidak ada konflik terbuka.</GisPanel>
            ) : visible.length === 0 ? (
              <GisPanel className="px-4 py-6 text-sm text-muted-foreground">Tidak ada konflik untuk kelas ini.</GisPanel>
            ) : (
              <Tabs value={activeType ?? ""} onValueChange={(value) => { if (value) gantiTipe(value); }}>
                <TabsList className="h-auto w-full flex-wrap justify-start group-data-horizontal/tabs:h-auto">
                  {groups.map((group) => (
                    <TabsTrigger key={group.type} value={group.type}>
                      {conflictTypeLabel(group.type)}
                      <span className="text-xs tabular-nums text-muted-foreground">{group.items.length}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ul className="max-h-80 overflow-y-auto rounded-[var(--radius-card)] border border-border bg-card">
                  {activeItems.map((item) => {
                    const active = item.id === selected?.id;
                    const row = conflictRowSummary(item, catalog.guruName);
                    return (
                      <li key={item.id} className="border-b border-border last:border-b-0">
                        <button
                          type="button"
                          onClick={() => pilih(item.id)}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 px-3 py-2 text-left",
                            active ? "bg-primary/5" : "hover:bg-muted/50",
                          )}
                        >
                          <span className="min-w-0 truncate text-sm">{row.title}</span>
                          {row.detail ? (
                            <span className="shrink-0 text-xs text-muted-foreground">{row.detail}</span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Tabs>
            )}
          </section>

          <GisPanel className="overflow-hidden p-0">
            <div className="border-b border-border px-4 py-4">
              <h2 className="text-base font-semibold">
                {selected ? conflictTypeLabel(selected.tipe_konflik) : "Pratinjau jadwal"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selected?.deskripsi ?? "Pilih konflik untuk melihat jadwal yang terlibat."}
              </p>
            </div>
            {selected ? (
              <PratinjauKartu konflik={selected} slots={slots} />
            ) : (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                Pilih konflik untuk melihat jadwal yang terlibat.
              </p>
            )}
            <div className="flex justify-end border-t border-border px-4 py-3">
              {selected ? (
                <Link
                  href={`/jadwal/${jadwalId}/konflik/${selected.id}`}
                  className={buttonVariants()}
                >
                  Tinjau solusi
                </Link>
              ) : (
                <Button disabled>Tinjau solusi</Button>
              )}
            </div>
          </GisPanel>
        </div>
      )}
    </div>
  );
}

export default function DaftarKonflikPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat konflik…</p>}>
      <DaftarKonflikInner />
    </Suspense>
  );
}
