"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  Building2,
  Clock,
  DoorOpen,
  GraduationCap,
  LogOut,
  MoreHorizontal,
  PanelLeft,
  RotateCcw,
  Settings,
  Sparkles,
  HelpCircle,
  Check,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrototype } from "@/lib/prototype-store";
import type { Role } from "@/lib/prototype-types";
import { useJadwal } from "@/lib/jadwal-context";
import { jadwalDetailHref, jadwalKonflikHref } from "@/lib/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

const roles: { id: Role; label: string }[] = [
  { id: "kurikulum", label: "Kurikulum" },
  { id: "guru", label: "Guru" },
  { id: "siswa", label: "Siswa" },
];

/** Urutan sama dengan alur setup di /master (hanya halaman CRUD yang ada). */
const sidebarMenuGap = "gap-2";

const masterNavItems = [
  { href: "/master/tahun-ajaran", label: "Tahun ajaran", icon: Calendar },
  { href: "/master/semester", label: "Semester", icon: Calendar },
  { href: "/master/guru", label: "Data guru", icon: Users },
  { href: "/master/mata-pelajaran", label: "Mata pelajaran", icon: BookOpen },
  { href: "/master/jurusan", label: "Jurusan", icon: Building2 },
  { href: "/master/kelas", label: "Kelas", icon: GraduationCap },
  { href: "/master/ruangan", label: "Ruangan", icon: DoorOpen },
  { href: "/master/jam-pelajaran", label: "Jam pelajaran", icon: Clock },
] as const;

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function SectionLabel({ children }: { children: string }) {
  return (
    <SidebarGroupLabel className="px-3 text-sm font-medium text-muted-foreground">
      {children}
    </SidebarGroupLabel>
  );
}

