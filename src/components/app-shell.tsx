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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrototype } from "@/lib/prototype-store";
import type { Role } from "@/lib/prototype-types";
import { JADWAL_ID, SEMESTER_LABEL } from "@/lib/prototype-types";
import { AiBadge } from "@/components/ai-badge";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
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
        <SidebarMenuBadge className="text-ai tabular-nums">{badge}</SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
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

function AppSidebar() {
  const router = useRouter();
  const { role, openConflicts, resetDemo, predicted } = usePrototype();
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
          <SidebarGroupLabel className="text-ai">
            <span>AI</span>
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

        <SidebarGroup>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/style-guide" />} tooltip="Style guide">
              <LayoutDashboard />
              <span>Style guide</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Reset demo"
              onClick={() => {
                resetDemo();
                router.push("/");
              }}
            >
              <RotateCcw />
              <span>Reset demo</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="px-2 pb-1 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          Data dummy · {JADWAL_ID}
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole } = usePrototype();

  if (pathname === "/style-guide") {
    return <>{children}</>;
  }

  const switchRole = (next: Role) => {
    setRole(next);
  };

  return (
    <TooltipProvider>
      <SidebarProvider className="h-full min-h-0">
        <AppSidebar />
        <SidebarInset className="min-h-0 overflow-hidden">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3 md:px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <p className="min-w-0 truncate text-sm font-medium">{SEMESTER_LABEL}</p>
            <div className="ml-auto grid shrink-0 grid-cols-3 gap-1 rounded-lg bg-muted p-1">
              {roles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchRole(item.id)}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors",
                    role === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
