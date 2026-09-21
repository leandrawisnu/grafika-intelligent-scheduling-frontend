"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Building2,
  GraduationCap,
  DoorOpen,
  Clock,
  Calendar,
  ClipboardList,
  Search,
  AlertTriangle,
  WandSparkles,
  RotateCcw,
  Palette,
  ChevronsUpDown,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrototype } from "@/lib/prototype-store";
import type { Role } from "@/lib/prototype-types";
import { JADWAL_ID } from "@/lib/prototype-types";
import { AiBadge } from "@/components/ai-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

const masterItems = [
  { href: "/master/guru", label: "Guru", icon: Users },
  { href: "/master/mata-pelajaran", label: "Mata Pelajaran", icon: BookOpen },
  { href: "/master/jurusan", label: "Jurusan", icon: Building2 },
  { href: "/master/kelas", label: "Kelas", icon: GraduationCap },
  { href: "/master/ruangan", label: "Ruangan", icon: DoorOpen },
  { href: "/master/jam-pelajaran", label: "Jam Pelajaran", icon: Clock },
  { href: "/master/tahun-ajaran", label: "Tahun Ajaran", icon: Calendar },
];

const kurikulumNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jadwal", label: "Jadwal", icon: ClipboardList },
];

const aiNav = [
  { href: "/ai/konflik", label: "Prediksi Konflik", icon: AlertTriangle },
  { href: "/ai/selesaikan", label: "Selesaikan", icon: WandSparkles },
  { href: "/ai/tanya", label: "Tanya AI", icon: Search },
];

const guruNav = [{ href: "/guru/jadwal", label: "Jadwal Mengajar", icon: ClipboardList }];
const siswaNav = [{ href: "/siswa/jadwal", label: "Jadwal Pelajaran", icon: ClipboardList }];

const roles: { id: Role; label: string }[] = [
  { id: "kurikulum", label: "Kurikulum" },
  { id: "guru", label: "Guru" },
  { id: "siswa", label: "Siswa" },
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton render={<Link href={href} />} isActive={active} tooltip={label}>
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
      {badge != null && badge > 0 ? (
        <SidebarMenuBadge className="bg-ai text-ai-foreground tabular-nums">{badge}</SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  );
}

function SidebarAccount() {
  const router = useRouter();
  const { role, setRole, resetDemo } = usePrototype();
  const roleLabel = roles.find((r) => r.id === role)?.label ?? "Kurikulum";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <SidebarMenuButton
            size="lg"
            className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
            render={<DropdownMenuTrigger />}
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Akun demo</span>
              <span className="truncate text-xs text-muted-foreground">
                {roleLabel} · {JADWAL_ID}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-60" />
          </SidebarMenuButton>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side="top"
            align="start"
            sideOffset={8}
          >
            <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate font-semibold">Akun demo</span>
                <span className="truncate text-xs text-muted-foreground">Data prototype</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Peran demo</DropdownMenuLabel>
              {roles.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => setRole(item.id)}
                >
                  <Check
                    className={cn("size-4", role !== item.id && "opacity-0")}
                  />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/style-guide")}>
              <Palette className="size-4" />
              Style guide
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                resetDemo();
                router.push("/");
              }}
            >
              <RotateCcw className="size-4" />
              Reset demo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
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
  const { openConflicts, predicted } = usePrototype();
  const conflictCount = predicted ? openConflicts.length : 0;

  return (
    <Sidebar variant="inset" collapsible="icon">
      <CloseMobileOnNavigate />
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />} tooltip="GIS">
              <span className="flex aspect-square size-8 items-center justify-center">
                <img
                  src="/Icons/GIS%20-%20Icon%20Light.svg"
                  alt=""
                  className="size-7"
                />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-bold tracking-tight">GIS</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  Grafika Intelligent Scheduling
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Kurikulum</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {kurikulumNav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Data Master</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {masterItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="gap-2">
            <span className="text-ai">AI</span>
            {conflictCount > 0 ? (
              <span className="ml-auto rounded-full bg-ai px-1.5 py-px text-[10px] font-medium text-ai-foreground tabular-nums">
                {conflictCount}
              </span>
            ) : (
              <AiBadge className="ml-auto h-4 px-1.5 text-[9px]">AI</AiBadge>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiNav.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  badge={item.href === "/ai/konflik" ? conflictCount : undefined}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Peran lain</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {guruNav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
              {siswaNav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarAccount />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
