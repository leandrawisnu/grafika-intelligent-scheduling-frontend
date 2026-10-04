"use client";

import { useCallback, useState } from "react";
import { CalendarOff, Trash2 } from "lucide-react";
import { CRUDPage } from "@/components/crud-page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Guru, Hari, HariLiburGuru, Semester } from "@/lib/types";

export default function GuruPage() {
  const [liburTarget, setLiburTarget] = useState<Guru | null>(null);
  const [libur, setLibur] = useState<HariLiburGuru[]>([]);
  const [hariList, setHariList] = useState<Hari[]>([]);
  const [semesterList, setSemesterList] = useState<Semester[]>([]);
  const [liburLoading, setLiburLoading] = useState(false);
  const [liburError, setLiburError] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);
  const [formLibur, setFormLibur] = useState({
    hari_id: "",
    semester_id: "",
    alasan: "",
  });

  const muatLibur = useCallback(async (guruId: string) => {
    setLiburLoading(true);
    setLiburError(null);
    try {
      const [liburData, hariData, semesterData] = await Promise.all([
        api.getHariLiburGuru(guruId),
        api.listHari({ page: 1, per_page: 50, q: "", sort: "urutan_hari", filters: {} }),
        api.getSemester(),
      ]);
      setLibur(liburData);
      setHariList(hariData.data);
      setSemesterList(semesterData);
      setFormLibur((prev) => ({
        ...prev,
        semester_id: prev.semester_id || semesterData[0]?.id || "",
      }));
    } catch (e) {
      setLiburError(e instanceof Error ? e.message : "Gagal memuat hari libur");
    } finally {
      setLiburLoading(false);
    }
  }, []);

  const bukaLibur = (row: any) => {
    setLiburTarget(row);
    setFormLibur({ hari_id: "", semester_id: "", alasan: "" });
    void muatLibur(row.id);
  };

  const simpanLibur = async () => {
    if (!liburTarget || !formLibur.hari_id || !formLibur.semester_id) return;
    setMenyimpan(true);
    setLiburError(null);
    try {
      await api.createHariLiburGuru(liburTarget.id, {
        hari_id: formLibur.hari_id,
        semester_id: formLibur.semester_id,
        alasan: formLibur.alasan.trim(),
      });
      setFormLibur((prev) => ({ ...prev, hari_id: "", alasan: "" }));
      await muatLibur(liburTarget.id);
    } catch (e) {
      setLiburError(e instanceof Error ? e.message : "Gagal menyimpan hari libur");
    } finally {
      setMenyimpan(false);
    }
  };

  const hapusLibur = async (liburId: string) => {
    if (!liburTarget) return;
    if (!confirm("Hapus hari libur ini?")) return;
    try {
      await api.deleteHariLiburGuru(liburTarget.id, liburId);
      await muatLibur(liburTarget.id);
    } catch (e) {
      setLiburError(e instanceof Error ? e.message : "Gagal menghapus hari libur");
    }
  };

  const namaHari = (id: string) => hariList.find((h) => h.id === id)?.nama ?? "—";
  const hariTersedia = hariList.filter(
    (h) =>
      !h.akhir_pekan &&
      !libur.some((l) => l.hari_id === h.id && l.semester_id === formLibur.semester_id),
  );
  const semesterLabel = (s: Semester) => s.nama || `Semester ${s.semester_ke}`;

  return (
    <>
      <CRUDPage
        title="Data Guru"
        description="Kelola data guru dan jam mengajar maksimal per minggu"
        fields={[
          { key: "nip", label: "NIP" },
          { key: "nama_lengkap", label: "Nama Lengkap" },
          { key: "jam_maksimal_per_minggu", label: "Jam Maksimal/Minggu", type: "number" },
        ]}
        fetchData={api.listGuru}
        onCreate={(d) => api.createGuru(d)}
        onUpdate={(id, d) => api.updateGuru(id, d)}
        onDelete={(id) => api.deleteGuru(id)}
        getInitialData={() => ({ nip: "", nama_lengkap: "", jam_maksimal_per_minggu: 40 })}
        rowActions={(row) => (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Hari libur"
            title="Atur hari libur"
            onClick={() => bukaLibur(row)}
          >
            <CalendarOff className="size-4" />
          </Button>
        )}
      />

      <Dialog
        open={liburTarget !== null}
        onOpenChange={(buka) => {
          if (!buka) setLiburTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hari libur — {liburTarget?.nama_lengkap ?? ""}</DialogTitle>
            <DialogDescription>
              Guru tidak mengajar pada hari-hari ini. Slot yang sudah diplot di hari tersebut
              tetap ada dan akan ditandai di Cek konflik.
            </DialogDescription>
          </DialogHeader>

          {liburError ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {liburError}
            </p>
          ) : null}

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Daftar hari libur</p>
            {liburLoading ? (
              <p className="text-sm text-muted-foreground">Memuat…</p>
            ) : libur.length === 0 ? (
              <p className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
                Belum ada hari libur.
              </p>
            ) : (
              <ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                {libur.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{l.hari?.nama ?? namaHari(l.hari_id)}</p>
                      {l.alasan ? (
                        <p className="truncate text-xs text-muted-foreground">{l.alasan}</p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Hapus"
                      onClick={() => void hapusLibur(l.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Tambah hari libur</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="libur-hari">Hari</Label>
                <Select
                  value={formLibur.hari_id || null}
                  onValueChange={(v) => setFormLibur({ ...formLibur, hari_id: v ?? "" })}
                >
                  <SelectTrigger className="w-full min-w-0 gap-2 px-3">
                    <span className="min-w-0 flex-1 truncate text-left text-sm">
                      {hariTersedia.find((h) => h.id === formLibur.hari_id)?.nama ??
                        (hariTersedia.length ? "Pilih hari" : "Semua hari sudah libur")}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {hariTersedia.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="libur-semester">Semester</Label>
                <Select
                  value={formLibur.semester_id || null}
                  onValueChange={(v) => setFormLibur({ ...formLibur, semester_id: v ?? "" })}
                >
                  <SelectTrigger className="w-full min-w-0 gap-2 px-3">
                    <span className="min-w-0 flex-1 truncate text-left text-sm">
                      {semesterList.find((s) => s.id === formLibur.semester_id)
                        ? semesterLabel(semesterList.find((s) => s.id === formLibur.semester_id)!)
                        : "Pilih semester"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {semesterList.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {semesterLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="libur-alasan">Alasan (opsional)</Label>
              <Input
                id="libur-alasan"
                value={formLibur.alasan}
                onChange={(e) => setFormLibur({ ...formLibur, alasan: e.target.value })}
                placeholder="Mis. cuti, pelatihan"
              />
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={!formLibur.hari_id || !formLibur.semester_id || menyimpan}
              onClick={() => void simpanLibur()}
            >
              {menyimpan ? "Menyimpan…" : "Tambah hari libur"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
