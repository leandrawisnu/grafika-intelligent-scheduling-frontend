"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const ALL = "__all__";

function parseJurusan(nama: string): string | null {
  const parts = nama.trim().split(/\s+/);
  if (parts.length < 2) return null;
  return parts[1];
}

export function KelasGridFilter({
  kelas,
  value,
  onChange,
  requireSelection = true,
}: {
  kelas: { id: string; nama: string }[];
  value: string;
  onChange: (kelasId: string) => void;
  /** Grid per kelas — tanpa opsi "Semua kelas" (lebih ringkas). */
  requireSelection?: boolean;
}) {
  const [jurusan, setJurusan] = useState("");

  const jurusanOptions = useMemo(() => {
    const codes = new Set<string>();
    for (const k of kelas) {
      const code = parseJurusan(k.nama);
      if (code) codes.add(code);
    }
    return [...codes].sort((a, b) => a.localeCompare(b, "id"));
  }, [kelas]);

  useEffect(() => {
    if (jurusanOptions.length === 0) return;
    if (!jurusan || !jurusanOptions.includes(jurusan)) {
      setJurusan(jurusanOptions[0]);
    }
  }, [jurusanOptions, jurusan]);

  const filteredKelas = useMemo(() => {
    if (!jurusan) return kelas;
    return kelas.filter((k) => parseJurusan(k.nama) === jurusan);
  }, [kelas, jurusan]);

  useEffect(() => {
    if (filteredKelas.length === 0) return;
    if (!value || !filteredKelas.some((k) => k.id === value)) {
      if (requireSelection) onChange(filteredKelas[0].id);
      else if (value) onChange("");
    }
  }, [filteredKelas, value, onChange, requireSelection]);

  const kelasLabel = kelas.find((k) => k.id === value)?.nama ?? "Pilih kelas";

  if (kelas.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">Belum ada kelas di jadwal ini</p>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[9rem] space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Jurusan</p>
        <Select value={jurusan} onValueChange={(v) => setJurusan(v ?? "")}>
          <SelectTrigger size="sm" className="w-full min-w-[9rem]">
            <span className="truncate text-sm">{jurusan || "Pilih jurusan"}</span>
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {jurusanOptions.map((code) => (
              <SelectItem key={code} value={code}>{code}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[12rem] flex-1 space-y-1 sm:max-w-xs">
        <p className="text-xs font-medium text-muted-foreground">Kelas</p>
        <Select
          value={value || (requireSelection ? undefined : ALL)}
          onValueChange={(v) => onChange(v === ALL ? "" : v ?? "")}
        >
          <SelectTrigger size="sm" className="w-full min-w-[12rem]">
            <span className="truncate text-sm">{kelasLabel}</span>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {!requireSelection ? (
              <SelectItem value={ALL}>
                Semua kelas ({jurusan ? filteredKelas.length : kelas.length})
              </SelectItem>
            ) : null}
            {filteredKelas.map((k) => (
              <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