function WorkspaceNavItem({
  href,
  label,
  icon: Icon,
  active,
  notify,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  notify?: boolean;
}) {
  return (
    <SidebarMenuItem className="px-1">
      <SidebarMenuButton
        render={<Link href={href} />}
        isActive={active}
        tooltip={label}
        className={cn(
          "relative h-10 gap-3 rounded-full px-3 text-sm font-medium text-muted-foreground",
          active &&
            "bg-primary/5 font-medium text-primary before:absolute before:-left-1 before:top-1/2 before:h-7 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary",
          !active && "hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <Icon className={cn("size-[18px]", active ? "text-primary" : "text-muted-foreground/80")} />
        <span className="flex-1">{label}</span>
        {notify ? (
          <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />
        ) : null}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function MasterNavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <SidebarMenuItem className="px-1">
      <SidebarMenuButton
        render={<Link href={href} />}
        isActive={active}
        tooltip={label}
        className={cn(
          "relative h-10 gap-3 rounded-full px-3 text-sm font-medium text-muted-foreground",
          active &&
            "bg-primary/5 font-medium text-primary before:absolute before:-left-1 before:top-1/2 before:h-7 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary",
          !active && "hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <Icon className={cn("size-[18px]", active ? "text-primary" : "text-muted-foreground/80")} />
        <span className="flex-1">{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SchoolContextCard() {
  const { activeJadwalId, semesterLabel } = useJadwal();

  const periodLine = activeJadwalId
    ? `Nickname: Grafika · ${semesterLabel}`
    : "Belum ada jadwal semester aktif";

  return (
    <div
      className="mx-1 flex w-[calc(100%-0.5rem)] items-start gap-3 rounded-[var(--radius-card)] border border-sidebar-border bg-card p-3"
      aria-label="Konteks sekolah dan semester aktif"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <GraduationCap className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">SMKN 4 Malang</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{periodLine}</span>
      </span>
    </div>
  );
}

function KurikulumSidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeJadwalId, validated, openKonflik } = useJadwal();
  const conflictCount = validated ? openKonflik.length : 0;

  const jadwalHref = jadwalDetailHref(activeJadwalId);
  const konflikHref = jadwalKonflikHref(activeJadwalId);

  const konflikActive =
    pathname.startsWith("/ai/konflik") ||
    pathname.startsWith("/ai/selesaikan") ||
    (pathname.startsWith("/jadwal/") && searchParams.get("tab") === "konflik");

  const jadwalActive =
    pathname === "/jadwal" || (pathname.startsWith("/jadwal/") && searchParams.get("tab") !== "konflik");

  const tanyaActive = pathname.startsWith("/ai/tanya");

  return (
    <>
      <SidebarGroup className="py-1">
        <SectionLabel>Workspace</SectionLabel>
        <SidebarGroupContent>
          <SidebarMenu className={sidebarMenuGap}>
            <WorkspaceNavItem
              href={jadwalHref}
              label="Jadwal mengajar"
              icon={Calendar}
              active={jadwalActive}
            />
            <WorkspaceNavItem
              href={konflikHref}
              label="AI Conflict Predictor"
              icon={Sparkles}
              active={konflikActive}
              notify={conflictCount > 0}
            />
            <WorkspaceNavItem
              href="/ai/tanya"
              label="Tanya AI"
              icon={HelpCircle}
              active={tanyaActive}
            />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="py-1">
        <SectionLabel>Data master</SectionLabel>
        <SidebarGroupContent>
          <SidebarMenu className={sidebarMenuGap}>
            {masterNavItems.map((item) => (
              <MasterNavItem key={item.href} {...item} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

function RoleSidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const href = role === "guru" ? "/guru/jadwal" : "/siswa/jadwal";
  const label = role === "guru" ? "Jadwal mengajar" : "Jadwal pelajaran";
  const active = isActivePath(pathname, href);

  return (
    <SidebarGroup className="py-1">
      <SectionLabel>Workspace</SectionLabel>
      <SidebarGroupContent>
        <SidebarMenu className={sidebarMenuGap}>
          <WorkspaceNavItem href={href} label={label} icon={Calendar} active={active} />
          <WorkspaceNavItem
            href="/ai/tanya"
            label="Tanya AI"
            icon={HelpCircle}
            active={pathname.startsWith("/ai/tanya")}
          />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function AccountMenuButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SidebarFooterNav() {
  const router = useRouter();
  const { role, setRole, resetDemo } = usePrototype();
  const { toggleSidebar } = useSidebar();
  const [accountOpen, setAccountOpen] = useState(false);
  const roleTitle =
    role === "kurikulum" ? "Koordinator kurikulum" : role === "guru" ? "Guru" : "Siswa";

  const closeAnd = (action: () => void) => {
    setAccountOpen(false);
    action();
  };

  const onRoleChange = (id: Role) => {
    setRole(id);
    if (id === "guru") router.push("/guru/jadwal");
    else if (id === "siswa") router.push("/siswa/jadwal");
    else router.push("/");
  };

  const onLogout = () => {
    resetDemo();
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-1 px-1">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            type="button"
            tooltip="Toggle"
            onClick={toggleSidebar}
            className="h-10 gap-3 rounded-full px-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            <PanelLeft className="size-[18px] text-muted-foreground/80" />
            <span>Toggle</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarSeparator className="my-2" />

      <div className="flex items-center gap-2 rounded-xl px-2 py-2">
        <Avatar className="size-9 rounded-full">
          <AvatarFallback className="rounded-full bg-primary/15 text-xs font-semibold text-primary">
            NS
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold">Nadia Salsabila</p>
          <p className="truncate text-xs text-muted-foreground">{roleTitle}</p>
        </div>
        <Popover open={accountOpen} onOpenChange={setAccountOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                aria-label="Menu akun"
                aria-expanded={accountOpen}
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            sideOffset={8}
            className="z-[200] w-56 gap-0 rounded-[var(--radius-card)] border border-border p-1.5"
          >
            <div className="border-b border-border/80 px-2 py-2">
              <p className="text-sm font-semibold text-foreground">Nadia Salsabila</p>
              <p className="text-xs text-muted-foreground">{roleTitle}</p>
            </div>
            <div className="py-1">
              <AccountMenuButton onClick={() => closeAnd(() => router.push("/style-guide"))}>
                <Settings className="size-4 text-muted-foreground" />
                Pengaturan
              </AccountMenuButton>
            </div>
            <div className="border-t border-border/80 py-1">
              <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Peran demo
              </p>
              {roles.map((item) => (
                <AccountMenuButton
                  key={item.id}
                  onClick={() => closeAnd(() => onRoleChange(item.id))}
                >
                  <Check className={cn("size-4", role !== item.id && "opacity-0")} />
                  {item.label}
                </AccountMenuButton>
              ))}
              <AccountMenuButton onClick={() => closeAnd(() => resetDemo())}>
                <RotateCcw className="size-4 text-muted-foreground" />
                Reset demo
              </AccountMenuButton>
            </div>
            <div className="border-t border-border/80 pt-1">
              <AccountMenuButton
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => closeAnd(onLogout)}
              >
                <LogOut className="size-4" />
                Keluar
              </AccountMenuButton>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function CloseMobileOnNavigate() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname, isMobile, setOpenMobile]);

  return null;
}

export function AppSidebar() {
  const { role } = usePrototype();

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-sidebar-border">
      <CloseMobileOnNavigate />
      <SidebarHeader className="gap-3 p-2 pt-3">
        <Link
          href="/"
          className="flex w-full items-center gap-2 rounded-md p-2 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="flex aspect-square size-8 shrink-0 items-center justify-center">
            <img src="/Icons/GIS%20-%20Icon%20Light.svg" alt="" className="size-7" />
          </span>
          <span className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="block truncate text-sm font-bold tracking-tight">GIS</span>
            <span className="block truncate text-[11px] text-muted-foreground">
              Grafika Intelligent Scheduling
            </span>
          </span>
        </Link>
        <SidebarSeparator className="mx-1" />
        <SchoolContextCard />
      </SidebarHeader>

      <SidebarContent className="gap-3 px-1">
        {role === "kurikulum" ? <KurikulumSidebarNav /> : <RoleSidebarNav role={role} />}
      </SidebarContent>

      <SidebarFooter className="p-2 pb-3">
        <SidebarFooterNav />
      </SidebarFooter>
    </Sidebar>
  );
}
