"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { useJadwal } from "@/lib/jadwal-context";
import { jadwalSemesterLabel } from "@/lib/jadwal-labels";
import type { Semester } from "@/lib/types";

function statusLabel(j: { status: string; bebas_konflik: boolean }, unplotted: number, konflik: number, validated: boolean) {
  if (j.status === "dipublikasikan") return "Dipublikasikan";
  if (unplotted > 0) return "Plotting";
  if (!validated) return "Draf";
  if (konflik > 0) return "Tinjauan konflik";
  return "Siap publikasi";
}

export default function JadwalPage() {
  const {
    jadwalList,
    refreshList,
    createJadwal,
    activeJadwalId,
    validated,
    openKonflik,
    unplotted,
    loading,
  } = useJadwal();
  const [semester, setSemester] = useState<Semester[]>([]);
  const [semesterLoadError, setSemesterLoadError] = useState<string | null>(null);
  const [pickSemester, setPickSemester] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const usedSemesterIds = useMemo(
    () => new Set(jadwalList.map((j) => j.semester_id)),
    [jadwalList]
  );

  const availableSemester = useMemo(
    () => semester.filter((s) => !usedSemesterIds.has(s.id)),
    [semester, usedSemesterIds]
  );

  useEffect(() => {
    void refreshList();
    void api
      .getSemester()
      .then((rows) => {
        setSemester(rows);
        setSemesterLoadError(null);
      })
      .catch((e) => {
        setSemester([]);
        setSemesterLoadError(e instanceof Error ? e.message : "Gagal memuat semester");
      });
  }, [refreshList]);

  useEffect(() => {
    if (!pickSemester && availableSemester.length > 0) {
      setPickSemester(availableSemester[0].id);
    }
  }, [availableSemester, pickSemester]);

  const handleCreate = async () => {
    if (!pickSemester) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createJadwal(pickSemester);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Gagal membuat jadwal");
    } finally {
      setCreating(false);
    }
  };

  const canCreate = Boolean(pickSemester) && availableSemester.some((s) => s.id === pickSemester);

  const pickSemesterLabel =
    availableSemester.find((s) => s.id === pickSemester)?.nama ?? "Pilih semester";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="gis-page-title">Jadwal semester</h1>
        <p className="text-sm text-muted-foreground">
          Satu jadwal per semester (backend). Pilih atau buat dari data master.
        </p>
      </div>

      <div className="max-w-lg space-y-3 rounded-[var(--radius-card)] border border-border p-4">
        {semesterLoadError ? (
          <p className="text-sm text-destructive">{semesterLoadError}. Cek backend jalan di :8080.</p>
        ) : semester.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada semester. Buat dulu di{" "}
            <Link href="/master/semester" className="font-medium text-primary underline-offset-4 hover:underline">
              Master → Semester
            </Link>{" "}
            (butuh tahun ajaran).
          </p>
        ) : availableSemester.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tiap semester sudah punya jadwal (maks satu per semester). Buka kartu di bawah atau tambah semester baru.
          </p>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[12rem] flex-1 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Semester baru</p>
              <Select
                value={pickSemester || null}
                onValueChange={(v) => setPickSemester(v ?? "")}
              >
                <SelectTrigger className="w-full min-w-[12rem]">
                  <span className="min-w-0 flex-1 truncate text-left text-sm">
                    {pickSemesterLabel}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {availableSemester.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => void handleCreate()} disabled={!canCreate || creating}>
              {creating ? "Membuat…" : "Buat jadwal"}
            </Button>
          </div>
        )}
        {createError ? <p className="text-sm text-destructive">{createError}</p> : null}
      </div>

      {loading && jadwalList.length === 0 ? (
        <p className="text-sm text-muted-foreground">Memuat…</p>
      ) : jadwalList.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada jadwal. Buat dari semester di atas.</p>
      ) : (
        <ul className="space-y-3">
          {jadwalList.map((j) => {
            const isActive = j.id === activeJadwalId;
            const konflikCount = isActive ? openKonflik.length : 0;
            const unplot = isActive ? unplotted.length : 0;
            const val = isActive ? validated : false;
            return (
              <li key={j.id}>
                <Link
                  href={`/jadwal/${j.id}`}
                  className="block max-w-lg rounded-[var(--radius-card)] border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{jadwalSemesterLabel(j, semester)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Status: {j.status}</p>
                    </div>
                    <Badge variant={j.status === "dipublikasikan" ? "default" : "secondary"}>
                      {statusLabel(j, unplot, konflikCount, val)}
                    </Badge>
                  </div>
                  {isActive ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {val
                        ? `${konflikCount} konflik terbuka · ${unplot} belum diplot`
                        : "Validasi konflik belum dijalankan"}
                    </p>
                  ) : null}
                  <Button className="mt-4" size="sm" tabIndex={-1}>
                    Buka grid
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
