"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { useCatalog } from "@/lib/catalog-context";
import { useJadwal } from "@/lib/jadwal-context";
import type { BarisImpor } from "@/lib/types";

type StatusImpor = BarisImpor["status"];

type BarisEdit = {
  hari: string;
  jam: string;
  mata_pelajaran: string;
  kelas: string;
  guru: string;
  ruangan: string;
  hari_id: string;
  jam_pelajaran_id: string;
  mata_pelajaran_id: string;
  kelas_id: string;
  guru_id: string;
  ruangan_id: string;
  status: StatusImpor;
};

const BATAS_BERKAS = 15 * 1024 * 1024;

function kunciBaris(b: BarisEdit) {
  return `${b.kelas_id}|${b.hari_id}|${b.jam_pelajaran_id}`;
}

function lengkap(b: BarisEdit) {
  return Boolean(b.kelas_id && b.mata_pelajaran_id && b.hari_id && b.jam_pelajaran_id);
}

function susunStatus(baris: BarisEdit[], bentrok: Set<string>) {
  const terpakai = new Set(bentrok);
  return baris.map((b) => {
    if (!lengkap(b)) return { ...b, status: "perlu_pilihan" as const };
    const kunci = kunciBaris(b);
    if (terpakai.has(kunci)) return { ...b, status: "sudah_ada" as const };
    terpakai.add(kunci);
    return { ...b, status: "siap" as const };
  });
}

function bentrokAwal(baris: BarisEdit[]) {
  const hitung = new Map<string, { siap: number; sudah: number }>();
  for (const b of baris) {
    if (!lengkap(b)) continue;
    const kunci = kunciBaris(b);
    const slot = hitung.get(kunci) ?? { siap: 0, sudah: 0 };
    if (b.status === "siap") slot.siap += 1;
    if (b.status === "sudah_ada") slot.sudah += 1;
    hitung.set(kunci, slot);
  }
  const bentrok = new Set<string>();
  for (const [kunci, jumlah] of hitung) {
    if (jumlah.sudah > 0 && jumlah.siap === 0) bentrok.add(kunci);
  }
  return bentrok;
}

function dariServer(b: BarisImpor): BarisEdit {
  return {
    hari: b.hari ?? "",
    jam: b.jam ?? "",
    mata_pelajaran: b.mata_pelajaran ?? "",
    kelas: b.kelas ?? "",
    guru: b.guru ?? "",
    ruangan: b.ruangan ?? "",
    hari_id: b.hari_id ?? "",
    jam_pelajaran_id: b.jam_pelajaran_id ?? "",
    mata_pelajaran_id: b.mata_pelajaran_id ?? "",
    kelas_id: b.kelas_id ?? "",
    guru_id: b.guru_id ?? "",
    ruangan_id: b.ruangan_id ?? "",
    status: b.status,
  };
}

function labelOpsi(options: { value: string; label: string }[], value: string, mentah: string) {
  if (!value) return mentah || "—";
  return options.find((o) => o.value === value)?.label ?? (mentah || "—");
}

