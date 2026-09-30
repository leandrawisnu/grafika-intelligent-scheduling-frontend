"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImporJadwalDialog } from "@/components/impor-jadwal-dialog";
import { ScheduleGrid } from "@/components/schedule-grid";
import { PlottingPanel } from "@/components/plotting-panel";
import { AiInsightBar } from "@/components/ai-insight-bar";
import { useCatalog } from "@/lib/catalog-context";
import { useJadwal } from "@/lib/jadwal-context";
import { KelasGridFilter } from "@/components/kelas-grid-filter";
import { GisPanel } from "@/components/gis-surface";
import { nestedKelas } from "@/lib/jadwal-labels";
import { api } from "@/lib/api";

function JadwalDetailInner() {
  const params = useParams();
  const jadwalId = params.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") ?? "grid";
  const tab = rawTab === "publikasi" || rawTab === "konflik" ? "grid" : rawTab;
  const catalog = useCatalog();
  const {
    loadJadwal,
    loadSlotsFor,
    jadwal,
    slots,
    jadwalKelasAktif,
    jadwalList,
    semesterLabel,
    gridKelasId,
    setGridKelasId,
    unplotted,
  } = useJadwal();

  useEffect(() => {
    if (!jadwalId) return;
    void (async () => {
      await loadJadwal(jadwalId);
      await loadSlotsFor(jadwalId);
    })();
  }, [jadwalId, loadJadwal, loadSlotsFor]);

  useEffect(() => {
    if (searchParams.get("tab") === "konflik" && jadwalId) {
      router.replace(`/jadwal/${jadwalId}/konflik`);
    }
  }, [searchParams, jadwalId, router]);

  const setTab = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "grid") params.delete("tab");
    else params.set("tab", value);
    const q = params.toString();
    router.replace(q ? `/jadwal/${jadwalId}?${q}` : `/jadwal/${jadwalId}`);
  };

  const [altJadwalId, setAltJadwalId] = useState<string | null>(null);

  useEffect(() => {
    if (slots.length > 0 || jadwalList.length < 2) {
      setAltJadwalId(null);
      return;
    }
    void (async () => {
      for (const j of jadwalList) {
        if (j.id === jadwalId) continue;
        const rows = await api.getJadwalKelasAktif(j.id, { ringkas: true });
        if (Array.isArray(rows) && rows.length > 0) {
          setAltJadwalId(j.id);
          return;
        }
      }
      setAltJadwalId(null);
    })();
  }, [slots.length, jadwalList, jadwalId]);

  const kelasInJadwal = useMemo(() => {
    const rows = jadwalKelasAktif.length > 0
      ? jadwalKelasAktif
      : (jadwal?.jadwal_kelas ?? []).filter((jk) => jk.is_active);
    return rows
      .map((jk) => {
        const id = jk.kelas_id;
        const nested = nestedKelas(jk);
        const nama = nested?.nama ?? catalog.kelas.find((k) => k.id === id)?.nama ?? id;
        return { id, nama };
      })
      .sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  }, [jadwalKelasAktif, jadwal, catalog.kelas]);

  useEffect(() => {
    if (kelasInJadwal.length === 0) return;
    if (!gridKelasId || !kelasInJadwal.some((k) => k.id === gridKelasId)) {
      setGridKelasId(kelasInJadwal[0].id);
    }
  }, [kelasInJadwal, gridKelasId, setGridKelasId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="gis-page-title">{semesterLabel}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Senin – Jumat · per kelas</p>
        </div>
        <ImporJadwalDialog jadwalId={jadwalId} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="plotting">
            Plotting {unplotted.length > 0 ? `(${unplotted.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {catalog.error ? (
            <AiInsightBar title="Katalog belum lengkap" detail={catalog.error}>
              <Button size="sm" variant="outline" onClick={() => void catalog.refresh()}>
                Muat ulang
              </Button>
            </AiInsightBar>
          ) : null}
          {slots.length === 0 ? (
            <AiInsightBar
              title="Jadwal ini belum berisi slot"
              detail={
                altJadwalId
                  ? "Ada jadwal lain untuk semester yang sama yang sudah terisi dari seed. Buka jadwal tersebut, atau jalankan make seed-slots di backend."
                  : "Jalankan make seed-slots di backend (setelah seed-ganjil), lalu refresh halaman."
              }
            >
              {altJadwalId ? (
                <Link href={`/jadwal/${altJadwalId}`} className={buttonVariants({ size: "sm" })}>
                  Buka jadwal berisi data
                </Link>
              ) : null}
            </AiInsightBar>
          ) : null}
          <GisPanel className="overflow-hidden p-0">
            <div className="flex flex-col gap-4 border-b border-border px-4 py-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Jadwal mingguan</h2>
                <p className="text-sm text-muted-foreground">Senin – Jumat · per kelas</p>
              </div>
              <KelasGridFilter
                kelas={kelasInJadwal}
                value={gridKelasId}
                onChange={setGridKelasId}
                requireSelection
              />
            </div>
            <ScheduleGrid
              kelasId={gridKelasId || null}
              embedded
              showFooter
              showConflicts={false}
              interactive={false}
            />
          </GisPanel>
        </TabsContent>

        <TabsContent value="plotting">
          <PlottingPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function JadwalDetailPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat jadwal…</p>}>
      <JadwalDetailInner />
    </Suspense>
  );
}
