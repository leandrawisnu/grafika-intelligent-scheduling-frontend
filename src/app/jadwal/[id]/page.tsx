"use client";

import { Suspense, useEffect, useMemo } from "react";
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
import { cn } from "@/lib/utils";
import { jadwalKonflikHref } from "@/lib/navigation";

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

  const kelasInJadwal = useMemo(() => {
    const rows = (jadwal?.jadwal_kelas ?? []).filter((jk) => jk.is_active);
    return rows
      .map((jk) => {
        const id = jk.kelas_id;
        const nama =
          jk.kelas?.nama ?? catalog.kelas.find((k) => k.id === id)?.nama ?? id;
        return { id, nama };
      })
      .sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  }, [jadwal, catalog.kelas]);

  const konflikHref = jadwalKonflikHref(jadwalId);

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
              title="Jadwal masih kosong"
              detail="Seed skeleton hanya mengisi master + kelas terdaftar. Isi slot lewat plotting/import — atau jalankan seed fase berikutnya yang memuat isi PDF."
            />
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setGridKelasId("")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                gridKelasId === "" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              Semua kelas
            </button>
            {kelasInJadwal.map((kelas) => (
              <button
                key={kelas.id}
                type="button"
                onClick={() => setGridKelasId(kelas.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  gridKelasId === kelas.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {kelas.nama}
              </button>
            ))}
            {kelasInJadwal.length === 0 ? (
              <span className="px-2 py-1 text-xs text-muted-foreground">Belum ada kelas di jadwal ini</span>
            ) : null}
          </div>
          <ScheduleGrid
            kelasId={gridKelasId || null}
            onSlotClick={(_, conflicts) => {
              if (conflicts[0]) {
                setSelectedConflictId(conflicts[0].id);
                setTab("konflik");
              }
            }}
          />
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