function PilihNilai({
  value,
  onValueChange,
  options,
  placeholder,
}: {
  value: string;
  onValueChange: (nilai: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const label = options.find((o) => o.value === value)?.label ?? placeholder;
  return (
    <Select value={value || undefined} onValueChange={(v) => onValueChange(v ?? "")}>
      <SelectTrigger className="h-8 w-full min-w-[8rem] max-w-[12rem]">
        <span className="min-w-0 flex-1 truncate text-left text-sm">{label}</span>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function statusTeks(status: StatusImpor) {
  if (status === "siap") return "Siap";
  if (status === "sudah_ada") return "Sudah ada";
  return "Perlu pilihan";
}

export function ImporJadwalDialog({ jadwalId }: { jadwalId: string }) {
  const catalog = useCatalog();
  const { jadwal, loadJadwal } = useJadwal();
  const [open, setOpen] = useState(false);
  const [berkas, setBerkas] = useState<File | null>(null);
  const [baris, setBaris] = useState<BarisEdit[]>([]);
  const [bentrok, setBentrok] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [membaca, setMembaca] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const semesterId = jadwal?.id === jadwalId ? jadwal.semester_id : "";

  const opsi = useMemo(() => {
    const kelas = catalog.kelas
      .filter((k) => !semesterId || k.semester_id === semesterId)
      .map((k) => ({ value: k.id, label: k.nama }))
      .sort((a, b) => a.label.localeCompare(b.label, "id"));
    const mapel = catalog.mataPelajaran
      .map((m) => ({ value: m.id, label: m.nama }))
      .sort((a, b) => a.label.localeCompare(b.label, "id"));
    const hari = catalog.hari.map((h) => ({ value: h.id, label: h.nama }));
    const jam = catalog.jam
      .filter((j) => !j.istirahat)
      .map((j) => ({
        value: j.id,
        label: j.waktu_mulai ? `Jam ${j.jam_ke} · ${j.waktu_mulai.slice(0, 5)}` : `Jam ${j.jam_ke}`,
      }));
    const guru = catalog.guru
      .map((g) => ({ value: g.id, label: g.nama_lengkap }))
      .sort((a, b) => a.label.localeCompare(b.label, "id"));
    const ruangan = catalog.ruangan
      .map((r) => ({ value: r.id, label: r.nama }))
      .sort((a, b) => a.label.localeCompare(b.label, "id"));
    return { kelas, mapel, hari, jam, guru, ruangan };
  }, [catalog, semesterId]);

  const jumlahSiap = baris.filter((b) => b.status === "siap").length;

  const reset = () => {
    setBerkas(null);
    setBaris([]);
    setBentrok(new Set());
    setError(null);
    setInputKey((k) => k + 1);
  };

  const ubahBuka = (buka: boolean) => {
    setOpen(buka);
    if (!buka) reset();
  };

  const pilihBerkas = (file: File | null) => {
    setError(null);
    setBaris([]);
    if (!file) {
      setBerkas(null);
      return;
    }
    const nama = file.name.toLowerCase();
    if (!nama.endsWith(".pdf") && !nama.endsWith(".xlsx")) {
      setBerkas(null);
      setError("Berkas harus PDF atau Excel .xlsx.");
      return;
    }
    if (file.size > BATAS_BERKAS) {
      setBerkas(null);
      setError("Berkas maksimal 15 MB.");
      return;
    }
    setBerkas(file);
  };

  const baca = async () => {
    if (!berkas) return;
    setMembaca(true);
    setError(null);
    try {
      const hasil = await api.pratinjauImpor(jadwalId, berkas);
      const awal = (hasil.baris ?? []).map(dariServer);
      const kunciBentrok = bentrokAwal(awal);
      setBentrok(kunciBentrok);
      setBaris(susunStatus(awal, kunciBentrok));
      if (awal.length === 0) {
        setError("Tidak ada baris jadwal yang terbaca.");
      }
    } catch (err) {
      setBaris([]);
      setError(err instanceof Error ? err.message : "Gagal membaca berkas.");
    } finally {
      setMembaca(false);
    }
  };

  const ubah = (index: number, patch: Partial<BarisEdit>) => {
    setBaris((sekarang) => {
      const berikutnya = sekarang.map((b, i) => (i === index ? { ...b, ...patch } : b));
      return susunStatus(berikutnya, bentrok);
    });
  };

  const simpan = async () => {
    const siap = baris.filter((b) => b.status === "siap");
    if (siap.length === 0) return;
    setMenyimpan(true);
    setError(null);
    try {
      await api.simpanImpor(
        jadwalId,
        siap.map((b) => ({
          kelas_id: b.kelas_id,
          mata_pelajaran_id: b.mata_pelajaran_id,
          hari_id: b.hari_id,
          jam_pelajaran_id: b.jam_pelajaran_id,
          guru_id: b.guru_id || undefined,
          ruangan_id: b.ruangan_id || undefined,
        })),
      );
      await loadJadwal(jadwalId);
      ubahBuka(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan jadwal.");
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" onClick={() => ubahBuka(true)}>
        <Upload className="mr-1.5 size-4" />
        Unggah jadwal
      </Button>
      <Dialog open={open} onOpenChange={ubahBuka}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Unggah jadwal</DialogTitle>
            <DialogDescription>
              PDF atau Excel .xlsx. Hasil baca dicocokkan ke data master, lalu disimpan sebagai slot jadwal ini.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              key={inputKey}
              type="file"
              accept=".pdf,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="block min-w-0 flex-1 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
              onChange={(e) => pilihBerkas(e.target.files?.[0] ?? null)}
            />
            <Button type="button" onClick={() => void baca()} disabled={!berkas || membaca || menyimpan}>
              {membaca ? "Membaca…" : "Baca berkas"}
            </Button>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {baris.length > 0 ? (
            <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border">
              <table className="w-full min-w-[52rem] text-left text-sm">
                <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Hari</th>
                    <th className="px-3 py-2 font-medium">Jam</th>
                    <th className="px-3 py-2 font-medium">Mapel</th>
                    <th className="px-3 py-2 font-medium">Kelas</th>
                    <th className="px-3 py-2 font-medium">Guru</th>
                    <th className="px-3 py-2 font-medium">Ruangan</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {baris.map((b, index) => {
                    const terkunci = b.status === "sudah_ada";
                    return (
                      <tr key={`${index}-${b.kelas}-${b.hari}-${b.jam}`} className="border-t border-border align-top">
                        <td className="px-3 py-2">
                          {terkunci || b.hari_id ? (
                            <span>{labelOpsi(opsi.hari, b.hari_id, b.hari)}</span>
                          ) : (
                            <PilihNilai
                              value={b.hari_id}
                              options={opsi.hari}
                              placeholder={b.hari || "Pilih hari"}
                              onValueChange={(hari_id) => ubah(index, { hari_id })}
                            />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {terkunci || b.jam_pelajaran_id ? (
                            <span>{labelOpsi(opsi.jam, b.jam_pelajaran_id, b.jam)}</span>
                          ) : (
                            <PilihNilai
                              value={b.jam_pelajaran_id}
                              options={opsi.jam}
                              placeholder={b.jam || "Pilih jam"}
                              onValueChange={(jam_pelajaran_id) => ubah(index, { jam_pelajaran_id })}
                            />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {terkunci || b.mata_pelajaran_id ? (
                            <span>{labelOpsi(opsi.mapel, b.mata_pelajaran_id, b.mata_pelajaran)}</span>
                          ) : (
                            <PilihNilai
                              value={b.mata_pelajaran_id}
                              options={opsi.mapel}
                              placeholder={b.mata_pelajaran || "Pilih mapel"}
                              onValueChange={(mata_pelajaran_id) => ubah(index, { mata_pelajaran_id })}
                            />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {terkunci || b.kelas_id ? (
                            <span>{labelOpsi(opsi.kelas, b.kelas_id, b.kelas)}</span>
                          ) : (
                            <PilihNilai
                              value={b.kelas_id}
                              options={opsi.kelas}
                              placeholder={b.kelas || "Pilih kelas"}
                              onValueChange={(kelas_id) => ubah(index, { kelas_id })}
                            />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {terkunci || b.guru_id ? (
                            <span>{labelOpsi(opsi.guru, b.guru_id, b.guru)}</span>
                          ) : (
                            <PilihNilai
                              value={b.guru_id}
                              options={opsi.guru}
                              placeholder={b.guru || "Pilih guru"}
                              onValueChange={(guru_id) => ubah(index, { guru_id })}
                            />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {terkunci || b.ruangan_id ? (
                            <span>{labelOpsi(opsi.ruangan, b.ruangan_id, b.ruangan)}</span>
                          ) : (
                            <PilihNilai
                              value={b.ruangan_id}
                              options={opsi.ruangan}
                              placeholder={b.ruangan || "Pilih ruangan"}
                              onValueChange={(ruangan_id) => ubah(index, { ruangan_id })}
                            />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={
                              b.status === "siap" ? "secondary" : b.status === "sudah_ada" ? "outline" : "destructive"
                            }
                          >
                            {statusTeks(b.status)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => ubahBuka(false)} disabled={menyimpan}>
              Batal
            </Button>
            <Button type="button" onClick={() => void simpan()} disabled={jumlahSiap === 0 || menyimpan || membaca}>
              {menyimpan ? "Menyimpan…" : jumlahSiap > 0 ? `Simpan ${jumlahSiap} slot` : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
