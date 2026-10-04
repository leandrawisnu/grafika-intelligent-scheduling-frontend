"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText, RefreshCw, Sparkles, TriangleAlert, Upload } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useCatalog } from "@/lib/catalog-context";
import { useJadwal } from "@/lib/jadwal-context";
import { cn } from "@/lib/utils";
import type {
  BarisJadwalPlan,
  DokumenImporJob,
  HasilTerapkanImpor,
  ImportPlan,
  MasterUsulanPlan,
} from "@/lib/types";

const BATAS_BERKAS = 15 * 1024 * 1024;
const TERIMA_BERKAS =
  ".pdf,.doc,.docx,.xls,.xlsx,.csv,.tsv,.ppt,.pptx,.txt,.rtf,.png,.jpg,.jpeg,.webp,.tif,.tiff,.bmp,.heic";

type Tahap = "pilih" | "proses" | "tinjau" | "sukses" | "gagal";

const LABEL_STATUS: Record<string, string> = {
  siap: "Siap",
  akan_dibuat: "Master baru",
  perlu_pilihan: "Perlu pilihan",
  sudah_ada: "Sudah ada",
};

const LABEL_JENIS: Record<string, string> = {
  jadwal: "Dokumen jadwal",
  master: "Dokumen master",
  campuran: "Dokumen campuran",
  tidak_dikenali: "Jenis tidak dikenal",
};

function hitungStatusBaris(b: BarisJadwalPlan): BarisJadwalPlan {
  const lengkap = Boolean(
    b.hari_id && b.jam_pelajaran_id && (b.kelas_id || b.kelas_ref) && (b.mata_pelajaran_id || b.mapel_ref),
  );
  if (!lengkap) return { ...b, status: "perlu_pilihan" };
  if (b.kelas_ref || b.mapel_ref || b.guru_ref || b.ruangan_ref) return { ...b, status: "akan_dibuat" };
  return { ...b, status: "siap" };
}

function pesanTahap(job: DokumenImporJob | null, adaJob: boolean): string {
  if (!adaJob) return "Mengunggah berkas…";
  const tahap = job?.tahap ?? "menunggu";
  if (tahap === "parsing") return "Membaca dokumen (OCR LlamaParse)…";
  if (tahap === "memetakan") return "AI memetakan data ke master GIS…";
  if (tahap === "menunggu") return "Menunggu antrian…";
  return "Memproses…";
}

