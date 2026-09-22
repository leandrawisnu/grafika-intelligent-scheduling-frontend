"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useJadwal } from "@/lib/jadwal-context";
import { jadwalKonflikHref } from "@/lib/navigation";

/** Redirect legacy /ai/konflik dan /ai/selesaikan ke tab konflik jadwal aktif. */
export function RedirectToJadwalKonflik({ label }: { label: string }) {
  const router = useRouter();
  const { activeJadwalId } = useJadwal();
  const target = jadwalKonflikHref(activeJadwalId);

  useEffect(() => {
    if (activeJadwalId) router.replace(target);
  }, [activeJadwalId, router, target]);

  if (activeJadwalId) {
    return (
      <p className="text-sm text-muted-foreground">Mengarahkan ke tab konflik jadwal…</p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {label} sekarang di tab <strong>Konflik</strong> pada jadwal semester.
      </p>
      <p className="text-sm text-muted-foreground">
        Belum ada jadwal aktif. Buat di{" "}
        <Link href="/jadwal" className="font-medium text-primary underline-offset-4 hover:underline">
          Jadwal semester
        </Link>
        .
      </p>
    </div>
  );
}
