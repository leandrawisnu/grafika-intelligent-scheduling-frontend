"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Send, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleGrid } from "@/components/schedule-grid";
import { PlottingPanel } from "@/components/plotting-panel";
import { KonflikResolvePanel } from "@/components/konflik-resolve-panel";
import { AiInsightBar } from "@/components/ai-insight-bar";
import { AiBadge } from "@/components/ai-badge";
import { useCatalog } from "@/lib/catalog-context";
import { useJadwal } from "@/lib/jadwal-context";
import { jadwalKonflikHref } from "@/lib/navigation";
import { KelasGridFilter } from "@/components/kelas-grid-filter";
import { GisPanel } from "@/components/gis-surface";
import { nestedKelas } from "@/lib/jadwal-labels";
import { api } from "@/lib/api";

function JadwalDetailInner() {
  const params = useParams();
  const jadwalId = params.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "grid";
  const catalog = useCatalog();
  const {
    loadJadwal,
    jadwal,
    slots,
    jadwalKelasAktif,
    jadwalList,
    semesterLabel,
    gridKelasId,
    setGridKelasId,
    validated,
    validating,
    predicting,
    published,
    openKonflik,
    unplotted,
    runValidasi,
    runPrediksiMl,
    publish,
    selectedConflictId,
    setSelectedConflictId,
    openKonflik: openList,
  } = useJadwal();

  useEffect(() => {
    if (jadwalId) void loadJadwal(jadwalId);
  }, [jadwalId, loadJadwal]);

  const selected = openList.find((c) => c.id === selectedConflictId) ?? openList[0];

  const setTab = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "grid") params.delete("tab");
    else params.set("tab", value);
    const q = params.toString();
    router.replace(q ? `/jadwal/${jadwalId}?${q}` : `/jadwal/${jadwalId}`);
  };

  const handlePublish = async () => {
    const result = await publish();
    if (!result.ok && result.reason) setTab("publikasi");
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
        const rows = await api.getJadwalKelasAktif(j.id);
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

  const konflikHref = jadwalKonflikHref(jadwalId);

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
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={published ? "default" : "secondary"}>
              {published ? "Dipublikasikan" : "Belum dipublikasikan"}
            </Badge>
            {validated ? (
              <Badge variant={openKonflik.length === 0 ? "secondary" : "destructive"}>
                {openKonflik.length === 0 ? "Bebas konflik" : `${openKonflik.length} konflik`}
              </Badge>
            ) : (
              <AiBadge>Validasi belum jalan</AiBadge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void runValidasi()} disabled={validating || published}>
            {validating ? "Memvalidasi…" : validated ? "Validasi ulang" : "Validasi konflik"}
          </Button>
          <Button variant="outline" onClick={() => void runPrediksiMl()} disabled={predicting || published}>
            <Sparkles className="mr-1.5 size-4" />
            {predicting ? "ML…" : "Prediksi ML (opsional)"}
          </Button>
          <Button
            onClick={() => void handlePublish()}
            disabled={published || openKonflik.length > 0 || !validated || unplotted.length > 0}
          >
            <Send className="mr-1.5 size-4" />
            Publikasi
          </Button>
        </div>
      </div>

      {validated && openKonflik.length > 0 ? (
        <AiInsightBar
          title={`${openKonflik.length} konflik di grid`}
          detail="Klik sel berwarna atau buka tab konflik."
        >
          <Link href={konflikHref} className={buttonVariants({ size: "sm" })}>
            Perbaiki konflik
          </Link>
        </AiInsightBar>
      ) : null}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="plotting">
            Plotting {unplotted.length > 0 ? `(${unplotted.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="konflik">Konflik</TabsTrigger>
          <TabsTrigger value="publikasi">Publikasi</TabsTrigger>
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
              onSlotClick={(_, conflicts) => {
                if (conflicts[0]) {
                  setSelectedConflictId(conflicts[0].id);
                  setTab("konflik");
                }
              }}
            />
          </GisPanel>
        </TabsContent>

        <TabsContent value="plotting">
          <PlottingPanel />
        </TabsContent>

        <TabsContent value="konflik" className="space-y-4">
          {!validated ? (
            <AiInsightBar
              title="Jalankan validasi untuk mengisi tab ini"
              detail="Rules lokal dari database; ML opsional."
            >
              <Button onClick={() => void runValidasi()} disabled={validating}>
                Validasi
              </Button>
            </AiInsightBar>
          ) : selected ? (
            <KonflikResolvePanel konflik={selected} />
          ) : (
            <p className="text-sm text-muted-foreground">Tidak ada konflik terbuka.</p>
          )}
        </TabsContent>

        <TabsContent value="publikasi" className="space-y-4">
          {published ? (
            <div className="rounded-[var(--radius-card)] border border-border bg-secondary px-4 py-6 text-sm">
              Jadwal sudah dipublikasikan. Guru/siswa melihat versi terbit.
            </div>
          ) : openKonflik.length > 0 || !validated || unplotted.length > 0 ? (
            <AiInsightBar
              title="Publikasi dikunci"
              detail={
                !validated
                  ? "Jalankan validasi konflik dulu."
                  : unplotted.length > 0
                    ? `${unplotted.length} slot belum punya guru.`
                    : `Masih ada ${openKonflik.length} konflik.`
              }
            >
              <Link href={konflikHref} className={buttonVariants({ size: "sm" })}>
                Buka tab konflik
              </Link>
            </AiInsightBar>
          ) : (
            <div className="space-y-3 rounded-[var(--radius-card)] border border-border bg-secondary px-4 py-6">
              <p className="text-sm font-medium">Tidak ada konflik. Jadwal boleh dipublikasikan.</p>
              <Button onClick={() => void handlePublish()}>
                <Send className="mr-1.5 size-4" />
                Publikasikan sekarang
              </Button>
            </div>
          )}
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
