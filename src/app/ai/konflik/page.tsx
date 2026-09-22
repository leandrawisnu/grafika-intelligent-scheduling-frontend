"use client";

import { RedirectToJadwalKonflik } from "@/components/redirect-to-jadwal-konflik";

export default function AiKonflikPage() {
  return (
    <div className="space-y-4">
      <h1 className="gis-page-title">Cek konflik</h1>
      <RedirectToJadwalKonflik label="Halaman ini" />
    </div>
  );
}
