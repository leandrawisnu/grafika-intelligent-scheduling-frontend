"use client";

import { CatalogProvider } from "@/lib/catalog-context";
import { JadwalProvider } from "@/lib/jadwal-context";
import { PrototypeProvider } from "@/lib/prototype-store";
import { SesiProvider } from "@/lib/sesi-context";
import { installOklchCanvasPolyfill } from "@/lib/oklch-canvas-polyfill";

if (typeof window !== "undefined") {
  installOklchCanvasPolyfill();
  if (process.env.NODE_ENV === "development" || window.location.hostname === "localhost") {
    void import("code-to-figma");
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SesiProvider>
      <PrototypeProvider>
        <CatalogProvider>
          <JadwalProvider>{children}</JadwalProvider>
        </CatalogProvider>
      </PrototypeProvider>
    </SesiProvider>
  );
}
