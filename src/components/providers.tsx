"use client";

import { PrototypeProvider } from "@/lib/prototype-store";
import { installOklchCanvasPolyfill } from "@/lib/oklch-canvas-polyfill";

if (typeof window !== "undefined") {
  installOklchCanvasPolyfill();
  if (process.env.NODE_ENV === "development" || window.location.hostname === "localhost") {
    void import("code-to-figma");
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <PrototypeProvider>{children}</PrototypeProvider>;
}
