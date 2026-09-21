"use client";

import Link from "next/link";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SEMESTER_LABEL } from "@/lib/prototype-types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const SEGMENT_LABELS: Record<string, string> = {
  master: "Data Master",
  jadwal: "Jadwal",
  ai: "AI",
  guru: "Guru",
  siswa: "Siswa",
  kelas: "Kelas",
  jurusan: "Jurusan",
  ruangan: "Ruangan",
  "tahun-ajaran": "Tahun Ajaran",
  "mata-pelajaran": "Mata Pelajaran",
  "jam-pelajaran": "Jam Pelajaran",
  konflik: "Prediksi Konflik",
  selesaikan: "Selesaikan",
  tanya: "Tanya AI",
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
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
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

  if (pathname === "/style-guide") {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <SidebarProvider className="h-full min-h-0">
        <AppSidebar />
        <SidebarInset className="min-h-0 overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 hidden h-4 sm:block" />
            <div className="min-w-0 flex-1">
              <AppBreadcrumb />
              <p className="truncate text-xs text-muted-foreground sm:hidden">{SEMESTER_LABEL}</p>
            </div>
            <p className="hidden shrink-0 text-xs text-muted-foreground md:block">{SEMESTER_LABEL}</p>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
