"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Data Master", items: [
      { href: "/master/guru", label: "Guru", icon: Users },
      { href: "/master/mata-pelajaran", label: "Mata Pelajaran", icon: BookOpen },
      { href: "/master/jurusan", label: "Jurusan", icon: Building2 },
      { href: "/master/kelas", label: "Kelas", icon: GraduationCap },
      { href: "/master/ruangan", label: "Ruangan", icon: DoorOpen },
      { href: "/master/jam-pelajaran", label: "Jam Pelajaran", icon: Clock },
      { href: "/master/tahun-ajaran", label: "Tahun Ajaran", icon: Calendar },
    ]
  },
  {
    label: "Penjadwalan", items: [
      { href: "/jadwal", label: "Jadwal", icon: ClipboardList },
    ]
  },
  {
    label: "AI", items: [
      { href: "/ai/tanya", label: "Tanya AI", icon: Search },
    ]
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      <aside className="w-64 border-r bg-sidebar shrink-0 hidden md:block">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold tracking-tight">Grafika</h1>
          <p className="text-xs text-muted-foreground">Intelligent Scheduling</p>
        </div>
        <ScrollArea className="h-[calc(100vh-65px)]">
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              if ("items" in item && item.items) {
                return (
                  <div key={item.label} className="py-2">
                    <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    {item.items.map((sub) => {
                      const Icon = sub.icon;
                      const isActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                );
              }
              const Icon = item.icon!;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
