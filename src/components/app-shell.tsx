"use client";

import Link from "next/link";
import { Fragment, Suspense } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { useJadwal } from "@/lib/jadwal-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ruteAplikasi } from "@/lib/navigation";

const SEGMENT_LABELS: Record<string, string> = {
  beranda: "Beranda",
  master: "Data Master",
  jadwal: "Jadwal semester",
  ai: "AI",
  guru: "Guru",
  siswa: "Siswa",
  kelas: "Kelas",
  jurusan: "Jurusan",
  ruangan: "Ruangan",
  "tahun-ajaran": "Tahun Ajaran",
  "mata-pelajaran": "Mata Pelajaran",
  "jam-pelajaran": "Jam Pelajaran",
  semester: "Semester",
  konflik: "Konflik",
  selesaikan: "Perbaiki konflik",
  tanya: "Asisten AI",
};

function labelForSegment(segment: string) {
  return SEGMENT_LABELS[segment] ?? segment.replace(/-/g, " ");
}

const partnerLogos = [
  { src: "/Icons/1.%20LOGO%20JHIC%202.0.png", alt: "Jagoan Hosting Innovation Competition 2026" },
  { src: "/Icons/2.%20Logo%20Jagoan%20Hosting.png", alt: "Jagoan Hosting" },
  { src: "/Icons/3.%20KOMDIGI.png", alt: "Komdigi" },
  { src: "/Icons/4.%20Garuda%20Spark%20Full%20Color.png", alt: "Garuda Spark Innovation Hub" },
  { src: "/Icons/5.%20LOGO%20NGALUP.png", alt: "Ngalup.co" },
] as const;

function PartnerLogoRow() {
  return (
    <div className="flex h-12 shrink-0 items-center justify-end gap-4 overflow-x-auto border-t bg-background px-4 md:px-6">
      {partnerLogos.map((logo) => (
        <img key={logo.src} src={logo.src} alt={logo.alt} className="h-6 w-auto shrink-0 object-contain" />
      ))}
    </div>
  );
}

function AppBreadcrumb() {
  const pathname = usePathname();
  const { semesterLabel } = useJadwal();
  if (pathname === "/beranda") {
    return (
      <Breadcrumb className="min-w-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Beranda</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const isUuid = (seg: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg);

  const parts = pathname.split("/").filter(Boolean);
  const crumbs = parts.map((part, index) => {
    const href = `/${parts.slice(0, index + 1).join("/")}`;
    let label = labelForSegment(part);
    if (isUuid(part)) {
      const prev = parts[index - 1];
      if (prev === "jadwal") {
        const nama = semesterLabel.trim();
        label =
          nama && nama !== "—" && nama !== "Belum ada jadwal aktif"
            ? nama
            : "Jadwal semester";
      } else if (prev === "konflik") {
        label = "Tinjau solusi";
      } else {
        label = "Detail";
      }
    }
    const isLast = index === parts.length - 1;
    return { href, label, isLast };
  });

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList>
        <BreadcrumbItem className="hidden sm:inline-flex">
          <BreadcrumbLink render={<Link href="/beranda" />}>Beranda</BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            <BreadcrumbSeparator className="hidden sm:inline-flex" />
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage className="capitalize">{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link href={crumb.href} />} className="capitalize">
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { semesterLabel } = useJadwal();

  if (!ruteAplikasi(pathname)) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <SidebarProvider className="h-full min-h-0">
        <Suspense fallback={null}>
          <AppSidebar />
        </Suspense>
        <SidebarInset className="min-h-0 overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 bg-background px-4 md:px-6">
            <div className="min-w-0 flex-1">
              <AppBreadcrumb />
              <p className="truncate text-xs text-muted-foreground sm:hidden">{semesterLabel}</p>
            </div>
            <p className="hidden shrink-0 text-xs text-muted-foreground md:block">{semesterLabel}</p>
          </header>
          <div className="gis-main-canvas gis-scrollbar mx-auto flex-1 w-full max-w-[var(--page-max-width)] overflow-auto p-6 md:p-8">
            {children}
          </div>
          <PartnerLogoRow />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
