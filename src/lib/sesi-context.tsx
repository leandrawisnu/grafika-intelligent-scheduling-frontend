"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ruteAplikasi } from "@/lib/navigation";

export type SesiAkun = {
  id: string;
  email: string;
  peran: "admin" | "koor_jurusan";
  jurusan_id?: string;
  aktif: boolean;
};

const SesiContext = createContext<SesiAkun | null>(null);

export function SesiProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const masukAplikasi = ruteAplikasi(pathname);
  const [sesi, setSesi] = useState<SesiAkun | null>(null);

  useEffect(() => {
    if (!masukAplikasi) return;
    let batal = false;
    fetch("/api/auth/sesi", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SesiAkun | null) => {
        if (!batal) setSesi(data);
      })
      .catch(() => {
        if (!batal) setSesi(null);
      });
    return () => {
      batal = true;
    };
  }, [masukAplikasi]);

  return <SesiContext.Provider value={sesi}>{children}</SesiContext.Provider>;
}

export function useSesi() {
  return useContext(SesiContext);
}
