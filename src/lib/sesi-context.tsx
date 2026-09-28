"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type SesiAkun = {
  id: string;
  email: string;
  peran: "admin" | "koor_jurusan";
  jurusan_id?: string;
  aktif: boolean;
};

const SesiContext = createContext<SesiAkun | null>(null);

export function SesiProvider({ children }: { children: React.ReactNode }) {
  const [sesi, setSesi] = useState<SesiAkun | null>(null);

  useEffect(() => {
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
  }, []);

  return <SesiContext.Provider value={sesi}>{children}</SesiContext.Provider>;
}

export function useSesi() {
  return useContext(SesiContext);
}
