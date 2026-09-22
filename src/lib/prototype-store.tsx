"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role } from "@/lib/prototype-types";

type PrototypeStore = {
  role: Role;
  viewGuruId: string;
  viewKelasId: string;
  setRole: (role: Role) => void;
  setViewGuruId: (id: string) => void;
  setViewKelasId: (id: string) => void;
  resetDemo: () => void;
};

const PrototypeContext = createContext<PrototypeStore | null>(null);

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("kurikulum");
  const [viewGuruId, setViewGuruId] = useState("");
  const [viewKelasId, setViewKelasId] = useState("");

  const resetDemo = useCallback(() => {
    setRole("kurikulum");
    setViewGuruId("");
    setViewKelasId("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("gis.activeJadwalSemesterId");
      window.location.href = "/";
    }
  }, []);

  const value = useMemo(
    () => ({
      role,
      viewGuruId,
      viewKelasId,
      setRole,
      setViewGuruId,
      setViewKelasId,
      resetDemo,
    }),
    [role, viewGuruId, viewKelasId, resetDemo]
  );

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}

export function usePrototype() {
  const ctx = useContext(PrototypeContext);
  if (!ctx) throw new Error("usePrototype must be used within PrototypeProvider");
  return ctx;
}