function SelectKecil({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (nilai: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full rounded-md border border-border bg-background px-2 py-1 text-xs",
        !value && "text-muted-foreground",
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function InputKecil({
  value,
  onChange,
  placeholder,
  tipe = "text",
}: {
  value: string;
  onChange: (nilai: string) => void;
  placeholder?: string;
  tipe?: "text" | "number";
}) {
  return (
    <input
      type={tipe}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
    />
  );
}

export function AiImporDialog({
  jadwalId,
  onModeCepat,
  onSelesai,
}: {
  jadwalId?: string | null;
  onModeCepat?: () => void;
  onSelesai?: (hasil: HasilTerapkanImpor) => void;
}) {
  const catalog = useCatalog();
  const { jadwal, loadJadwal, loadSlotsFor, loadKonflikFor } = useJadwal();
  const jadwalAktifId = jadwalId ?? jadwal?.id ?? null;
  const [open, setOpen] = useState(false);
  const [tahap, setTahap] = useState<Tahap>("pilih");
  const [berkas, setBerkas] = useState<File | null>(null);
  const [target, setTarget] = useState<"otomatis" | "jadwal" | "master">("otomatis");
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<DokumenImporJob | null>(null);
  const [rencana, setRencana] = useState<ImportPlan | null>(null);
  const [hasil, setHasil] = useState<HasilTerapkanImpor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const reset = useCallback(() => {
    setTahap("pilih");
    setBerkas(null);
    setTarget("otomatis");
    setJobId(null);
    setJob(null);
    setRencana(null);
    setHasil(null);
    setError(null);
    setSibuk(false);
    setInputKey((k) => k + 1);
  }, []);

  const ubahBuka = (buka: boolean) => {
    if (!buka && tahap === "proses") return;
    setOpen(buka);
    if (!buka) reset();
  };

  const pilihBerkas = (file: File | null) => {
    setError(null);
    if (!file) {
      setBerkas(null);
      return;
    }
    if (file.size > BATAS_BERKAS) {
      setBerkas(null);
      setError("Berkas maksimal 15 MB.");
      return;
    }
    setBerkas(file);
  };

  const mulai = async () => {
    if (!berkas) return;
    setSibuk(true);
    setError(null);
    setTahap("proses");
    setJob(null);
    try {
      const res = await api.createDokumenImpor(berkas, {
        jadwalSemesterId: jadwalAktifId ?? undefined,
        target,
      });
      setJobId(res.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah dokumen.");
      setTahap("gagal");
    } finally {
      setSibuk(false);
    }
  };

  useEffect(() => {
    if (!open || tahap !== "proses" || !jobId) return;
    let batal = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const data = await api.getDokumenImpor(jobId);
        if (batal) return;
        setJob(data);
        if (data.status === "siap" && data.rencana) {
          setRencana(data.rencana);
          setTahap("tinjau");
          return;
        }
        if (data.status === "gagal") {
          setError(data.pesan ?? "Analisis gagal.");
          setTahap("gagal");
          return;
        }
        if (data.status === "diterapkan") {
          setHasil(data.hasil_terapkan ?? null);
          setTahap("sukses");
          return;
        }
        timer = setTimeout(tick, 2000);
      } catch (e) {
        if (!batal) {
          setError(e instanceof Error ? e.message : "Gagal memantau proses analisis.");
          setTahap("gagal");
        }
      }
    };
    timer = setTimeout(tick, 1200);
    return () => {
      batal = true;
      clearTimeout(timer);
    };
  }, [open, tahap, jobId]);

  const ulangi = async () => {
    if (!jobId) return;
    setSibuk(true);
    setError(null);
    try {
      await api.ulangiDokumenImpor(jobId);
      setTahap("proses");
      setJob(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengulang analisis.");
    } finally {
      setSibuk(false);
    }
  };

  const terapkan = async () => {
    if (!rencana || !jobId) return;
    setSibuk(true);
    setError(null);
    try {
      const res = await api.terapkanDokumenImpor(jobId, rencana, jadwal?.semester_id);
      setHasil(res);
      setTahap("sukses");
      if (jadwalId) {
        void loadJadwal(jadwalId, { paksa: true });
        void loadSlotsFor(jadwalId);
        void loadKonflikFor(jadwalId);
      }
      void catalog.refresh();
      onSelesai?.(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menerapkan rencana impor.");
    } finally {
      setSibuk(false);
    }
  };

  const ubahBaris = (index: number, patch: Partial<BarisJadwalPlan>) => {
    setRencana((prev) => {
      if (!prev) return prev;
      const baris = prev.baris_jadwal.map((b, i) =>
        i === index ? hitungStatusBaris({ ...b, ...patch }) : b,
      );
      return { ...prev, baris_jadwal: baris };
    });
  };

  const ubahMaster = (kategori: keyof MasterUsulanPlan, index: number, patch: Record<string, unknown>) => {
    setRencana((prev) => {
      if (!prev) return prev;
      const daftar = (prev.master_usulan[kategori] as unknown as Record<string, unknown>[]).map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      );
      return {
        ...prev,
        master_usulan: { ...prev.master_usulan, [kategori]: daftar },
      } as unknown as ImportPlan;
    });
  };

  const opsiHari = useMemo(() => catalog.hari.map((h) => ({ value: h.id, label: h.nama })), [catalog.hari]);
  const opsiJam = useMemo(
    () =>
      catalog.jam
        .filter((j) => !j.istirahat)
        .map((j) => ({ value: j.id, label: `ke-${j.jam_ke} · ${j.waktu_mulai?.slice(0, 5) ?? ""}` })),
    [catalog.jam],
  );
  const opsiKelas = useMemo(
    () => catalog.kelas.map((k) => ({ value: k.id, label: k.nama })).sort((a, b) => a.label.localeCompare(b.label, "id")),
    [catalog.kelas],
  );
  const opsiMapel = useMemo(
    () =>
      catalog.mataPelajaran
        .map((m) => ({ value: m.id, label: m.nama }))
        .sort((a, b) => a.label.localeCompare(b.label, "id")),
    [catalog.mataPelajaran],
  );
  const opsiGuru = useMemo(
    () =>
      catalog.guru
        .filter((g) => g.aktif)
        .map((g) => ({ value: g.id, label: g.nama_lengkap }))
        .sort((a, b) => a.label.localeCompare(b.label, "id")),
    [catalog.guru],
  );
  const opsiRuangan = useMemo(
    () =>
      catalog.ruangan
        .map((r) => ({ value: r.id, label: r.nama }))
        .sort((a, b) => a.label.localeCompare(b.label, "id")),
    [catalog.ruangan],
  );
  const opsiJurusan = useMemo(
    () => catalog.jurusan.map((j) => ({ value: j.id, label: j.nama })),
    [catalog.jurusan],
  );

  const namaMasterRef = (ref: string | null): string | null => {
    if (!ref || !rencana) return null;
    const m = rencana.master_usulan;
    const semua = [
      ...m.guru.map((x) => ({ ref: x.ref, nama: x.nama })),
      ...m.mata_pelajaran.map((x) => ({ ref: x.ref, nama: x.nama })),
      ...m.ruangan.map((x) => ({ ref: x.ref, nama: x.nama })),
      ...m.kelas.map((x) => ({ ref: x.ref, nama: x.nama })),
      ...m.jurusan.map((x) => ({ ref: x.ref, nama: x.nama })),
    ];
    return semua.find((x) => x.ref === ref)?.nama ?? ref;
  };

  const jumlahSiap =
    rencana?.baris_jadwal.filter((b) => b.status === "siap" || b.status === "akan_dibuat").length ?? 0;
  const jumlahMaster =
    rencana
      ? Object.values(rencana.master_usulan)
          .flat()
          .filter((m) => (m as { aksi?: string }).aksi === "buat").length
      : 0;

  const labelNama = (id: string | null, daftar: { id: string; nama?: string; nama_lengkap?: string; kode?: string }[]) => {
    if (!id) return null;
    const item = daftar.find((x) => x.id === id);
    return item ? item.nama ?? item.nama_lengkap ?? item.kode ?? id : id;
  };

  return (
    <>
      <Button type="button" onClick={() => ubahBuka(true)}>
        <Sparkles className="size-4 shrink-0" aria-hidden />
        Impor Dokumen (AI)
      </Button>

      <Dialog open={open} onOpenChange={ubahBuka}>
        <DialogContent className="flex max-h-[88vh] flex-col overflow-hidden sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Impor Dokumen (AI)</DialogTitle>
            <DialogDescription>
              Unggah dokumen apa pun — PDF, foto/scan, Excel, Word. AI membaca, mencocokkan ke data master, dan
              menyiapkan jadwal/master baru untuk ditinjau sebelum diterapkan.
            </DialogDescription>
          </DialogHeader>

          {tahap === "pilih" ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  key={inputKey}
                  type="file"
                  accept={TERIMA_BERKAS}
                  className="block min-w-0 flex-1 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
                  onChange={(e) => pilihBerkas(e.target.files?.[0] ?? null)}
                />
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as typeof target)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="otomatis">Deteksi otomatis</option>
                  <option value="jadwal">Khusus jadwal</option>
                  <option value="master">Khusus master</option>
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                Maksimal 15 MB. Format didukung: PDF, DOCX, XLSX, CSV, PPTX, gambar (JPG/PNG/HEIC), dan lainnya.
              </p>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => ubahBuka(false)}>
                  Batal
                </Button>
                <Button type="button" onClick={() => void mulai()} disabled={!berkas || sibuk}>
                  <Upload className="mr-1.5 size-4" />
                  Analisis dengan AI
                </Button>
              </DialogFooter>
            </div>
          ) : null}

          {tahap === "proses" ? (
            <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
              <Sparkles className="size-8 animate-pulse text-primary" />
              <p className="text-sm font-medium">{pesanTahap(job, jobId !== null)}</p>
              <p className="max-w-md text-xs text-muted-foreground">
                Proses berjalan di server dan bisa memakan waktu hingga beberapa menit untuk dokumen besar.
                Biarkan halaman ini terbuka.
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{job?.nama_berkas ?? berkas?.name}</Badge>
                {job?.status === "memproses" ? <span>status: {job.tahap}</span> : null}
              </div>
            </div>
          ) : null}

          {tahap === "tinjau" && rencana ? (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              <div className="rounded-[var(--radius-card)] border border-primary/15 bg-ai-muted px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{LABEL_JENIS[rencana.jenis_dokumen] ?? rencana.jenis_dokumen}</Badge>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    Keyakinan {Math.round((rencana.keyakinan ?? 0) * 100)}%
                  </span>
                </div>
                <p className="mt-2 leading-relaxed">{rencana.ringkasan || "—"}</p>
                {rencana.peringatan?.length ? (
                  <ul className="mt-2 space-y-1">
                    {rencana.peringatan.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-warning-foreground">
                        <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {rencana.baris_jadwal.length > 0 ? (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">
                      Baris jadwal ({rencana.baris_jadwal.length})
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Akan disimpan: <span className="font-medium tabular-nums">{jumlahSiap}</span> baris
                    </p>
                  </div>
                  <div className="overflow-auto rounded-md border border-border">
                    <table className="w-full min-w-[64rem] text-left text-sm">
                      <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
                        <tr>
                          <th className="px-2 py-2 font-medium">Hari</th>
                          <th className="px-2 py-2 font-medium">Jam</th>
                          <th className="px-2 py-2 font-medium">Kelas</th>
                          <th className="px-2 py-2 font-medium">Mapel</th>
                          <th className="px-2 py-2 font-medium">Guru</th>
                          <th className="px-2 py-2 font-medium">Ruangan</th>
                          <th className="px-2 py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rencana.baris_jadwal.map((b, index) => {
                          const perlu = b.status === "perlu_pilihan";
                          return (
                            <tr key={index} className="border-t border-border align-top">
                              <td className="px-2 py-1.5">
                                {perlu && !b.hari_id ? (
                                  <SelectKecil
                                    value={b.hari_id ?? ""}
                                    onChange={(v) => ubahBaris(index, { hari_id: v })}
                                    options={opsiHari}
                                    placeholder={b.hari || "Pilih hari"}
                                  />
                                ) : (
                                  <span className="text-xs">{labelNama(b.hari_id, catalog.hari) ?? b.hari ?? "—"}</span>
                                )}
                              </td>
                              <td className="px-2 py-1.5">
                                {perlu && !b.jam_pelajaran_id ? (
                                  <SelectKecil
                                    value={b.jam_pelajaran_id ?? ""}
                                    onChange={(v) => ubahBaris(index, { jam_pelajaran_id: v })}
                                    options={opsiJam}
                                    placeholder={b.jam || "Pilih jam"}
                                  />
                                ) : (
                                  <span className="text-xs">{b.jam || "—"}</span>
                                )}
                              </td>
                              <td className="px-2 py-1.5">
                                {b.kelas_id ? (
                                  <span className="text-xs">{labelNama(b.kelas_id, catalog.kelas) ?? b.kelas}</span>
                                ) : b.kelas_ref ? (
                                  <span className="text-xs font-medium text-primary">
                                    ＋ {namaMasterRef(b.kelas_ref)}
                                  </span>
                                ) : (
                                  <SelectKecil
                                    value=""
                                    onChange={(v) => ubahBaris(index, { kelas_id: v, kelas_ref: null })}
                                    options={opsiKelas}
                                    placeholder={b.kelas || "Pilih kelas"}
                                  />
                                )}
                              </td>
                              <td className="px-2 py-1.5">
                                {b.mata_pelajaran_id ? (
                                  <span className="text-xs">
                                    {labelNama(b.mata_pelajaran_id, catalog.mataPelajaran) ?? b.mata_pelajaran}
                                  </span>
                                ) : b.mapel_ref ? (
                                  <span className="text-xs font-medium text-primary">
                                    ＋ {namaMasterRef(b.mapel_ref)}
                                  </span>
                                ) : (
                                  <SelectKecil
                                    value=""
                                    onChange={(v) => ubahBaris(index, { mata_pelajaran_id: v, mapel_ref: null })}
                                    options={opsiMapel}
                                    placeholder={b.mata_pelajaran || "Pilih mapel"}
                                  />
                                )}
                              </td>
                              <td className="px-2 py-1.5">
                                {b.guru_id ? (
                                  <span className="text-xs">{labelNama(b.guru_id, catalog.guru) ?? b.guru ?? "—"}</span>
                                ) : b.guru_ref ? (
                                  <span className="text-xs font-medium text-primary">
                                    ＋ {namaMasterRef(b.guru_ref)}
                                  </span>
                                ) : perlu ? (
                                  <SelectKecil
                                    value=""
                                    onChange={(v) => ubahBaris(index, { guru_id: v })}
                                    options={opsiGuru}
                                    placeholder={b.guru || "Pilih guru"}
                                  />
                                ) : (
                                  <span className="text-xs text-muted-foreground">{b.guru || "—"}</span>
                                )}
                              </td>
                              <td className="px-2 py-1.5">
                                {b.ruangan_id ? (
                                  <span className="text-xs">{labelNama(b.ruangan_id, catalog.ruangan) ?? b.ruangan ?? "—"}</span>
                                ) : b.ruangan_ref ? (
                                  <span className="text-xs font-medium text-primary">
                                    ＋ {namaMasterRef(b.ruangan_ref)}
                                  </span>
                                ) : perlu ? (
                                  <SelectKecil
                                    value=""
                                    onChange={(v) => ubahBaris(index, { ruangan_id: v })}
                                    options={opsiRuangan}
                                    placeholder={b.ruangan || "Pilih ruangan"}
                                  />
                                ) : (
                                  <span className="text-xs text-muted-foreground">{b.ruangan || "—"}</span>
                                )}
                              </td>
                              <td className="px-2 py-1.5">
                                <Badge
                                  variant={
                                    b.status === "siap"
                                      ? "secondary"
                                      : b.status === "sudah_ada"
                                        ? "outline"
                                        : b.status === "akan_dibuat"
                                          ? "default"
                                          : "destructive"
                                  }
                                >
                                  {LABEL_STATUS[b.status] ?? b.status}
                                </Badge>
                                {b.catatan ? (
                                  <p className="mt-1 max-w-[14rem] text-[11px] leading-snug text-muted-foreground">
                                    {b.catatan}
                                  </p>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {jumlahMaster > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Master baru yang akan dibuat ({jumlahMaster})</h3>

                  {rencana.master_usulan.jurusan.length > 0 ? (
                    <div className="rounded-md border border-border p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Jurusan</p>
                      <div className="space-y-2">
                        {rencana.master_usulan.jurusan.map((item, i) => (
                          <div key={item.ref} className="grid grid-cols-[1fr_1fr_6rem] gap-2">
                            <InputKecil value={item.nama} onChange={(v) => ubahMaster("jurusan", i, { nama: v })} placeholder="Nama jurusan" />
                            <InputKecil value={item.kode ?? ""} onChange={(v) => ubahMaster("jurusan", i, { kode: v })} placeholder="Kode" />
                            <SelectKecil value={item.aksi} onChange={(v) => ubahMaster("jurusan", i, { aksi: v })} options={[{ value: "buat", label: "Buat" }, { value: "abaikan", label: "Abaikan" }]} placeholder="Aksi" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {rencana.master_usulan.guru.length > 0 ? (
                    <div className="rounded-md border border-border p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Guru</p>
                      <div className="space-y-2">
                        {rencana.master_usulan.guru.map((item, i) => (
                          <div key={item.ref} className="grid grid-cols-[1fr_1fr_6rem] gap-2">
                            <InputKecil value={item.nama} onChange={(v) => ubahMaster("guru", i, { nama: v })} placeholder="Nama guru" />
                            <InputKecil value={item.nip ?? ""} onChange={(v) => ubahMaster("guru", i, { nip: v })} placeholder="NIP (opsional)" />
                            <SelectKecil value={item.aksi} onChange={(v) => ubahMaster("guru", i, { aksi: v })} options={[{ value: "buat", label: "Buat" }, { value: "abaikan", label: "Abaikan" }]} placeholder="Aksi" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {rencana.master_usulan.mata_pelajaran.length > 0 ? (
                    <div className="rounded-md border border-border p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Mata pelajaran</p>
                      <div className="space-y-2">
                        {rencana.master_usulan.mata_pelajaran.map((item, i) => (
                          <div key={item.ref} className="grid grid-cols-[1fr_1fr_5rem_5rem_6rem] gap-2">
                            <InputKecil value={item.nama} onChange={(v) => ubahMaster("mata_pelajaran", i, { nama: v })} placeholder="Nama mapel" />
                            <InputKecil value={item.kode ?? ""} onChange={(v) => ubahMaster("mata_pelajaran", i, { kode: v })} placeholder="Kode" />
                            <InputKecil tipe="number" value={item.jam_wajib_per_minggu?.toString() ?? ""} onChange={(v) => ubahMaster("mata_pelajaran", i, { jam_wajib_per_minggu: v === "" ? null : Number(v) })} placeholder="JP/minggu" />
                            <InputKecil tipe="number" value={item.tingkat?.toString() ?? ""} onChange={(v) => ubahMaster("mata_pelajaran", i, { tingkat: v === "" ? null : Number(v) })} placeholder="Tingkat" />
                            <SelectKecil value={item.aksi} onChange={(v) => ubahMaster("mata_pelajaran", i, { aksi: v })} options={[{ value: "buat", label: "Buat" }, { value: "abaikan", label: "Abaikan" }]} placeholder="Aksi" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {rencana.master_usulan.ruangan.length > 0 ? (
                    <div className="rounded-md border border-border p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Ruangan</p>
                      <div className="space-y-2">
                        {rencana.master_usulan.ruangan.map((item, i) => (
                          <div key={item.ref} className="grid grid-cols-[1fr_1fr_1fr_5rem_6rem] gap-2">
                            <InputKecil value={item.nama} onChange={(v) => ubahMaster("ruangan", i, { nama: v })} placeholder="Nama ruangan" />
                            <InputKecil value={item.kode ?? ""} onChange={(v) => ubahMaster("ruangan", i, { kode: v })} placeholder="Kode" />
                            <InputKecil value={item.tipe_ruangan ?? ""} onChange={(v) => ubahMaster("ruangan", i, { tipe_ruangan: v })} placeholder="Tipe (kelas/lab)" />
                            <InputKecil tipe="number" value={item.kapasitas?.toString() ?? ""} onChange={(v) => ubahMaster("ruangan", i, { kapasitas: v === "" ? null : Number(v) })} placeholder="Kapasitas" />
                            <SelectKecil value={item.aksi} onChange={(v) => ubahMaster("ruangan", i, { aksi: v })} options={[{ value: "buat", label: "Buat" }, { value: "abaikan", label: "Abaikan" }]} placeholder="Aksi" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {rencana.master_usulan.kelas.length > 0 ? (
                    <div className="rounded-md border border-border p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Kelas</p>
                      <div className="space-y-2">
                        {rencana.master_usulan.kelas.map((item, i) => (
                          <div key={item.ref} className="grid grid-cols-[1fr_1fr_5rem_1fr_6rem] gap-2">
                            <InputKecil value={item.nama} onChange={(v) => ubahMaster("kelas", i, { nama: v })} placeholder="Nama kelas" />
                            <InputKecil value={item.kode ?? ""} onChange={(v) => ubahMaster("kelas", i, { kode: v })} placeholder="Kode" />
                            <InputKecil tipe="number" value={item.tingkat?.toString() ?? ""} onChange={(v) => ubahMaster("kelas", i, { tingkat: v === "" ? null : Number(v) })} placeholder="Tingkat" />
                            <SelectKecil
                              value={item.jurusan_id ?? ""}
                              onChange={(v) => ubahMaster("kelas", i, { jurusan_id: v, jurusan_ref: null })}
                              options={opsiJurusan}
                              placeholder={item.jurusan_ref ? `＋ ${namaMasterRef(item.jurusan_ref)}` : "Pilih jurusan"}
                            />
                            <SelectKecil value={item.aksi} onChange={(v) => ubahMaster("kelas", i, { aksi: v })} options={[{ value: "buat", label: "Buat" }, { value: "abaikan", label: "Abaikan" }]} placeholder="Aksi" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <DialogFooter className="sticky bottom-0 bg-background pt-2">
                <Button type="button" variant="outline" onClick={() => ubahBuka(false)} disabled={sibuk}>
                  Batal
                </Button>
                <Button type="button" onClick={() => void terapkan()} disabled={sibuk || (jumlahSiap === 0 && jumlahMaster === 0)}>
                  {sibuk ? "Menerapkan…" : `Terapkan${jumlahSiap > 0 ? ` ${jumlahSiap} slot` : ""}${jumlahMaster > 0 ? ` + ${jumlahMaster} master` : ""}`}
                </Button>
              </DialogFooter>
            </div>
          ) : null}

          {tahap === "sukses" ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-primary/15 bg-ai-muted px-4 py-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">Impor diterapkan.</p>
                  <p className="mt-1 text-muted-foreground">
                    {hasil
                      ? `${hasil.jumlah_slot} slot tersimpan, ${hasil.jumlah_master} master dibuat, ${hasil.dilewati} baris dilewati.`
                      : "Perubahan sudah masuk ke sistem."}
                  </p>
                  {hasil && hasil.konflik.jumlah > 0 ? (
                    <p className="mt-1 font-medium text-destructive">
                      {hasil.konflik.jumlah} konflik terdeteksi ({hasil.konflik.kesalahan} kesalahan)
                      {jadwalAktifId ? (
                        <>
                          {" — "}
                          <Link
                            href={`/jadwal/${jadwalAktifId}/konflik`}
                            className="underline underline-offset-4"
                          >
                            tinjau sekarang
                          </Link>
                          .
                        </>
                      ) : (
                        "."
                      )}
                    </p>
                  ) : hasil ? (
                    <p className="mt-1 text-muted-foreground">Tidak ada konflik baru yang terdeteksi.</p>
                  ) : null}
                  {hasil?.peringatan?.length ? (
                    <ul className="mt-2 space-y-1 text-xs text-warning-foreground">
                      {hasil.peringatan.map((p, i) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
              <DialogFooter>
                {jadwalAktifId && hasil && hasil.konflik.jumlah > 0 ? (
                  <Link href={`/jadwal/${jadwalAktifId}/konflik`} className={buttonVariants()}>
                    Lihat konflik
                  </Link>
                ) : null}
                <Button type="button" onClick={() => ubahBuka(false)}>
                  Selesai
                </Button>
              </DialogFooter>
            </div>
          ) : null}

          {tahap === "gagal" ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <TriangleAlert className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-medium">Analisis gagal.</p>
                  <p className="mt-1">{error ?? "Terjadi kesalahan tak terduga."}</p>
                </div>
              </div>
              <DialogFooter className="flex-wrap">
                {onModeCepat ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      ubahBuka(false);
                      onModeCepat();
                    }}
                  >
                    <FileText className="mr-1.5 size-4" />
                    Pakai mode cepat (lama)
                  </Button>
                ) : null}
                <Button type="button" variant="outline" onClick={() => void ulangi()} disabled={sibuk || !jobId}>
                  <RefreshCw className="mr-1.5 size-4" />
                  Ulangi analisis
                </Button>
                <Button type="button" onClick={() => ubahBuka(false)}>
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
