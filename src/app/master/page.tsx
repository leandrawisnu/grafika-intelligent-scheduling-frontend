"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Calendar,
  Clock,
  DoorOpen,
  GraduationCap,
  Users,
} from "lucide-react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GisSectionHeading } from "@/components/gis-surface";
import { useCatalog } from "@/lib/catalog-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const kelengkapanItems = [
  {
    href: "/master/guru",
    label: "Guru",
    description: "Untuk plotting dan batas jam mengajar",
    icon: Users,
  },
  {
    href: "/master/mata-pelajaran",
    label: "Mata pelajaran",
    description: "Mapel yang dijadwalkan per kelas",
    icon: BookOpen,
  },
  {
    href: "/master/jurusan",
    label: "Jurusan",
    description: "Struktur program keahlian",
    icon: Building2,
  },
  {
    href: "/master/kelas",
    label: "Kelas",
    description: "Kelas per jurusan untuk grid jadwal",
    icon: GraduationCap,
  },
  {
    href: "/master/ruangan",
    label: "Ruangan",
    description: "Validasi bentrok ruangan",
    icon: DoorOpen,
  },
  {
    href: "/master/jam-pelajaran",
    label: "Jam pelajaran",
    description: "Slot waktu harian",
    icon: Clock,
  },
] as const;

function IconWell({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-primary/10 text-primary">
      {children}
    </span>
  );
}

export default function MasterHubPage() {
  const catalog = useCatalog();
  const [tahunCount, setTahunCount] = useState<number | null>(null);
  const [semesterCount, setSemesterCount] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [tahun, semester] = await Promise.all([api.getTahunAjaran(), api.getSemester()]);
        setTahunCount(tahun.length);
        setSemesterCount(semester.length);
      } catch {
        setTahunCount(null);
        setSemesterCount(null);
      }
    })();
  }, []);

  const counts: Record<string, number> = {
    guru: catalog.guru.length,
    mapel: catalog.mataPelajaran.length,
    jurusan: catalog.jurusan.length,
    kelas: catalog.kelas.length,
    ruangan: catalog.ruangan.length,
    jam: catalog.jam.length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="gis-page-title">Data master</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Atur tahun ajaran dan semester dulu, lalu lengkapi data untuk plotting dan validasi jadwal.
        </p>
      </div>

      <section className="space-y-3">
        <GisSectionHeading title="Mulai semester" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/master/tahun-ajaran" className="group block">
            <div className="gis-interactive-card h-full p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-medium">1. Tahun ajaran</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Periode kalender sekolah</p>
                </div>
                <IconWell>
                  <Calendar className="size-5" aria-hidden />
                </IconWell>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {tahunCount != null ? `${tahunCount} tahun ajaran` : "Memuat…"}
              </p>
            </div>
          </Link>
          <Link href="/master/semester" className="group block">
            <div className="gis-interactive-card h-full p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-medium">2. Semester</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Ganjil/genap pada tahun ajaran</p>
                </div>
                <IconWell>
                  <ArrowRight
                    className="size-5 opacity-70 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </IconWell>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {semesterCount != null ? `${semesterCount} semester` : "Memuat…"}
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <GisSectionHeading title="Kelengkapan data" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kelengkapanItems.map((item) => {
            const Icon = item.icon;
            const key = item.href.split("/").pop() ?? "";
            const countKey =
              key === "mata-pelajaran"
                ? "mapel"
                : key === "jam-pelajaran"
                  ? "jam"
                  : key === "guru"
                    ? "guru"
                    : key;
            const n = counts[countKey] ?? 0;
            return (
              <Link key={item.href} href={item.href} className="block">
                <div className={cn("gis-interactive-card h-full")}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-3">
                        <IconWell>
                          <Icon className="size-4" aria-hidden />
                        </IconWell>
                        <div className="min-w-0">
                          <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                          <CardDescription className="text-xs">{item.description}</CardDescription>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                        {catalog.loading ? "…" : n}
                      </span>
                    </div>
                  </CardHeader>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
