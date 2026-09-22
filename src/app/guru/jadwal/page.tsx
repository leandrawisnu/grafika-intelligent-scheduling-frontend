"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { ScheduleGrid } from "@/components/schedule-grid";
import { GisPanel, GisStatTile } from "@/components/gis-surface";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useCatalog } from "@/lib/catalog-context";
import { useJadwal } from "@/lib/jadwal-context";
import { usePrototype } from "@/lib/prototype-store";
import { cn } from "@/lib/utils";

export default function GuruJadwalPage() {
  const router = useRouter();
  const catalog = useCatalog();
  const {
    published,
    slots,
    activeJadwalId,
    jadwalList,
    semesterLabel,
    setActiveJadwalId,
    openKonflik,
    validated,
  } = useJadwal();
  const { setRole } = usePrototype();

  const [selectedGuruId, setSelectedGuruId] = useState<string | null>(null);

  const displaySlots = published ? slots : [];
  const activeGuru = catalog.guru.filter((g) => g.aktif);

  const filteredSlots = useMemo(() => {
    if (!selectedGuruId) return displaySlots;
    return displaySlots.filter((s) => s.guru_id === selectedGuruId);
  }, [displaySlots, selectedGuruId]);

  const uniqueRuangan = useMemo(
    () => new Set(displaySlots.map((s) => s.ruangan_id).filter(Boolean)).size,
    [displaySlots]
  );

  const guruInSlots = useMemo(
    () => new Set(displaySlots.map((s) => s.guru_id).filter(Boolean)).size,
    [displaySlots]
  );

  const resetFilters = () => setSelectedGuruId(null);

  const weekRange = "Senin – Jumat";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="gis-page-title">Jadwal mengajar</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {published
              ? "Ringkasan jadwal terbit untuk guru aktif."
              : "Jadwal belum dipublikasikan — grid kosong sampai kurikulum mempublikasikan."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={activeJadwalId ?? undefined}
            onValueChange={(v) => v && setActiveJadwalId(v)}
            disabled={jadwalList.length === 0}
          >
            <SelectTrigger size="sm" className="min-w-[11rem]">
              <span className="truncate text-sm">
                {activeJadwalId ? `Periode ${semesterLabel}` : "Pilih periode"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {jadwalList.map((j) => (
                <SelectItem key={j.id} value={j.id}>
                  {j.semester?.nama ?? j.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
            <SlidersHorizontal className="mr-1.5 size-3.5" />
            Reset filter
          </Button>
        </div>
      </div>

      {!activeJadwalId ? (
        <p className="text-sm text-muted-foreground">Belum ada jadwal semester.</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <GisStatTile
              label="Total sesi"
              value={filteredSlots.length}
              hint="dari jadwal tersimpan"
            />
            <GisStatTile
              label="Guru aktif"
              value={guruInSlots || activeGuru.length}
              hint="data master aktif"
            />
            <GisStatTile
              label="Ruang tersedia"
              value={uniqueRuangan}
              hint="terhubung ke jadwal"
            />
            <GisStatTile
              label="Perlu perhatian"
              value={validated ? openKonflik.length : "—"}
              hint={validated ? "konflik terdeteksi AI" : "validasi belum jalan"}
              tone={validated && openKonflik.length > 0 ? "danger" : "default"}
            />
          </div>

          <GisPanel className="overflow-hidden p-0">
            <div className="flex flex-col gap-3 border-b border-border px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Jadwal mingguan</h2>
                <p className="text-sm text-muted-foreground">{weekRange}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedGuruId(null)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedGuruId === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  Semua guru
                </button>
                {activeGuru.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedGuruId(item.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      selectedGuruId === item.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.nama_lengkap}
                  </button>
                ))}
              </div>
            </div>
            <ScheduleGrid
              guruId={selectedGuruId}
              slots={displaySlots}
              showConflicts={false}
              interactive={false}
              embedded
              showFooter
            />
          </GisPanel>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Demo: ganti role di akun sidebar.
        <button
          type="button"
          className="ml-1 underline"
          onClick={() => {
            setRole("kurikulum");
            router.push("/");
          }}
        >
          Kembali ke kurikulum
        </button>
      </p>
    </div>
  );
}
