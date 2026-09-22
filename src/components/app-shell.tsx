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

const SEGMENT_LABELS: Record<string, string> = {
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
  tanya: "Bantuan AI",
};

function labelForSegment(segment: string) {
  return SEGMENT_LABELS[segment] ?? segment.replace(/-/g, " ");
}

function AppBreadcrumb() {
  const pathname = usePathname();
  if (pathname === "/") {
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

  const parts = pathname.split("/").filter(Boolean);
  const crumbs = parts.map((part, index) => {
    const href = `/${parts.slice(0, index + 1).join("/")}`;
    const label = labelForSegment(part);
    const isLast = index === parts.length - 1;
    return { href, label, isLast };
  });

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList>
        <BreadcrumbItem className="hidden sm:inline-flex">
          <BreadcrumbLink render={<Link href="/" />}>Beranda</BreadcrumbLink>
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

  if (pathname === "/style-guide") {
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
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
